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

/**
 * Checks if two numbers are approximately equal within a given tolerance (epsilon).
 * @param a The first number.
 * @param b The second number.
 * @param eps The maximum allowed difference. Defaults to 0.5.
 * @returns `true` if the absolute difference is less than or equal to epsilon.
 */
export const near = (a: number, b: number, eps = 0.5) => Math.abs(a - b) <= eps;
