import { Orientation } from '@portfolio/components/HexGridBackground/HexGridBackground';

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
