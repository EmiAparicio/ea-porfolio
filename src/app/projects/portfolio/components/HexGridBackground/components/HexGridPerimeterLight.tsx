'use client';

import {
  hexRadiusAtom,
  hexTargetsByTypeAtom,
} from '@portfolio/atoms/hexGridAtoms';
import { useCanvas2DBackingStore } from '@portfolio/hooks/hexgrid/useCanvas2DBackingStore';
import { useHexPerimeterLoops } from '@portfolio/hooks/hexgrid/useHexPerimeterLoops';
import { useRasterizedSvgImage } from '@portfolio/hooks/hexgrid/useRasterizedSvgImage';
import { useLatestRef } from '@portfolio/hooks/useLatestRef';
import { Axial } from '@portfolio/types/hexgrid';
import { resolveColor } from '@portfolio/utils/hexgrid/color';
import { ensureGlowSprite } from '@portfolio/utils/hexgrid/drawing';
import { mod } from '@portfolio/utils/hexgrid/math';
import {
  sampleLoop,
  type Rect,
  type Trig,
} from '@portfolio/utils/hexgrid/perimeter-loops';
import { clamp } from '@portfolio/utils/math';
import cn from 'classnames';
import { useAtomValue } from '@portfolio/lib/jotai';
import { JSX, useCallback, useEffect, useMemo, useRef } from 'react';

const ROTATE_ANTICLOCKWISE = false;
const MAX_DPR = 2;
const AUTO_PXL_PER_PARTICLE = 100;
const AUTO_MIN_PARTICLES = 0;
const AUTO_MAX_PARTICLES = 2;
const AUTO_SWEEP_PERIOD_SEC = 3;
const AUTO_BASELINE_DIAGONAL = 360;
const AUTO_RADIUS_GAIN = 0.25;
const AUTO_RADIUS_CLAMP_MIN = 0.85;
const AUTO_RADIUS_CLAMP_MAX = 1.35;

/**
 * Props for HexGridPerimeterLight component.
 */
export type HexGridPerimeterLightProps = {
  /** Stacking order of the absolute wrapper (outer <div>). */
  zIndex: number;
  /** SVG path “d” string representing the hex grid stroke sized to this component. */
  d: string;
  /** Logical canvas width in CSS pixels. */
  width: number;
  /** Logical canvas height in CSS pixels. */
  height: number;
  /** Grid stroke width in CSS pixels for prerendering the grid image. */
  stroke: number;
  /** Light/particle color. Also used to tint illuminated grid. */
  gridColor: string;
  /** Axial coordinate that maps to the visual center of the canvas. */
  qrCenter?: Axial;
  /** Hex orientation. */
  orientation?: 'pointy' | 'flat';
  /** Global alpha multiplier [0..1]. */
  alpha?: number;
  /** Illumination radius factor relative to hex radius. */
  glowRadiusFactor?: number;
  /** Core (full intensity) radius factor relative to hex radius. */
  glowCoreFactor?: number;
  /** Fraction [0..1] of the outer radius used for fading out from core to edge. */
  glowFeatherFactor?: number;
  /** Optional wrapper className (use text-* to drive currentColor). */
  className?: string;
};

/**
 * Animated perimeter light that reveals the grid only under particles traveling along exterior hex borders.
 * It manages multiple perimeter light sources based on targets registered in the hexTargetsByTypeAtom.
 *
 * @param {HexGridPerimeterLightProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered component.
 */
export default function HexGridPerimeterLight({
  zIndex,
  d,
  width,
  height,
  stroke,
  gridColor,
  qrCenter = { q: 0, r: 0 },
  orientation = 'pointy',
  alpha = 1,
  glowRadiusFactor = 1,
  glowCoreFactor = 0.1,
  glowFeatherFactor = 1,
  className,
}: HexGridPerimeterLightProps): JSX.Element {
  const perimeterTargetsAtom = useMemo(
    () => hexTargetsByTypeAtom('perimeter'),
    []
  );
  const perimeterTargets = useAtomValue(perimeterTargetsAtom);

  return (
    <div
      className={cn(className, 'pointer-events-none absolute inset-0')}
      style={{ zIndex }}
      aria-hidden="true"
    >
      {perimeterTargets.map((target, i) => (
        <SinglePerimeterLight
          key={i}
          target={target}
          d={d}
          width={width}
          height={height}
          stroke={stroke}
          gridColor={gridColor}
          qrCenter={qrCenter}
          orientation={orientation}
          alpha={alpha}
          glowRadiusFactor={glowRadiusFactor}
          glowCoreFactor={glowCoreFactor}
          glowFeatherFactor={glowFeatherFactor}
        />
      ))}
    </div>
  );
}

/**
 * Renders a single animated light source traveling along the perimeter of a single target element.
 *
 * @param {Object} props - The properties for the component.
 * @param {HTMLElement | React.RefObject<HTMLElement | null> | null} props.target - The target element or ref whose perimeter the light should follow.
 * @param {string} props.d - SVG path “d” string representing the hex grid stroke.
 * @param {number} props.width - Logical canvas width in CSS pixels.
 * @param {number} props.height - Logical canvas height in CSS pixels.
 * @param {number} props.stroke - Grid stroke width in CSS pixels.
 * @param {string} props.gridColor - Light/particle color.
 * @param {Axial} [props.qrCenter] - Axial coordinate that maps to the visual center.
 * @param {'pointy' | 'flat'} [props.orientation] - Hex orientation.
 * @param {number} [props.alpha] - Global alpha multiplier [0..1].
 * @param {number} [props.glowRadiusFactor] - Illumination radius factor relative to hex radius.
 * @param {number} [props.glowCoreFactor] - Core (full intensity) radius factor relative to hex radius.
 * @param {number} [props.glowFeatherFactor] - Fraction [0..1] of the outer radius used for fading out.
 * @returns {JSX.Element | null} The rendered canvas element or null.
 */
function SinglePerimeterLight({
  target,
  d,
  width,
  height,
  stroke,
  gridColor,
  qrCenter = { q: 0, r: 0 },
  orientation = 'pointy',
  alpha = 1,
  glowRadiusFactor = 1,
  glowCoreFactor = 0.1,
  glowFeatherFactor = 1,
}: {
  target: HTMLElement | React.RefObject<HTMLElement | null> | null;
  d: string;
  width: number;
  height: number;
  stroke: number;
  gridColor: string;
  qrCenter?: Axial;
  orientation?: 'pointy' | 'flat';
  alpha?: number;
  glowRadiusFactor?: number;
  glowCoreFactor?: number;
  glowFeatherFactor?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const spriteRef = useRef<{
    key: string;
    canvas: HTMLCanvasElement;
    cssR: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const hexSizePx = useAtomValue(hexRadiusAtom);

  const dpr =
    typeof window !== 'undefined'
      ? Math.min(MAX_DPR, Math.max(1, Math.floor(window.devicePixelRatio || 1)))
      : 1;

  useCanvas2DBackingStore({
    canvasRef,
    bufferRef: maskRef,
    cssWidth: width,
    cssHeight: height,
    dpr,
  });

  const { image, status } = useRasterizedSvgImage({
    d,
    width,
    height,
    color: '#fff',
    stroke,
  });

  const { trig, loops, bbox, totalLen, targetRect, getRoi } =
    useHexPerimeterLoops({
      containerRef,
      target,
      width,
      height,
      hexRadiusCss: hexSizePx,
      orientation,
      qrCenter,
    });

  const latestRefs = useLatestRef({
    width,
    height,
    gridColor,
    alpha,
    stroke,
    glowRadiusFactor,
    glowCoreFactor,
    glowFeatherFactor,
  });
  const latestDprRef = useLatestRef(dpr);
  const latestTrigRef = useLatestRef(trig as Trig);
  const latestImgRef = useLatestRef<CanvasImageSource | null>(image ?? null);

  /**
   * The main animation loop for drawing the perimeter light effect.
   * It calculates particle positions, updates the mask canvas, and composites the final image.
   * It is wrapped in useCallback and scheduled using requestAnimationFrame.
   */
  const loop = useCallback(() => {
    const schedule = () => {
      rafRef.current = requestAnimationFrame(loop);
    };

    const main = canvasRef.current;
    const mask = maskRef.current;
    const img = latestImgRef.current;
    if (!main || !mask || !img || status !== 'ready') return schedule();

    const p = latestRefs.current;
    const dprNow = latestDprRef.current;
    const W = p.width;
    const H = p.height;

    const ctx = main.getContext('2d');
    const mctx = mask.getContext('2d');
    if (!ctx || !mctx) return schedule();

    const totalLenNow = Math.max(1, totalLen || 0);
    const rect = targetRect as Rect | null;
    const diag = rect ? Math.hypot(rect.w, rect.h) : AUTO_BASELINE_DIAGONAL;
    const sizeScale = Math.sqrt(diag / AUTO_BASELINE_DIAGONAL);
    const radiusSizeMul = clamp(
      1 + AUTO_RADIUS_GAIN * (sizeScale - 1),
      AUTO_RADIUS_CLAMP_MIN,
      AUTO_RADIUS_CLAMP_MAX
    );
    const speedPxPerSecAuto = totalLenNow / AUTO_SWEEP_PERIOD_SEC;
    const particlesAuto = clamp(
      Math.round(totalLenNow / AUTO_PXL_PER_PARTICLE),
      AUTO_MIN_PARTICLES,
      AUTO_MAX_PARTICLES
    );
    const now = performance.now();
    const travel =
      ((speedPxPerSecAuto * now) / 1000) * (ROTATE_ANTICLOCKWISE ? 1 : -1);
    const baseColor = resolveColor(
      canvasRef.current?.parentElement || undefined,
      p.gridColor
    );
    const hexR = (latestTrigRef.current as Trig | null)?.size ?? hexSizePx;

    const Rcss = Math.max(1, hexR * p.glowRadiusFactor * radiusSizeMul);
    const coreRcss = Math.max(
      0,
      Math.min(Rcss, hexR * p.glowCoreFactor * radiusSizeMul)
    );
    const fadeFrac = Math.max(0, Math.min(1, p.glowFeatherFactor));
    const coreT = Math.max(0, Math.min(1, coreRcss / Rcss));
    const fadeStartT = Math.max(coreT + 1e-3, 1 - fadeFrac);

    const sprite = ensureGlowSprite(spriteRef, Rcss, coreT, fadeStartT, dprNow);

    const roi = getRoi(Rcss + 4);

    const bboxLocal = bbox || { x: 0, y: 0, w: W, h: H };
    const rx = roi ? roi.x : Math.max(0, Math.floor(bboxLocal.x));
    const ry = roi ? roi.y : Math.max(0, Math.floor(bboxLocal.y));
    const rw = roi ? roi.w : Math.min(W - rx, Math.ceil(bboxLocal.w));
    const rh = roi ? roi.h : Math.min(H - ry, Math.ceil(bboxLocal.h));

    mctx.setTransform(dprNow, 0, 0, dprNow, 0, 0);
    mctx.clearRect(rx, ry, rw, rh);

    if (loops && particlesAuto > 0) {
      for (const loopObj of loops) {
        const portion = loopObj.length / totalLenNow;
        const n = Math.max(1, Math.round(particlesAuto * portion));
        const spacing = loopObj.length / n;
        for (let i = 0; i < n; i++) {
          const dist = mod(travel + i * spacing, loopObj.length);
          const [cx, cy] = sampleLoop(loopObj, dist);
          mctx.drawImage(
            sprite.canvas,
            cx - sprite.cssR,
            cy - sprite.cssR,
            sprite.cssR * 2,
            sprite.cssR * 2
          );
        }
      }
    }

    ctx.setTransform(dprNow, 0, 0, dprNow, 0, 0);
    ctx.clearRect(rx, ry, rw, rh);

    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(img, rx, ry, rw, rh, rx, ry, rw, rh);

    ctx.globalCompositeOperation = 'source-in';
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = baseColor;
    ctx.fillRect(rx, ry, rw, rh);

    ctx.globalCompositeOperation = 'destination-in';
    ctx.globalAlpha = 1;
    ctx.drawImage(mask, rx, ry, rw, rh, rx, ry, rw, rh);

    ctx.globalCompositeOperation = 'source-over';
    schedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, totalLen, targetRect, loops, bbox, getRoi, hexSizePx]);

  /**
   * Sets up the animation frame request and clean up on unmount.
   */
  useEffect(() => {
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [loop]);

  if (!d || width <= 0 || height <= 0) return null;

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
      style={{ zIndex: 0 }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
