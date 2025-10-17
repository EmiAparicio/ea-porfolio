'use client';

import { useActiveKeyStorageGuard } from '@project/hooks/useActiveKeyStorageGuard';
import { useHexPanelIntentGuard } from '@project/hooks/useHexPanelIntentGuard';

export const SessionStorageGuards = () => {
  useActiveKeyStorageGuard();
  useHexPanelIntentGuard();

  return null;
};
