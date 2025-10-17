'use client';

import {
  hexRadiusAtom,
  hexTargetsByTypeAtom,
} from '@project/atoms/hexGridAtoms';
import { useHexPerimeterMeasure } from '@project/hooks/hexgrid/useHexPerimeterMeasure';
import { useHexRevealSpotlight } from '@project/hooks/hexgrid/useHexRevealSpotlight';
import { Axial } from '@project/types/hexgrid';
import {
  axialRound,
  pixelToAxial,
} from '@project/utils/hexgrid/perimeter-loops';
import cn from 'classnames';
import { useAtomValue } from '@project/lib/jotai';
import type { RefObject } from 'react';
import { useMemo, useRef } from 'react';

/**
 * Props for the HexGridSpotlightBg component.
 */
export type HexGridSpotlightBgProps = {
  /**
   * The z-index of the container.
   */
  zIndex: number;
  /**
   * The width of the container.
   */
  width: number;
  /**
   * The height of the container.
   */
  height: number;
  /**
   * The central axial coordinates of the grid. Defaults to { q: 0, r: 0 }.
   */
  qrCenter?: Axial;
  /**
   * The orientation of the hexagons. Defaults to 'pointy'.
   */
  orientation?: 'pointy' | 'flat';
  /**
   * The size of the spotlight effect. Defaults to 'small'.
   */
  size?: 'small' | 'big';
  /**
   * The color of the spotlight. Defaults to a CSS variable.
   */
  color?: string;
  /**
   * The stroke width of the hexagons. Defaults to 2.
   */
  stroke?: number;
  /**
   * Additional CSS classes.
   */
  className?: string;
};

/**
 * A component that renders a hexagonal spotlight effect behind specific target elements.
 * It listens for "spotlight" targets from a Jotai atom and creates a `SingleSpotlightPublisher`
 * for each one.
 *
 * @param props - The component props.
 * @returns A JSX element containing the spotlight effects.
 */
export default function HexGridSpotlightBg({
  zIndex,
  width,
  height,
  qrCenter = { q: 0, r: 0 },
  orientation = 'pointy',
  size = 'small',
  color = 'var(--hx-grid-spotlight-bg)',
  stroke = 2,
  className,
}: HexGridSpotlightBgProps) {
  const targetsAtom = useMemo(() => hexTargetsByTypeAtom('spotlight'), []);
  const spotlightTargets = useAtomValue(targetsAtom);

  return (
    <div
      className={cn(className, 'pointer-events-none absolute inset-0')}
      style={{ zIndex }}
      aria-hidden="true"
    >
      {spotlightTargets.map((target) => (
        <SingleSpotlightPublisher
          key={getSpotlightKey(target)}
          target={target}
          width={width}
          height={height}
          qrCenter={qrCenter}
          orientation={orientation}
          size={size}
          color={color}
          stroke={stroke}
        />
      ))}
    </div>
  );
}

/**
 * A sub-component that measures a single target element and reveals a spotlight effect.
 *
 * @param props - The component props.
 * @returns A JSX element that serves as a container for the spotlight effect.
 */
function SingleSpotlightPublisher({
  target,
  width,
  height,
  qrCenter,
  orientation,
  size,
  color,
  stroke,
}: {
  target: HTMLElement | RefObject<HTMLElement | null> | null;
  width: number;
  height: number;
  qrCenter: Axial;
  orientation: 'pointy' | 'flat';
  size: 'small' | 'big';
  color: string;
  stroke: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hexSizePx = useAtomValue(hexRadiusAtom);

  const { overlappedQrs } = useHexPerimeterMeasure({
    containerRef,
    target,
    width,
    height,
    hexRadiusCss: hexSizePx,
    orientation,
    qrCenter,
    pixelToAxialAction: (x, y, trig) => {
      const fracAxial = pixelToAxial([x, y], trig);
      return axialRound(fracAxial.q, fracAxial.r);
    },
    sampleStepPx: Math.max(4, Math.floor(hexSizePx / 2)),
  });

  const baseIdRef = useRef<string>('');
  if (!baseIdRef.current)
    baseIdRef.current = Math.random().toString(36).slice(2);

  useHexRevealSpotlight({
    enabled: true,
    qrs: overlappedQrs,
    size,
    color,
    stroke,
    baseId: baseIdRef.current,
  });

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
      style={{ zIndex: 0 }}
    />
  );
}

const spotKeyMap = new WeakMap<object, string>();
/**
 * Generates a unique key for a spotlight target.
 *
 * @param t - The target element or ref.
 * @returns A unique string key.
 */
function getSpotlightKey(
  t: HTMLElement | RefObject<HTMLElement | null> | null
) {
  const el =
    t && typeof t === 'object' && 'current' in t
      ? t.current
      : (t as HTMLElement | null);
  if (el) {
    let k = el.dataset.spotlightId;
    if (!k) {
      k = Math.random().toString(36).slice(2);
      el.dataset.spotlightId = k;
    }
    return `el:${k}`;
  }
  if (!spotKeyMap.has((t ?? {}) as object)) {
    spotKeyMap.set((t ?? {}) as object, Math.random().toString(36).slice(2));
  }
  return `ref:${spotKeyMap.get((t ?? {}) as object)}`;
}
