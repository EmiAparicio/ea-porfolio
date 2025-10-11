/**
 * Clamps a number between a minimum and maximum value.
 * @param v The number to clamp.
 * @param a The minimum value.
 * @param b The maximum value.
 * @returns The clamped value.
 */
export function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}
