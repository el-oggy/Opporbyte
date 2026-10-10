export type Triple = [number, number, number];
export type Pose = { position: Triple; rotation: Triple; scale: number };
const scatter: Pose[] = [
  { position: [-2.55, 1.7, 0.35], rotation: [-0.16, 0.42, -0.15], scale: 1 },
  { position: [2.6, 1.55, -0.7], rotation: [0.08, -0.43, 0.13], scale: 0.95 },
  { position: [2.55, -1.15, 1.35], rotation: [-0.1, -0.43, 0.15], scale: 0.92 },
  { position: [-2.55, -1.55, 1.25], rotation: [0.1, 0.38, -0.1], scale: 1 },
  { position: [0.5, 2.85, 0.5], rotation: [-0.12, -0.32, -0.08], scale: 1 },
  { position: [0.25, -2.35, 0.6], rotation: [0.15, -0.36, 0.06], scale: 1 },
];
const organized: Pose[] = [
  { position: [-1.28, 0.58, 0.35], rotation: [-0.09, -0.22, 0], scale: 0.94 },
  { position: [1.33, 0.58, 0.35], rotation: [-0.09, -0.22, 0], scale: 0.94 },
  { position: [2.5, -1.1, 0.55], rotation: [-0.09, -0.22, 0], scale: 0.58 },
  { position: [-1.3, -1.08, 0.39], rotation: [-0.09, -0.22, 0], scale: 0.94 },
  { position: [1.05, -0.58, 0.45], rotation: [-0.09, -0.22, 0], scale: 0.85 },
  { position: [0.96, -1.45, 0.49], rotation: [-0.09, -0.22, 0], scale: 0.86 },
];
export function smooth(value: number, start = 0, end = 1) {
  const t = Math.min(1, Math.max(0, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
}
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
function blend(a: Pose, b: Pose, t: number): Pose {
  return {
    position: a.position.map((v, i) => mix(v, b.position[i], t)) as Triple,
    rotation: a.rotation.map((v, i) => mix(v, b.rotation[i], t)) as Triple,
    scale: mix(a.scale, b.scale, t),
  };
}
// Every pose is derived from progress. Scroll direction never accumulates state.
export function opportunityPose(
  index: number,
  progress: number,
  mobile = false,
): Pose {
  const source = scatter[index % scatter.length];
  if (mobile) {
    const positions: Triple[] = [
      [-1.8, 1.38, 0.9],
      [2, 1.8, -0.7],
      [1.75, -1, 1.1],
      [-1.9, -1.4, 0.9],
      [0, 2.65, 0],
      [0, -2.35, 0],
    ];
    return {
      ...source,
      position: positions[index],
      scale: source.scale * 0.76,
    };
  }
  const p = Math.min(1, Math.max(0, progress));
  const aligned: Pose = {
    position: source.position.map((v) => v * 0.9) as Triple,
    rotation: [
      source.rotation[0] * 0.6,
      source.rotation[1] * 0.75,
      source.rotation[2] * 0.3,
    ],
    scale: source.scale,
  };
  const gathered = blend(aligned, organized[index], 0.45);
  if (p < 0.25) return blend(source, aligned, smooth(p, 0, 0.25));
  if (p < 0.5) return blend(aligned, gathered, smooth(p, 0.25, 0.5));
  if (p < 0.8) return blend(gathered, organized[index], smooth(p, 0.5, 0.8));
  const settled: Pose = {
    ...organized[index],
    position: [
      organized[index].position[0],
      organized[index].position[1] - 0.18,
      organized[index].position[2],
    ],
  };
  return blend(organized[index], settled, smooth(p, 0.8, 1));
}
export function corePose(progress: number, mobile = false): Pose {
  const t = mobile ? 0 : smooth(progress, 0.32, 0.82);
  return {
    position: [mix(0, -2.7, t), mix(-0.05, 1.82, t), mix(-0.55, 0.42, t)],
    rotation: [-0.17, mix(-0.62, -0.25, t), mix(-0.16, 0, t)],
    scale: mix(mobile ? 0.94 : 1.1, 0.17, t),
  };
}
