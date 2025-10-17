'use client';

import { globalModalOpenAtom } from '@project/atoms/modalAtoms';
import HexGridClickRipple from '@project/components/HexGridBackground/components/HexGridClickRipple';
import HexGridCursorReveal from '@project/components/HexGridBackground/components/HexGridCursorReveal';
import { HexGridDebugOverlay } from '@project/components/HexGridBackground/components/HexGridDebugOverlay';
import HexGridDragSparks from '@project/components/HexGridBackground/components/HexGridDragSparks';
import HexGridLight from '@project/components/HexGridBackground/components/HexGridLight';
import HexGridPerimeterLight from '@project/components/HexGridBackground/components/HexGridPerimeterLight';
import HexGridSpotlightBg from '@project/components/HexGridBackground/components/HexGridSpotlightBg';
import { useHexBgProps } from '@project/hooks/hexgrid/useHexBgProps';
import { useHexGridBackground } from '@project/hooks/hexgrid/useHexGridBackground';
import useWindowSize from '@project/hooks/useWindowSize';
import { usePerformance } from '@project/providers/PerformanceProvider';
import { OmitSafe } from '@project/types/hexgrid';
import cn from 'classnames';
import { useAtomValue } from 'jotai';

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
    clickRippleProps,
    cursorRevealProps,
    dragSparksProps,
    lightProps,
    perimeterProps,
  } = useHexBgProps();

  const isModalOpen = useAtomValue(globalModalOpenAtom);
  const { deviceType } = useWindowSize();
  const centerModeByDevType =
    centerMode ??
    ({ mobile: 'centerHex', medium: 'centerHex', web: 'centerHex' }[
      deviceType
    ] as CenterMode);

  const { enableAnimations: enableAnimationsCursorReveal } = usePerformance(
    'hx-bg-cursor-reveal'
  );
  const { enableAnimations: enableAnimationsClickRipple } =
    usePerformance('hx-bg-click-ripple');
  const { enableAnimations: enableAnimationsPerimeterLight } = usePerformance(
    'hx-bg-perimeter-light'
  );
  const { enableAnimations: enableAnimationsSpotlight } =
    usePerformance('hx-bg-spotlight');
  const { enableAnimations: enableAnimationsLight } =
    usePerformance('hx-bg-light');
  const { enableAnimations: enableAnimationsDragSparks } =
    usePerformance('hx-bg-drag-sparks');

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

  const hexGridBasicValues = {
    d,
    width: box.width,
    height: box.height,
  };

  const ready = d && box.width > 0 && box.height > 0;

  return (
    <div
      ref={ref}
      className={cn(
        className,
        'pointer-events-none absolute inset-0 isolate motion-reduce:hidden'
      )}
      aria-hidden
    >
      {ready && (
        <>
          <HexGridDebugOverlay
            enabled={debug}
            orientation={orientation}
            params={params}
            d={d}
            stroke={1}
            boundsD={debugBoundsD}
          />

          {enableAnimationsCursorReveal && !isModalOpen && (
            <HexGridCursorReveal
              zIndex={10}
              {...hexGridBasicValues}
              {...cursorRevealProps}
            />
          )}

          {enableAnimationsClickRipple && !isModalOpen && (
            <HexGridClickRipple
              zIndex={20}
              {...hexGridBasicValues}
              {...clickRippleProps}
            />
          )}

          {enableAnimationsPerimeterLight && !isModalOpen && (
            <HexGridPerimeterLight
              zIndex={23}
              {...hexGridBasicValues}
              {...perimeterProps}
            />
          )}

          {enableAnimationsSpotlight && !isModalOpen && (
            <HexGridSpotlightBg zIndex={23} {...hexGridBasicValues} />
          )}

          {enableAnimationsLight && !isModalOpen && (
            <HexGridLight zIndex={12} {...hexGridBasicValues} {...lightProps} />
          )}

          {enableAnimationsDragSparks && !isModalOpen && (
            <HexGridDragSparks
              zIndex={17}
              {...hexGridBasicValues}
              {...dragSparksProps}
            />
          )}
        </>
      )}
    </div>
  );
}
