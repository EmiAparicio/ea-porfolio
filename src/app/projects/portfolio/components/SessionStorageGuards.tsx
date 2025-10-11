'use client';

import { useActiveKeyStorageGuard } from '@portfolio/hooks/useActiveKeyStorageGuard';
import { useHexPanelIntentGuard } from '@portfolio/hooks/useHexPanelIntentGuard';

export const SessionStorageGuards = () => {
  useActiveKeyStorageGuard();
  useHexPanelIntentGuard();

  return null;
};
