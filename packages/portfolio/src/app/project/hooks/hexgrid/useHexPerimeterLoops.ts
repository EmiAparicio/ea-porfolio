'use client';

import {
  computeBorderLoops,
  makeTrig,
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
  RefObject,
} from 'react';

const getEl = (t: HTMLElement | RefObject<HTMLElement | null> | null) =>
  t && typeof t === 'object' && 'current' in t
    ? (t as RefObject<HTMLElement | null>).current
    : (t as HTMLElement | null);

const q = (v: number) => Math.round(v * 2) / 2;
const near = (a: number, b: number, eps = 0.25) => Math.abs(a - b) <= eps;

/**
 * A custom hook to compute the perimeter of an HTML element within a hexagonal grid layout.
 * It detects the element's position and size, then calculates a series of `Loop` objects that
 * represent its border in the grid's coordinate system. The computation is debounced and
 * optimized with `ResizeObserver` and `requestAnimationFrame`.
 *
 * @param {object} opts - The options for the hook.
 * @param {RefObject<HTMLElement | null>} opts.containerRef - A ref to the container element that defines the coordinate system.
 * @param {HTMLElement | RefObject<HTMLElement | null> | null} opts.target - The target HTML element whose perimeter is to be computed.
 * @param {number} opts.width - The width of the container.
 * @param {number} opts.height - The height of the container.
 * @param {number} opts.hexRadiusCss - The CSS radius of the hexagons in the grid.
 * @param {'pointy' | 'flat'} opts.orientation - The orientation of the hexagons.
 * @param {{q: number; r: number;}} opts.qrCenter - The axial coordinates of the grid's center.
 * @returns {{trig: Trig; targetRect: Rect | null; loops: Loop[] | null; totalLen: number; bbox: Rect | null; getRoi: (padPx: number) => Rect | null; recompute: () => void; version: number;}} An object containing the computed loops, their bounding box, total length, and utility functions.
 */
export function useHexPerimeterLoops(opts: {
  containerRef: RefObject<HTMLElement | null>;
  target: HTMLElement | RefObject<HTMLElement | null> | null;
  width: number;
  height: number;
  hexRadiusCss: number;
  orientation: 'pointy' | 'flat';
  qrCenter: { q: number; r: number };
}) {
  const {
    containerRef,
    target,
    width,
    height,
    hexRadiusCss,
    orientation,
    qrCenter,
  } = opts;

  const trig = useMemo<Trig>(
    () => makeTrig(hexRadiusCss, width, height, orientation, qrCenter),
    [hexRadiusCss, width, height, orientation, qrCenter]
  );

  const loopsRef = useRef<Loop[] | null>(null);
  const loopsBBoxRef = useRef<Rect | null>(null);
  const totalLenRef = useRef<number>(0);
  const targetRectRef = useRef<Rect | null>(null);

  const [version, setVersion] = useState(0);
  const recompute = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    const container = containerRef.current;
    const targetEl = getEl(target);

    if (!container || !targetEl) {
      if (loopsRef.current !== null) {
        loopsRef.current = null;
        loopsBBoxRef.current = null;
        totalLenRef.current = 0;
        targetRectRef.current = null;
        setVersion((v) => v + 1);
      }
      return;
    }

    let rafId: number | null = null;
    let lastRect: Rect | null = null;

    const measure = () => {
      const containerBox = container.getBoundingClientRect();
      const box = targetEl.getBoundingClientRect();
      const currentRect: Rect = {
        x: q(box.left - containerBox.left),
        y: q(box.top - containerBox.top),
        w: q(box.width),
        h: q(box.height),
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
      loopsRef.current = built;
      totalLenRef.current = built.reduce((s, l) => s + l.length, 0);
      targetRectRef.current = currentRect;

      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
      for (const L of built) {
        for (let i = 0; i < L.points.length; i += 2) {
          const x = L.points[i],
            y = L.points[i + 1];
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
      loopsBBoxRef.current =
        minX === Infinity
          ? { ...currentRect }
          : { x: q(minX), y: q(minY), w: q(maxX - minX), h: q(maxY - minY) };

      setVersion((v) => v + 1);
    };

    const debouncedMeasure = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(measure);
    };

    debouncedMeasure();

    const ro = new ResizeObserver(debouncedMeasure);
    ro.observe(targetEl);
    window.addEventListener('resize', debouncedMeasure, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', debouncedMeasure);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [containerRef, target, trig]);

  const getRoi = useCallback(
    (padPx: number): Rect | null => {
      const bbox = loopsBBoxRef.current;
      if (!bbox) {
        return null;
      }
      const rx = Math.max(0, Math.floor(bbox.x - padPx));
      const ry = Math.max(0, Math.floor(bbox.y - padPx));
      const rw = Math.min(width - rx, Math.ceil(bbox.w + 2 * padPx));
      const rh = Math.min(height - ry, Math.ceil(bbox.h + 2 * padPx));
      return { x: rx, y: ry, w: rw, h: rh };
    },
    [width, height]
  );

  return {
    trig,
    targetRect: targetRectRef.current,
    loops: loopsRef.current,
    totalLen: totalLenRef.current,
    bbox: loopsBBoxRef.current,
    getRoi,
    recompute,
    version,
  } as const;
}
