'use client';

import { activeKeyAtom } from '@portfolio/atoms/sectionsAtoms';
import { useOnFreshNavigation } from '@portfolio/hooks/useFreshNavigation';
import { useResetAtom } from 'jotai/utils';
import { useCallback } from 'react';

/**
 * A custom hook that resets the active key atom on a "fresh" navigation.
 * This prevents a stale active state from persisting when a user
 * reloads the page or arrives from an external source.
 */
export function useActiveKeyStorageGuard() {
  const resetActiveKey = useResetAtom(activeKeyAtom);

  const onFreshNavigation = useCallback(() => {
    resetActiveKey();
  }, [resetActiveKey]);

  useOnFreshNavigation(onFreshNavigation);
}
