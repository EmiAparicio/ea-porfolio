import { Ripple, RipplePhysics } from '@project/types/hexgrid';
import { drawRingMask } from '@project/utils/hexgrid/drawing';
import {
  computeAlpha,
  easeOutCubic,
  effectiveStagger,
} from '@project/utils/hexgrid/math';
import { RefObject, useCallback, useEffect, useRef } from 'react';
import { clamp } from '../../utils/math';

export type UseRippleEngineParams = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  bufferRef: RefObject<HTMLCanvasElement | null>;
  image: CanvasImageSource | null;
  size: { width: number; height: number; dpr: number };
  physics: RipplePhysics;
};

export type UseRippleEngineResult = {
  trigger: (x: number, y: number) => void;
  active: boolean;
};

/**
 * A custom hook that manages and renders a ripple effect on a canvas.
 * It uses `requestAnimationFrame` to create an animation loop that draws
 * masked rings on the canvas, simulating ripples spreading out from a
 * central point.
 *
 * @param {UseRippleEngineParams} params - The parameters for the ripple engine.
 * @param {RefObject<HTMLCanvasElement | null>} params.canvasRef - A ref to the main canvas element.
 * @param {RefObject<HTMLCanvasElement | null>} params.bufferRef - A ref to the buffer canvas element.
 * @param {CanvasImageSource | null} params.image - The image to be used as the base for the ripple effect.
 * @param {{width: number; height: number; dpr: number;}} params.size - The dimensions and device pixel ratio of the canvas.
 * @param {RipplePhysics} params.physics - The physics parameters for the ripple effect.
 * @returns {UseRippleEngineResult} An object containing the trigger function and the active state of the engine.
 */
export function useRippleEngine(
  params: UseRippleEngineParams
): UseRippleEngineResult {
  const { canvasRef, bufferRef, image, size, physics } = params;

  const imageRef = useRef<CanvasImageSource | null>(image);
  const sizeRef = useRef(size);
  const physicsRef = useRef(physics);
  useEffect(() => void (imageRef.current = image), [image]);
  useEffect(() => void (sizeRef.current = size), [size]);
  useEffect(() => void (physicsRef.current = physics), [physics]);

  const ripplesRef = useRef<Ripple[]>([]);
  const rafRef = useRef<number | null>(null);

  const maskRef = useRef<HTMLCanvasElement | null>(null);
  const ringRef = useRef<HTMLCanvasElement | null>(null);

  /**
   * Ensures that a canvas element exists and has the correct dimensions.
   *
   * @param {{current: HTMLCanvasElement | null}} cvsRef - A ref to the canvas.
   * @param {number} W - The desired width.
   * @param {number} H - The desired height.
   * @returns {HTMLCanvasElement} The canvas element.
   */
  const ensureCanvas = useCallback(
    (cvsRef: { current: HTMLCanvasElement | null }, W: number, H: number) => {
      let cvs = cvsRef.current;
      if (!cvs) {
        cvs = document.createElement('canvas');
        cvsRef.current = cvs;
      }
      if (cvs.width !== W || cvs.height !== H) {
        cvs.width = W;
        cvs.height = H;
      }
      return cvs;
    },
    []
  );

  /**
   * The main animation loop for the ripple effect. It updates and draws each ripple.
   */
  const tick = useCallback(() => {
    const id = requestAnimationFrame(tick);
    rafRef.current = id;

    const main = canvasRef.current;
    const buf = bufferRef.current;
    const img = imageRef.current;
    const { width, height, dpr } = sizeRef.current;
    const phys = physicsRef.current;

    if (!main || !buf || !img) {
      return;
    }

    const mCtx = main.getContext('2d');
    const bCtx = buf.getContext('2d');
    if (!mCtx || !bCtx) {
      return;
    }

    mCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    mCtx.clearRect(0, 0, width, height);
    mCtx.imageSmoothingEnabled = true;

    bCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bCtx.imageSmoothingEnabled = true;

    const Wpx = Math.max(1, Math.floor(width * dpr));
    const Hpx = Math.max(1, Math.floor(height * dpr));
    const mask = ensureCanvas(maskRef, Wpx, Hpx);
    const ring = ensureCanvas(ringRef, Wpx, Hpx);
    const maskCtx = mask.getContext('2d')!;
    const ringCtx = ring.getContext('2d')!;

    maskCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    maskCtx.clearRect(0, 0, width, height);

    const now = performance.now();
    const ringCount = Math.max(1, Math.floor(phys.rings));
    const fallbackMinSep = phys.minRingSeparationPx ?? phys.ringWidth * 0.75;
    const totalLife =
      phys.durationSec * 1000 + (ringCount - 1) * phys.stagger * 1000;

    const next: Ripple[] = [];

    const MAX_RIPPLES = 48;

    for (let i = 0; i < ripplesRef.current.length; i++) {
      const r = ripplesRef.current[i];
      const ageMs = now - r.born;
      if (ageMs > totalLife + 50) {
        continue;
      }

      const effStagger = effectiveStagger(
        phys.stagger,
        fallbackMinSep,
        r.reach,
        phys.durationSec
      );

      for (let j = 0; j < ringCount; j++) {
        const localSec = ageMs / 1000 - j * effStagger;
        const t = clamp(localSec / Math.max(0.001, phys.durationSec), 0, 1);
        if (t <= 0) {
          continue;
        }

        const R = easeOutCubic(t) * r.reach;
        const W = Math.max(1, phys.ringWidth);
        const innerR = Math.max(0, R - W);
        const alpha = computeAlpha(t, phys.startFadePct, phys.endFadePct);

        ringCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawRingMask(ringCtx, {
          cx: r.cx,
          cy: r.cy,
          R,
          innerR,
          reach: r.reach,
          falloffExp: Math.max(0.25, phys.falloffExp),
          outerFeather: Math.min(28, Math.max(6, W * 0.8)),
          innerFeather: Math.min(28, Math.max(6, W * 0.8)),
          width,
          height,
        });

        maskCtx.globalCompositeOperation = 'lighter';
        maskCtx.globalAlpha = alpha;
        maskCtx.drawImage(ring, 0, 0, width, height);
      }

      next.push(r);
      if (next.length > MAX_RIPPLES) {
        break;
      }
    }

    ripplesRef.current = next;

    mCtx.globalCompositeOperation = 'source-over';
    mCtx.globalAlpha = 1;
    mCtx.drawImage(img, 0, 0, width, height);
    mCtx.globalCompositeOperation = 'destination-in';
    mCtx.drawImage(mask, 0, 0, width, height);
    mCtx.globalCompositeOperation = 'source-over';
  }, [canvasRef, bufferRef, ensureCanvas]);

  /**
   * Starts the `requestAnimationFrame` loop.
   */
  const startRAF = useCallback(() => {
    if (rafRef.current != null) {
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  /**
   * Triggers a new ripple at the specified coordinates.
   *
   * @param {number} x The x-coordinate of the ripple's origin.
   * @param {number} y The y-coordinate of the ripple's origin.
   */
  const trigger = useCallback(
    (x: number, y: number) => {
      const { width, height } = sizeRef.current;
      const phys = physicsRef.current;

      const mrx = Math.max(x, width - x);
      const mry = Math.max(y, height - y);
      const maxR = Math.hypot(mrx, mry);
      const reach = Math.min(
        phys.maxRadiusPx ?? Infinity,
        Math.max(40, maxR * phys.reachFactor)
      );

      if (ripplesRef.current.length > 64) {
        ripplesRef.current.shift();
      }
      ripplesRef.current.push({ cx: x, cy: y, reach, born: performance.now() });
      startRAF();
    },
    [startRAF]
  );

  useEffect(() => {
    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = null;
    };
  }, []);

  return {
    trigger,
    active: rafRef.current != null || ripplesRef.current.length > 0,
  };
}
