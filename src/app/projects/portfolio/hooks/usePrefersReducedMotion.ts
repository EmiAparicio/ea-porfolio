'use client';

import { useEffect, useState } from 'react';

/**
 * A custom hook to detect if the user has a preference for reduced motion.
 * It's based on the `(prefers-reduced-motion: reduce)` media query.
 *
 * @returns {boolean} A boolean indicating whether the user prefers reduced motion.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefers, setPrefers] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setPrefers(e.matches);

    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return prefers;
}
