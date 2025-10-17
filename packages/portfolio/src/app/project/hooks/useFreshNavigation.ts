'use client';

import { useEffect } from 'react';

/**
 * Determines if the current page load is a "fresh" navigation.
 * A fresh navigation is one that is not a reload, an internal navigation, or a history traversal.
 *
 * @returns {boolean} True if it's a fresh navigation, otherwise false.
 */
function isFreshNavigation(): boolean {
  try {
    const nav = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (nav && nav.type === 'reload') {
      return false;
    }

    if (performance.navigation && performance.navigation.type === 1) {
      return false;
    }

    const ref = document.referrer;
    if (ref && new URL(ref).origin === location.origin) {
      return false;
    }
  } catch {
    return false;
  }
  return true;
}

/**
 * A custom hook that executes a callback function only on a "fresh" navigation event.
 * A "fresh" navigation is when a user enters the site directly from a bookmark or an external link,
 * and not on internal navigation or page reloads. It also handles cases where a page is restored
 * from the browser's back-forward cache (bfcache).
 *
 * @param {() => void} callback The function to execute on a fresh navigation.
 */
export function useOnFreshNavigation(callback: () => void) {
  useEffect(() => {
    if (isFreshNavigation()) {
      callback();
    }
  }, [callback]);

  useEffect(() => {
    const onPageHide = (e: PageTransitionEvent) => {
      if (e.persisted) {
        callback();
      }
    };
    window.addEventListener('pagehide', onPageHide);
    return () => window.removeEventListener('pagehide', onPageHide);
  }, [callback]);
}
