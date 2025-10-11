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

/**
 * Calculates the vertex points for a regular hexagon.
 * @param cx The x-coordinate of the center.
 * @param cy The y-coordinate of the center.
 * @param r The radius (distance from center to a vertex).
 * @param rotationDeg Optional rotation in degrees. Defaults to 0.
 * @param precision Optional number of decimal places for coordinates.
 * @returns A string of "x,y" pairs for use in an SVG `points` attribute.
 */
export function hexPoints(
  cx: number,
  cy: number,
  r: number,
  rotationDeg = 0,
  precision?: number
): string {
  const rot = (rotationDeg * Math.PI) / 180;
  const pts: Array<[number, number]> = [];

  for (let i = 0; i < 6; i++) {
    const a = rot + (Math.PI / 3) * i;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }

  return pts
    .map(([x, y]) =>
      precision != null
        ? `${x.toFixed(precision)},${y.toFixed(precision)}`
        : `${x},${y}`
    )
    .join(' ');
}


/**
 * Hashes a string to an unsigned 32-bit integer using the FNV-1a algorithm.
 * @param s The string to hash.
 * @returns The 32-bit hash code.
 */
export function hashStr(s: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Creates a seeded pseudorandom number generator using the mulberry32 algorithm.
 * @param a The 32-bit integer seed.
 * @returns A function that returns a random float between 0 and 1.
 */
export function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type RNG = () => number;