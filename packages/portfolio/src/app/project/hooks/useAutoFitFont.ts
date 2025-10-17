'use client';

import {
  hasFontsAPI,
  useIsoLayoutEffect,
  useResizeObserverRaf,
} from '@project/hooks/useGlitchCore';
import { clamp } from '@project/utils/math';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export const MIN_FONT_PX = 8;

/**
 * Estimates the initial font size in pixels for a given title to fit within a maximum width.
 *
 * @param {string} title The text title.
 * @param {number} maxWidth The maximum width in pixels.
 * @param {number} [basePx=16] The base font size for scaling.
 * @param {boolean} [allowGrow=true] Whether the font size is allowed to grow larger than `basePx`.
 * @returns {number} The estimated font size in pixels.
 */
export function estimateInitialPx(
  title: string,
  maxWidth: number,
  basePx = 16,
  allowGrow = true
) {
  const avgCharEm = 0.58;
  const est = Math.floor(maxWidth / Math.max(1, title.length * avgCharEm));
  const maxPx = allowGrow ? 160 : basePx;
  return clamp(est, MIN_FONT_PX, maxPx);
}

/**
 * A custom hook that automatically adjusts the font size of a text element to fit within a given maximum width.
 * It uses `ResizeObserver` and `useLayoutEffect` to handle dynamic resizing and font loading.
 *
 * @param {object} params - The parameters for the hook.
 * @param {string} params.title - The text content to be fitted.
 * @param {number} params.maxWidth - The maximum width for the text element.
 * @param {boolean} [params.allowGrow=true] - If true, the font size can increase.
 * @param {number} [params.basePx=16] - The base font size to use for initial estimation.
 * @param {boolean} [params.avoidFlash=true] - If true, the text is hidden until the first measurement is complete to prevent a "flash" of incorrect size.
 * @param {React.RefObject<HTMLElement | null>} params.wrapRef - A ref to the container element.
 * @param {React.RefObject<HTMLElement | null>} params.textRef - A ref to the text element whose font size will be adjusted.
 * @returns {{fontPx: number; overscanPx: number; measuredOnce: boolean; ampPx: number; flashHidden: boolean;}} An object with the calculated font size and related properties.
 */
export function useAutoFitFont(params: {
  title: string;
  maxWidth: number;
  allowGrow?: boolean;
  basePx?: number;
  avoidFlash?: boolean;
  wrapRef: React.RefObject<HTMLElement | null>;
  textRef: React.RefObject<HTMLElement | null>;
}) {
  const {
    title,
    maxWidth,
    allowGrow = true,
    basePx = 16,
    avoidFlash = true,
    wrapRef,
    textRef,
  } = params;
  const [fontPx, setFontPx] = useState(() =>
    estimateInitialPx(title, maxWidth, basePx, allowGrow)
  );
  const [measuredOnce, setMeasuredOnce] = useState(false);
  const measuring = useRef(false);

  useEffect(() => {
    setMeasuredOnce(false);
    setFontPx(estimateInitialPx(title, maxWidth, basePx, allowGrow));
  }, [title, maxWidth, allowGrow, basePx]);

  const measureAndFit = useCallback(() => {
    if (measuring.current) {
      return;
    }
    const textEl = textRef.current;
    if (!textEl) {
      return;
    }
    measuring.current = true;
    const rect = textEl.getBoundingClientRect();
    const currentWidth = rect.width || textEl.scrollWidth;
    if (!currentWidth || !Number.isFinite(currentWidth)) {
      measuring.current = false;
      return;
    }
    const baseEl = wrapRef.current || textEl;
    const cs = window.getComputedStyle(baseEl);
    const currentPx = parseFloat(cs.fontSize || '16') || 16;
    const ratio = maxWidth / currentWidth;
    let next = currentPx;
    if (Math.abs(ratio - 1) > 0.02) {
      const candidate = Math.floor(currentPx * ratio);
      next = allowGrow
        ? Math.max(MIN_FONT_PX, candidate)
        : Math.max(MIN_FONT_PX, Math.min(candidate, currentPx));
    }
    if (Math.abs(next - fontPx) >= 1) {
      setFontPx(next);
    }
    if (!measuredOnce) {
      setMeasuredOnce(true);
    }
    measuring.current = false;
  }, [allowGrow, fontPx, measuredOnce, maxWidth, textRef, wrapRef]);

  useIsoLayoutEffect(() => {
    measureAndFit();
  }, [title, maxWidth, measureAndFit]);

  useEffect(() => {
    const onResize = () => measureAndFit();
    window.addEventListener('resize', onResize, { passive: true });
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        onResize();
      }
    };
    window.addEventListener('pageshow', onPageShow);

    let removeFontsListener: (() => void) | null = null;
    let timeoutId: number | null = null;
    if (hasFontsAPI(document)) {
      const handleFontsDone = () => onResize();
      document.fonts.ready.then(handleFontsDone).catch(() => {});
      const fonts: FontFaceSet = document.fonts;
      fonts.addEventListener('loadingdone', handleFontsDone as EventListener);
      removeFontsListener = () =>
        fonts.removeEventListener(
          'loadingdone',
          handleFontsDone as EventListener
        );
    } else {
      window.addEventListener('load', onResize, { once: true });
      timeoutId = window.setTimeout(onResize, 350);
    }

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pageshow', onPageShow);
      if (removeFontsListener) {
        removeFontsListener();
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [measureAndFit]);

  useResizeObserverRaf(textRef, measureAndFit);

  const ampPx = useMemo(() => {
    const base = fontPx || 16;
    return +(base * 0.05).toFixed(2);
  }, [fontPx]);

  const overscanPx = useMemo(() => Math.ceil(ampPx * 0.5), [ampPx]);

  return {
    fontPx,
    overscanPx,
    measuredOnce,
    ampPx: Math.max(7, ampPx),
    flashHidden: avoidFlash && !measuredOnce,
  };
}
