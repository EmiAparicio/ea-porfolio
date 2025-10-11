import { Orientation } from '@portfolio/components/HexGridBackground/HexGridBackground';
import { clamp } from '@portfolio/utils/math';

/**
 * Integer floor division by two.
 * @param n Input number.
 * @returns Floor(n/2).
 */
export function floorDiv2(n: number) {
  return Math.floor(n / 2);
}

/**
 * Converts odd-q offset coordinates to axial coordinates.
 * @param i Column index in odd-q.
 * @param j Row index in odd-q.
 * @returns Axial { q, r }.
 */
export function oddQ_to_axial(i: number, j: number) {
  const q = i;
  const r = j - floorDiv2(i);
  return { q, r };
}

/**
 * Converts odd-r offset coordinates to axial coordinates.
 * @param i Row index in odd-r.
 * @param j Column index in odd-r.
 * @returns Axial { q, r }.
 */
export function oddR_to_axial(i: number, j: number) {
  const r = i;
  const q = j - floorDiv2(i);
  return { q, r };
}

/**
 * Converts axial coordinates to odd-q offset coordinates.
 * @param q Axial q.
 * @param r Axial r.
 * @returns Odd-q { i, j }.
 */
export function axial_to_oddQ(q: number, r: number) {
  const i = q;
  const j = r + floorDiv2(q);
  return { i, j };
}

/**
 * Converts axial coordinates to odd-r offset coordinates.
 * @param q Axial q.
 * @param r Axial r.
 * @returns Odd-r { i, j }.
 */
export function axial_to_oddR(q: number, r: number) {
  const i = r;
  const j = q + floorDiv2(r);
  return { i, j };
}

/**
 * Computes the six vertex positions of a hexagon.
 * @param cx Center x in logical pixels.
 * @param cy Center y in logical pixels.
 * @param R Hex radius in logical pixels.
 * @param orientation Hex orientation.
 * @returns Array of six [x, y] tuples.
 */
export function hexPoints(
  cx: number,
  cy: number,
  R: number,
  orientation: Orientation
): [number, number][] {
  const startDeg = orientation === 'flat' ? 0 : 30;
  const pts: [number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const ang = ((startDeg + i * 60) * Math.PI) / 180;
    pts.push([cx + R * Math.cos(ang), cy + R * Math.sin(ang)]);
  }
  return pts;
}

/**
 * Builds an SVG path string from a sequence of points.
 * @param pts List of [x, y] points.
 * @returns SVG path data string.
 */
export function pathFromPoints(pts: [number, number][]) {
  return `M ${pts.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(' L ')} Z`;
}

/**
 * Smoothstep in [0,1] with zero slope at the ends.
 */
export function smoothstep01(u: number) {
  const t = clamp(u, 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Normalizes an angle in degrees to [0,360).
 */
export function normDeg(a: number) {
  return ((a % 360) + 360) % 360;
}

/**
 * Cubic ease-out function.
 * @param t Normalized time in [0, 1].
 * @returns Eased value.
 */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Computes temporal alpha for a ring given start and end fade windows.
 * @param t Normalized lifetime progress in [0, 1].
 * @param startFadePct Early fade-in window size in [0, 0.3].
 * @param endFadePct Late fade-out window size in [0, 0.3].
 * @returns Alpha in [0, 1].
 */
export function computeAlpha(
  t: number,
  startFadePct: number,
  endFadePct: number
): number {
  if (t <= 0) return 0;
  if (t >= 1) return 0;
  if (startFadePct > 0 && t < startFadePct) return t / startFadePct;
  if (endFadePct > 0 && t > 1 - endFadePct) return (1 - t) / endFadePct;
  return 1;
}

/**
 * Approximates the radial speed of the ripple front in px/sec.
 * @param reach Target radius in pixels.
 * @param durationSec Time to reach the target radius in seconds.
 * @returns Approximate speed in px/sec.
 */
export function approxSpeedPxPerSec(
  reach: number,
  durationSec: number
): number {
  return (reach / Math.max(0.001, durationSec)) * 0.6;
}

/**
 * Ensures a minimum temporal separation between rings given a desired radial separation.
 * @param baseStagger Base stagger in seconds.
 * @param minRingSeparationPx Minimum radial separation in pixels.
 * @param reach Target radius in pixels.
 * @param durationSec Time to reach the target radius in seconds.
 * @returns Effective stagger in seconds.
 */
export function effectiveStagger(
  baseStagger: number,
  minRingSeparationPx: number,
  reach: number,
  durationSec: number
): number {
  const speed = approxSpeedPxPerSec(reach, durationSec);
  const minStaggerSec =
    minRingSeparationPx > 0 ? minRingSeparationPx / Math.max(0.001, speed) : 0;
  return Math.max(baseStagger, minStaggerSec);
}
