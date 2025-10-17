import { useEffect, useMemo, useState } from 'react';

export type UseDprOptions = {
  max?: number;
  min?: number;
};

/**
 * React hook that returns the current devicePixelRatio, clamped between min and max.
 * It updates on window resize and on resolution media-query changes.
 * @param options Range clamping options. Defaults to { min: 1, max: 2 }.
 * @returns Current clamped devicePixelRatio.
 */
export function useDevicePixelRatio(options: UseDprOptions = {}): number {
  const { max = 2, min = 1 } = options;
  const initial = useMemo(() => {
    if (typeof window === 'undefined') return 1;
    const raw = window.devicePixelRatio || 1;
    return Math.min(max, Math.max(min, raw));
  }, [max, min]);

  const [dpr, setDpr] = useState<number>(initial);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const update = () => {
      const raw = window.devicePixelRatio || 1;
      const next = Math.min(max, Math.max(min, raw));
      setDpr((prev) => (prev === next ? prev : next));
    };

    const queries = [1, 1.25, 1.5, 2, 3, 4].map((v) =>
      window.matchMedia(`(resolution: ${v}dppx)`)
    );
    queries.forEach((mq) => mq.addEventListener?.('change', update));
    window.addEventListener('resize', update, { passive: true });

    update();
    return () => {
      queries.forEach((mq) => mq.removeEventListener?.('change', update));
      window.removeEventListener('resize', update);
    };
  }, [max, min]);

  return dpr;
}
