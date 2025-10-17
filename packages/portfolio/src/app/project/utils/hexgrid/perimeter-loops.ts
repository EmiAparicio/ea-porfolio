import { Axial } from '@project/types/hexgrid';

export type Trig = {
  size: number;
  sqrt3: number;
  originX: number;
  originY: number;
  pointy: boolean;
  centerQ: number;
  centerR: number;
};

export type Rect = { x: number; y: number; w: number; h: number };

export type Loop = {
  points: Float32Array;
  cumlen: Float32Array;
  length: number;
};

/**
 * Creates helpers for hex grid conversions. The axial center maps to canvas center.
 */
export function makeTrig(
  hexSizePx: number,
  width: number,
  height: number,
  orientation: 'pointy' | 'flat',
  center: Axial
): Trig {
  return {
    size: hexSizePx,
    sqrt3: Math.sqrt(3),
    originX: width / 2,
    originY: height / 2,
    pointy: orientation === 'pointy',
    centerQ: center.q,
    centerR: center.r,
  };
}

/**
 * Converts axial to pixel with the axial center anchored at canvas center.
 */
export function axialToPixel(ax: Axial, t: Trig): [number, number] {
  const qrel = ax.q - t.centerQ;
  const rrel = ax.r - t.centerR;
  if (t.pointy) {
    const x = t.size * (t.sqrt3 * qrel + (t.sqrt3 / 2) * rrel);
    const y = t.size * 1.5 * rrel;
    return [x + t.originX, y + t.originY];
  }
  const x = t.size * 1.5 * qrel;
  const y = t.size * ((t.sqrt3 / 2) * qrel + t.sqrt3 * rrel);
  return [x + t.originX, y + t.originY];
}

/**
 * Converts pixel to fractional axial with the axial center anchored at canvas center.
 */
export function pixelToAxial(
  px: [number, number],
  t: Trig
): { q: number; r: number } {
  const x = px[0] - t.originX;
  const y = px[1] - t.originY;
  if (t.pointy) {
    const qrel = ((t.sqrt3 / 3) * x - (1 / 3) * y) / t.size;
    const rrel = ((2 / 3) * y) / t.size;
    return { q: qrel + t.centerQ, r: rrel + t.centerR };
  }
  const qrel = ((2 / 3) * x) / t.size;
  const rrel = ((-1 / 3) * x + (t.sqrt3 / 3) * y) / t.size;
  return { q: qrel + t.centerQ, r: rrel + t.centerR };
}

/**
 * Rounds fractional axial to nearest axial center.
 */
export function axialRound(q: number, r: number): Axial {
  const x = q;
  const z = r;
  const y = -x - z;
  let rx = Math.round(x);
  let ry = Math.round(y);
  let rz = Math.round(z);
  const xDiff = Math.abs(rx - x);
  const yDiff = Math.abs(ry - y);
  const zDiff = Math.abs(rz - z);
  if (xDiff > yDiff && xDiff > zDiff) rx = -ry - rz;
  else if (yDiff > zDiff) ry = -rx - rz;
  else rz = -rx - ry;
  return { q: rx, r: rz };
}

/**
 * Computes exterior border loops from the set of hexes overlapped by a rect.
 * Guarantees at least one loop by selecting the hex under the rect center when needed.
 */
export function computeBorderLoops(rect: Rect, t: Trig): Loop[] {
  const corners: [number, number][] = [
    [rect.x, rect.y],
    [rect.x + rect.w, rect.y],
    [rect.x + rect.w, rect.y + rect.h],
    [rect.x, rect.y + rect.h],
  ];

  const ax = corners.map((c) => pixelToAxial(c as [number, number], t));
  const qVals = ax.map((a) => a.q);
  const rVals = ax.map((a) => a.r);
  const q0 = Math.floor(Math.min(...qVals)) - 2;
  const q1 = Math.ceil(Math.max(...qVals)) + 2;
  const r0 = Math.floor(Math.min(...rVals)) - 2;
  const r1 = Math.ceil(Math.max(...rVals)) + 2;

  const overlapped = new Set<string>();
  for (let q = q0; q <= q1; q++) {
    for (let r = r0; r <= r1; r++) {
      const c = axialToPixel({ q, r }, t);
      const poly = hexVertices(c, t);
      if (polygonIntersectsRect(poly, rect)) overlapped.add(`${q},${r}`);
    }
  }

  if (overlapped.size === 0) {
    const centerPx: [number, number] = [
      rect.x + rect.w / 2,
      rect.y + rect.h / 2,
    ];
    const frac = pixelToAxial(centerPx, t);
    const nearest = axialRound(frac.q, frac.r);
    const verts = hexVertices(axialToPixel(nearest, t), t);
    const { pts, cum } = buildCumLength([...verts, verts[0]]);
    return [{ points: pts, cumlen: cum, length: cum[cum.length - 1] }];
  }

  const nbr = axialNeighbors();
  const edges: { a: [number, number]; b: [number, number] }[] = [];
  for (const key of overlapped) {
    const [qStr, rStr] = key.split(',');
    const q = parseInt(qStr, 10);
    const r = parseInt(rStr, 10);
    const center = axialToPixel({ q, r }, t);
    const verts = hexVertices(center, t);
    const mids: [number, number][] = [];
    for (let i = 0; i < 6; i++) {
      const a = verts[i];
      const b = verts[(i + 1) % 6];
      mids.push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]);
    }
    const nbrVecs = nbr.map((d) =>
      sub(axialToPixel({ q: q + d.q, r: r + d.r }, t), center)
    );
    for (let i = 0; i < 6; i++) {
      const a = verts[i];
      const b = verts[(i + 1) % 6];
      const mid = mids[i];
      const n = norm(sub(mid, center));
      let best = 0;
      let bestDot = -1e9;
      for (let k = 0; k < 6; k++) {
        const d = nbrVecs[k];
        const dp = (n[0] * d[0] + n[1] * d[1]) / (Math.hypot(d[0], d[1]) || 1);
        if (dp > bestDot) {
          bestDot = dp;
          best = k;
        }
      }
      const dq = nbr[best].q;
      const dr = nbr[best].r;
      const otherKey = `${q + dq},${r + dr}`;
      if (!overlapped.has(otherKey)) edges.push({ a, b });
    }
  }

  const used = new Array(edges.length).fill(false);
  const pointMap = new Map<string, number[]>();
  for (let i = 0; i < edges.length; i++) {
    const e = edges[i];
    const ka = keyPt(e.a);
    const kb = keyPt(e.b);
    if (!pointMap.has(ka)) pointMap.set(ka, []);
    if (!pointMap.has(kb)) pointMap.set(kb, []);
    pointMap.get(ka)!.push(i);
    pointMap.get(kb)!.push(i);
  }

  const loops: Loop[] = [];
  for (let i = 0; i < edges.length; i++) {
    if (used[i]) continue;
    const loopPts: [number, number][] = [];
    let cur = i;
    let curPt = edges[i].a;
    const startKey = keyPt(edges[i].a);
    let guard = 0;
    while (guard++ < edges.length * 4) {
      used[cur] = true;
      const e = edges[cur];
      const a = e.a;
      const b = e.b;
      if (eqPt(curPt, a)) {
        loopPts.push(a);
        curPt = b;
      } else {
        loopPts.push(b);
        curPt = a;
      }
      const k = keyPt(curPt);
      if (k === startKey) break;
      const candidates = pointMap.get(k) || [];
      let nextEdge = -1;
      for (const idx of candidates)
        if (!used[idx]) {
          nextEdge = idx;
          break;
        }
      if (nextEdge === -1) break;
      cur = nextEdge;
    }
    if (loopPts.length >= 3) {
      if (!eqPt(loopPts[0], loopPts[loopPts.length - 1]))
        loopPts.push(loopPts[0]);
      const uniq = dedupeConsecutive(loopPts);
      if (uniq.length < 4) continue;
      const signed = polygonArea(uniq);
      if (signed > 0) uniq.reverse();
      const { pts, cum } = buildCumLength(uniq);
      loops.push({ points: pts, cumlen: cum, length: cum[cum.length - 1] });
    }
  }

  if (loops.length === 0) {
    const centerPx: [number, number] = [
      rect.x + rect.w / 2,
      rect.y + rect.h / 2,
    ];
    const frac = pixelToAxial(centerPx, t);
    const nearest = axialRound(frac.q, frac.r);
    const verts = hexVertices(axialToPixel(nearest, t), t);
    const { pts, cum } = buildCumLength([...verts, verts[0]]);
    return [{ points: pts, cumlen: cum, length: cum[cum.length - 1] }];
  }

  return loops;
}

/**
 * Samples a point along a loop by arc length using binary search on cumlen.
 */
export function sampleLoop(loop: Loop, dist: number): [number, number] {
  const L = loop.length;
  const d = mod(dist, L);
  const n = loop.cumlen.length;
  let lo = 0;
  let hi = n - 1;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (loop.cumlen[mid] < d) lo = mid + 1;
    else hi = mid;
  }
  const i = lo;
  const prev = i === 0 ? 0 : loop.cumlen[i - 1];
  const cur = loop.cumlen[i];
  const ai = i === 0 ? n - 1 : i - 1;
  const ax = loop.points[ai * 2];
  const ay = loop.points[ai * 2 + 1];
  const bx = loop.points[i * 2];
  const by = loop.points[i * 2 + 1];
  const seg = Math.max(1e-6, cur - prev);
  const u = (d - prev) / seg;
  return [ax + (bx - ax) * u, ay + (by - ay) * u];
}

/**
 * Returns a stable key for a point to connect edges.
 */
function keyPt(p: [number, number]): string {
  return `${Math.round(p[0] * 1000)},${Math.round(p[1] * 1000)}`;
}

/**
 * Six axial neighbor deltas.
 */
function axialNeighbors(): Axial[] {
  return [
    { q: 1, r: 0 },
    { q: 1, r: -1 },
    { q: 0, r: -1 },
    { q: -1, r: 0 },
    { q: -1, r: 1 },
    { q: 0, r: 1 },
  ];
}

/**
 * Hex vertices around a center.
 */
function hexVertices(center: [number, number], t: Trig): [number, number][] {
  const out: [number, number][] = [];
  const step = Math.PI / 3;
  const start = t.pointy ? Math.PI / 6 : 0;
  for (let i = 0; i < 6; i++) {
    const a = start + i * step;
    out.push([
      center[0] + t.size * Math.cos(a),
      center[1] + t.size * Math.sin(a),
    ]);
  }
  return out;
}

/**
 * Polygon-rect overlap with segment checks.
 */
function polygonIntersectsRect(poly: [number, number][], r: Rect): boolean {
  for (const p of poly) if (pointInRect(p[0], p[1], r)) return true;
  const rc = [
    [r.x, r.y],
    [r.x + r.w, r.y],
    [r.x + r.w, r.y + r.h],
    [r.x, r.y + r.h],
  ] as [number, number][];
  let inside = true;
  for (const c of rc) if (!pointInPolygon(c, poly)) inside = false;
  if (inside) return true;
  for (let i = 0; i < 6; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % 6];
    for (let j = 0; j < 4; j++) {
      const c = rc[j];
      const d = rc[(j + 1) % 4];
      if (segmentsIntersect(a, b, c, d)) return true;
    }
  }
  return false;
}

/**
 * Builds flat points and cumulative arc lengths for a closed polyline.
 */
function buildCumLength(pts: [number, number][]) {
  const n = pts.length;
  const flat = new Float32Array(n * 2);
  const cum = new Float32Array(n);
  let L = 0;
  for (let i = 0; i < n; i++) {
    flat[i * 2] = pts[i][0];
    flat[i * 2 + 1] = pts[i][1];
    if (i > 0) L += dist(pts[i], pts[i - 1]);
    if (i === n - 1) L += dist(pts[i], pts[0]);
    cum[i] = L;
  }
  return { pts: flat, cum };
}

/**
 * A true modulo operator that works for negative numbers.
 */
function mod(a: number, b: number) {
  return ((a % b) + b) % b;
}

/**
 * Checks if a point is inside a rectangle.
 */
function pointInRect(x: number, y: number, r: Rect): boolean {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

/**
 * Checks if a point is inside a polygon using the winding number algorithm.
 */
function pointInPolygon(
  pt: [number, number],
  poly: [number, number][]
): boolean {
  let wn = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    if (a[1] <= pt[1]) {
      if (b[1] > pt[1] && cross(sub(b, a), sub(pt, a)) > 0) wn++;
    } else {
      if (b[1] <= pt[1] && cross(sub(b, a), sub(pt, a)) < 0) wn--;
    }
  }
  return wn !== 0;
}

/**
 * Determines if two line segments intersect.
 */
function segmentsIntersect(
  a: [number, number],
  b: [number, number],
  c: [number, number],
  d: [number, number]
): boolean {
  const o1 = orient(a, b, c);
  const o2 = orient(a, b, d);
  const o3 = orient(c, d, a);
  const o4 = orient(c, d, b);
  if (o1 * o2 < 0 && o3 * o4 < 0) return true;
  if (o1 === 0 && onSeg(a, b, c)) return true;
  if (o2 === 0 && onSeg(a, b, d)) return true;
  if (o3 === 0 && onSeg(c, d, a)) return true;
  if (o4 === 0 && onSeg(c, d, b)) return true;
  return false;
}

/**
 * Calculates the orientation of a triplet of points (clockwise, counter-clockwise, or collinear).
 */
function orient(a: [number, number], b: [number, number], c: [number, number]) {
  return cross(sub(b, a), sub(c, a));
}

/**
 * Checks if a point `p` lies on the segment `ab`, assuming they are collinear.
 */
function onSeg(a: [number, number], b: [number, number], p: [number, number]) {
  return (
    Math.min(a[0], b[0]) - 1e-6 <= p[0] &&
    p[0] <= Math.max(a[0], b[0]) + 1e-6 &&
    Math.min(a[1], b[1]) - 1e-6 <= p[1] &&
    p[1] <= Math.max(a[1], b[1]) + 1e-6
  );
}

/**
 * Subtracts two 2D vectors (b from a).
 */
function sub(a: [number, number], b: [number, number]): [number, number] {
  return [a[0] - b[0], a[1] - b[1]];
}

/**
 * Normalizes a 2D vector to a unit vector.
 */
function norm(a: [number, number]): [number, number] {
  const L = Math.hypot(a[0], a[1]) || 1;
  return [a[0] / L, a[1] / L];
}

/**
 * Computes the 2D cross product of two vectors.
 */
function cross(a: [number, number], b: [number, number]) {
  return a[0] * b[1] - a[1] * b[0];
}

/**
 * Checks if two points are approximately equal.
 */
function eqPt(a: [number, number], b: [number, number]) {
  return Math.abs(a[0] - b[0]) < 1e-3 && Math.abs(a[1] - b[1]) < 1e-3;
}

/**
 * Removes consecutive duplicate points from an array of points.
 */
function dedupeConsecutive(pts: [number, number][]): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < pts.length; i++) {
    if (i === 0 || !eqPt(pts[i], pts[i - 1])) out.push(pts[i]);
  }
  return out;
}

/**
 * Calculates the signed area of a polygon using the shoelace formula.
 */
function polygonArea(pts: [number, number][]): number {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const q = pts[(i + 1) % pts.length];
    a += p[0] * q[1] - p[1] * q[0];
  }
  return 0.5 * a;
}

/**
 * Calculates the Euclidean distance between two points.
 */
function dist(a: [number, number], b: [number, number]) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}
