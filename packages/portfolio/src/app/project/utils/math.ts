/**
 * Shuffles an array using the Fisher-Yates (aka Knuth) algorithm.
 * Creates a shallow copy of the array and shuffles it.
 * @param arr The array to shuffle.
 * @returns A new array with the elements shuffled.
 * @template T
 */
export function shuffle<T>(arr: T[]) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
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
 * Generates an array of integers within a specified range.
 * @param a The starting number of the range (inclusive).
 * @param b The ending number of the range (inclusive).
 * @returns An array containing the sequence of integers.
 */
export function range(a: number, b: number) {
  const out: number[] = [];
  for (let i = a; i <= b; i++) out.push(i);
  return out;
}

export type RNG = () => number;

/**
 * Creates a seeded pseudorandom number generator (PRNG).
 * This implementation uses the mulberry32 algorithm.
 * @param seed The initial 32-bit integer seed.
 * @returns A random number generator function that produces values between 0 and 1.
 */
export function seededRng(seed: number): RNG {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generates a normally distributed random number (mean 0, standard deviation 1)
 * using the Box-Muller transform.
 * @param rng A random number generator function that returns values between 0 and 1.
 * @returns A random number from a standard normal distribution.
 */
export function gaussian(rng: RNG): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * Performs linear interpolation between two numbers.
 * @param a The start value (when t=0).
 * @param b The end value (when t=1).
 * @param t The interpolation factor, typically in the range [0, 1].
 * @returns The interpolated value.
 */
export function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Safely converts a string or number to a non-negative integer pixel value.
 * @param v The value to convert.
 * @param fallback The value to return if the input is undefined or cannot be parsed.
 * @returns The parsed pixel value.
 * @internal
 */
export const toPx = (v: number | string | undefined, fallback: number) => {
  if (v === undefined || v === null) return fallback;
  const n = typeof v === 'string' ? Number(v) : v;
  if (Number.isNaN(n)) return fallback;
  return Math.max(0, Math.floor(n));
};
