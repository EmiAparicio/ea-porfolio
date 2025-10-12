'use client';

import {
  usePerformanceProfile,
  type PerformanceProfile,
  type PerformanceReasons,
  type UsePerformanceProfileOptions,
} from '@portfolio/hooks/usePerformanceProfile';
import { useAtom } from 'jotai';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { performanceStateAtom } from '@portfolio/atoms/performanceAtoms';

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
  minFps: 24,
  graceMs: 2500,
  minFpsSamples: 15,
  hysteresisFps: 5,
};
const fpsThresholds = { full: 45, reduced: 30, minimal: 24 };

const DOWNGRADE_DELAY_MS = 500;
const UPGRADE_DELAY_MS = 8000;
const tierOrder: Record<PerformanceTier, number> = {
  off: 0,
  minimal: 1,
  reduced: 2,
  full: 3,
};
const tierLadder: PerformanceTier[] = ['off', 'minimal', 'reduced', 'full'];

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
  const [performanceState, setPerformanceState] = useAtom(performanceStateAtom);
  const { tier: performanceTier, timestamp } = performanceState;
  const [isInitialized, setIsInitialized] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingTierRef = useRef<PerformanceTier | null>(null);

  useEffect(() => {
    const now = Date.now();
    const ageInMs = now - timestamp;
    const ONE_HOUR_MS = 3600 * 1000;

    if (ageInMs >= ONE_HOUR_MS && performanceTier !== 'off') {
      setPerformanceState({ tier: 'off', timestamp: 0 });
      setIsInitialized(true);
    } else {
      setIsInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isInitialized || perf.fps === null) return;

    const f = perf.fps;
    const idealTier: PerformanceTier =
      f >= fpsThresholds.full
        ? 'full'
        : f >= fpsThresholds.reduced
          ? 'reduced'
          : f >= fpsThresholds.minimal
            ? 'minimal'
            : 'off';

    const isUpgrade = tierOrder[idealTier] > tierOrder[performanceTier];
    let targetTier: PerformanceTier;

    if (isUpgrade) {
      const currentTierIndex = tierLadder.indexOf(performanceTier);
      if (currentTierIndex >= tierLadder.length - 1) {
        targetTier = performanceTier;
      } else {
        const nextTier = tierLadder[currentTierIndex + 1];
        targetTier =
          tierOrder[idealTier] < tierOrder[nextTier]
            ? performanceTier
            : nextTier;
      }
    } else {
      targetTier = idealTier;
    }

    if (pendingTierRef.current === targetTier) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      pendingTierRef.current = null;
    }

    if (targetTier === performanceTier) return;

    const delay = isUpgrade ? UPGRADE_DELAY_MS : DOWNGRADE_DELAY_MS;

    pendingTierRef.current = targetTier;
    timerRef.current = setTimeout(() => {
      setPerformanceState({ tier: targetTier, timestamp: Date.now() });
      pendingTierRef.current = null;
      timerRef.current = null;
    }, delay);
  }, [isInitialized, perf.fps, performanceTier, setPerformanceState]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const value = useMemo<Ctx>(() => {
    const isTierEnabled = (tier: FeatureTier) => {
      return policy[performanceTier](tier);
    };
    return {
      enableAnimations: perf.enableAnimations && performanceTier !== 'off',
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
 * @param featureTier An optional tier (1, 2, or 3) representing the priority
 * of a feature. Tier 3 is highest priority (most essential), Tier 1 is lowest priority (least essential).
 * If provided, the hook returns a tailored `enableAnimations` flag based on the performance policy.
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
