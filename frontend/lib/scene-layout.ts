export type Triple = [number, number, number];
export const SCATTERED: Triple[] = [
  [-1.95, 1.83, -0.85],
  [2.28, 0.98, -1.25],
  [-1.95, -1.45, 1.05],
  [2.07, -1.75, 0.45],
  [0.65, 2.7, 0.35],
];
const CONNECTED: Triple[] = [
  [-2.2, 1.25, 0.3],
  [2.15, 1.2, -0.5],
  [-2, -1.5, 0.6],
  [2, -1.25, 0.2],
  [0.25, 2.65, 0.4],
];
export const ORGANIZED: Triple[] = [
  [-0.26, 0.55, 0.56],
  [2.5, 0.55, 0.2],
  [-2.73, -0.45, 0.78],
  [1.12, -1.18, 0.47],
  [2.35, 2.14, 0.18],
];
const ROTATIONS: Triple[] = [
  [0.13, 0.38, -0.16],
  [-0.12, -0.42, 0.12],
  [0.12, 0.42, -0.14],
  [-0.1, -0.36, 0.15],
  [0.14, -0.3, -0.1],
];
export const ORGANIZED_ROTATIONS: Triple[] = [
  [-0.07, -0.2, 0],
  [-0.07, -0.2, 0],
  [-0.07, -0.2, 0],
  [-0.07, -0.2, 0],
  [-0.07, -0.2, 0],
];
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

export function cardPose(
  index: number,
  progress: number,
): { position: Triple; rotation: Triple } {
  const p = Math.max(0, Math.min(1, progress));
  if (p === 0)
    return {
      position: [...SCATTERED[index]] as Triple,
      rotation: [...ROTATIONS[index]] as Triple,
    };
  if (p === 1)
    return {
      position: [...ORGANIZED[index]] as Triple,
      rotation: [...ORGANIZED_ROTATIONS[index]] as Triple,
    };
  const stage = p < 0.42 ? smooth(p / 0.42) : smooth((p - 0.42) / 0.58);
  const from = p < 0.42 ? SCATTERED[index] : CONNECTED[index];
  const to = p < 0.42 ? CONNECTED[index] : ORGANIZED[index];
  return {
    position: from.map((value, axis) => mix(value, to[axis], stage)) as Triple,
    rotation: ROTATIONS[index].map((value, axis) =>
      mix(value, ORGANIZED_ROTATIONS[index][axis], smooth(p)),
    ) as Triple,
  };
}

export function cameraPose(progress: number, inspection: number) {
  const p = Math.max(0, Math.min(1, progress));
  const inspect = Math.max(0, Math.min(1, inspection));
  const arc = Math.sin(p * Math.PI);
  return {
    position: [
      0.65 + arc * 2.6 + inspect * 4.2,
      0.8 + arc * 0.75 + inspect * 1.05,
      10.9 + smooth(p) * 1.15,
    ] as Triple,
    target: [0, 0.05 + smooth(p) * 0.12, 0] as Triple,
  };
}
