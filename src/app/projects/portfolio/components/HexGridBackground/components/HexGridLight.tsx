'use client';

import { useCanvas2DBackingStore } from '@portfolio/hooks/hexgrid/useCanvas2DBackingStore';
import { useRasterizedSvgImage } from '@portfolio/hooks/hexgrid/useRasterizedSvgImage';
import { useLatestRef } from '@portfolio/hooks/useLatestRef';
import { normDeg, smoothstep01 } from '@portfolio/utils/hexgrid/math';
import { clamp } from '@portfolio/utils/math';
import cn from 'classnames';
import { useEffect, useMemo, useRef } from 'react';

export type HexGridLightProps = {
  /**
   * Stacking order of the absolute wrapper (applied to the outer <div>).
   * Use this to layer the light above/below sibling elements.
   */
  zIndex: number;
  /**
   * SVG path “d” string representing the hex grid stroke (hollow hex outlines).
   * Should already be sized to the same logical width/height of this component.
   */
  d: string;
  /**
   * Logical canvas width in CSS pixels (pre-DPR). The internal backing store
   * is sized to width * DPR for crisp rendering on HiDPI displays.
   */
  width: number;
  /**
   * Logical canvas height in CSS pixels (pre-DPR). The internal backing store
   * is sized to height * DPR for crisp rendering on HiDPI displays.
   */
  height: number;
  /**
   * Grid stroke width in CSS pixels. Affects the prerendered grid thickness.
   */
  stroke: number;
  /**
   * Grid stroke color (any valid CSS color). Applied when prerendering the path.
   */
  gridColor: string;
  /**
   * Orientation of the sweeping band, in degrees. 0° is +X (to the right),
   * 90° is +Y (down). The band is centered on this axis and has soft edges.
   */
  barAngleDeg: number;
  /**
   * Direction the band travels, in degrees. This vector is independent from
   * `barAngleDeg`. The sweep starts outside one side of the canvas (along the
   * band normal) and moves to the opposite side following this direction.
   */
  travelAngleDeg: number;
  /**
   * Base width of the bright band, in CSS pixels, before scaling by the internal
   * visual scale and DPR. The effective half-band is bandWidthPx/2.
   */
  bandWidthPx: number;
  /**
   * Soft feather on each side of the band, in CSS pixels, before visual scaling
   * and DPR. Total half-extent used for masking is halfBand + feather.
   */
  featherPx: number;
  /**
   * Sweep speed in pixels per second, measured on the backing store in device pixels.
   * Higher values mean a faster traverse across the canvas.
   */
  speedPxPerSec: number;
  /**
   * Pause time in seconds after the band reaches the end of its travel,
   * before starting a new sweep.
   */
  repeatDelaySec: number;
  /**
   * Initial delay in seconds before the very first sweep begins.
   * When the document becomes hidden, the next cycle start is postponed by this delay.
   */
  startDelaySec: number;
  /**
   * Enables additive glow flares that ride along with the band. When disabled,
   * the sweep still occurs but no flares are drawn.
   */
  flareEnabled: boolean;
  /**
   * Normalized sweep progress [0..1] at which flares begin to fade in.
   * 0 means flares are visible from the start; 1 means they only appear at the end.
   */
  flareStartRatio: number;
  /**
   * Radius of flare #1 in CSS pixels before visual scaling and DPR.
   * The on-canvas radius is max(2, radius * scale).
   */
  flare1RadiusPx: number;
  /**
   * Radius of flare #2 in CSS pixels before visual scaling and DPR.
   * The on-canvas radius is max(2, radius * scale).
   */
  flare2RadiusPx: number;
  /**
   * Flare #1 offset along the band axis, in CSS pixels before scaling.
   * Positive values move in the +barAngle direction.
   */
  flare1OffsetAlongPx: number;
  /**
   * Flare #2 offset along the band axis, in CSS pixels before scaling.
   * Positive values move in the +barAngle direction.
   */
  flare2OffsetAlongPx: number;
  /**
   * Flare #1 offset along the band normal, in CSS pixels before scaling.
   * Positive values move to the left of the band axis (90° CCW from barAngle).
   */
  flare1OffsetNormalPx: number;
  /**
   * Flare #2 offset along the band normal, in CSS pixels before scaling.
   * Positive values move to the left of the band axis (90° CCW from barAngle).
   */
  flare2OffsetNormalPx: number;
  /**
   * Base alpha multiplier for flare #1 in [0..1]. The final alpha also depends
   * on sweep progress via a smoothstep easing after `flareStartRatio`.
   */
  flare1Alpha: number;
  /**
   * Base alpha multiplier for flare #2 in [0..1]. The final alpha also depends
   * on sweep progress via a smoothstep easing after `flareStartRatio`.
   */
  flare2Alpha: number;
  /**
   * Color of flare #1 center (any CSS color). Rendered with an inner-to-outer
   * radial gradient that fades to transparent.
   */
  flare1Color: string;
  /**
   * Color of flare #2 center (any CSS color). Rendered with an inner-to-outer
   * radial gradient that fades to transparent.
   */
  flare2Color: string;
  /**
   * Extra angle in degrees added to `barAngleDeg` to determine the flare motion
   * direction. This lets the flare drift differently from the band’s normal.
   */
  flareMotionAngleDeg: number;
  /**
   * Optional className for the absolute wrapper. Useful to control pointer events,
   * transitions, or responsive visibility.
   */
  className?: string;
};

type TrigPack = {
  radBar: number;
  radTravel: number;
  radFlare: number;
  tx: number;
  ty: number;
  nx: number;
  ny: number;
  fx: number;
  fy: number;
};

// This helper function was part of the original component and contains complex drawing logic.
// We are keeping it as is, but correcting the `clamp` calls inside.
function drawFlare(
  ctx: CanvasRenderingContext2D,
  params: {
    baseProps: HexGridLightProps;
    trig: TrigPack;
    scale: number;
    ease: number;
    cx: number;
    cy: number;
    offsetAlongPx: number;
    offsetNormalPx: number;
    radiusPx: number;
    alpha: number;
    color: string;
  }
) {
  const {
    trig,
    scale,
    ease,
    cx,
    cy,
    offsetAlongPx,
    offsetNormalPx,
    radiusPx,
    alpha,
    color,
  } = params;
  const { tx, ty, nx, ny } = trig;
  const sF = scale;
  const xw = cx + (tx * offsetAlongPx * sF + nx * offsetNormalPx * sF);
  const yw = cy + (ty * offsetAlongPx * sF + ny * offsetNormalPx * sF);
  const r = Math.max(2, radiusPx * sF);

  const hslToRgb = (h: number, s: number, l: number) => {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const hp = h / 60;
    const x = c * (1 - Math.abs((hp % 2) - 1));
    let r = 0,
      g = 0,
      b = 0;
    if (hp >= 0 && hp < 1) {
      r = c;
      g = x;
    } else if (hp < 2) {
      r = x;
      g = c;
    } else if (hp < 3) {
      g = c;
      b = x;
    } else if (hp < 4) {
      g = x;
      b = c;
    } else if (hp < 5) {
      r = x;
      b = c;
    } else {
      r = c;
      b = x;
    }
    const m = l - c / 2;
    return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
  };

  const parseCssColor = (input: string) => {
    const str = (input || '').trim().toLowerCase();
    if (str.startsWith('#')) {
      const h = str.slice(1);
      const hex = (v: string) => parseInt(v, 16);
      if (h.length === 3)
        return {
          r: hex(h[0] + h[0]),
          g: hex(h[1] + h[1]),
          b: hex(h[2] + h[2]),
          a: 1,
        };
      if (h.length === 4)
        return {
          r: hex(h[0] + h[0]),
          g: hex(h[1] + h[1]),
          b: hex(h[2] + h[2]),
          a: hex(h[3] + h[3]) / 255,
        };
      if (h.length === 6)
        return {
          r: hex(h.slice(0, 2)),
          g: hex(h.slice(2, 4)),
          b: hex(h.slice(4, 6)),
          a: 1,
        };
      if (h.length === 8)
        return {
          r: hex(h.slice(0, 2)),
          g: hex(h.slice(2, 4)),
          b: hex(h.slice(4, 6)),
          a: hex(h.slice(6, 8)) / 255,
        };
    }
    const rgbMatch = str.match(
      /^rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*([0-9.]+))?\s*\)$/
    );
    if (rgbMatch) {
      return {
        r: clamp(parseFloat(rgbMatch[1]), 0, 255),
        g: clamp(parseFloat(rgbMatch[2]), 0, 255),
        b: clamp(parseFloat(rgbMatch[3]), 0, 255),
        a: rgbMatch[4] != null ? clamp(parseFloat(rgbMatch[4]), 0, 1) : 1,
      };
    }
    const hslMatch = str.match(
      /^hsla?\(\s*([0-9.]+)\s*,\s*([0-9.]+)%\s*,\s*([0-9.]+)%(?:\s*,\s*([0-9.]+))?\s*\)$/
    );
    if (hslMatch) {
      const h = ((parseFloat(hslMatch[1]) % 360) + 360) % 360;
      const s = clamp(parseFloat(hslMatch[2]) / 100, 0, 1);
      const l = clamp(parseFloat(hslMatch[3]) / 100, 0, 1);
      const a = hslMatch[4] != null ? clamp(parseFloat(hslMatch[4]), 0, 1) : 1;
      const { r, g, b } = hslToRgb(h, s, l);
      return { r, g, b, a };
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  };

  const rgbaStr = (r: number, g: number, b: number, a = 1) =>
    `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${clamp(a, 0, 1)})`;

  const ringAlpha = clamp(alpha * ease, 0, 1);
  const { r: cr, g: cg, b: cb, a: ca } = parseCssColor(color);
  const colorAlpha = clamp(ca, 0, 1);
  const energy = clamp(ringAlpha * colorAlpha, 0, 1);

  const mainRingRadius = r * 0.9;
  const mainRingWidth = Math.max(1, r * 0.14);
  const innerRingRadius = r * 0.6;
  const innerRingWidth = Math.max(1, mainRingWidth * 0.25);

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const haloRadius = r * 1.35;
  const halo = ctx.createRadialGradient(xw, yw, 0, xw, yw, haloRadius);
  halo.addColorStop(0.0, rgbaStr(255, 255, 255, 0));
  halo.addColorStop(0.65, rgbaStr(255, 255, 255, clamp(0.06 * energy, 0, 1)));
  halo.addColorStop(1.0, rgbaStr(255, 255, 255, 0));
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(xw, yw, haloRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineWidth = mainRingWidth;
  ctx.lineCap = 'round';
  ctx.strokeStyle = rgbaStr(cr, cg, cb, 1);
  ctx.shadowColor = rgbaStr(cr, cg, cb, energy);
  ctx.shadowBlur = r * 0.35;
  ctx.globalAlpha = energy;
  ctx.beginPath();
  ctx.arc(xw, yw, mainRingRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineWidth = Math.max(1, mainRingWidth * 0.35);
  ctx.lineCap = 'round';
  const highlightA = clamp(0.6 * energy, 0, 1);
  ctx.strokeStyle = rgbaStr(255, 255, 255, 1);
  ctx.shadowColor = rgbaStr(255, 255, 255, highlightA);
  ctx.shadowBlur = r * 0.18;
  ctx.globalAlpha = highlightA;
  ctx.beginPath();
  ctx.arc(xw, yw, mainRingRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineWidth = innerRingWidth;
  ctx.lineCap = 'round';
  const minorA = clamp(0.45 * energy, 0, 1);
  ctx.strokeStyle = rgbaStr(cr, cg, cb, 1);
  ctx.shadowColor = rgbaStr(cr, cg, cb, minorA);
  ctx.shadowBlur = r * 0.1;
  ctx.globalAlpha = minorA;
  ctx.beginPath();
  ctx.arc(xw, yw, innerRingRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

export default function HexGridLight(props: HexGridLightProps) {
  const {
    zIndex,
    d,
    width,
    height,
    stroke,
    gridColor,
    barAngleDeg,
    travelAngleDeg,
    flareMotionAngleDeg,
    className,
  } = props;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskRef = useRef<HTMLCanvasElement | null>(null);

  const MAX_DPR = 2;
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
    color: gridColor,
    stroke,
  });

  const trig = useMemo<TrigPack>(() => {
    const rb = (normDeg(barAngleDeg) * Math.PI) / 180;
    const rt = (normDeg(travelAngleDeg) * Math.PI) / 180;
    const rf = (normDeg(barAngleDeg + flareMotionAngleDeg) * Math.PI) / 180;
    return {
      radBar: rb,
      radTravel: rt,
      radFlare: rf,
      tx: Math.cos(rb),
      ty: Math.sin(rb),
      nx: Math.cos(rb + Math.PI / 2),
      ny: Math.sin(rb + Math.PI / 2),
      fx: Math.cos(rf),
      fy: Math.sin(rf),
    };
  }, [barAngleDeg, travelAngleDeg, flareMotionAngleDeg]);

  const latestProps = useLatestRef(props);

  useEffect(() => {
    if (status !== 'ready' || !image) return;

    const main = canvasRef.current;
    const mask = maskRef.current;
    if (!main || !mask) return;

    const ctx = main.getContext('2d');
    const mctx = mask.getContext('2d');
    if (!ctx || !mctx) return;

    let rafId: number | null = null;
    let cycleStart =
      performance.now() + latestProps.current.startDelaySec * 1000;

    const loop = (now: number) => {
      rafId = requestAnimationFrame(loop);

      const p = latestProps.current;
      const { width: W, height: H } = p;
      const { tx, ty, nx, ny, radBar, radTravel, fx, fy } = trig;

      const spanAlongBar = Math.abs(tx) * W + Math.abs(ty) * H;
      const halfExtentNormal = 0.5 * (Math.abs(nx) * W + Math.abs(ny) * H);

      const baseScale = Math.min(W, H) / 800;
      const scale = Math.max(0.7, Math.min(1.4, baseScale));

      const halfBand = Math.max(0, (p.bandWidthPx * scale) / 2);
      const feather = Math.max(0, p.featherPx * scale);
      const totalHalf = halfBand + feather;

      const ux = Math.cos(radTravel);
      const uy = Math.sin(radTravel);
      const sideSign = Math.sign(nx * ux + ny * uy) || 1;

      const startPos = sideSign * (halfExtentNormal + totalHalf);
      const endPos = -sideSign * (halfExtentNormal + totalHalf);
      const distanceCss = Math.abs(startPos - endPos);
      const speedCssPerSec = p.speedPxPerSec * dpr;
      const travelTimeSec = Math.max(0.001, distanceCss / speedCssPerSec);
      const periodSec = travelTimeSec + p.repeatDelaySec;

      const elapsedSec = (now - cycleStart) / 1000;
      let running = false,
        pos = startPos,
        progress = 0;

      if (elapsedSec >= 0) {
        const phase = elapsedSec % periodSec;
        if (phase <= travelTimeSec) {
          running = true;
          const u = clamp(phase / travelTimeSec, 0, 1);
          progress = smoothstep01(u);
          pos = startPos + (endPos - startPos) * progress;
        }
      }

      mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      mctx.clearRect(0, 0, W, H);

      if (running) {
        mctx.save();
        mctx.translate(W / 2 + nx * pos, H / 2 + ny * pos);
        mctx.rotate(radBar);
        const grad = mctx.createLinearGradient(0, -totalHalf, 0, totalHalf);
        const mid = totalHalf > 0 ? halfBand / totalHalf : 0;
        grad.addColorStop(0, 'rgba(255,255,255,0)');
        grad.addColorStop(Math.max(0, 0.5 - mid * 0.5), 'rgba(255,255,255,1)');
        grad.addColorStop(Math.min(1, 0.5 + mid * 0.5), 'rgba(255,255,255,1)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        mctx.fillStyle = grad;
        const rectLen = spanAlongBar + totalHalf * 2 + 128;
        mctx.fillRect(-rectLen / 2, -totalHalf, rectLen, totalHalf * 2);
        mctx.restore();
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      if (running) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(image, 0, 0, W, H);
        ctx.globalCompositeOperation = 'destination-in';
        ctx.drawImage(mask, 0, 0, W, H);
        ctx.globalCompositeOperation = 'source-over';

        if (p.flareEnabled && progress >= clamp(p.flareStartRatio, 0, 1)) {
          const t0 = clamp(p.flareStartRatio, 0, 1);
          const t = (progress - t0) / Math.max(1e-6, 1 - t0);
          const ease = smoothstep01(t);
          const flareCx = W / 2 + fx * pos;
          const flareCy = H / 2 + fy * pos;

          drawFlare(ctx, {
            cx: flareCx,
            cy: flareCy,
            baseProps: p,
            trig,
            scale,
            ease,
            offsetAlongPx: p.flare1OffsetAlongPx,
            offsetNormalPx: p.flare1OffsetNormalPx,
            radiusPx: p.flare1RadiusPx,
            alpha: p.flare1Alpha,
            color: p.flare1Color,
          });
          drawFlare(ctx, {
            cx: flareCx,
            cy: flareCy,
            baseProps: p,
            trig,
            scale,
            ease,
            offsetAlongPx: p.flare2OffsetAlongPx,
            offsetNormalPx: p.flare2OffsetNormalPx,
            radiusPx: p.flare2RadiusPx,
            alpha: p.flare2Alpha,
            color: p.flare2Color,
          });
        }
      }
    };

    rafId = requestAnimationFrame(loop);

    const onVisibilityChange = () => {
      if (document.hidden) {
        cycleStart =
          performance.now() + latestProps.current.startDelaySec * 1000;
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [status, image, dpr, trig, latestProps]);

  if (!d || width <= 0 || height <= 0) return null;

  return (
    <div
      className={cn(className, 'pointer-events-none absolute inset-0')}
      style={{ zIndex }}
      aria-hidden
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
