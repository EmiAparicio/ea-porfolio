import type { FeatureKey } from '@project/providers/PerformanceProvider';
import { atomWithStorage } from 'jotai/utils';

export type PersistedPerformanceState = {
  enabledFeatures: FeatureKey[];
  timestamp: number;
};

const STORAGE_KEY = 'performance-features';

const initialValue: PersistedPerformanceState = {
  enabledFeatures: [],
  timestamp: 0,
};

export const performanceStateAtom = atomWithStorage<PersistedPerformanceState>(
  STORAGE_KEY,
  initialValue
);
