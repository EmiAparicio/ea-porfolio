'use client';

import {
  usePerformanceProfile,
  type PerformanceProfile,
  type PerformanceReasons,
  type UsePerformanceProfileOptions,
} from '@portfolio/hooks/usePerformanceProfile';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type PerformanceTier = 'full' | 'reduced' | 'minimal' | 'off';
export type FeatureTier = 1 | 2 | 3;

export type PerformanceSnapshot = {
  lowPerformance: boolean;
  reasons: PerformanceReasons;
  fps: number | null;
  profile: PerformanceProfile;
  enableAnimations: boolean;
  performanceTier: PerformanceTier;
};

type Ctx = {
  enableAnimations: boolean;
  performanceTier: PerformanceTier;
  isTierEnabled: (tier: FeatureTier) => boolean;
};

const PerformanceContext = createContext<Ctx | undefined>(undefined);

const policy = {
  full: (_tier: FeatureTier) => true,
  reduced: (tier: FeatureTier) => tier >= 2,
  minimal: (tier: FeatureTier) => tier >= 3,
  off: (_tier: FeatureTier) => false,
};

const profileOptions: UsePerformanceProfileOptions = {
  minFps: 30,
  graceMs: 2500,
  minFpsSamples: 5,
  reprobeMs: 2000,
  hysteresisFps: 5,
};
const fpsThresholds = { full: 45, reduced: 30, minimal: 24 };

const DOWNGRADE_DELAY_MS = 3000;
const UPGRADE_DELAY_MS = 10000;
const tierOrder: Record<PerformanceTier, number> = {
  off: 0,
  minimal: 1,
  reduced: 2,
  full: 3,
};

/**
 * Provides a performance context to its children.
 * This provider measures the application's FPS and determines a performance tier
 * ('full', 'reduced', 'minimal', 'off'). Components can then use the `usePerformance`
 * hook to conditionally render performance-intensive features.
 * @param props The component props.
 * @param props.children The child components to be wrapped by the provider.
 */
export function PerformanceProvider({ children }: { children: ReactNode }) {
  const perf = usePerformanceProfile(profileOptions);
  const [performanceTier, setPerformanceTier] =
    useState<PerformanceTier>('full');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (perf.fps === null) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const f = perf.fps;
    let targetTier: PerformanceTier;
    if (f >= fpsThresholds.full) targetTier = 'full';
    else if (f >= fpsThresholds.reduced) targetTier = 'reduced';
    else if (f >= fpsThresholds.minimal) targetTier = 'minimal';
    else targetTier = 'off';

    if (targetTier === performanceTier) return;

    const isUpgrade = tierOrder[targetTier] > tierOrder[performanceTier];
    const delay = isUpgrade ? UPGRADE_DELAY_MS : DOWNGRADE_DELAY_MS;

    timerRef.current = setTimeout(() => {
      setPerformanceTier(targetTier);
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [perf.fps, performanceTier]);

  const value = useMemo<Ctx>(() => {
    const isTierEnabled = (tier: FeatureTier) => {
      return policy[performanceTier](tier);
    };
    return {
      enableAnimations: perf.enableAnimations,
      performanceTier,
      isTierEnabled,
    };
  }, [performanceTier, perf.enableAnimations]);

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
}

/**
 * A hook to access the performance context.
 * It provides information about the current performance tier and whether animations are enabled.
 * @param featureTier An optional tier (1, 2, or 3) representing the performance
 * cost of a feature. Tier 1 is cheapest, Tier 3 is most expensive. If provided,
 * the hook returns a tailored `enableAnimations` flag based on the performance policy.
 * @returns The performance context, including `enableAnimations`, `performanceTier`, and `isTierEnabled`.
 * @throws If used outside of a `PerformanceProvider`.
 */
export function usePerformance(featureTier?: FeatureTier) {
  const ctx = useContext(PerformanceContext);
  if (!ctx)
    throw new Error('usePerformance must be used within a PerformanceProvider');
  if (featureTier == null) return ctx;
  const allowed = ctx.isTierEnabled(featureTier);
  return {
    ...ctx,
    enableAnimations: ctx.enableAnimations && allowed,
  } as const;
}
