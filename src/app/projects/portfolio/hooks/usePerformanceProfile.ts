'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

/**
 * Options for the usePerformanceProfile hook.
 *
 * @typedef {object} UsePerformanceProfileOptions
 * @property {number} [fpsProbeMs=900] The duration in milliseconds for each FPS probe.
 * @property {Array<'visibilitychange' | 'resize'>} [recheckOn] Events that trigger a performance recheck.
 * @property {number} [minFps=45] The minimum acceptable frames per second.
 * @property {number} [minCores=4] The minimum acceptable number of CPU cores.
 * @property {number} [minMemoryGB=4] The minimum acceptable amount of device memory in gigabytes.
 * @property {{ lowPerformance?: boolean }} [force] Forces the low performance state.
 * @property {number} [graceMs=2500] A grace period in milliseconds before performance profiling begins.
 * @property {number} [minFpsSamples=2] The minimum number of FPS samples required to score performance.
 * @property {number} [reprobeMs=2000] The interval in milliseconds to re-probe FPS.
 * @property {number} [hysteresisFps=5] The FPS threshold above minFps to exit a low performance state.
 */
export type UsePerformanceProfileOptions = {
  fpsProbeMs?: number;
  recheckOn?: Array<'visibilitychange' | 'resize'>;
  minFps?: number;
  minCores?: number;
  minMemoryGB?: number;
  force?: { lowPerformance?: boolean };
  graceMs?: number;
  minFpsSamples?: number;
  reprobeMs?: number;
  hysteresisFps?: number;
};

/**
 * Reasons contributing to a low performance score.
 *
 * @typedef {object} PerformanceReasons
 * @property {boolean} prefersReducedMotion - Indicates if the user has a preference for reduced motion.
 * @property {boolean} saveData - Indicates if the user has enabled data saver mode.
 * @property {boolean} lowFps - Indicates if the current FPS is below the minimum threshold.
 * @property {boolean} lowCores - Indicates if the number of CPU cores is below the minimum threshold.
 * @property {boolean} lowMemory - Indicates if the device memory is below the minimum threshold.
 * @property {boolean} noWebGL - Indicates if WebGL is not supported.
 * @property {boolean} slowNetwork - Indicates if the network connection is slow.
 */
export type PerformanceReasons = {
  prefersReducedMotion: boolean;
  saveData: boolean;
  lowFps: boolean;
  lowCores: boolean;
  lowMemory: boolean;
  noWebGL: boolean;
  slowNetwork: boolean;
};

/**
 * A snapshot of the device's performance profile.
 *
 * @typedef {object} PerformanceProfile
 * @property {number | null} cores - The number of CPU cores.
 * @property {number | null} memoryGB - The amount of device memory in gigabytes.
 * @property {string | null} effectiveType - The effective network connection type.
 * @property {boolean} saveData - The user's data saver preference.
 * @property {boolean} webgl - WebGL support status.
 */
export type PerformanceProfile = {
  cores: number | null;
  memoryGB: number | null;
  effectiveType: string | null;
  saveData: boolean;
  webgl: boolean;
};

type MinimalNetworkInformation = {
  effectiveType?: string;
  saveData?: boolean;
  addEventListener?: (type: 'change', listener: () => void) => void;
  removeEventListener?: (type: 'change', listener: () => void) => void;
};

type NavigatorExtended = Navigator & {
  deviceMemory?: number;
  connection?: MinimalNetworkInformation;
  mozConnection?: MinimalNetworkInformation;
  webkitConnection?: MinimalNetworkInformation;
};

const isBrowser =
  typeof window !== 'undefined' && typeof document !== 'undefined';

const initialSignals: PerformanceProfile = {
  cores: null,
  memoryGB: null,
  effectiveType: null,
  saveData: false,
  webgl: false,
};

/**
 * Checks for WebGL support in the browser.
 *
 * @returns {boolean} True if WebGL is supported, otherwise false.
 */
function checkWebGLSupport(): boolean {
  if (!isBrowser) {
    return false;
  }
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch (_e) {
    return false;
  }
}

const webGLSupported = checkWebGLSupport();

let lastBrowserSignals: PerformanceProfile | null = null;
/**
 * Gets a snapshot of the current browser performance signals.
 *
 * @returns {PerformanceProfile} The current performance profile snapshot.
 */
function getBrowserSignalsSnapshot(): PerformanceProfile {
  if (!isBrowser) {
    return initialSignals;
  }

  const nav = navigator as NavigatorExtended;
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection;

  const nextSnapshot: PerformanceProfile = {
    cores: nav.hardwareConcurrency ?? null,
    memoryGB: nav.deviceMemory ?? null,
    effectiveType: conn?.effectiveType ?? null,
    saveData: !!conn?.saveData,
    webgl: webGLSupported,
  };

  if (
    lastBrowserSignals &&
    lastBrowserSignals.cores === nextSnapshot.cores &&
    lastBrowserSignals.memoryGB === nextSnapshot.memoryGB &&
    lastBrowserSignals.effectiveType === nextSnapshot.effectiveType &&
    lastBrowserSignals.saveData === nextSnapshot.saveData
  ) {
    return lastBrowserSignals;
  }

  lastBrowserSignals = nextSnapshot;
  return nextSnapshot;
}

/**
 * Subscribes to browser performance signal changes.
 *
 * @param {() => void} callback The callback function to run on changes.
 * @returns {() => void} A function to unsubscribe from the events.
 */
function subscribeToBrowserSignals(callback: () => void): () => void {
  if (!isBrowser) {
    return () => {};
  }

  const disposers: Array<() => void> = [];
  const add = (
    target: EventTarget,
    event: string,
    handler: EventListenerOrEventListenerObject
  ) => {
    target.addEventListener(event, handler, { passive: true });
    disposers.push(() => target.removeEventListener(event, handler));
  };

  add(window, 'resize', callback);
  add(document, 'visibilitychange', callback);

  const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
  mql.addEventListener('change', callback);
  disposers.push(() => mql.removeEventListener('change', callback));

  const nav = navigator as NavigatorExtended;
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
  if (conn?.addEventListener) {
    conn.addEventListener('change', callback);
    disposers.push(() => conn.removeEventListener?.('change', callback));
  }

  return () => disposers.forEach((d) => d());
}

/**
 * A custom hook that provides a synchronized snapshot of browser performance signals.
 *
 * @returns {PerformanceProfile} The current performance profile of the browser.
 */
function useBrowserSignals(): PerformanceProfile {
  return useSyncExternalStore(
    subscribeToBrowserSignals,
    getBrowserSignalsSnapshot,
    () => initialSignals
  );
}

/**
 * A utility function to get the current high-resolution timestamp.
 *
 * @returns {number} The current timestamp in milliseconds.
 */
function now(): number {
  return performance.now();
}

/**
 * A custom hook for performance profiling of the user's device and browser.
 * It detects various factors like FPS, CPU cores, memory, network, and user preferences
 * to determine if the device is low-performance and animations should be disabled.
 *
 * @param {UsePerformanceProfileOptions} [options={}] - The configuration options.
 * @returns {Readonly<{lowPerformance: boolean; reasons: PerformanceReasons; fps: number | null; profile: PerformanceProfile; enableAnimations: boolean;}>} An object containing the performance profile and recommendations.
 */
export function usePerformanceProfile(
  options: UsePerformanceProfileOptions = {}
): Readonly<{
  lowPerformance: boolean;
  reasons: PerformanceReasons;
  fps: number | null;
  profile: PerformanceProfile;
  enableAnimations: boolean;
}> {
  const {
    fpsProbeMs = 900,
    minFps = 45,
    minCores = 4,
    minMemoryGB = 4,
    force,
    graceMs = 2500,
    minFpsSamples = 2,
    reprobeMs = 2000,
    hysteresisFps = 5,
  } = options;

  const signals = useBrowserSignals();
  const prefersReducedMotion =
    isBrowser && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [fps, setFps] = useState<number | null>(null);
  const [graceOver, setGraceOver] = useState<boolean>(false);
  const [lowPerformanceSticky, setLowPerformanceSticky] =
    useState<boolean>(false);

  const rafRef = useRef<number | null>(null);
  const unmountedRef = useRef<boolean>(false);
  const fpsSamplesRef = useRef<number[]>([]);

  const finalizeFpsSample = useCallback((value: number) => {
    fpsSamplesRef.current = [...fpsSamplesRef.current.slice(-4), value];
    const avg =
      fpsSamplesRef.current.reduce((a, b) => a + b, 0) /
      fpsSamplesRef.current.length;
    setFps(Math.round(avg));
  }, []);

  const probeFps = useCallback(() => {
    if (!isBrowser || document.visibilityState !== 'visible') {
      return;
    }

    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
    }

    let frames = 0;
    const start = now();
    const stopAt = start + Math.max(300, fpsProbeMs);

    const tick = (t: number) => {
      frames += 1;
      if (t >= stopAt) {
        const elapsed = Math.max(1, t - start);
        const fpsNow = (frames * 1000) / elapsed;
        if (!unmountedRef.current) {
          finalizeFpsSample(fpsNow);
        }
        rafRef.current = null;
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [finalizeFpsSample, fpsProbeMs]);

  useEffect(() => {
    unmountedRef.current = false;
    probeFps();

    const graceTimer = setTimeout(
      () => {
        if (!unmountedRef.current) {
          setGraceOver(true);
        }
      },
      Math.max(0, graceMs)
    );

    const reprobeTimer = setInterval(probeFps, Math.max(1000, reprobeMs));

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        probeFps();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      unmountedRef.current = true;
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
      }
      clearTimeout(graceTimer);
      clearInterval(reprobeTimer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [probeFps, graceMs, reprobeMs]);

  const reasonsBase = useMemo(() => {
    return {
      lowCores: signals.cores != null ? signals.cores <= minCores : false,
      lowMemory:
        signals.memoryGB != null ? signals.memoryGB < minMemoryGB : false,
      slowNetwork:
        signals.effectiveType === '2g' || signals.effectiveType === 'slow-2g',
      noWebGL: !signals.webgl,
      saveData: signals.saveData,
    };
  }, [signals, minCores, minMemoryGB]);

  const lowFps = fps != null ? fps < minFps : false;

  const reasons: PerformanceReasons = useMemo(
    () => ({
      prefersReducedMotion,
      saveData: reasonsBase.saveData,
      lowFps,
      lowCores: reasonsBase.lowCores,
      lowMemory: reasonsBase.lowMemory,
      noWebGL: reasonsBase.noWebGL,
      slowNetwork: reasonsBase.slowNetwork,
    }),
    [prefersReducedMotion, reasonsBase, lowFps]
  );

  const haveEnoughSamples =
    fpsSamplesRef.current.length >= Math.max(1, minFpsSamples);
  const canScore = graceOver && haveEnoughSamples;

  const desiredLowPerformance = useMemo(() => {
    if (force?.lowPerformance !== undefined) {
      return force.lowPerformance;
    }
    if (reasons.prefersReducedMotion || reasons.saveData) {
      return true;
    }
    if (!canScore) {
      return false;
    }

    let score = 0;
    if (reasons.lowFps) {
      score += 2;
    }
    if (reasons.lowCores) {
      score += 1;
    }
    if (reasons.lowMemory) {
      score += 1;
    }
    if (reasons.noWebGL) {
      score += 1;
    }
    if (reasons.slowNetwork) {
      score += 1;
    }
    return score >= 2;
  }, [force?.lowPerformance, reasons, canScore]);

  useEffect(() => {
    if (!canScore) {
      return;
    }
    setLowPerformanceSticky((prev) => {
      if (prev) {
        if (fps != null && fps >= minFps + hysteresisFps) {
          return desiredLowPerformance;
        }
        return true;
      }
      return desiredLowPerformance;
    });
  }, [desiredLowPerformance, canScore, fps, minFps, hysteresisFps]);

  const lowPerformance = lowPerformanceSticky || desiredLowPerformance;

  return {
    lowPerformance,
    reasons,
    fps,
    profile: signals,
    enableAnimations: !lowPerformance,
  };
}
