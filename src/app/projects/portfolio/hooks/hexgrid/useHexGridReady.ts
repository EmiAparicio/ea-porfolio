'use client';

import { useAtomValue } from '@portfolio/lib/jotai';
import { isHexGridReadyAtom } from '@portfolio/atoms/hexGridAtoms';

export function useHexGridReady() {
  return useAtomValue(isHexGridReadyAtom);
}
