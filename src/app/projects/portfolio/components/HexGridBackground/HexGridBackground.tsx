'use client';

import { HexGridDebugOverlay } from '@portfolio/components/HexGridBackground/components/HexGridDebugOverlay';
import { useHexBgProps } from '@portfolio/hooks/hexgrid/useHexBgProps';
import { useHexGridBackground } from '@portfolio/hooks/hexgrid/useHexGridBackground';
import useWindowSize from '@portfolio/hooks/useWindowSize';
import { OmitSafe } from '@portfolio/types/hexgrid';
import cn from 'classnames';

/**
 * Type to safely omit properties from a given type T.
 */
export type StripHexGridProps<T> = OmitSafe<
  T,
  'zIndex' | 'd' | 'width' | 'height'
>;

/**
 * Type defining the orientation of the hexagonal grid.
 */
export type Orientation = 'flat' | 'pointy';
/**
 * Type defining how the grid is centered relative to the screen.
 */
export type CenterMode = 'centerHex' | 'centerEdge';

/**
 * Values for configuring the hexagonal grid background.
 */
export type HexGridBackgroundValues = {
  stroke: number;
  minCols: number;
  minRows: number;
  maxHexRadius: number;
};

/**
 * Props for the HexGridBackground component.
 */
export interface HexGridBackgroundProps {
  /**
   * The orientation of the hexagons. Defaults to 'pointy'.
   */
  orientation?: Orientation;
  /**
   * The centering mode of the grid. Defaults based on device type.
   */
  centerMode?: CenterMode;
  /**
   * If true, shows the debug overlay. Defaults to false.
   */
  debug?: boolean;
  /**
   * Additional CSS class names.
   */
  className?: string;
}

/**
 * A dynamic and interactive hexagonal grid background component.
 * It renders a responsive grid and overlays various animated effects
 * such as ripples, lights, and sparks, based on user interaction and performance settings.
 *
 * @param props - The component props.
 * @returns A JSX element representing the hexagonal grid background.
 */
export default function HexGridBackground({
  orientation = 'pointy',
  centerMode,
  debug = false,
  className,
}: HexGridBackgroundProps) {
  const {
    gridBackgroundValues,
  } = useHexBgProps();

  const { deviceType } = useWindowSize();
  const centerModeByDevType =
    centerMode ??
    ({ mobile: 'centerHex', medium: 'centerHex', web: 'centerHex' }[
      deviceType
    ] as CenterMode);

  const {
    ref,
    size: box,
    d,
    params,
    debugBoundsD,
  } = useHexGridBackground({
    orientation,
    centerMode: centerModeByDevType,
    debug,
    ...gridBackgroundValues,
  });

  return (
    <div
      ref={ref}
      className={cn(
        className,
        'pointer-events-none absolute inset-0 isolate motion-reduce:hidden'
      )}
      aria-hidden
    >
      <HexGridDebugOverlay
        enabled={debug}
        orientation={orientation}
        params={params}
        d={d}
        stroke={1}
        boundsD={debugBoundsD}
      />
    </div>
  );
}
