"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  createCardTexture,
  createWorkspaceTexture,
  studioTexture,
} from "../scene/card-textures";
import { corePose, opportunityPose, smooth } from "./poses";
import type { Hero3DProps } from "./Hero3D";

interface WorldProps extends Hero3DProps {
  visible: boolean;
  pointer: RefObject<{ x: number; y: number }>;
  onReady: () => void;
  onFailure: () => void;
}
function roundedGeometry(
  width: number,
  height: number,
  depth = 0.18,
  radius = 0.16,
) {
  const shape = new THREE.Shape();
  const x = -width / 2,
    y = -height / 2;
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
    bevelSize: 0.045,
    bevelThickness: 0.04,
    bevelSegments: 4,
    curveSegments: 12,
    steps: 1,
  });
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}
function sculpturalO() {
  const shape = new THREE.Shape();
  shape.absellipse(0, 0, 1.25, 1.46, 0, Math.PI * 2, false, 0);
  const hole = new THREE.Path();
  hole.absellipse(0, 0, 0.71, 0.94, 0, Math.PI * 2, true, 0);
  shape.holes.push(hole);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.8,
    bevelEnabled: true,
    bevelSegments: 8,
    bevelSize: 0.145,
    bevelThickness: 0.17,
    curveSegments: 64,
    steps: 1,
  });
  geometry.translate(0, 0, -0.4);
  // Assign the actual inner-wall triangles a dark ceramic material. Contiguous
  // groups keep draw calls low while the front face remains signature orange.
  const positions = geometry.getAttribute("position");
  const normals = geometry.getAttribute("normal");
  geometry.clearGroups();
  let start = 0;
  let material = 0;
  for (let i = 0; i < positions.count; i += 3) {
    const x =
      (positions.getX(i) + positions.getX(i + 1) + positions.getX(i + 2)) / 3;
    const y =
      (positions.getY(i) + positions.getY(i + 1) + positions.getY(i + 2)) / 3;
    const nz = Math.abs(
      (normals.getZ(i) + normals.getZ(i + 1) + normals.getZ(i + 2)) / 3,
    );
    const next = Math.hypot(x / 0.71, y / 0.94) < 1.28 && nz < 0.85 ? 1 : 0;
    if (i === 0) material = next;
    if (next !== material) {
      geometry.addGroup(start, i - start, material);
      start = i;
      material = next;
    }
  }
  geometry.addGroup(start, positions.count - start, material);
  return geometry;
}
function curvePaper(geometry: THREE.BufferGeometry) {
  const positions = geometry.getAttribute("position");
  for (let i = 0; i < positions.count; i++)
    positions.setZ(i, positions.getZ(i) + positions.getX(i) ** 2 * 0.075);
  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}
function detailTexture(index: number) {
  if (index < 3) {
    const texture = createCardTexture(index);
    if (index === 2) {
      const ctx = (texture.image as HTMLCanvasElement).getContext("2d")!;
      ctx.fillStyle = "#B9F0EC";
      ctx.beginPath();
      ctx.roundRect(51, 919, 410, 52, 26);
      ctx.fill();
      ctx.fillStyle = "#202420";
      ctx.font = "500 25px Inter, sans-serif";
      ctx.fillText("✓ Verified skills · Demo", 72, 953);
      texture.needsUpdate = true;
    }
    return texture;
  }
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = index === 3 ? 512 : 256;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = index === 4 ? "#B9F0EC" : "#FFFDF8";
  ctx.beginPath();
  ctx.roundRect(0, 0, canvas.width, canvas.height, 35);
  ctx.fill();
  ctx.fillStyle = "#202420";
  ctx.font = "600 58px Inter, sans-serif";
  if (index === 3) {
    ctx.fillText("Finance Analyst", 50, 230);
    ctx.font = "500 27px Inter, sans-serif";
    ctx.fillText("Morrow Collective · Fictional company", 50, 100);
    ctx.fillStyle = "#64675e";
    ctx.fillText("Finance / Hybrid", 50, 320);
    ctx.font = "500 22px Inter, sans-serif";
    ctx.fillText("DEMO OPPORTUNITY", 50, 448);
  } else {
    ctx.fillText(index === 4 ? "✳ Matched" : "Review needed ↗", 60, 115);
    ctx.font = "500 26px Inter, sans-serif";
    ctx.fillStyle = "#37665e";
    ctx.fillText(
      index === 4 ? "Verified skills · Demo" : "Your decision, always",
      60,
      189,
    );
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
function Core(props: WorldProps) {
  const group = useRef<THREE.Group>(null);
  const geometry = useMemo(() => sculpturalO(), []);
  const elapsed = useRef(0);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame((_state, delta) => {
    if (!group.current) return;
    if (!props.reduced) elapsed.current += Math.min(delta, 0.04);
    const p = props.reduced || props.mobile ? 0 : props.progress.current;
    const pose = corePose(p, props.mobile);
    const idle = props.reduced
      ? 0
      : Math.sin(elapsed.current * 0.35) * 0.06 * (1 - p);
    const intro = props.reduced ? 1 : smooth(elapsed.current, 0, 1.2);
    group.current.position.set(...pose.position);
    group.current.rotation.set(
      pose.rotation[0] + idle,
      pose.rotation[1] +
        idle +
        props.pointer.current.x * 0.08 * (1 - p) -
        (1 - intro) * 0.18,
      pose.rotation[2],
    );
    group.current.scale.setScalar(pose.scale);
  });
  return (
    <group ref={group}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          attach="material-0"
          color="#FF6B2B"
          roughness={0.23}
          metalness={0.02}
          clearcoat={1}
          clearcoatRoughness={0.2}
          envMapIntensity={0.75}
        />
        <meshPhysicalMaterial
          attach="material-1"
          color="#202420"
          roughness={0.4}
          metalness={0.08}
          clearcoat={0.45}
        />
      </mesh>
      <mesh position={[0, 0, -0.43]} scale={[1, 1.29, 1]}>
        <torusGeometry args={[0.715, 0.024, 10, 80]} />
        <meshStandardMaterial color="#B9F0EC" roughness={0.3} metalness={0.2} />
      </mesh>
      {Array.from({ length: 18 }, (_, i) => {
        const angle = (i / 18) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 0.69, Math.sin(angle) * 0.9, -0.18]}
            rotation={[0, 0, angle]}
          >
            <boxGeometry args={[0.018, 0.045, 0.23]} />
            <meshStandardMaterial color="#566055" roughness={0.55} />
          </mesh>
        );
      })}
      <mesh position={[0.93, 1.05, 0.48]} rotation={[0, 0, -0.67]}>
        <capsuleGeometry args={[0.045, 0.15, 4, 12]} />
        <meshPhysicalMaterial
          color="#B9F0EC"
          roughness={0.25}
          clearcoat={0.9}
        />
      </mesh>
    </group>
  );
}
function Opportunity({ index, ...props }: WorldProps & { index: number }) {
  const group = useRef<THREE.Group>(null);
  const elapsed = useRef(0);
  const width = index === 2 ? 1.72 : index > 3 ? 2.3 : 2.48;
  const height = index === 2 ? 2.36 : index > 3 ? 0.66 : 1.35;
  const geometries = useMemo(() => {
    const body = roundedGeometry(width, height, index === 2 ? 0.055 : 0.19);
    const face = new THREE.PlaneGeometry(
      width - 0.08,
      height - 0.08,
      index === 2 ? 24 : 1,
      1,
    );
    const sheet = roundedGeometry(width - 0.05, height - 0.05, 0.025);
    if (index === 2) {
      curvePaper(body);
      curvePaper(face);
      curvePaper(sheet);
    }
    return { body, face, sheet };
  }, [index, width, height]);
  const texture = useMemo(() => detailTexture(index), [index]);
  useEffect(
    () => () => {
      Object.values(geometries).forEach((g) => g.dispose());
      texture.dispose();
    },
    [geometries, texture],
  );
  useFrame((_state, delta) => {
    if (!group.current) return;
    if (!props.reduced) elapsed.current += Math.min(delta, 0.04);
    const p = props.reduced || props.mobile ? 0 : props.progress.current;
    const pose = opportunityPose(index, p, props.mobile);
    const settle = props.reduced ? 1 : smooth(elapsed.current, 0, 1.2);
    const idle = props.reduced
      ? 0
      : Math.sin(elapsed.current * 0.47 + index * 1.6) * 0.065 * (1 - p);
    const parallax = (1 - p) * (index % 2 ? -1 : 1);
    group.current.position.set(
      pose.position[0] + props.pointer.current.x * 0.12 * parallax,
      pose.position[1] + idle + (1 - settle) * 0.3,
      pose.position[2],
    );
    group.current.rotation.set(
      pose.rotation[0] + props.pointer.current.y * 0.07 * parallax,
      pose.rotation[1] + props.pointer.current.x * 0.08 * parallax,
      pose.rotation[2],
    );
    group.current.scale.setScalar(pose.scale);
  });
  return (
    <group ref={group}>
      <mesh geometry={geometries.body} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={index === 4 ? "#83b5ac" : "#cbbba1"}
          roughness={0.48}
          metalness={0.04}
          clearcoat={0.22}
        />
      </mesh>
      <mesh
        geometry={geometries.face}
        // Extruded front faces triangulate across the bowed paper outline;
        // keep the curved print beyond that front surface at its center too.
        position={[0, 0, index === 2 ? 0.15 : 0.141]}
      >
        <meshBasicMaterial
          map={texture}
          transparent
          alphaTest={0.1}
          toneMapped={false}
        />
      </mesh>
      {index === 2 && (
        <>
          <mesh
            geometry={geometries.sheet}
            position={[0.035, -0.04, -0.08]}
            rotation={[0, 0, -0.025]}
            castShadow
          >
            <meshStandardMaterial color="#fffdf8" roughness={0.85} />
          </mesh>
          <mesh
            geometry={geometries.sheet}
            position={[0.07, -0.08, -0.13]}
            rotation={[0, 0, -0.045]}
            castShadow
          >
            <meshStandardMaterial color="#e6d8be" roughness={0.9} />
          </mesh>
          <mesh position={[0.35, -0.93, 0.22]}>
            <boxGeometry args={[0.85, 0.055, 0.015]} />
            <meshStandardMaterial color="#B9F0EC" roughness={0.75} />
          </mesh>
        </>
      )}
    </group>
  );
}
function WorkspaceBoard(props: WorldProps) {
  const group = useRef<THREE.Group>(null);
  const body = useMemo(() => roundedGeometry(6.3, 4.75, 0.26, 0.24), []);
  const texture = useMemo(() => createWorkspaceTexture(), []);
  useEffect(
    () => () => {
      body.dispose();
      texture.dispose();
    },
    [body, texture],
  );
  useFrame(() => {
    if (!group.current) return;
    const p = props.reduced || props.mobile ? 0 : props.progress.current;
    const t = smooth(p, 0.38, 0.8);
    group.current.visible = p > 0.38;
    group.current.position.set(
      0,
      0.02 - smooth(p, 0.8, 1) * 0.18,
      -1.1 + t * 0.9,
    );
    group.current.scale.setScalar(0.68 + t * 0.32);
  });
  return (
    <group ref={group} visible={false} rotation={[-0.09, -0.22, 0]}>
      <mesh geometry={body} castShadow receiveShadow>
        <meshPhysicalMaterial color="#ebdeca" roughness={0.6} clearcoat={0.2} />
      </mesh>
      <mesh position={[0.1, 1.72, 0.181]}>
        <planeGeometry args={[5.4, 1.05]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.16, 0.18]}>
        <boxGeometry args={[5.84, 0.018, 0.024]} />
        <meshStandardMaterial color="#d8c9b0" />
      </mesh>
    </group>
  );
}
function Connections(props: WorldProps) {
  const group = useRef<THREE.Group>(null);
  const geometries = useMemo(
    () =>
      [0, 1, 2, 3].map((index) => {
        const pose = opportunityPose(index, 0);
        const start = new THREE.Vector3(...pose.position);
        const end = new THREE.Vector3(0, 0, -0.6);
        return new THREE.TubeGeometry(
          new THREE.CubicBezierCurve3(
            start,
            new THREE.Vector3(start.x * 0.6, start.y + 0.8, -1.4),
            new THREE.Vector3(start.x * 0.35, -start.y * 0.2, -1.3),
            end,
          ),
          32,
          0.013,
          5,
          false,
        );
      }),
    [],
  );
  useEffect(() => () => geometries.forEach((g) => g.dispose()), [geometries]);
  useFrame(() => {
    if (!group.current) return;
    const p = props.reduced || props.mobile ? 0 : props.progress.current;
    group.current.visible = !props.mobile && p < 0.67;
    const strength =
      (0.14 + smooth(p, 0.03, 0.22) * 0.45) * (1 - smooth(p, 0.3, 0.67));
    group.current.children.forEach((child) => {
      const material = (child as THREE.Mesh)
        .material as THREE.MeshStandardMaterial;
      material.opacity = strength;
    });
  });
  return (
    <group ref={group}>
      {geometries.map((geometry, index) => (
        <mesh key={index} geometry={geometry}>
          <meshStandardMaterial
            color={index % 2 ? "#9dc6ba" : "#d4ac83"}
            transparent
            opacity={0.14}
            roughness={0.75}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
function World(props: WorldProps) {
  const { camera, invalidate, gl } = useThree();
  const environment = useMemo(() => studioTexture(), []);
  const { onFailure, onReady } = props;
  const pointer = useRef(new THREE.Vector2());
  const targetPointer = useRef(new THREE.Vector2());
  const animatedPointer = useRef({ x: 0, y: 0 });
  const sent = useRef(false);
  const readyFrame = useRef(0);
  useFrame((_state, delta) => {
    const p = props.reduced || props.mobile ? 0 : props.progress.current;
    if (props.reduced || props.mobile) pointer.current.set(0, 0);
    else
      pointer.current.lerp(
        targetPointer.current.set(
          props.pointer.current.x,
          props.pointer.current.y,
        ),
        1 - Math.exp(-4 * Math.min(delta, 0.05)),
      );
    animatedPointer.current.x = pointer.current.x;
    animatedPointer.current.y = pointer.current.y;
    const arc = Math.sin(Math.min(1, Math.max(0, p)) * Math.PI);
    camera.position.set(
      0.85 + arc * 1.15 + pointer.current.x * 0.2,
      0.68 + arc * 0.55 + pointer.current.y * 0.14,
      props.mobile ? 11.5 : 12.65 + smooth(p) * 0.85,
    );
    camera.lookAt(0, 0.1, 0);
    if (!sent.current) {
      sent.current = true;
      readyFrame.current = requestAnimationFrame(onReady);
    }
  });
  useEffect(() => {
    const lost = (event: Event) => {
      event.preventDefault();
      onFailure();
    };
    gl.domElement.addEventListener("webglcontextlost", lost);
    invalidate();
    return () => {
      cancelAnimationFrame(readyFrame.current);
      gl.domElement.removeEventListener("webglcontextlost", lost);
      environment.dispose();
    };
  }, [environment, gl, invalidate, onFailure]);
  useEffect(() => {
    if (props.visible) invalidate();
  }, [props.visible, props.reduced, props.mobile, invalidate]);
  return (
    <>
      <primitive object={environment} attach="environment" />
      <ambientLight intensity={0.3} />
      <hemisphereLight args={["#fffdf8", "#b09978", 0.65]} />
      <directionalLight
        position={[-4, 7, 6]}
        intensity={2.5}
        color="#fff4e1"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-normalBias={0.035}
        shadow-bias={-0.0002}
        shadow-radius={8}
        shadow-blurSamples={8}
      />
      <directionalLight position={[5, 0, 5]} intensity={0.7} color="#fffdf8" />
      <directionalLight position={[3, 5, -5]} intensity={1.6} color="#e9fff7" />
      <group position={[0, 0.05, 0]}>
        <Connections {...props} />
        <WorkspaceBoard {...props} />
        <Core {...props} pointer={animatedPointer} />
        {(props.mobile ? [0, 2] : [0, 1, 2, 3, 4, 5]).map((index) => (
          <Opportunity
            {...props}
            pointer={animatedPointer}
            index={index}
            key={index}
          />
        ))}
      </group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -3.5, 0]}
        receiveShadow
      >
        <planeGeometry args={[25, 25]} />
        <shadowMaterial color="#674522" transparent opacity={0.065} />
      </mesh>
    </>
  );
}
export default function OpportunityWorld(props: WorldProps) {
  return (
    <Canvas
      camera={{ position: [0.85, 0.68, props.mobile ? 11.5 : 12.65], fov: 39 }}
      dpr={[1, props.mobile ? 1.2 : 1.5]}
      shadows="variance"
      frameloop={
        props.visible ? (props.reduced ? "demand" : "always") : "never"
      }
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
        toneMapping: THREE.NeutralToneMapping,
        toneMappingExposure: 0.9,
      }}
      fallback={null}
    >
      <World {...props} />
    </Canvas>
  );
}
