"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { cardPose } from "@/lib/scene-layout";
import { createCardTexture, studioTexture } from "./card-textures";

interface SceneProps {
  progress: RefObject<number>;
  reduced: boolean;
  mobile: boolean;
  visible: boolean;
  onReady: () => void;
  onFailure: () => void;
}

function roundedGeometry(width: number, height: number, radius = 0.15) {
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
  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.09,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.065,
    bevelThickness: 0.065,
    curveSegments: 8,
  });
}

function CareerCard({
  index,
  progress,
  reduced,
  mobile,
}: Pick<SceneProps, "progress" | "reduced" | "mobile"> & { index: number }) {
  const group = useRef<THREE.Group>(null);
  const { size } = useThree();
  const width = index === 4 ? 2.3 : 3.15,
    height = index === 4 ? 1.15 : 1.58;
  const geometry = useMemo(
    () => roundedGeometry(width, height),
    [width, height],
  );
  const texture = useMemo(() => createCardTexture(index), [index]);
  const elapsed = useRef(0);
  const pointer = useRef(new THREE.Vector2());
  useEffect(
    () => () => {
      geometry.dispose();
      texture.dispose();
    },
    [geometry, texture],
  );
  useFrame((state, delta) => {
    if (!group.current) return;
    if (!reduced) elapsed.current += Math.min(delta, 0.04);
    const p = reduced || mobile ? 0 : progress.current;
    const pose = cardPose(index, p);
    const float = reduced
      ? 0
      : Math.sin(elapsed.current * 0.65 + index * 1.6) * 0.075 * (1 - p);
    const intro = reduced ? 1 : Math.min(1, elapsed.current / 1.15);
    if (reduced || mobile) pointer.current.set(0, 0);
    else pointer.current.lerp(state.pointer, 1 - Math.exp(-5 * Math.min(delta, 0.05)));
    group.current.position.set(
      pose.position[0] * (mobile ? 0.77 : 1) + pointer.current.x * 0.04 * (1 - p),
      pose.position[1] * (mobile ? 0.88 : 1) + float + (1 - intro) * 0.22,
      pose.position[2],
    );
    const hover =
      !mobile && !reduced && size.width > 0 ? pointer.current : { x: 0, y: 0 };
    group.current.rotation.set(
      pose.rotation[0] - hover.y * 0.035 * (1 - p),
      pose.rotation[1] + hover.x * 0.045 * (1 - p),
      pose.rotation[2],
    );
    group.current.scale.setScalar(mobile ? 0.77 : 1);
  });
  return (
    <group ref={group}>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color={index === 4 ? "#97cec7" : "#d9cfbc"}
          roughness={0.62}
        />
      </mesh>
      <mesh position={[0, 0, 0.161]}>
        <planeGeometry args={[width - 0.025, height - 0.025]} />
        <meshBasicMaterial map={texture} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}

function Core({
  progress,
  reduced,
  mobile,
}: Pick<SceneProps, "progress" | "reduced" | "mobile">) {
  const core = useRef<THREE.Group>(null);
  const elapsed = useRef(0);
  const pointer = useRef(new THREE.Vector2());
  useFrame((state, delta) => {
    if (!core.current) return;
    if (!reduced) elapsed.current += Math.min(delta, 0.04);
    const p = reduced || mobile ? 0 : progress.current;
    const merge = THREE.MathUtils.smoothstep(p, 0.45, 1);
    if (reduced || mobile) pointer.current.set(0, 0);
    else pointer.current.lerp(state.pointer, 1 - Math.exp(-5 * Math.min(delta, 0.05)));
    core.current.position.set(
      0.05 - merge * 2.5 + pointer.current.x * 0.09 * (1 - p),
      -0.02 + merge * 2.12 + pointer.current.y * 0.07 * (1 - p),
      -0.2 + merge * 0.8,
    );
    core.current.scale.setScalar((mobile ? 0.88 : 1) * (1 - merge * 0.7));
    core.current.rotation.set(
      0.1 + (reduced ? 0 : Math.sin(elapsed.current * 0.32) * 0.1),
      -0.37 +
        (reduced
          ? 0
          : Math.sin(elapsed.current * 0.4) * 0.15 + pointer.current.x * 0.09),
      -0.3 + (reduced ? 0 : Math.sin(elapsed.current * 0.26) * 0.07),
    );
  });
  return (
    <group ref={core}>
      <mesh scale={[1, 1.16, 0.96]}>
        <torusGeometry args={[1.08, 0.41, 40, 100]} />
        <meshPhysicalMaterial
          color="#FF6B2B"
          roughness={0.28}
          metalness={0.08}
          clearcoat={1}
          clearcoatRoughness={0.17}
          envMapIntensity={0.65}
        />
      </mesh>
      <mesh position={[0, 0, -0.14]} scale={[1, 1.16, 1]}>
        <torusGeometry args={[0.71, 0.052, 12, 80]} />
        <meshStandardMaterial
          color="#292c27"
          roughness={0.38}
          metalness={0.15}
        />
      </mesh>
      <mesh
        position={[0, 0, -0.12]}
        rotation={[0, 0, 0.8]}
        scale={[1, 1.16, 1]}
      >
        <torusGeometry args={[0.705, 0.017, 8, 32, Math.PI * 0.43]} />
        <meshStandardMaterial
          color="#B9F0EC"
          emissive="#B9F0EC"
          emissiveIntensity={0.3}
        />
      </mesh>
      <mesh position={[1.12, 1.0, 0.02]}>
        <sphereGeometry args={[0.09, 16, 12]} />
        <meshPhysicalMaterial color="#292c27" roughness={0.2} />
      </mesh>
    </group>
  );
}

function Connections({
  progress,
  reduced,
  mobile,
}: Pick<SceneProps, "progress" | "reduced" | "mobile">) {
  const lines = useRef<THREE.Group>(null);
  const curves = useMemo(
    () =>
      [-1, 1].map((direction) => {
        const curve = new THREE.CubicBezierCurve3(
          new THREE.Vector3(-3.2, direction * 1.3, -1),
          new THREE.Vector3(-1, direction * 3.8, -1.3),
          new THREE.Vector3(2, direction * 3, -1.4),
          new THREE.Vector3(3, direction * -1.1, -1),
        );
        return new THREE.TubeGeometry(curve, 64, 0.008, 4, false);
      }),
    [],
  );
  useEffect(() => () => curves.forEach((curve) => curve.dispose()), [curves]);
  useFrame(() => {
    if (lines.current)
      lines.current.visible = mobile || reduced || progress.current < 0.77;
  });
  return (
    <group ref={lines}>
      {curves.map((geometry, i) => (
        <mesh key={i} geometry={geometry}>
          <meshBasicMaterial
            color={i === 0 ? "#a0c9bf" : "#c9bda5"}
            transparent
            opacity={0.62}
          />
        </mesh>
      ))}
      {[
        [-2.8, 1.4, -1],
        [2.65, -1.2, -0.5],
        [1.25, 2.7, -1.5],
        [-1.25, -2.7, -0.5],
      ].map((position, i) => (
        <mesh key={i} position={position as [number, number, number]}>
          <sphereGeometry args={[i % 2 ? 0.045 : 0.065, 12, 8]} />
          <meshStandardMaterial
            color={i % 2 ? "#FF6B2B" : "#8abeb6"}
            roughness={0.4}
          />
        </mesh>
      ))}
    </group>
  );
}

function WorkspaceFrame({
  progress,
  reduced,
  mobile,
}: Pick<SceneProps, "progress" | "reduced" | "mobile">) {
  const frame = useRef<THREE.Group>(null);
  const material = useRef<THREE.MeshStandardMaterial>(null);
  const geometry = useMemo(() => roundedGeometry(6.85, 5.15, 0.2), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(() => {
    const p = mobile || reduced ? 0 : progress.current;
    if (frame.current) frame.current.visible = p > 0.45;
    if (material.current)
      material.current.opacity =
        THREE.MathUtils.smoothstep(p, 0.45, 0.8) * 0.85;
  });
  return (
    <group ref={frame} position={[0, 0.22, -0.1]} visible={false}>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          ref={material}
          color="#fffdf8"
          transparent
          opacity={0}
          depthWrite={false}
          roughness={0.8}
        />
      </mesh>
    </group>
  );
}

function World(props: SceneProps) {
  const { invalidate, gl } = useThree();
  const { onFailure, onReady, mobile, reduced } = props;
  const environment = useMemo(() => studioTexture(), []);
  useEffect(() => {
    const onLost = (event: Event) => {
      event.preventDefault();
      onFailure();
    };
    gl.domElement.addEventListener("webglcontextlost", onLost);
    onReady();
    invalidate();
    return () => {
      environment.dispose();
      gl.domElement.removeEventListener("webglcontextlost", onLost);
    };
  }, [environment, invalidate, gl, onReady, onFailure]);
  useEffect(() => {
    invalidate();
  }, [mobile, reduced, invalidate]);
  return (
    <>
      <primitive object={environment} attach="environment" />
      <ambientLight intensity={0.45} />
      <hemisphereLight args={["#fffdf8", "#c8b397", 1.1]} />
      <directionalLight position={[-4, 6, 5]} intensity={1.8} color="#fff5e5" />
      <directionalLight position={[4, 1, -3]} intensity={1.1} color="#f4fff9" />
      <Core {...props} />
      <Connections {...props} />
      <WorkspaceFrame {...props} />
      {(props.mobile ? [0, 2, 4] : [0, 1, 2, 3, 4]).map((index) => (
        <CareerCard key={index} index={index} {...props} />
      ))}
    </>
  );
}

export default function CoreScene(props: SceneProps) {
  return (
    <Canvas
      className="webgl-scene"
      camera={{ position: [0, 0.1, props.mobile ? 10.8 : 11.2], fov: 40 }}
      dpr={[1, props.mobile ? 1.25 : 1.6]}
      frameloop={
        props.visible ? (props.reduced ? "demand" : "always") : "never"
      }
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      fallback={null}
    >
      <World {...props} />
    </Canvas>
  );
}
