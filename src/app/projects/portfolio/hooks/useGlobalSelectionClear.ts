import { useEffect } from 'react';

let selectionCleanerInstalled = false;

/**
 * Installs a single global pointerdown listener to clear any existing
 * text selection on the next user interaction (click/tap).
 */
export function useGlobalSelectionClear(): void {
  useEffect(() => {
    if (typeof window === 'undefined' || selectionCleanerInstalled) return;
    const handler = () => {
      const sel = window.getSelection?.();
      if (sel && !sel.isCollapsed) sel.removeAllRanges();
    };
    window.addEventListener('pointerdown', handler, {
      passive: true,
      capture: true,
    });
    selectionCleanerInstalled = true;
  }, []);
}
