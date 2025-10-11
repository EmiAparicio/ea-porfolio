'use client';

import { useCanvas2DBackingStore } from '@portfolio/hooks/hexgrid/useCanvas2DBackingStore';
import { useGlobalPointerRipple } from '@portfolio/hooks/hexgrid/useGlobalPointerRipple';
import { useRasterizedSvgImage } from '@portfolio/hooks/hexgrid/useRasterizedSvgImage';
import { useRippleEngine } from '@portfolio/hooks/hexgrid/useRippleEngine';
import { useDevicePixelRatio } from '@portfolio/hooks/useDevicePixelRatio';
import cn from 'classnames';
import { useRef } from 'react';

/**
 * Props for HexGridClickRipple
 *
 * All units are CSS pixels unless otherwise stated.
 */
export type HexGridClickRippleProps = {
  /**
   * Stacking order for the overlay canvas.
   * Recommended: keep just above the grid but below interactive UI.
   * Typical: 0–100.
   */
  zIndex: number;

  /**
   * SVG path “d” for the hex grid lines (outline-only; hexagons are hollow).
   * Must be drawn in the same coordinate space as `width` x `height`.
   */
  d: string;

  /**
   * Logical width of the canvas/grid.
   * Must match the coordinate system used when generating `d`.
   */
  width: number;

  /**
   * Logical height of the canvas/grid.
   * Must match the coordinate system used when generating `d`.
   */
  height: number;

  /**
   * Stroke color used when rasterizing the grid image.
   * Note: visual brightness is modulated by the ripple masks.
   * Example: '#01BB75'.
   */
  color: string;

  /**
   * Stroke width (grid line thickness) in px when rasterizing the grid.
   * Smaller than ~1.0 may alias; larger than ~4 looks heavy.
   * Typical: 1–3. Default: 1.5
   */
  stroke: number;

  /**
   * How many concentric rings per click.
   * Costs more fill passes per frame. Over ~8 rarely looks better.
   * Recommended: 1–6. Default: 3
   */
  rings: number;

  /**
   * Ring band thickness (torus width) in px.
   * Too small (<6) can alias; too large (>40) looks like a filled disc.
   * Recommended: 8–36. Default: 16
   */
  ringWidth: number;

  /**
   * Time (seconds) a single ring takes to go from radius 0 to `reach`.
   * Lower = faster expansion. Very low values (<0.4) can cause overlap.
   * Recommended: 0.6–1.8. Default: 1.0
   */
  durationSec: number;

  /**
   * Base time offset (seconds) between consecutive rings.
   * Visible separation rule of thumb:
   *   stagger >= ringWidth / (reach/durationSec * 0.6)
   * If smaller than that, rings may visually merge.
   * Recommended: 0.06–0.25. Default: 0.1
   */
  stagger: number;

  /**
   * Fraction of the maximum feasible radius the wave will travel.
   * 1.0 reaches the farthest corner; smaller keeps it tighter.
   * Recommended: 0.45–0.9. Default: 0.55
   */
  reachFactor: number;

  /**
   * Absolute cap (px) for ring reach. Overrides `reachFactor` if smaller.
   * Useful to keep waves local on huge canvases.
   * Example: 240–520. Omit to rely on `reachFactor`.
   */
  maxRadiusPx: number;

  /**
   * Minimum radial separation (px) enforced between ring fronts.
   * If > 0, the engine derives an effective stagger each frame to meet this.
   * Set 0 to disable auto-separation.
   * Recommended: ~0.75 * ringWidth for crisp separation.
   * Default: 0.75 * ringWidth (computed).
   */
  minRingSeparationPx?: number;

  /**
   * Radial brightness falloff exponent (center -> edge).
   * 1 = linear, 2 = quadratic (softer mid, faster near edge), 3+ = steeper tail.
   * Recommended: 1.5–3.0. Default: 2.0
   */
  falloffExp: number;

  /**
   * Early-life temporal fade-in window (fraction of ring lifetime).
   * 0.0–0.3. Default: 0.08
   */
  startFadePct: number;

  /**
   * Late-life temporal fade-out window (fraction of ring lifetime).
   * 0.0–0.3. Larger values soften the disappearance at max radius.
   * Default: 0.12
   */
  endFadePct: number;

  /** Extra className for the absolute container (overlay). */
  className?: string;
};

export default function HexGridClickRipple({
  zIndex,
  d,
  width,
  height,
  color,
  stroke,
  rings,
  ringWidth,
  durationSec,
  stagger,
  reachFactor,
  maxRadiusPx,
  minRingSeparationPx,
  falloffExp,
  startFadePct,
  endFadePct,
  className,
}: HexGridClickRippleProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bufRef = useRef<HTMLCanvasElement | null>(null);

  const dpr = useDevicePixelRatio({ max: 2, min: 1 });

  useCanvas2DBackingStore({
    canvasRef,
    bufferRef: bufRef,
    cssWidth: width,
    cssHeight: height,
    dpr,
  });

  const { image } = useRasterizedSvgImage({ d, width, height, color, stroke });

  const { trigger } = useRippleEngine({
    canvasRef,
    bufferRef: bufRef,
    image: image ?? null,
    size: { width, height, dpr },
    physics: {
      rings,
      ringWidth,
      durationSec,
      stagger,
      minRingSeparationPx,
      reachFactor,
      maxRadiusPx,
      falloffExp,
      startFadePct,
      endFadePct,
    },
  });

  useGlobalPointerRipple({
    hostRef,
    width,
    height,
    onClickAtAction: (x, y) => trigger(x, y),
    cooldownMs: 100,
    dedupePx: 14,
    dedupeWindowMs: 220,
    dragEpsPx: 8,
  });

  if (!d || width <= 0 || height <= 0) return null;

  return (
    <div
      ref={hostRef}
      className={cn(className, 'pointer-events-none absolute inset-0')}
      style={{ zIndex }}
      aria-hidden
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
