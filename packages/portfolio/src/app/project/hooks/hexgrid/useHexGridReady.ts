'use client';

import { useAtomValue } from '@project/lib/jotai';
import { isHexGridReadyAtom } from '@project/atoms/hexGridAtoms';

export function useHexGridReady() {
  return useAtomValue(isHexGridReadyAtom);
}
