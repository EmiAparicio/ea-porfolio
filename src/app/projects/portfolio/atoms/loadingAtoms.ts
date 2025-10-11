'use client';

import { atom } from '@portfolio/lib/jotai';
import type { LocaleBase } from '@i18n/utils/constants';

export const globalLoadingAtom = atom(false);

export const switchStartAtAtom = atom<number | null>(null);

export const targetLangAtom = atom<LocaleBase | null>(null);
