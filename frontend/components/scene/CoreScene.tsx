"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { cameraPose, cardPose } from "@/lib/scene-layout";
import {
  createCardTexture,
  createWorkspaceTexture,
  studioTexture,
} from "./card-textures";

interface SceneProps {
  progress: RefObject<number>;
  reduced: boolean;
  mobile: boolean;
  compact: boolean;
  inspection: boolean;
  visible: boolean;
  onReady: () => void;
  onFailure: () => void;
}

function roundedGeometry(
  width: number,
  height: number,
  depth = 0.22,
  radius = 0.14,
) {
  const x = -width / 2,
    y = -height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.045,
    bevelThickness: 0.045,
    curveSegments: 10,
  });
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}

function coreGeometry() {
  const shape = new THREE.Shape();
  shape.absellipse(0, 0, 1.36, 1.59, 0, Math.PI * 2, false, 0);
  const hole = new THREE.Path();
  hole.absellipse(0, 0, 0.85, 1.08, 0, Math.PI * 2, true, 0);
  shape.holes.push(hole);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.68,
    steps: 1,
    bevelEnabled: true,
    bevelSegments: 8,
    bevelSize: 0.16,
    bevelThickness: 0.17,
    curveSegments: 64,
  });
  geometry.translate(0, 0, -0.34);
  return geometry;
}

function CareerCard({
  index,
  progress,
  reduced,
  mobile,
  compact,
}: SceneProps & { index: number }) {
  const group = useRef<THREE.Group>(null);
  const width = index === 2 ? 2.03 : index === 4 ? 2.18 : 2.65;
  const height = index === 2 ? 2.55 : index === 4 ? 1.03 : 1.42;
  const geometry = useMemo(
    () => roundedGeometry(width, height),
    [width, height],
  );
  const layerGeometry = useMemo(
    () => roundedGeometry(width - 0.12, height - 0.12, 0.035),
    [width, height],
  );
  const texture = useMemo(() => createCardTexture(index), [index]);
  const elapsed = useRef(0);
  const pointer = useRef(new THREE.Vector2());
  useEffect(
    () => () => {
      geometry.dispose();
      layerGeometry.dispose();
      texture.dispose();
    },
    [geometry, layerGeometry, texture],
  );
  useFrame((state, delta) => {
    if (!group.current) return;
    if (!reduced) elapsed.current += Math.min(delta, 0.04);
    const p = reduced || compact ? 0 : progress.current;
    const pose = cardPose(index, p, compact);
    const intro = reduced
      ? 1
      : THREE.MathUtils.smoothstep(elapsed.current, 0, 1.35);
    const float = reduced
      ? 0
      : Math.sin(elapsed.current * 0.6 + index * 1.7) * 0.11 * (1 - p);
    if (reduced || mobile) pointer.current.set(0, 0);
    else
      pointer.current.lerp(
        state.pointer,
        1 - Math.exp(-4 * Math.min(delta, 0.05)),
      );
    const sign = index % 2 ? -1 : 1;
    group.current.position.set(
      pose.position[0] * (mobile ? 0.79 : 1) +
        pointer.current.x * 0.16 * sign * (1 - p),
      pose.position[1] * (mobile ? 0.8 : 1) + float + (1 - intro) * 0.7,
      pose.position[2] + pointer.current.x * 0.12 * sign * (1 - p),
    );
    group.current.rotation.set(
      pose.rotation[0] - pointer.current.y * 0.09 * (1 - p),
      pose.rotation[1] + pointer.current.x * 0.13 * (1 - p),
      pose.rotation[2] + (1 - intro) * 0.1 * sign,
    );
    group.current.scale.setScalar(mobile ? 0.74 : 1);
  });
  return (
    <group ref={group}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={index === 4 ? "#76b4af" : "#c5b8a0"}
          roughness={0.36}
          metalness={0.12}
          clearcoat={0.6}
        />
      </mesh>
      <mesh geometry={layerGeometry} position={[0, 0, 0.148]} receiveShadow>
        <meshStandardMaterial
          color={index === 4 ? "#B9F0EC" : "#FFFDF8"}
          roughness={0.7}
        />
      </mesh>
      <mesh position={[0, 0, 0.215]} receiveShadow>
        <planeGeometry args={[width - 0.16, height - 0.16]} />
        <meshBasicMaterial
          map={texture}
          toneMapped={false}
          transparent
          alphaTest={0.1}
        />
      </mesh>
      {index === 2 && (
        <mesh
          geometry={layerGeometry}
          position={[0.035, -0.055, -0.155]}
          rotation={[0, 0, -0.026]}
          castShadow
        >
          <meshStandardMaterial color="#e8dcc6" roughness={0.75} />
        </mesh>
      )}
    </group>
  );
}

function Core({ progress, reduced, mobile, compact }: SceneProps) {
  const core = useRef<THREE.Group>(null);
  const geometry = useMemo(() => coreGeometry(), []);
  const elapsed = useRef(0);
  const pointer = useRef(new THREE.Vector2());
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame((state, delta) => {
    if (!core.current) return;
    if (!reduced) elapsed.current += Math.min(delta, 0.04);
    const p = reduced || compact ? 0 : progress.current;
    const merge = THREE.MathUtils.smoothstep(p, 0.43, 1);
    const intro = reduced
      ? 1
      : THREE.MathUtils.smoothstep(elapsed.current, 0, 1.4);
    if (reduced || mobile) pointer.current.set(0, 0);
    else
      pointer.current.lerp(
        state.pointer,
        1 - Math.exp(-4 * Math.min(delta, 0.05)),
      );
    core.current.position.set(
      0.12 - merge * 3.23 + pointer.current.x * 0.08,
      -0.03 + merge * 2.28 - (1 - intro) * 0.5 + pointer.current.y * 0.06,
      -0.05 + merge * 0.38,
    );
    core.current.scale.setScalar((mobile ? 0.91 : 1.12) * (1 - merge * 0.82));
    core.current.rotation.set(
      -0.18 + (reduced ? 0 : Math.sin(elapsed.current * 0.38) * 0.12),
      -0.53 +
        (reduced ? 0 : Math.sin(elapsed.current * 0.32) * 0.2) +
        pointer.current.x * 0.16 -
        (1 - intro) * 0.45,
      -0.24 + (reduced ? 0 : Math.sin(elapsed.current * 0.23) * 0.05),
    );
  });
  return (
    <group ref={core}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#FF6B2B"
          roughness={0.24}
          metalness={0.08}
          clearcoat={1}
          clearcoatRoughness={0.2}
          envMapIntensity={0.65}
        />
      </mesh>
      {/* A recessed, ribbed inner wall makes the letter a physical object. */}
      <mesh position={[0, 0, -0.23]} scale={[1, 1.26, 2.3]} castShadow>
        <torusGeometry args={[0.81, 0.12, 20, 96]} />
        <meshPhysicalMaterial
          color="#292e28"
          roughness={0.34}
          metalness={0.38}
        />
      </mesh>
      <mesh position={[0, 0, -0.39]} scale={[1, 1.26, 1]}>
        <torusGeometry args={[0.81, 0.043, 12, 96]} />
        <meshStandardMaterial
          color="#8cbab2"
          metalness={0.22}
          roughness={0.32}
        />
      </mesh>
      {Array.from({ length: 24 }, (_, i) => {
        const angle = (i / 24) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * 0.785,
              Math.sin(angle) * 0.995,
              -0.195,
            ]}
            rotation={[0, 0, angle]}
          >
            <boxGeometry args={[0.025, 0.058, 0.24]} />
            <meshStandardMaterial
              color="#596052"
              roughness={0.44}
              metalness={0.4}
            />
          </mesh>
        );
      })}
      <mesh
        position={[0, 0, 0.345]}
        rotation={[0, 0, -0.75]}
        scale={[1, 1.26, 1]}
      >
        <torusGeometry args={[0.872, 0.015, 8, 32, Math.PI * 0.32]} />
        <meshStandardMaterial
          color="#B9F0EC"
          emissive="#B9F0EC"
          emissiveIntensity={0.22}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[1.03, 1.21, 0.38]} rotation={[0, 0, -0.7]}>
        <capsuleGeometry args={[0.045, 0.15, 4, 12]} />
        <meshPhysicalMaterial
          color="#202420"
          roughness={0.25}
          metalness={0.2}
        />
      </mesh>
    </group>
  );
}

function Connections({ progress, reduced, mobile, compact }: SceneProps) {
  const lines = useRef<THREE.Group>(null);
  const elapsed = useRef(0);
  const geometries = useMemo(
    () =>
      [0, 1].map((i) => {
        const points = Array.from({ length: 101 }, (_, n) => {
          const angle = (n / 100) * Math.PI * 2;
          return new THREE.Vector3(
            Math.cos(angle) * (4.3 - i * 0.25),
            Math.sin(angle) * 2.33,
            Math.sin(angle + i) * 1.35 - 0.9,
          );
        });
        return new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3(points),
          100,
          i ? 0.008 : 0.012,
          6,
          true,
        );
      }),
    [],
  );
  useEffect(
    () => () => geometries.forEach((geometry) => geometry.dispose()),
    [geometries],
  );
  useFrame((_state, delta) => {
    if (!lines.current) return;
    if (!reduced) elapsed.current += Math.min(delta, 0.04);
    const p = reduced || compact ? 0 : progress.current;
    lines.current.visible = p < 0.8;
    lines.current.rotation.set(
      0.35,
      -0.14 + Math.sin(elapsed.current * 0.15) * 0.08,
      -0.27,
    );
    lines.current.scale.setScalar(mobile ? 0.74 : 1);
    const strength =
      (0.08 + THREE.MathUtils.smoothstep(p, 0.08, 0.42) * 0.6) *
      (1 - THREE.MathUtils.smoothstep(p, 0.52, 0.8));
    for (let i = 0; i < 2; i++) {
      const material = (lines.current.children[i] as THREE.Mesh)
        .material as THREE.MeshStandardMaterial;
      material.opacity = (i ? 0.55 : 1) * (compact ? 0.18 : strength);
    }
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + (reduced ? 0 : elapsed.current * 0.16);
      lines.current.children[i + 2].position.set(
        Math.cos(angle) * 4.3,
        Math.sin(angle) * 2.33,
        Math.sin(angle) * 1.35 - 0.9,
      );
    }
  });
  return (
    <group ref={lines} rotation={[0.35, -0.14, -0.27]}>
      {geometries.map((geometry, i) => (
        <mesh key={i} geometry={geometry}>
          <meshStandardMaterial
            color={i ? "#c8b591" : "#83b7ad"}
            transparent
            opacity={i ? 0.38 : 0.55}
            roughness={0.6}
          />
        </mesh>
      ))}
      {[
        [-3, 1.1, -0.25],
        [2.6, -1.4, -1.4],
        [1.5, 2.15, 0.2],
        [-1, -2.24, -1.8],
      ].map((position, i) => (
        <mesh
          key={i}
          position={position as [number, number, number]}
          castShadow
        >
          <sphereGeometry args={[i % 2 ? 0.068 : 0.105, 16, 12]} />
          <meshPhysicalMaterial
            color={i % 2 ? "#FF6B2B" : "#B9F0EC"}
            metalness={0.1}
            roughness={0.25}
            clearcoat={1}
          />
        </mesh>
      ))}
    </group>
  );
}

function WorkspaceFrame({ progress, reduced, compact }: SceneProps) {
  const frame = useRef<THREE.Group>(null);
  const geometry = useMemo(() => roundedGeometry(8.2, 4.95, 0.28, 0.25), []);
  const texture = useMemo(() => createWorkspaceTexture(), []);
  useEffect(
    () => () => {
      geometry.dispose();
      texture.dispose();
    },
    [geometry, texture],
  );
  useFrame(() => {
    if (!frame.current) return;
    const p = reduced || compact ? 0 : progress.current;
    const enter = THREE.MathUtils.smoothstep(p, 0.44, 0.9);
    frame.current.visible = p > 0.44;
    frame.current.scale.setScalar(0.72 + enter * 0.28);
    frame.current.position.z = -2 + enter * 1.65;
  });
  return (
    <group
      ref={frame}
      position={[0, 0.25, -2]}
      rotation={[-0.07, -0.2, 0]}
      visible={false}
    >
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#f7f1e6"
          roughness={0.46}
          metalness={0.05}
          clearcoat={0.25}
        />
      </mesh>
      <mesh position={[0, 1.5, 0.195]}>
        <boxGeometry args={[7.65, 0.018, 0.014]} />
        <meshStandardMaterial color="#d7cbb6" />
      </mesh>
      <mesh position={[-0.4, 1.95, 0.22]}>
        <planeGeometry args={[4.4, 0.9]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

function CameraRig({
  progress,
  reduced,
  mobile,
  compact,
  inspection,
}: SceneProps) {
  const { camera, size } = useThree();
  const inspect = useRef(inspection ? 1 : 0);
  const pointer = useRef(new THREE.Vector2());
  useFrame((state, delta) => {
    const damp = 1 - Math.exp(-4 * Math.min(delta, 0.05));
    inspect.current = reduced
      ? Number(inspection)
      : THREE.MathUtils.lerp(inspect.current, Number(inspection), damp);
    if (reduced || mobile) pointer.current.set(0, 0);
    else pointer.current.lerp(state.pointer, damp);
    const p = reduced || compact ? 0 : progress.current;
    const pose = cameraPose(p, inspect.current);
    camera.position.set(
      pose.position[0] + pointer.current.x * 0.35,
      pose.position[1] + pointer.current.y * 0.23,
      mobile
        ? 9.65
        : compact
          ? 10.2
          : pose.position[2] + (size.width < 1150 ? 0.5 : 0),
    );
    camera.lookAt(...pose.target);
  });
  return null;
}

function World(props: SceneProps) {
  const { invalidate, gl } = useThree();
  const { onFailure, onReady, mobile, reduced, inspection } = props;
  const environment = useMemo(() => studioTexture(), []);
  const readySent = useRef(false);
  const readyFrame = useRef(0);
  // Readiness means the first composed frame has actually rendered, rather
  // than just that the WebGL context exists. This also keeps the fallback
  // present through the renderer's initial material/shadow setup.
  useFrame(() => {
    if (readySent.current) return;
    readySent.current = true;
    readyFrame.current = requestAnimationFrame(onReady);
  });
  useEffect(() => {
    const onLost = (event: Event) => {
      event.preventDefault();
      onFailure();
    };
    gl.domElement.addEventListener("webglcontextlost", onLost);
    invalidate();
    return () => {
      cancelAnimationFrame(readyFrame.current);
      environment.dispose();
      gl.domElement.removeEventListener("webglcontextlost", onLost);
    };
  }, [environment, invalidate, gl, onFailure]);
  useEffect(() => {
    invalidate();
  }, [mobile, reduced, inspection, invalidate]);
  return (
    <>
      <primitive object={environment} attach="environment" />
      <ambientLight intensity={0.4} />
      <hemisphereLight args={["#fffdf8", "#ab9575", 0.85]} />
      <directionalLight
        position={[-3, 7, 5]}
        intensity={2.4}
        color="#fff7ea"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-normalBias={0.035}
        shadow-bias={-0.0003}
        shadow-radius={10}
        shadow-blurSamples={12}
      />
      <directionalLight position={[4, 1, 4]} intensity={0.65} color="#fffdf8" />
      <directionalLight position={[3, 4, -4]} intensity={1.4} color="#effff7" />
      <CameraRig {...props} />
      <group position={[0, props.compact ? 0 : -1.6, 0]}>
        <Core {...props} />
        <Connections {...props} />
        <WorkspaceFrame {...props} />
        {(mobile ? [0, 2, 4] : [0, 1, 2, 3, 4]).map((index) => (
          <CareerCard key={index} index={index} {...props} />
        ))}
      </group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, props.compact ? -3.4 : -4, 0]}
        receiveShadow
      >
        <planeGeometry args={[30, 30]} />
        <shadowMaterial color="#62482c" transparent opacity={0.085} />
      </mesh>
    </>
  );
}

export default function CoreScene(props: SceneProps) {
  return (
    <Canvas
      className="webgl-scene"
      camera={{ position: [0.65, 0.8, props.mobile ? 9.65 : 12.1], fov: 42 }}
      dpr={[1, props.mobile ? 1.25 : 1.6]}
      shadows="variance"
      frameloop={
        props.visible ? (props.reduced ? "demand" : "always") : "never"
      }
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
        toneMappingExposure: 0.9,
        toneMapping: THREE.NeutralToneMapping,
      }}
      fallback={null}
    >
      <World {...props} />
    </Canvas>
  );
}
