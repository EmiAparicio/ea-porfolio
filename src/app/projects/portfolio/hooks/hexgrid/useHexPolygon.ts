import { useMemo } from 'react';
import { toPointsStr } from '@portfolio/utils/hexgrid/math';

export type HexOrientation = 'flat' | 'pointy';

/**
 * Defines the vertices for a hexagonal shape in both flat and pointy orientations.
 * The coordinates are given as percentages of the hexagon's bounding box.
 */
export const HEX_POINTS: Record<
  HexOrientation,
  readonly (readonly [number, number])[]
> = {
  pointy: [
    [50, 0],
    [100, 25],
    [100, 75],
    [50, 100],
    [0, 75],
    [0, 25],
  ],
  flat: [
    [25, 0],
    [75, 0],
    [100, 50],
    [75, 100],
    [25, 100],
    [0, 50],
  ],
} as const;

/**
 * A custom hook that provides the SVG `points` string and CSS `clip-path`
 * for a hexagonal polygon based on its orientation.
 *
 * @param {HexOrientation} orientation The desired orientation of the hexagon ('flat' or 'pointy').
 * @returns {{pointsStr: string; clipPath: string;}} An object containing the SVG points string and the CSS clip-path property value.
 */
export function useHexPolygon(orientation: HexOrientation) {
  const pointsStr = useMemo(
    () => toPointsStr(HEX_POINTS[orientation]),
    [orientation]
  );
  const clipPath = useMemo(
    () =>
      `polygon(${HEX_POINTS[orientation].map(([x, y]) => `${x}% ${y}%`).join(',')})`,
    [orientation]
  );
  return { pointsStr, clipPath } as const;
}
