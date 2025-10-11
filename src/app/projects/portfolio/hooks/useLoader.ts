'use client';

import { globalLoadingAtom } from '@portfolio/atoms/loadingAtoms';
import { useSetAtom } from '@portfolio/lib/jotai';
import { useCallback } from 'react';

/**
 * Hook to control the global loading overlay.
 * @returns Methods to show/hide the overlay and track async work with automatic toggling.
 */
export function useLoader() {
  const setLoading = useSetAtom(globalLoadingAtom);

  const show = useCallback(() => {
    setLoading(true);
  }, [setLoading]);

  const hide = useCallback(() => {
    setLoading(false);
  }, [setLoading]);

  /**
   * Tracks a Promise and toggles the loader automatically.
   * @template T
   * @param work Promise to track
   * @returns The resolved value of the promise
   */
  const track = useCallback(
    async <T>(work: Promise<T>): Promise<T> => {
      setLoading(true);
      try {
        return await work;
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  return { show, hide, track };
}
