'use client';

import { HexToggleItem } from '@portfolio/components/HexToggleBar/HexToggleBar';
import { atom } from '@portfolio/lib/jotai';
import type { ReactNode } from 'react';

export type ModalContent = { child: ReactNode; info?: string };

export const globalModalOpenAtom = atom<boolean>(false);
export const globalModalContentAtom = atom<ModalContent | null>(null);

export const globalModalItemsAtom = atom<HexToggleItem[]>([]);
