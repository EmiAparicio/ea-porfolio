import { RefObject } from "react";

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
