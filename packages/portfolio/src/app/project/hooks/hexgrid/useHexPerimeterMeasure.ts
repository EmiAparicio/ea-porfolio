'use client';

import {
  computeBorderLoops,
  makeTrig,
  sampleLoop,
  type Loop,
  type Rect,
  type Trig,
} from '@project/utils/hexgrid/perimeter-loops';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react';

/**
 * Utility function to resolve an HTMLElement from a RefObject or a direct element reference.
 *
 * @param {HTMLElement | RefObject<HTMLElement | null> | null} t - The target element or its ref.
 * @returns {HTMLElement | null} The resolved HTML element or null.
 */
const getEl = (t: HTMLElement | RefObject<HTMLElement | null> | null) =>
  t && typeof t === 'object' && 'current' in t
    ? (t as RefObject<HTMLElement | null>).current
    : (t as HTMLElement | null);

/**
 * Checks if two numbers are approximately near each other within a given tolerance.
 *
 * @param {number} a - First number.
 * @param {number} b - Second number.
 * @param {number} [eps=0.5] - The epsilon (tolerance) value.
 * @returns {boolean} True if the numbers are near, false otherwise.
 */
const near = (a: number, b: number, eps = 0.5) => Math.abs(a - b) <= eps;

/**
 * A hook that measures the bounding box of a target element relative to a container
 * and computes the hexagonal "perimeter loops" that define its border on the grid.
 * It tracks changes in the target's size, position, and scroll/resize events.
 *
 * @param {object} opts - Options for the hook.
 * @param {RefObject<HTMLElement | null>} opts.containerRef - A reference to the container element used for coordinate system.
 * @param {HTMLElement | RefObject<HTMLElement | null> | null} opts.target - The target element whose boundary loops are calculated.
 * @param {number} opts.width - Logical canvas width in CSS pixels.
 * @param {number} opts.height - Logical canvas height in CSS pixels.
 * @param {number} opts.hexRadiusCss - The CSS radius of a single hex.
 * @param {'pointy' | 'flat'} opts.orientation - The hex grid orientation.
 * @param {{ q: number; r: number }} opts.qrCenter - Axial coordinate that maps to the visual center.
 * @param {(x: number, y: number, trig: Trig) => { q: number; r: number }} opts.pixelToAxialAction - Function to convert pixel coordinates to axial coordinates.
 * @param {number} [opts.sampleStepPx] - Pixel step size for sampling the perimeter boundary (for performance).
 * @returns {object} Contains the list of overlapped axial coordinates and a function to manually trigger recomputation.
 */
export function useHexPerimeterMeasure(opts: {
  containerRef: RefObject<HTMLElement | null>;
  target: HTMLElement | RefObject<HTMLElement | null> | null;
  width: number;
  height: number;
  hexRadiusCss: number;
  orientation: 'pointy' | 'flat';
  qrCenter: { q: number; r: number };
  pixelToAxialAction: (
    x: number,
    y: number,
    trig: Trig
  ) => { q: number; r: number };
  sampleStepPx?: number;
}) {
  const {
    containerRef,
    target,
    width,
    height,
    hexRadiusCss,
    orientation,
    qrCenter,
    pixelToAxialAction: pixelToAxial,
    sampleStepPx,
  } = opts;

  const trig = useMemo<Trig>(
    () => makeTrig(hexRadiusCss, width, height, orientation, qrCenter),
    [hexRadiusCss, width, height, orientation, qrCenter]
  );

  const [version, setVersion] = useState(0);
  const recompute = useCallback(() => setVersion((v) => v + 1), []);
  const computedRectRef = useRef<Rect | null>(null);
  const computedLoopsRef = useRef<Loop[]>([]);
  const computedBboxRef = useRef<Rect | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const targetEl = getEl(target);

    if (!container || !targetEl) {
      if (computedLoopsRef.current.length > 0) {
        computedRectRef.current = null;
        computedLoopsRef.current = [];
        computedBboxRef.current = null;
        setVersion((v) => v + 1);
      }
      return;
    }

    let rafId: number | null = null;
    let lastRect: Rect | null = null;

    const measureAndCompute = () => {
      const containerBox = container.getBoundingClientRect();
      const box = targetEl.getBoundingClientRect();
      const currentRect: Rect = {
        x: box.left - containerBox.left,
        y: box.top - containerBox.top,
        w: box.width,
        h: box.height,
      };

      if (
        lastRect &&
        near(lastRect.x, currentRect.x) &&
        near(lastRect.y, currentRect.y) &&
        near(lastRect.w, currentRect.w) &&
        near(lastRect.h, currentRect.h)
      ) {
        return;
      }
      lastRect = currentRect;

      const built = computeBorderLoops(currentRect, trig);

      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
      for (const L of built) {
        const pts = L.points;
        for (let i = 0; i < pts.length; i += 2) {
          const x = pts[i],
            y = pts[i + 1];
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
      const bbox: Rect =
        minX === Infinity
          ? { ...currentRect }
          : {
              x: minX,
              y: minY,
              w: maxX - minX,
              h: maxY - minY,
            };

      computedRectRef.current = currentRect;
      computedLoopsRef.current = built;
      computedBboxRef.current = bbox;
      setVersion((v) => v + 1);
    };

    const debouncedMeasure = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(measureAndCompute);
    };

    debouncedMeasure();

    const ro = new ResizeObserver(debouncedMeasure);
    ro.observe(targetEl);
    window.addEventListener('resize', debouncedMeasure, { passive: true });
    window.addEventListener('scroll', debouncedMeasure, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', debouncedMeasure);
      window.removeEventListener('scroll', debouncedMeasure);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [containerRef, target, trig]);

  /**
   * Checks if a given point (x, y) is inside any of the provided polygon loops using the ray-casting algorithm.
   *
   * @param {number} x - The x-coordinate of the point.
   * @param {number} y - The y-coordinate of the point.
   * @param {Loop[]} loops - An array of polygon loops.
   * @returns {boolean} True if the point is inside the perimeter loops, false otherwise.
   */
  const pointInLoops = useCallback((x: number, y: number, loops: Loop[]) => {
    const EPS = 1e-9;
    let inside = false;
    for (const L of loops) {
      const pts = L.points;
      for (let i = 0, j = pts.length - 2; i < pts.length; i += 2) {
        const xi = pts[i],
          yi = pts[i + 1];
        const xj = pts[j],
          yj = pts[j + 1];
        const yiAbove = yi > y + EPS;
        const yjAbove = yj > y + EPS;
        if (yiAbove !== yjAbove) {
          const denom = yj - yi || yj - yi + EPS;
          const xInt = ((xj - xi) * (y - yi)) / denom + xi;
          if (x <= xInt + EPS) inside = !inside;
        }
        j = i;
      }
    }
    return inside;
  }, []);

  const overlappedQrs = useMemo(() => {
    const rect = computedRectRef.current;
    const loops = computedLoopsRef.current;
    const bbox = computedBboxRef.current;
    if (!rect || !loops || loops.length === 0 || !bbox) return [];

    const base = sampleStepPx ?? hexRadiusCss / 2;
    const step = Math.max(2, Math.floor(base));
    const acc = new Set<string>();
    const push = (q: number, r: number) => acc.add(`${q}|${r}`);

    const cx = rect.x + rect.w * 0.5;
    const cy = rect.y + rect.h * 0.5;
    const inset = Math.max(0.5, hexRadiusCss * 0.02);

    for (const L of loops) {
      const n = Math.max(1, Math.round(L.length / step));
      for (let i = 0; i <= n; i++) {
        const d = (i / n) * L.length;
        const [x, y] = sampleLoop(L, d);
        const dx = cx - x,
          dy = cy - y;
        const len = Math.hypot(dx, dy) || 1;
        const ix = x + (dx / len) * inset;
        const iy = y + (dy / len) * inset;

        if (!pointInLoops(ix, iy, loops)) continue;
        const { q, r } = pixelToAxial(ix, iy, trig);
        push(q, r);
      }
    }

    const x0 = Math.max(0, Math.floor(bbox.x));
    const y0 = Math.max(0, Math.floor(bbox.y));
    const x1 = Math.min(width, Math.ceil(bbox.x + bbox.w));
    const y1 = Math.min(height, Math.ceil(bbox.y + bbox.h));

    const offX = ((x0 % step) + step) % step;
    const offY = ((y0 % step) + step) % step;

    for (let y = y0 + offY; y < y1; y += step) {
      for (let x = x0 + offX; x < x1; x += step) {
        const cxp = x + 0.5,
          cyp = y + 0.5;
        if (!pointInLoops(cxp, cyp, loops)) continue;
        const { q, r } = pixelToAxial(cxp, cyp, trig);
        push(q, r);
      }
    }

    return Array.from(acc, (k) => {
      const [q, r] = k.split('|').map(Number);
      return { q, r };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    version,
    trig,
    hexRadiusCss,
    sampleStepPx,
    width,
    height,
    pointInLoops,
    pixelToAxial,
  ]);

  return {
    /** The list of axial coordinates of hexes partially or fully overlapped by the target's boundary. */
    overlappedQrs,
    /** Function to force a manual re-measurement and re-computation of the loops. */
    recompute,
  } as const;
}
