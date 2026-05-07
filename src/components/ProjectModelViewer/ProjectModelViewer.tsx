import { Canvas, useFrame } from "@react-three/fiber";
import { useLoader } from "@react-three/fiber";
import clsx from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { Box3, MeshBasicMaterial, Vector3 } from "three";
import type { Group, Mesh, Object3D } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import type { ProjectModel } from "../../data/portfolio";
import { getAssetPath } from "../../utils/assets";
import s from "./ProjectModelViewer.module.scss";

interface ProjectModelViewerProps {
  className?: string;
  isActive: boolean;
  model: ProjectModel;
  size?: "default" | "large";
}

interface ModelSceneProps {
  isActive: boolean;
  model: ProjectModel;
  rotationRef: RotationRef;
  isDraggingRef: BooleanRef;
}

interface RotationState {
  x: number;
  y: number;
}

interface RotationRef {
  current: RotationState;
}

interface BooleanRef {
  current: boolean;
}

type ModelLogo = NonNullable<ProjectModel["logo"]>;
type ModelExtra = NonNullable<ProjectModel["extras"]>[number];

const white = "#ffffff";
const black = "#000000";
const modelSolidMaterial = new MeshBasicMaterial({ color: white });
const modelWireMaterial = new MeshBasicMaterial({
  color: black,
  wireframe: true,
});

const isMesh = (object: Object3D): object is Mesh =>
  "isMesh" in object && Boolean((object as Mesh).isMesh);

const getModelSources = (model: ProjectModel) =>
  [model.src, model.logo?.src, ...(model.extras?.map((extra) => extra.src) ?? [])]
    .filter((src): src is string => Boolean(src))
    .map(getAssetPath);

const prepareModelClone = (
  scene: Object3D,
  material: MeshBasicMaterial,
  targetScale: number,
  wireframeScale = 1,
) => {
  const object = scene.clone(true);

  object.traverse((child) => {
    if (isMesh(child)) child.material = material;
  });

  const box = new Box3().setFromObject(object);
  const size = box.getSize(new Vector3());
  const center = box.getCenter(new Vector3());
  const maxSize = Math.max(size.x, size.y, size.z) || 1;
  const scale = (targetScale / maxSize) * wireframeScale;

  object.scale.setScalar(scale);
  object.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

  return object;
};

const getGeometry = (type: "sphere" | "cone" | "cylinder") => {
  if (type === "sphere") return <sphereGeometry args={[1, 8, 6]} />;
  if (type === "cone") return <coneGeometry args={[1, 1.8, 4]} />;

  return <cylinderGeometry args={[0.55, 0.55, 1, 8]} />;
};

function Block({
  position,
  scale,
}: {
  position: [number, number, number];
  scale: [number, number, number];
}) {
  return (
    <group position={position} scale={scale}>
      <mesh>
        <boxGeometry />
        <meshBasicMaterial color={white} />
      </mesh>
      <mesh scale={[1.01, 1.01, 1.01]}>
        <boxGeometry />
        <meshBasicMaterial color={black} wireframe />
      </mesh>
    </group>
  );
}

function Shape({
  type,
  position,
  scale,
}: {
  type: "sphere" | "cone" | "cylinder";
  position: [number, number, number];
  scale: [number, number, number];
}) {
  return (
    <group position={position} scale={scale}>
      <mesh>
        {getGeometry(type)}
        <meshBasicMaterial color={white} />
      </mesh>
      <mesh scale={[1.01, 1.01, 1.01]}>
        {getGeometry(type)}
        <meshBasicMaterial color={black} wireframe />
      </mesh>
    </group>
  );
}

function ToothModel() {
  return (
    <group>
      <Shape
        type="sphere"
        position={[-0.45, 0.35, 0]}
        scale={[0.65, 0.5, 0.55]}
      />
      <Shape
        type="sphere"
        position={[0.45, 0.35, 0]}
        scale={[0.65, 0.5, 0.55]}
      />
      <Shape
        type="cone"
        position={[-0.32, -0.55, 0]}
        scale={[0.34, 0.8, 0.34]}
      />
      <Shape
        type="cone"
        position={[0.32, -0.55, 0]}
        scale={[0.34, 0.8, 0.34]}
      />
    </group>
  );
}

function ShirtModel() {
  return (
    <group>
      <Block position={[0, 0, 0]} scale={[1.25, 1.05, 0.25]} />
      <Block position={[-0.95, 0.25, 0]} scale={[0.55, 0.35, 0.25]} />
      <Block position={[0.95, 0.25, 0]} scale={[0.55, 0.35, 0.25]} />
      <Block position={[0, 0.74, 0]} scale={[0.42, 0.26, 0.28]} />
    </group>
  );
}

function PrinterModel() {
  return (
    <group>
      <Block position={[0, -0.55, 0]} scale={[1.45, 0.28, 0.75]} />
      <Block position={[-0.7, 0.1, 0]} scale={[0.18, 1.1, 0.18]} />
      <Block position={[0.7, 0.1, 0]} scale={[0.18, 1.1, 0.18]} />
      <Block position={[0, 0.68, 0]} scale={[1.55, 0.18, 0.18]} />
      <Block position={[0, 0.22, 0]} scale={[0.5, 0.28, 0.32]} />
    </group>
  );
}

function ChatModel() {
  return (
    <group>
      <Block position={[0, 0.12, 0]} scale={[1.45, 0.82, 0.22]} />
      <Shape
        type="cone"
        position={[-0.45, -0.55, 0]}
        scale={[0.32, 0.45, 0.22]}
      />
      <Block position={[-0.42, 0.18, 0.25]} scale={[0.16, 0.16, 0.08]} />
      <Block position={[0, 0.18, 0.25]} scale={[0.16, 0.16, 0.08]} />
      <Block position={[0.42, 0.18, 0.25]} scale={[0.16, 0.16, 0.08]} />
    </group>
  );
}

function KanbanModel() {
  return (
    <group>
      <Block position={[0, 0, 0]} scale={[1.65, 1.1, 0.12]} />
      <Block position={[-0.55, 0.15, 0.18]} scale={[0.38, 0.7, 0.08]} />
      <Block position={[0, -0.05, 0.18]} scale={[0.38, 0.7, 0.08]} />
      <Block position={[0.55, 0.2, 0.18]} scale={[0.38, 0.7, 0.08]} />
    </group>
  );
}

function ModelObject({ kind }: { kind: ProjectModel["kind"] }) {
  switch (kind) {
    case "tooth":
      return <ToothModel />;
    case "shirt":
      return <ShirtModel />;
    case "printer":
      return <PrinterModel />;
    case "chat-bubble":
      return <ChatModel />;
    case "kanban-board":
    default:
      return <KanbanModel />;
  }
}

function DownloadedObject({
  src,
  scale = 2.2,
}: {
  src: string;
  scale?: number;
}) {
  const assetSrc = getAssetPath(src);
  const gltf = useLoader(GLTFLoader, assetSrc);
  const solidModel = useMemo(
    () => prepareModelClone(gltf.scene, modelSolidMaterial, scale),
    [gltf.scene, scale],
  );
  const wireModel = useMemo(
    () => prepareModelClone(gltf.scene, modelWireMaterial, scale, 1.015),
    [gltf.scene, scale],
  );

  return (
    <group>
      <primitive object={solidModel} dispose={null} />
      <primitive object={wireModel} dispose={null} />
    </group>
  );
}

function DownloadedModel({ model }: { model: ProjectModel }) {
  if (!model.src) return null;

  return (
    <group
      position={model.position ?? [0, 0, 0]}
      rotation={model.rotation ?? [0, 0, 0]}
    >
      <DownloadedObject src={model.src} scale={model.scale} />
    </group>
  );
}

function ExtraModel({ extra }: { extra: ModelExtra }) {
  return (
    <group
      position={extra.position ?? [0, 0, 0]}
      rotation={extra.rotation ?? [0, 0, 0]}
    >
      <DownloadedObject src={extra.src} scale={extra.scale} />
    </group>
  );
}

function RotatingLogo({ logo }: { logo: ModelLogo }) {
  const groupRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    groupRef.current.rotation.y += delta * (logo.rotationSpeed ?? 0.6);
  });

  return (
    <group ref={groupRef} position={logo.position ?? [0, 1.15, 0]}>
      <DownloadedObject src={logo.src} scale={logo.scale ?? 0.8} />
    </group>
  );
}

function ModelScene({
  isActive,
  model,
  rotationRef,
  isDraggingRef,
}: ModelSceneProps) {
  const groupRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (!isActive || !groupRef.current) return;

    const targetRotation = rotationRef.current;
    const easing = isDraggingRef.current ? 0.45 : 0.12;

    if (!isDraggingRef.current) {
      targetRotation.y += delta * 0.15;
    }

    groupRef.current.rotation.y +=
      (targetRotation.y - groupRef.current.rotation.y) * easing;
    groupRef.current.rotation.x +=
      (targetRotation.x - groupRef.current.rotation.x) * easing;
  });

  return (
    <>
      <group
        ref={groupRef}
        rotation={[rotationRef.current.x, rotationRef.current.y, 0]}
      >
        {model.src ? (
          <DownloadedModel model={model} />
        ) : (
          <ModelObject kind={model.kind} />
        )}
        {model.extras?.map((extra) => (
          <ExtraModel key={extra.src} extra={extra} />
        ))}
      </group>
      {model.logo && <RotatingLogo logo={model.logo} />}
    </>
  );
}

export function ProjectModelViewer({
  className,
  isActive,
  model,
  size = "default",
}: ProjectModelViewerProps) {
  const rotationRef = useRef<RotationState>({ x: -0.15, y: 0.45 });
  const isDraggingRef = useRef(false);
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const dragStartRef = useRef<{
    x: number;
    y: number;
    rotation: RotationState;
  } | null>(null);
  const modelSources = useMemo(() => getModelSources(model), [model]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || hasBeenVisible) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;

      setHasBeenVisible(true);
      observer.disconnect();
    });

    observer.observe(viewer);

    return () => observer.disconnect();
  }, [hasBeenVisible]);

  useEffect(() => {
    if (!hasBeenVisible) return;

    modelSources.forEach((src) => {
      useLoader.preload(GLTFLoader, src);
    });
  }, [hasBeenVisible, modelSources]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      rotation: { ...rotationRef.current },
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = dragStartRef.current;
    if (!start) return;

    rotationRef.current = {
      x: start.rotation.x + (event.clientY - start.y) * 0.01,
      y: start.rotation.y + (event.clientX - start.x) * 0.01,
    };
  };

  const handlePointerUp = () => {
    dragStartRef.current = null;
    isDraggingRef.current = false;
  };

  return (
    <div
      ref={viewerRef}
      className={clsx(s.viewer, s[size], className)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {hasBeenVisible ? (
        <Canvas
          className={s.canvas}
          camera={{ position: [0, 0.15, 4.2], fov: 35 }}
          dpr={1}
          frameloop={isActive ? "always" : "demand"}
          gl={{ antialias: false, powerPreference: "low-power" }}
        >
          <color attach="background" args={[white]} />
          <ModelScene
            isActive={isActive}
            model={model}
            rotationRef={rotationRef}
            isDraggingRef={isDraggingRef}
          />
        </Canvas>
      ) : (
        <div className={s.viewerFallback} />
      )}
      <div className={s.caption}>{model.label}</div>
    </div>
  );
}
