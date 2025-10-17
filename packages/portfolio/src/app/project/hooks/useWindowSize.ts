import {
  DeviceType,
  FullscreenEventName,
  GenericEventTarget,
} from '@project/types/window';
import { computeDeviceType } from '@project/utils/window';
import { useEffect, useState } from 'react';

export type UseWindowSizeOptions = {
  /**
   * Breakpoints expressed as aspect ratios (width/height).
   * If aspect >= web → 'web', else if aspect >= medium → 'medium', else 'mobile'.
   */
  aspectBreakpoints?: {
    web: number;
    medium: number;
  };
  /**
   * Use window.visualViewport for width/height when available.
   * Improves accuracy on mobile (zoom, on-screen keyboard).
   * Default: true.
   */
  useVisualViewport?: boolean;
  /**
   * Ignore resize updates while in fullscreen mode.
   * Default: true.
   */
  ignoreWhileFullscreen?: boolean;
  /**
   * Initial size when running during SSR (no window).
   * Default: { width: 1024, height: 768 }.
   */
  initialSize?: { width: number; height: number };
};

export type UseWindowSizeReturn = {
  deviceType: DeviceType;
  windowWidth: number;
  windowHeight: number;
};

/**
 * A React hook that tracks window dimensions and derives a device type from the aspect ratio.
 * It's optimized for performance using `requestAnimationFrame` and provides options for
 * mobile-specific viewports and SSR compatibility.
 * @param options Configuration options for the hook.
 * @returns An object with the current window dimensions and device type.
 */
const useWindowSize = (options?: UseWindowSizeOptions): UseWindowSizeReturn => {
  const {
    aspectBreakpoints = { web: 4 / 3, medium: 25 / 42 },
    useVisualViewport = true,
    ignoreWhileFullscreen = true,
    initialSize = { width: 1024, height: 768 },
  } = options ?? {};

  const isBrowser = typeof window !== 'undefined';
  const aspectWeb = aspectBreakpoints.web;
  const aspectMedium = aspectBreakpoints.medium;

  const initial = (() => {
    if (!isBrowser) {
      const { width, height } = initialSize;
      return {
        deviceType: computeDeviceType(width, height, {
          web: aspectWeb,
          medium: aspectMedium,
        }),
        windowWidth: width,
        windowHeight: height,
      };
    }
    const vv = useVisualViewport ? window.visualViewport : null;
    const width = Math.round((vv?.width ?? window.innerWidth) || 0);
    const height = Math.round((vv?.height ?? window.innerHeight) || 0);
    return {
      deviceType: computeDeviceType(width, height, {
        web: aspectWeb,
        medium: aspectMedium,
      }),
      windowWidth: width,
      windowHeight: height,
    };
  })();

  const [state, setState] = useState<UseWindowSizeReturn>(initial);

  useEffect(() => {
    if (!isBrowser) return;

    let rafId: number | null = null;

    /**
     * Reads the current window or visual viewport dimensions.
     * @internal
     */
    const readSize = (): { width: number; height: number } => {
      const vv = useVisualViewport ? window.visualViewport : null;
      const width = Math.round((vv?.width ?? window.innerWidth) || 0);
      const height = Math.round((vv?.height ?? window.innerHeight) || 0);
      return { width, height };
    };

    /**
     * Checks if the document is currently in fullscreen mode across different browsers.
     * @internal
     */
    const isFullscreen = (): boolean => {
      const doc = document as unknown as {
        fullscreenElement?: Element | null;
        webkitFullscreenElement?: Element | null;
        mozFullScreenElement?: Element | null;
        msFullscreenElement?: Element | null;
      };
      return Boolean(
        doc.fullscreenElement ||
          doc.webkitFullscreenElement ||
          doc.mozFullScreenElement ||
          doc.msFullscreenElement
      );
    };

    /**
     * Schedules a state update with the latest window dimensions on the next animation frame.
     * @internal
     */
    const scheduleMeasure = () => {
      if (rafId != null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        if (ignoreWhileFullscreen && isFullscreen()) return;
        const { width, height } = readSize();
        const nextType = computeDeviceType(width, height, {
          web: aspectWeb,
          medium: aspectMedium,
        });
        setState((prev) =>
          prev.windowWidth !== width ||
          prev.windowHeight !== height ||
          prev.deviceType !== nextType
            ? { deviceType: nextType, windowWidth: width, windowHeight: height }
            : prev
        );
      });
    };

    const onResize: EventListener = () => scheduleMeasure();
    const onOrientation: EventListener = () => scheduleMeasure();
    const onFullscreenChange: EventListener = () => scheduleMeasure();

    /**
     * An IIFE that detects browser support for passive event listeners for performance optimization.
     * @internal
     */
    const passiveOpts: AddEventListenerOptions | boolean = (() => {
      try {
        let supported = false;
        const test = () => {};
        const probe = {
          get passive() {
            supported = true;
            return false;
          },
        } as unknown as AddEventListenerOptions;
        window.addEventListener('passive-test', test, probe);
        window.removeEventListener('passive-test', test, probe);
        return supported ? { passive: true } : false;
      } catch {
        return false;
      }
    })();

    window.addEventListener('resize', onResize, passiveOpts);
    window.addEventListener('orientationchange', onOrientation, passiveOpts);

    const docTarget = document as unknown as GenericEventTarget;
    const fullscreenEvents: FullscreenEventName[] = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'MSFullscreenChange',
    ];
    fullscreenEvents.forEach((evt) => {
      docTarget.addEventListener(evt, onFullscreenChange, passiveOpts);
    });

    const vv = useVisualViewport ? window.visualViewport : null;
    vv?.addEventListener('resize', onResize, passiveOpts);
    vv?.addEventListener('scroll', onResize, passiveOpts);

    scheduleMeasure();

    return () => {
      if (rafId != null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onOrientation);
      fullscreenEvents.forEach((evt) => {
        docTarget.removeEventListener(evt, onFullscreenChange);
      });
      vv?.removeEventListener('resize', onResize);
      vv?.removeEventListener('scroll', onResize);
    };
  }, [
    isBrowser,
    useVisualViewport,
    ignoreWhileFullscreen,
    aspectWeb,
    aspectMedium,
  ]);

  return state;
};

export default useWindowSize;
