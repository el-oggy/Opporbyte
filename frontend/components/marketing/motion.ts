export const clamp = (value: number) => Math.min(1, Math.max(0, value));

// Exponential damping follows the same path at different frame rates.
export function damp(current: number, target: number, elapsed: number) {
  return current + (target - current) * (1 - Math.exp(-elapsed / 0.085));
}

export function sceneProgress(top: number, viewport: number) {
  return clamp((viewport * 0.88 - top) / (viewport * 0.7));
}
