'use client';

import { hashStr, mulberry32, RNG } from '@project/utils/math';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

/**
 * A custom hook that uses `useLayoutEffect` in a browser environment and falls back to `useEffect` on the server.
 * This is useful for synchronizing with the DOM tree before the browser paints.
 */
export const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * A custom hook to determine if the user has a preference for reduced motion.
 * It respects the user's preference for motion.
 *
 * @param {boolean} respect If true, the hook will check the media query, otherwise it will always return false.
 * @returns {boolean} A boolean indicating whether the user prefers reduced motion.
 */
export function usePrefersReducedMotion(respect: boolean): boolean {
  return useMemo(() => {
    if (!respect || typeof window === 'undefined' || !window.matchMedia) {
      return false;
    }
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      return false;
    }
  }, [respect]);
}

/**
 * A custom hook that generates a pseudo-random number generator (RNG) with a given seed.
 * The RNG function is memoized to ensure stability for a given seed.
 *
 * @param {string} seed The seed string used to initialize the RNG.
 * @returns {RNG} A pseudo-random number generator function.
 */
export function useRNG(seed: string): RNG {
  return useMemo(() => mulberry32(hashStr(seed)), [seed]);
}

/**
 * A custom hook that generates memoized random values for a 'glitch' effect based on a provided RNG.
 *
 * @param {RNG} rng The pseudo-random number generator.
 * @returns {{phase: number; rate: number; ampmul: number; shimmymul: number;}} An object with random values for glitch effects.
 */
export function useGlitchRandoms(rng: RNG) {
  return useMemo(() => {
    const phase = +rng().toFixed(3);
    const rate = +(0.92 + rng() * 0.16).toFixed(3);
    const ampmul = +(0.9 + rng() * 0.2).toFixed(3);
    const shimmymul = +(0.9 + rng() * 0.2).toFixed(3);
    return { phase, rate, ampmul, shimmymul };
  }, [rng]);
}

/**
 * A custom hook to calculate and memoize timing properties for animations.
 *
 * @param {number} intervalMs The base animation interval in milliseconds.
 * @param {number} speed The speed multiplier for the animation.
 * @param {boolean} prefersReducedMotion A flag indicating the user's motion preference.
 * @returns {{isActive: boolean; effectiveDurMs: number;}} An object containing the active state and effective duration.
 */
export function useTimings(
  intervalMs: number,
  speed: number,
  prefersReducedMotion: boolean
) {
  const isActive = useMemo(
    () => intervalMs > 0 && !prefersReducedMotion,
    [intervalMs, prefersReducedMotion]
  );
  const activeMs = useMemo(
    () => Math.max(120, Math.round((speed ?? 1) * 1000)),
    [speed]
  );
  const effectiveDurMs = useMemo(
    () => Math.min(activeMs, Math.max(1, intervalMs)),
    [activeMs, intervalMs]
  );
  return { isActive, effectiveDurMs };
}

/**
 * Creates a function that generates a random cycle duration with jitter.
 *
 * @param {RNG} rng The pseudo-random number generator.
 * @param {number} intervalMs The base interval in milliseconds.
 * @param {number} [jitterSpan=0.3] The amount of jitter to apply.
 * @returns {() => number} A function that returns a new cycle duration in milliseconds.
 */
export function makeSampleCycleMs(
  rng: RNG,
  intervalMs: number,
  jitterSpan = 0.3
) {
  return () => {
    const ratio = 1 + (rng() - 0.5) * jitterSpan;
    return Math.max(1, Math.round(intervalMs * ratio));
  };
}

/**
 * A custom hook that manages a pulsing animation state using a timed loop.
 *
 * @param {boolean} isActive A flag to enable or disable the pulse.
 * @param {number} effectiveDurMs The duration of the 'on' state of the pulse.
 * @param {() => number} sampleCycleMs A function that provides the duration of the entire pulse cycle.
 * @param {RNG} rng The pseudo-random number generator.
 * @returns {boolean} A boolean indicating if the pulse is currently active.
 */
export function usePulse(
  isActive: boolean,
  effectiveDurMs: number,
  sampleCycleMs: () => number,
  rng: RNG
) {
  const [animatePulse, setAnimatePulse] = useState(false);
  const tStart = useRef<number | null>(null);
  const tOn = useRef<number | null>(null);
  const tOff = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      setAnimatePulse(false);
      return;
    }
    const loop = () => {
      setAnimatePulse(true);
      tOn.current = window.setTimeout(() => {
        setAnimatePulse(false);
        const next = sampleCycleMs();
        const gap = Math.max(0, next - effectiveDurMs);
        tOff.current = window.setTimeout(loop, gap);
      }, effectiveDurMs);
    };
    const first = sampleCycleMs();
    const delay = Math.floor(rng() * first);
    tStart.current = window.setTimeout(loop, delay);
    return () => {
      if (tStart.current) {
        clearTimeout(tStart.current);
      }
      if (tOn.current) {
        clearTimeout(tOn.current);
      }
      if (tOff.current) {
        clearTimeout(tOff.current);
      }
      tStart.current = tOn.current = tOff.current = null;
    };
  }, [isActive, effectiveDurMs, sampleCycleMs, rng]);

  return animatePulse;
}

/**
 * A custom hook that uses ResizeObserver to run a callback on element resize, debounced with `requestAnimationFrame`.
 * It also listens to window resize events as a fallback/companion.
 *
 * @template T The type of the element to observe.
 * @param {React.RefObject<T | null>} elRef A ref to the element to observe.
 * @param {() => void} onResize The callback function to execute on resize.
 */
export function useResizeObserverRaf<T extends Element>(
  elRef: React.RefObject<T | null>,
  onResize: () => void
) {
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el || typeof ResizeObserver === 'undefined') {
      return;
    }
    const fire = () => {
      if (raf.current) {
        cancelAnimationFrame(raf.current);
      }
      raf.current = requestAnimationFrame(() => {
        onResize();
        raf.current = null;
      });
    };
    const ro = new ResizeObserver(fire);
    ro.observe(el);
    const winResize = () => fire();
    window.addEventListener('resize', winResize, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', winResize);
      if (raf.current) {
        cancelAnimationFrame(raf.current);
      }
    };
  }, [elRef, onResize]);
}

/**
 * A type guard function to check if the `document` object has the `fonts` API available.
 * This is useful for checking if `document.fonts.ready` can be used.
 *
 * @param {Document} d The document object to check.
 * @returns {d is Document & {fonts: FontFaceSet}} True if the fonts API is available, otherwise false.
 */
export function hasFontsAPI(
  d: Document
): d is Document & { fonts: FontFaceSet } {
  return (
    !!(d as { fonts?: FontFaceSet }).fonts &&
    typeof (d as { fonts: FontFaceSet }).fonts.ready?.then === 'function'
  );
}
