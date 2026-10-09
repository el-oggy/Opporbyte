export type Triple = [number, number, number];
export const SCATTERED: Triple[] = [
  [-1.55, 1.75, -0.5],
  [2.12, 0.72, 0.1],
  [-1.72, -1.55, 0.65],
  [1.65, -1.92, -0.1],
  [0.8, 2.38, -1.4],
];
const CONNECTED: Triple[] = [
  [-1.8, 1.6, -0.3],
  [2, 1.3, 0],
  [-1.8, -1.4, 0.3],
  [1.7, -1.5, 0],
  [0.35, 2.6, -1],
];
export const ORGANIZED: Triple[] = [
  [-1.55, 0.7, 0.5],
  [1.6, 0.7, 0.5],
  [-1.55, -1.13, 0.5],
  [1.6, -1.13, 0.5],
  [0, 2.0, 0.5],
];
const ROTATIONS: Triple[] = [
  [0.13, 0.28, -0.15],
  [-0.08, -0.3, 0.12],
  [0.13, 0.2, -0.1],
  [-0.15, -0.18, 0.1],
  [0.08, -0.2, -0.08],
];
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

export function cardPose(
  index: number,
  progress: number,
): { position: Triple; rotation: Triple } {
  const p = Math.max(0, Math.min(1, progress));
  const stage = p < 0.42 ? smooth(p / 0.42) : smooth((p - 0.42) / 0.58);
  const from = p < 0.42 ? SCATTERED[index] : CONNECTED[index];
  const to = p < 0.42 ? CONNECTED[index] : ORGANIZED[index];
  return {
    position: from.map((value, axis) => mix(value, to[axis], stage)) as Triple,
    rotation:
      p === 1
        ? [0, 0, 0]
        : (ROTATIONS[index].map((value) => value * (1 - smooth(p))) as Triple),
  };
}
