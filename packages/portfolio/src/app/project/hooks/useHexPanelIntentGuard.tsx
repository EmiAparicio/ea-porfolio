'use client';

import { useOnFreshNavigation } from '@project/hooks/useFreshNavigation';
import { useCallback } from 'react';

/**
 * Clears sessionStorage keys used for hexagonal panel intents.
 * This function helps prevent unwanted state from persisting across fresh navigations.
 *
 * @param {number} [maxKeys=128] The maximum number of sessionStorage keys to check.
 */
function clearHexPanelIntentKeys(maxKeys = 128) {
  try {
    if (typeof window === 'undefined' || !('sessionStorage' in window)) {
      return;
    }
    const keysToDelete: string[] = [];
    const len = Math.min(sessionStorage.length, maxKeys);
    for (
      let i = 0, seen = 0;
      i < sessionStorage.length && seen < len;
      i++, seen++
    ) {
      const key = sessionStorage.key(i)!;
      if (/^hexPanel:.*:intent$/.test(key)) {
        keysToDelete.push(key);
      }
    }
    for (const k of keysToDelete) {
      sessionStorage.removeItem(k);
    }
  } catch {
    /* empty */
  }
}

/**
 * A custom hook that clears hexagonal panel intent keys from sessionStorage
 * on a fresh navigation. This ensures a clean state when a user
 * navigates to a new page from an external source or a hard reload.
 */
export function useHexPanelIntentGuard() {
  const onFreshNavigation = useCallback(() => {
    clearHexPanelIntentKeys();
  }, []);

  useOnFreshNavigation(onFreshNavigation);
}
