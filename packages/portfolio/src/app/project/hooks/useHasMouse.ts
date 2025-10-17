import { useEffect, useState } from 'react';

/**
 * A custom hook to determine if the user's primary input device is a mouse.
 * It detects the presence of a mouse pointer by checking for 'hover: hover' and 'pointer: fine' media query support.
 *
 * @returns {boolean} A boolean indicating whether a mouse is present.
 */
export function useHasMouse(): boolean {
  const [hasMouse, setHasMouse] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return true;
    }
    const mq = window.matchMedia?.('(hover: hover) and (pointer: fine)');
    if (mq?.matches) {
      return true;
    }
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    return !hasTouch;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) {
      return;
    }
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const handler = (e: MediaQueryListEvent) => setHasMouse(e.matches);
    mq.addEventListener('change', handler);
    return () => {
      mq.removeEventListener('change', handler);
    };
  }, []);

  return hasMouse;
}
