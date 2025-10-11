'use client';

import {
  hexGridDAtom,
  hexRadiusAtom,
  qrToCenterAtom,
  type QrToCenter,
} from '@portfolio/atoms/hexGridAtoms';
import {
  CenterMode,
  Orientation,
} from '@portfolio/components/HexGridBackground/HexGridBackground';
import useElementSize from '@portfolio/hooks/useElementSize';
import { useSetAtom } from '@portfolio/lib/jotai';
import { HexGridParamsSnapshot } from '@portfolio/types/hexgrid';
import {
  axial_to_oddQ,
  axial_to_oddR,
  hexPoints,
  oddQ_to_axial,
  oddR_to_axial,
  pathFromPoints,
} from '@portfolio/utils/hexgrid/math';
import { useEffect, useMemo, useState, type Ref } from 'react';

export type UseHexGridArgs = {
  stroke: number;
  orientation: Orientation;
  centerMode: CenterMode;
  minCols: number;
  minRows: number;
  maxHexRadius: number;
  debug?: boolean;
};

export type UseHexGridResult = {
  ref: Ref<HTMLDivElement>;
  size: { width: number; height: number };
  d: string;
  debugBoundsD?: string | null;
  params: HexGridParamsSnapshot | null;
};

/**
 * A custom hook to generate and manage a responsive hexagonal grid for a background.
 * It calculates the optimal hexagon size and layout based on container dimensions
 * and user-defined constraints. It also provides a function to convert hexagonal
 * coordinates to pixel coordinates and publishes key parameters to Jotai atoms.
 *
 * @param {UseHexGridArgs} args - The arguments for configuring the hexagonal grid.
 * @param {number} args.stroke - The stroke width for the hexagons.
 * @param {Orientation} args.orientation - The orientation of the hexagons ('flat' or 'pointy').
 * @param {CenterMode} args.centerMode - The centering mode for the grid.
 * @param {number} args.minCols - The minimum number of columns to fit on the screen.
 * @param {number} args.minRows - The minimum number of rows to fit on the screen.
 * @param {number} args.maxHexRadius - The maximum allowed radius of a hexagon.
 * @returns {UseHexGridResult} An object containing a ref for the container, its size, the SVG path data, and grid parameters.
 */
export function useHexGridBackground({
  stroke,
  orientation,
  centerMode,
  minCols,
  minRows,
  maxHexRadius,
}: UseHexGridArgs): UseHexGridResult {
  const setHexRadius = useSetAtom(hexRadiusAtom);
  const setHexD = useSetAtom(hexGridDAtom);
  const setQrToCenter = useSetAtom(qrToCenterAtom);

  const { ref, size: box } = useElementSize<HTMLDivElement>();

  const [vvTick, setVvTick] = useState(0);
  useEffect(() => {
    if (typeof window === 'undefined' || !('visualViewport' in window)) {
      return;
    }
    const vv = window.visualViewport as VisualViewport;
    const onChange = () => setVvTick((t) => t + 1);
    vv.addEventListener('resize', onChange);
    vv.addEventListener('scroll', onChange);
    return () => {
      vv.removeEventListener('resize', onChange);
      vv.removeEventListener('scroll', onChange);
    };
  }, []);

  const params = useMemo<HexGridParamsSnapshot | null>(() => {
    const W = Math.max(0, Math.floor(box.width));
    const H = Math.max(0, Math.floor(box.height));
    if (W === 0 || H === 0) {
      return null;
    }

    let visW = W;
    let visH = H;
    if (
      typeof window !== 'undefined' &&
      'visualViewport' in window &&
      ref.current
    ) {
      const r = ref.current.getBoundingClientRect();
      const vv = window.visualViewport as VisualViewport;
      const vx = vv.offsetLeft ?? 0;
      const vy = vv.offsetTop ?? 0;
      const vw = vv.width ?? W;
      const vh = vv.height ?? H;
      const ix = Math.max(0, Math.min(r.right, vx + vw) - Math.max(r.left, vx));
      const iy = Math.max(0, Math.min(r.bottom, vy + vh) - Math.max(r.top, vy));
      if (ix > 0 && iy > 0) {
        visW = ix;
        visH = iy;
      }
    }

    const N = Math.max(1, Math.floor(minCols));
    const M = Math.max(1, Math.floor(minRows));

    const Rw =
      orientation === 'flat'
        ? visW / (1.5 * N + 0.5)
        : visW / (Math.sqrt(3) * N);
    const Rh =
      orientation === 'flat'
        ? visH / (Math.sqrt(3) * M)
        : visH / (1.5 * M + 0.5);
    const R = Math.max(1, Math.min(maxHexRadius, Math.floor(Math.min(Rw, Rh))));

    const stepX = orientation === 'flat' ? 1.5 * R : Math.sqrt(3) * R;
    const stepY = orientation === 'flat' ? Math.sqrt(3) * R : 1.5 * R;
    const offsetSecondary = orientation === 'flat' ? stepY / 2 : stepX / 2;

    const centerX = Math.round(W / 2);
    const centerY = Math.round(H / 2);

    let centerShiftX = 0;
    let centerShiftY = 0;
    if (centerMode === 'centerEdge') {
      if (orientation === 'flat') {
        centerShiftX = stepX / 2;
      } else {
        centerShiftY = stepY / 2;
      }
    }

    const halfW = orientation === 'flat' ? R : (Math.sqrt(3) * R) / 2;
    const halfH = orientation === 'flat' ? (Math.sqrt(3) * R) / 2 : R;

    const strokePad = stroke * 1.5;
    const marginX = halfW + strokePad;
    const marginY = halfH + strokePad;

    let iStart: number, iEnd: number, jStart: number, jEnd: number;

    if (orientation === 'flat') {
      iStart = Math.ceil((-marginX - centerShiftX - centerX) / stepX);
      iEnd = Math.floor((W + marginX - centerShiftX - centerX) / stepX);
      jStart = Math.ceil(
        (-marginY - centerShiftY - centerY - offsetSecondary) / stepY
      );
      jEnd = Math.floor(
        (H + marginY - centerShiftY - centerY + offsetSecondary) / stepY
      );
    } else {
      iStart = Math.ceil((-marginY - centerShiftY - centerY) / stepY);
      iEnd = Math.floor((H + marginY - centerShiftY - centerY) / stepY);
      jStart = Math.ceil(
        (-marginX - centerShiftX - centerX - offsetSecondary) / stepX
      );
      jEnd = Math.floor(
        (W + marginX - centerShiftX - centerX + offsetSecondary) / stepX
      );
    }

    let qOffset = 0;
    let rOffset = 0;

    if (centerMode === 'centerEdge') {
      if (orientation === 'flat') {
        const a = oddQ_to_axial(-1, 0);
        qOffset = -a.q;
        rOffset = -a.r;
      } else {
        const a = oddR_to_axial(-1, 0);
        qOffset = -a.q;
        rOffset = -a.r;
      }
    }

    return {
      W,
      H,
      R,
      stepX,
      stepY,
      offsetSecondary,
      centerX,
      centerY,
      centerShiftX,
      centerShiftY,
      iStart,
      iEnd,
      jStart,
      jEnd,
      qOffset,
      rOffset,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    box.width,
    box.height,
    stroke,
    orientation,
    centerMode,
    minCols,
    minRows,
    maxHexRadius,
    ref,
    vvTick,
  ]);

  const d = useMemo(() => {
    if (!params) {
      return '';
    }
    const {
      W,
      H,
      R,
      stepX,
      stepY,
      offsetSecondary,
      centerX,
      centerY,
      centerShiftX,
      centerShiftY,
      iStart,
      iEnd,
      jStart,
      jEnd,
    } = params;

    const halfW = orientation === 'flat' ? R : (Math.sqrt(3) * R) / 2;
    const halfH = orientation === 'flat' ? (Math.sqrt(3) * R) / 2 : R;

    const cmds: string[] = [];
    for (let i = iStart; i <= iEnd; i++) {
      for (let j = jStart; j <= jEnd; j++) {
        let cx: number;
        let cy: number;

        if (orientation === 'flat') {
          cx = centerX + i * stepX + centerShiftX;
          cy =
            centerY +
            j * stepY +
            (i % 2 === 0 ? 0 : offsetSecondary) +
            centerShiftY;
        } else {
          cx =
            centerX +
            j * stepX +
            (i % 2 === 0 ? 0 : offsetSecondary) +
            centerShiftX;
          cy = centerY + i * stepY + centerShiftY;
        }

        const scx = Math.round(cx);
        const scy = Math.round(cy);

        if (
          scx + halfW < 0 ||
          scx - halfW > W ||
          scy + halfH < 0 ||
          scy - halfH > H
        ) {
          continue;
        }

        const pts = hexPoints(scx, scy, R, orientation);
        cmds.push(pathFromPoints(pts));
      }
    }
    return cmds.join(' ');
  }, [params, orientation]);

  const debugBoundsD = useMemo(() => {
    if (!params) {
      return null;
    }
    const { R, stepX, stepY, centerX, centerY, centerShiftX, centerShiftY } =
      params;
    const cols = Math.max(1, Math.floor(minCols));
    const rows = Math.max(1, Math.floor(minRows));
    const halfW = orientation === 'flat' ? R : (Math.sqrt(3) * R) / 2;
    const halfH = orientation === 'flat' ? (Math.sqrt(3) * R) / 2 : R;

    let iMin: number, iMax: number, jMin: number, jMax: number;
    if (orientation === 'flat') {
      iMin = -Math.floor((cols - 1) / 2);
      iMax = iMin + (cols - 1);
      jMin = -Math.floor((rows - 1) / 2);
      jMax = jMin + (rows - 1);
    } else {
      iMin = -Math.floor((rows - 1) / 2);
      iMax = iMin + (rows - 1);
      jMin = -Math.floor((cols - 1) / 2);
      jMax = jMin + (cols - 1);
    }
    let minX = Infinity,
      maxX = -Infinity;
    if (orientation === 'flat') {
      for (let i = iMin; i <= iMax; i++) {
        const cx = centerX + i * stepX + centerShiftX;
        minX = Math.min(minX, cx - halfW);
        maxX = Math.max(maxX, cx + halfW);
      }
    } else {
      for (let j = jMin; j <= jMax; j++) {
        const cx = centerX + j * stepX + centerShiftX;
        minX = Math.min(minX, cx - halfW);
        maxX = Math.max(maxX, cx + halfW);
      }
    }
    let minY = Infinity,
      maxY = -Infinity;
    if (orientation === 'flat') {
      for (let j = jMin; j <= jMax; j++) {
        const cy = centerY + j * stepY + centerShiftY;
        minY = Math.min(minY, cy - halfH);
        maxY = Math.max(maxY, cy + halfH);
      }
    } else {
      for (let i = iMin; i <= iMax; i++) {
        const cy = centerY + i * stepY + centerShiftY;
        minY = Math.min(minY, cy - halfH);
        maxY = Math.max(maxY, cy + halfH);
      }
    }
    const pad = stroke * 0.5;
    const x = Math.round(minX - pad),
      y = Math.round(minY - pad);
    const w = Math.round(maxX - minX + 2 * pad),
      h = Math.round(maxY - minY + 2 * pad);
    return `M ${x} ${y} H ${x + w} V ${y + h} H ${x} Z`;
  }, [params, orientation, minCols, minRows, stroke]);

  const qrToCenterFn = useMemo<QrToCenter | null>(() => {
    if (!params) {
      return null;
    }
    const {
      stepX,
      stepY,
      offsetSecondary,
      centerX,
      centerY,
      centerShiftX,
      centerShiftY,
      qOffset,
      rOffset,
    } = params;
    if (orientation === 'flat') {
      return (qr) => {
        const { i, j } = axial_to_oddQ(qr.q + qOffset, qr.r + rOffset);
        const cx = centerX + i * stepX + centerShiftX;
        const cy =
          centerY +
          j * stepY +
          (i % 2 === 0 ? 0 : offsetSecondary) +
          centerShiftY;
        return { left: Math.round(cx), top: Math.round(cy) };
      };
    } else {
      return (qr) => {
        const { i, j } = axial_to_oddR(qr.q + qOffset, qr.r + rOffset);
        const cx =
          centerX +
          j * stepX +
          (i % 2 === 0 ? 0 : offsetSecondary) +
          centerShiftX;
        const cy = centerY + i * stepY + centerShiftY;
        return { left: Math.round(cx), top: Math.round(cy) };
      };
    }
  }, [params, orientation]);

  useEffect(() => {
    setHexRadius(params?.R ?? 0);
  }, [params, setHexRadius]);

  useEffect(() => {
    setHexD(d);
  }, [d, setHexD]);

  useEffect(() => {
    setQrToCenter(() => qrToCenterFn);
  }, [qrToCenterFn, setQrToCenter]);

  return { ref, size: box, d, debugBoundsD, params };
}
