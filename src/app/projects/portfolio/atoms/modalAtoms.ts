'use client';

import { atom } from '@portfolio/lib/jotai';
import type { ReactNode } from 'react';

export type ModalContent = { child: ReactNode; info?: string };

export const globalModalOpenAtom = atom<boolean>(false);
export const globalModalContentAtom = atom<ModalContent | null>(null);
