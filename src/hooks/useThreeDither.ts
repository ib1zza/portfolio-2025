import { useEffect, useRef } from "react";
import * as THREE from "three";

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
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        #define PI 3.14159265
        #define PI2 6.28318531

        uniform sampler2D u_src;
        uniform sampler2D u_atlas;
        uniform vec3 u_palette[16];
        uniform int u_paletteCount;
        uniform vec2 u_res;
        uniform vec2 u_cell;
        uniform float u_charCount;
        uniform float u_time;
        uniform float u_intensity;
        uniform float u_contrast;
        uniform float u_brightness;
        uniform int u_mode;
        uniform float u_matrixSize;
        uniform vec2 u_canvasSize;
        uniform float u_halftoneRadius;

        varying vec2 vUv;

        // --- Exposure adjustments ---
        float luma(vec3 c) {
          return dot(c, vec3(0.2126, 0.7152, 0.0722));
        }

        vec2 pixelUV(vec2 uv) {
          return (floor(uv * u_res) + 0.5) / u_res;
        }

        vec3 adjustExposure(vec3 c) {
          c = (c - 0.5) * u_contrast + 0.5;
          c *= u_brightness;
          return clamp(c, 0.0, 1.0);
        }

        vec3 paletteLookup(float t) {
          if (u_paletteCount <= 1) return u_palette[0];
          float n = float(u_paletteCount - 1);
          float idx = floor(t * n + 0.5);
          int i_idx = clamp(int(idx), 0, 15);
          return u_palette[i_idx];
        }

        // --- Bayer Matrices ---
        const float BAYER_8[64] = float[64](
           0.0/64.0, 48.0/64.0, 12.0/64.0, 60.0/64.0,  3.0/64.0, 51.0/64.0, 15.0/64.0, 63.0/64.0,
          32.0/64.0, 16.0/64.0, 44.0/64.0, 28.0/64.0, 35.0/64.0, 19.0/64.0, 47.0/64.0, 31.0/64.0,
           8.0/64.0, 56.0/64.0,  4.0/64.0, 52.0/64.0, 11.0/64.0, 59.0/64.0,  7.0/64.0, 55.0/64.0,
          40.0/64.0, 24.0/64.0, 36.0/64.0, 20.0/64.0, 43.0/64.0, 27.0/64.0, 39.0/64.0, 23.0/64.0,
           2.0/64.0, 50.0/64.0, 14.0/64.0, 62.0/64.0,  1.0/64.0, 49.0/64.0, 13.0/64.0, 61.0/64.0,
          34.0/64.0, 18.0/64.0, 46.0/64.0, 30.0/64.0, 33.0/64.0, 17.0/64.0, 45.0/64.0, 29.0/64.0,
          10.0/64.0, 58.0/64.0,  6.0/64.0, 54.0/64.0,  9.0/64.0, 57.0/64.0,  5.0/64.0, 53.0/64.0,
          42.0/64.0, 26.0/64.0, 38.0/64.0, 22.0/64.0, 41.0/64.0, 25.0/64.0, 37.0/64.0, 21.0/64.0
        );

        float bayer8(vec2 p) {
          int x = int(mod(p.x, 8.0));
          int y = int(mod(p.y, 8.0));
          return BAYER_8[y * 8 + x] - 0.5;
        }

        float bayer4(vec2 p) {
          int x = int(mod(p.x, 4.0));
          int y = int(mod(p.y, 4.0));
          float m[16] = float[16](
             0.0/16.0,  8.0/16.0,  2.0/16.0, 10.0/16.0,
            12.0/16.0,  4.0/16.0, 14.0/16.0,  6.0/16.0,
             3.0/16.0, 11.0/16.0,  1.0/16.0,  9.0/16.0,
            15.0/16.0,  7.0/16.0, 13.0/16.0,  5.0/16.0
          );
          return m[y * 4 + x] - 0.5;
        }

        float bayer2(vec2 p) {
          int x = int(mod(p.x, 2.0));
          int y = int(mod(p.y, 2.0));
          float m[4] = float[4](0.0/4.0, 2.0/4.0, 3.0/4.0, 1.0/4.0);
          return m[y * 2 + x] - 0.5;
        }

        float bayerN(vec2 p, float n) {
          if (n < 3.0) return bayer2(p);
          if (n < 5.0) return bayer4(p);
          return bayer8(p);
        }

        // High-quality Interleaved Gradient Noise (IGN)
        float interleavedGradientNoise(vec2 position) {
          vec3 magic = vec3(0.06711056, 0.00583715, 52.9829189);
          return fract(magic.z * fract(dot(position, magic.xy)));
        }

        // --- Halftone Helper Functions ---
        float hypot(float x, float y) {
          return sqrt(x * x + y * y);
        }

        float rand(vec2 seed) {
          return fract(sin(dot(seed.xy, vec2(12.9898, 78.233))) * 43758.5453);
        }

        float distanceToDotRadius(float channel, vec2 coord, vec2 normal, vec2 p, float angle, float rad_max) {
          float dist = hypot(coord.x - p.x, coord.y - p.y);
          float rad = pow(abs(channel), 1.125) * rad_max;
          return rad - dist;
        }

        struct Cell {
          vec2 normal;
          vec2 p1;
          vec2 p2;
          vec2 p3;
          vec2 p4;
          float samp1;
          float samp2;
          float samp3;
          float samp4;
        };

        vec4 getSample(vec2 point) {
          vec4 tex = texture2D(u_src, vec2(point.x / u_canvasSize.x, point.y / u_canvasSize.y));
          float base = rand(vec2(floor(point.x), floor(point.y))) * PI2;
          float step = PI2 / 8.0;
          float dist = u_halftoneRadius * 0.66;

          for (int i = 0; i < 8; ++i) {
            float r = base + step * float(i);
            vec2 coord = point + vec2(cos(r) * dist, sin(r) * dist);
            tex += texture2D(u_src, vec2(coord.x / u_canvasSize.x, coord.y / u_canvasSize.y));
          }
          tex /= 9.0;
          return tex;
        }

        Cell getReferenceCell(vec2 p, vec2 origin, float grid_angle, float step) {
          Cell c;
          vec2 n = vec2(cos(grid_angle), sin(grid_angle));
          float threshold = step * 0.5;
          float dot_normal = n.x * (p.x - origin.x) + n.y * (p.y - origin.y);
          float dot_line = -n.y * (p.x - origin.x) + n.x * (p.y - origin.y);
          vec2 offset = vec2(n.x * dot_normal, n.y * dot_normal);
          float offset_normal = mod(hypot(offset.x, offset.y), step);
          float normal_dir = (dot_normal < 0.0) ? 1.0 : -1.0;
          float normal_scale = ((offset_normal < threshold) ? -offset_normal : step - offset_normal) * normal_dir;
          float offset_line = mod(hypot((p.x - offset.x) - origin.x, (p.y - offset.y) - origin.y), step);
          float line_dir = (dot_line < 0.0) ? 1.0 : -1.0;
          float line_scale = ((offset_line < threshold) ? -offset_line : step - offset_line) * line_dir;

          c.normal = n;
          c.p1.x = p.x - n.x * normal_scale + n.y * line_scale;
          c.p1.y = p.y - n.y * normal_scale - n.x * line_scale;

          float normal_step = normal_dir * ((offset_normal < threshold) ? step : -step);
          float line_step = line_dir * ((offset_line < threshold) ? step : -step);
          c.p2.x = c.p1.x - n.x * normal_step;
          c.p2.y = c.p1.y - n.y * normal_step;
          c.p3.x = c.p1.x + n.y * line_step;
          c.p3.y = c.p1.y - n.x * line_step;
          c.p4.x = c.p1.x - n.x * normal_step + n.y * line_step;
          c.p4.y = c.p1.y - n.y * normal_step - n.x * line_step;

          return c;
        }

        float getDotColour(Cell c, vec2 p, int channel, float angle, float aa) {
          if (channel == 0) {
            c.samp1 = 1.0 - getSample(c.p1).r;
            c.samp2 = 1.0 - getSample(c.p2).r;
            c.samp3 = 1.0 - getSample(c.p3).r;
            c.samp4 = 1.0 - getSample(c.p4).r;
          } else if (channel == 1) {
            c.samp1 = 1.0 - getSample(c.p1).g;
            c.samp2 = 1.0 - getSample(c.p2).g;
            c.samp3 = 1.0 - getSample(c.p3).g;
            c.samp4 = 1.0 - getSample(c.p4).g;
          } else {
            c.samp1 = 1.0 - getSample(c.p1).b;
            c.samp2 = 1.0 - getSample(c.p2).b;
            c.samp3 = 1.0 - getSample(c.p3).b;
            c.samp4 = 1.0 - getSample(c.p4).b;
          }

          float dist_c_1 = distanceToDotRadius(c.samp1, c.p1, c.normal, p, angle, u_halftoneRadius);
          float dist_c_2 = distanceToDotRadius(c.samp2, c.p2, c.normal, p, angle, u_halftoneRadius);
          float dist_c_3 = distanceToDotRadius(c.samp3, c.p3, c.normal, p, angle, u_halftoneRadius);
          float dist_c_4 = distanceToDotRadius(c.samp4, c.p4, c.normal, p, angle, u_halftoneRadius);
          
          float res = (dist_c_1 > 0.0) ? clamp(dist_c_1 / aa, 0.0, 1.0) : 0.0;
          res += (dist_c_2 > 0.0) ? clamp(dist_c_2 / aa, 0.0, 1.0) : 0.0;
          res += (dist_c_3 > 0.0) ? clamp(dist_c_3 / aa, 0.0, 1.0) : 0.0;
          res += (dist_c_4 > 0.0) ? clamp(dist_c_4 / aa, 0.0, 1.0) : 0.0;
          
          return clamp(res, 0.0, 1.0);
        }

        void main() {
          // Halftone (dots) mode
          if (u_mode == 2) {
            vec2 p = vec2(vUv.x * u_canvasSize.x, vUv.y * u_canvasSize.y);
            vec2 origin = vec2(0.0, 0.0);
            float aa = (u_halftoneRadius < 2.5) ? u_halftoneRadius * 0.5 : 1.25;

            // Define grid angles (R, G, B rotated at different angles to prevent moire)
            float rotateR = PI / 12.0;
            float rotateG = PI / 12.0 * 2.0;
            float rotateB = PI / 12.0 * 3.0;

            Cell cell_r = getReferenceCell(p, origin, rotateR, u_halftoneRadius);
            Cell cell_g = getReferenceCell(p, origin, rotateG, u_halftoneRadius);
            Cell cell_b = getReferenceCell(p, origin, rotateB, u_halftoneRadius);

            float r = getDotColour(cell_r, p, 0, rotateR, aa);
            float g = getDotColour(cell_g, p, 1, rotateG, aa);
            float b = getDotColour(cell_b, p, 2, rotateB, aa);

            // Mix ink and paper colors based on dithered density
            float l = (r + g + b) / 3.0;
            vec3 ink = paletteLookup(0.0);
            vec3 paper = paletteLookup(1.0);
            vec3 col = mix(paper, ink, l * u_intensity);
            
            gl_FragColor = vec4(col, 1.0);
            return;
          }

          // ASCII mode
          if (u_mode == 3) {
            vec2 cell = floor(vUv * u_cell);
            vec2 cellCenter = (cell + 0.5) / u_cell;
            vec3 src = texture2D(u_src, cellCenter).rgb;
            src = adjustExposure(src);
            float l = luma(src);

            float idx = floor(l * (u_charCount - 1.0) + 0.5);

            vec2 local = fract(vUv * u_cell);
            local.y = 1.0 - local.y;
            vec2 atlasUV = vec2((idx + local.x) / u_charCount, local.y);
            float glyph = texture2D(u_atlas, atlasUV).r;

            vec3 ink = paletteLookup(0.0);
            vec3 paper = paletteLookup(1.0);
            vec3 col = mix(paper, ink, glyph);
            gl_FragColor = vec4(col, 1.0);
            return;
          }

          // Bayer and Floyd modes
          vec3 src = texture2D(u_src, pixelUV(vUv)).rgb;
          src = adjustExposure(src);
          vec2 cell = floor(vUv * u_res);

          float l = luma(src);
          float threshold = 0.0;

          if (u_mode == 0) {
            threshold = bayerN(cell, u_matrixSize) * u_intensity;
          } else if (u_mode == 1) {
            float noise = interleavedGradientNoise(cell + u_time * 13.0);
            threshold = (noise - 0.5) * u_intensity;
          }

          float dithered = clamp(l + threshold, 0.0, 1.0);
          gl_FragColor = vec4(paletteLookup(dithered), 1.0);
        }
      `,
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
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

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
    if (!material) return;

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
  }, [
    options.mode,
    options.palette.join(","),
    options.matrixSize,
    options.intensity,
    options.contrast,
    options.brightness,
  ]);
}
