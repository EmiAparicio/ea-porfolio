import { RefObject } from 'react';

/**
 * Parameters for drawing a ring mask (alpha-only).
 */
export type RingMaskParams = {
  cx: number;
  cy: number;
  R: number;
  innerR: number;
  reach: number;
  falloffExp: number;
  outerFeather: number;
  innerFeather: number;
  width: number;
  height: number;
};

/**
 * Draws a single ring alpha mask into the provided 2D context.
 * The context is cleared; the resulting alpha represents the ring intensity.
 * It does NOT draw the grid image; intended to be blended into a global mask.
 */
export function drawRingMask(
  ctx: CanvasRenderingContext2D,
  p: RingMaskParams
): void {
  const W = Math.max(1, p.width);
  const H = Math.max(1, p.height);

  ctx.save();

  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.clearRect(0, 0, W, H);

  ctx.beginPath();
  ctx.arc(p.cx, p.cy, Math.max(0.0001, p.R), 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,1)';
  ctx.fill();

  if (p.innerR > 0) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(p.cx, p.cy, p.innerR, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalCompositeOperation = 'destination-in';
  const fall = ctx.createRadialGradient(
    p.cx,
    p.cy,
    0.0001,
    p.cx,
    p.cy,
    Math.max(0.0001, p.reach)
  );
  const steps = 4;
  for (let k = 0; k < steps; k++) {
    const s = k / (steps - 1);
    const intensity = Math.max(0, Math.min(1, Math.pow(1 - s, p.falloffExp)));
    fall.addColorStop(s, `rgba(255,255,255,${intensity})`);
  }
  ctx.fillStyle = fall;
  ctx.fillRect(0, 0, W, H);

  ctx.globalCompositeOperation = 'destination-in';
  const gOut = ctx.createRadialGradient(
    p.cx,
    p.cy,
    Math.max(0.0001, p.R - p.outerFeather),
    p.cx,
    p.cy,
    Math.max(0.0001, p.R)
  );
  gOut.addColorStop(0.0, 'rgba(255,255,255,1)');
  gOut.addColorStop(1.0, 'rgba(255,255,255,0)');
  ctx.fillStyle = gOut;
  ctx.fillRect(0, 0, W, H);

  if (p.innerR > 0) {
    ctx.globalCompositeOperation = 'destination-out';
    const gIn = ctx.createRadialGradient(
      p.cx,
      p.cy,
      Math.max(0.0001, p.innerR),
      p.cx,
      p.cy,
      Math.max(0.0001, p.innerR + p.innerFeather)
    );
    gIn.addColorStop(0.0, 'rgba(255,255,255,1)');
    gIn.addColorStop(1.0, 'rgba(255,255,255,0)');
    ctx.fillStyle = gIn;
    ctx.fillRect(0, 0, W, H);
  }

  ctx.restore();
}

/**
 * Generates or reuses a cached circular gradient sprite for the glow mask.
 */
export function ensureGlowSprite(
  cacheRef: RefObject<{
    key: string;
    canvas: HTMLCanvasElement;
    cssR: number;
  } | null>,
  cssR: number,
  coreT: number,
  fadeStartT: number,
  dpr: number
) {
  const key = `${Math.round(cssR * 100)}/${Math.round(coreT * 1000)}/${Math.round(
    fadeStartT * 1000
  )}/${dpr}`;
  if (cacheRef.current && cacheRef.current.key === key) return cacheRef.current;

  const devR = Math.max(1, Math.round(cssR * dpr));
  const size = devR * 2;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const gctx = c.getContext('2d')!;
  const cx = devR;
  const cy = devR;

  const grad = gctx.createRadialGradient(cx, cy, 0, cx, cy, devR);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(Math.max(0, Math.min(1, coreT)), 'rgba(255,255,255,1)');
  grad.addColorStop(
    Math.max(0, Math.min(1, fadeStartT)),
    'rgba(255,255,255,0.35)'
  );
  grad.addColorStop(0.999, 'rgba(255,255,255,0)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');

  gctx.fillStyle = grad;
  gctx.beginPath();
  gctx.arc(cx, cy, devR, 0, Math.PI * 2);
  gctx.fill();

  const sprite = { key, canvas: c, cssR };
  cacheRef.current = sprite;
  return sprite;
}
