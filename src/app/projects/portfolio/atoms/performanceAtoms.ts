import type { PerformanceTier } from '@portfolio/providers/PerformanceProvider';
import { atomWithStorage } from 'jotai/utils';

export type PersistedPerformanceState = {
  tier: PerformanceTier;
  timestamp: number;
};

const STORAGE_KEY = 'performance-tier';

const initialValue: PersistedPerformanceState = {
  tier: 'off',
  timestamp: 0,
};

export const performanceStateAtom = atomWithStorage<PersistedPerformanceState>(
  STORAGE_KEY,
  initialValue
);
