import { useEffect, useRef } from "react";
import * as THREE from "three";
import { VERTEX_SHADER, FRAGMENT_SHADER } from "./ditherShaders";

interface DitherOptions {
  mode: "bayer" | "floyd" | "dots" | "ascii";
  resolution: number;
  palette: string[];
  matrixSize: 2 | 4 | 8;
  intensity?: number;
  contrast?: number;
  brightness?: number;
  charset?: string;
  animate?: boolean;
  preserveDrawingBuffer?: boolean;
}

// Helper to create an ASCII characters texture atlas
const createAsciiAtlas = (charset: string, fontSize = 16): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width = fontSize * charset.length;
  canvas.height = fontSize;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.font = `${Math.floor(fontSize * 0.9)}px ui-monospace, "JetBrains Mono", "Fira Code", "Menlo", monospace`;
    for (let i = 0; i < charset.length; i++) {
      ctx.fillText(charset[i], i * fontSize + fontSize / 2, fontSize / 2 + 1);
    }
  }
  return canvas;
};

export function useThreeDither(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  videoRef: React.RefObject<HTMLVideoElement | null>,
  options: DitherOptions
) {
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const textureRef = useRef<THREE.VideoTexture | null>(null);
  const atlasTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // Helper to parse hex colors to Vector3 for uniform array
  const parsePalette = (colors: string[]): THREE.Vector3[] => {
    const parsed: THREE.Vector3[] = [];
    for (let i = 0; i < 16; i++) {
      const hex = colors[i] || "#000000";
      const color = new THREE.Color(hex);
      parsed.push(new THREE.Vector3(color.r, color.g, color.b));
    }
    return parsed;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    // 1. Create WebGLRenderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      powerPreference: "high-performance",
      alpha: false,
      preserveDrawingBuffer: options.preserveDrawingBuffer ?? false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // 2. Create Scene and Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    cameraRef.current = camera;

    // 3. Create VideoTexture
    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    textureRef.current = texture;

    // 4. Create ASCII Atlas Texture
    const charset = options.charset || " .:-=+*#%@";
    const atlasCanvas = createAsciiAtlas(charset);
    const atlasTexture = new THREE.CanvasTexture(atlasCanvas);
    atlasTexture.minFilter = THREE.NearestFilter;
    atlasTexture.magFilter = THREE.NearestFilter;
    atlasTextureRef.current = atlasTexture;

    // 5. Create Shader Material
    const material = new THREE.ShaderMaterial({
      uniforms: {
        u_src: { value: texture },
        u_atlas: { value: atlasTexture },
        u_palette: { value: parsePalette(options.palette) },
        u_paletteCount: { value: options.palette.length },
        u_res: { value: new THREE.Vector2(options.resolution, options.resolution) },
        u_cell: { value: new THREE.Vector2(options.resolution / 4, options.resolution / 4) },
        u_charCount: { value: charset.length },
        u_time: { value: 0 },
        u_intensity: { value: options.intensity ?? 1.0 },
        u_contrast: { value: options.contrast ?? 1.0 },
        u_brightness: { value: options.brightness ?? 1.0 },
        u_mode: {
          value:
            options.mode === "bayer"
              ? 0
              : options.mode === "floyd"
                ? 1
                : options.mode === "dots"
                  ? 2
                  : 3,
        },
        u_matrixSize: { value: options.matrixSize },
        u_canvasSize: { value: new THREE.Vector2(1, 1) },
        u_halftoneRadius: { value: 4.0 },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
    });
    materialRef.current = material;

    // 6. Create full-screen mesh
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // 7. Resize handler (Calculates perfectly square grid cells)
    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w && h) {
        renderer.setSize(w, h, false);

        // Update canvas size uniforms
        material.uniforms.u_canvasSize.value.set(w, h);
        material.uniforms.u_halftoneRadius.value = Math.max(2.0, w / options.resolution);

        // Grid cells for standard dither modes (Bayer, Floyd)
        const pe = w / h; // screen aspect ratio
        const re = Math.max(4, Math.floor(options.resolution));
        const ve = Math.max(4, Math.floor(re / pe));
        material.uniforms.u_res.value.set(re, ve);

        // Grid cells for ASCII mode (glyphs are 8x larger)
        const asciiRes = Math.max(4, Math.floor(options.resolution / 4));
        const asciiDown = Math.max(4, Math.floor(asciiRes / pe));
        material.uniforms.u_cell.value.set(asciiRes, asciiDown);
      }
    };
    resize();

    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(canvas);

    // 8. Render Loop
    const startTime = performance.now();
    const render = () => {
      if (video.readyState >= 2) {
        if (options.animate) {
          material.uniforms.u_time.value = (performance.now() - startTime) / 1000.0;
        } else {
          material.uniforms.u_time.value = 0.0;
        }
        renderer.render(scene, camera);
      }
      animationFrameIdRef.current = requestAnimationFrame(render);
    };
    render();

    // 9. Cleanup
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      resizeObserver.disconnect();
      mesh.geometry.dispose();
      mesh.material.dispose();
      texture.dispose();
      atlasTexture.dispose();
      renderer.dispose();
    };
  }, []);

  // Update uniforms dynamically when options change
  useEffect(() => {
    const material = materialRef.current;
    const canvas = canvasRef.current;
    if (!material || !canvas) return;

    material.uniforms.u_palette.value = parsePalette(options.palette);
    material.uniforms.u_paletteCount.value = options.palette.length;
    material.uniforms.u_intensity.value = options.intensity ?? 1.0;
    material.uniforms.u_contrast.value = options.contrast ?? 1.0;
    material.uniforms.u_brightness.value = options.brightness ?? 1.0;
    material.uniforms.u_mode.value =
      options.mode === "bayer"
        ? 0
        : options.mode === "floyd"
          ? 1
          : options.mode === "dots"
            ? 2
            : 3;
    material.uniforms.u_matrixSize.value = options.matrixSize;

    // Dynamically recalculate resolution and aspect ratio grid cells
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w && h) {
      material.uniforms.u_canvasSize.value.set(w, h);
      material.uniforms.u_halftoneRadius.value = Math.max(2.0, w / options.resolution);

      const pe = w / h;
      const re = Math.max(4, Math.floor(options.resolution));
      const ve = Math.max(4, Math.floor(re / pe));
      material.uniforms.u_res.value.set(re, ve);

      const asciiRes = Math.max(4, Math.floor(options.resolution / 4));
      const asciiDown = Math.max(4, Math.floor(asciiRes / pe));
      material.uniforms.u_cell.value.set(asciiRes, asciiDown);
    }
  }, [
    options.mode,
    options.resolution,
    options.palette.join(","),
    options.matrixSize,
    options.intensity,
    options.contrast,
    options.brightness,
  ]);
}
