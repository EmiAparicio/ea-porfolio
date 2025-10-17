import { atom } from '@project/lib/jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';

const sessionJsonStorage = createJSONStorage<string | null>(
  () => sessionStorage
);

const storage = {
  ...sessionJsonStorage,
  setItem: (key: string, value: string | null) => {
    if (value === null) sessionJsonStorage.removeItem(key);
    else sessionJsonStorage.setItem(key, value);
  },
};

export const activeKeyAtom = atomWithStorage<string | null>(
  'hexToggle:activeKey',
  null,
  storage
);

export const carouselActiveIdxAtom = atom<number>(0);
