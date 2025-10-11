'use client';

import { useLatestRef } from '@portfolio/hooks/useLatestRef';
import { RefObject, useEffect } from 'react';

/**
 * Parameters for the `useGlobalPointerRipple` hook.
 *
 * @typedef {object} UseGlobalPointerRippleParams
 * @property {RefObject<HTMLElement | null>} hostRef - A React ref to the host element.
 * @property {number} width - The logical width of the canvas.
 * @property {number} height - The logical height of the canvas.
 * @property {(x: number, y: number) => void} onClickAtAction - The callback function to be executed when a click event is detected.
 * @property {number} [cooldownMs=80] - The minimum time in milliseconds between ripple triggers.
 * @property {number} [dedupePx=12] - The minimum distance in pixels between consecutive clicks to trigger a ripple.
 * @property {number} [dedupeWindowMs=200] - The time window in milliseconds for deduplication.
 * @property {number} [dragEpsPx=6] - The maximum distance in pixels a pointer can move to still be considered a click.
 */
export type UseGlobalPointerRippleParams = {
  hostRef: RefObject<HTMLElement | null>;
  width: number;
  height: number;
  onClickAtAction: (x: number, y: number) => void;
  cooldownMs?: number;
  dedupePx?: number;
  dedupeWindowMs?: number;
  dragEpsPx?: number;
};

/**
 * A custom hook that listens for global pointer events to trigger a "ripple" effect on a specific host element.
 * It's designed to filter out drag events and duplicate clicks, ensuring a clean and responsive effect.
 *
 * @param {UseGlobalPointerRippleParams} params - The parameters for the hook.
 */
export function useGlobalPointerRipple(
  params: UseGlobalPointerRippleParams
): void {
  const { onClickAtAction: onClickAt, hostRef } = params;
  const latestParams = useLatestRef(params);

  useEffect(() => {
    const pState = {
      active: false,
      x: 0,
      y: 0,
      moved: false,
    };
    let lastTs = 0;
    const clicks: Array<{ x: number; y: number; t: number }> = [];

    const onPointerDown = (e: PointerEvent) => {
      pState.active = true;
      pState.x = e.clientX;
      pState.y = e.clientY;
      pState.moved = false;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!pState.active) {
        return;
      }
      const { dragEpsPx = 6 } = latestParams.current;
      const dx = e.clientX - pState.x;
      const dy = e.clientY - pState.y;
      if (dx * dx + dy * dy > dragEpsPx * dragEpsPx) {
        pState.moved = true;
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!pState.active) {
        return;
      }
      pState.active = false;
      if (pState.moved) {
        return;
      }

      const {
        cooldownMs = 80,
        dedupePx = 12,
        dedupeWindowMs = 200,
        width,
        height,
      } = latestParams.current;

      const now = performance.now();
      if (now - lastTs < cooldownMs) {
        return;
      }
      lastTs = now;

      const host = hostRef.current;
      if (!host) {
        return;
      }
      const rect = host.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      if (cx < 0 || cy < 0 || cx > rect.width || cy > rect.height) {
        return;
      }

      const logicalX = (cx / rect.width) * width;
      const logicalY = (cy / rect.height) * height;

      for (let i = clicks.length - 1; i >= 0; i--) {
        const c = clicks[i];
        if (now - c.t > dedupeWindowMs) {
          clicks.splice(i, 1);
          continue;
        }
        const dx = c.x - logicalX;
        const dy = c.y - logicalY;
        if (dx * dx + dy * dy < dedupePx * dedupePx) {
          return;
        }
      }
      clicks.push({ x: logicalX, y: logicalY, t: now });

      onClickAt(logicalX, logicalY);
    };

    const onPointerCancel = () => {
      pState.active = false;
    };

    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerCancel, {
      passive: true,
    });

    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
    };
  }, [onClickAt, hostRef, latestParams]);
}
