import { atom } from '@portfolio/lib/jotai';
import { PixelPos } from '@portfolio/types/buttons-panel';
import { Axial } from '@portfolio/types/hexgrid';

export const hexRadiusAtom = atom(0);

export const hexGridDAtom = atom<string | null>(null);

export type QrToCenter = (qr: Axial) => PixelPos;

export const qrToCenterAtom = atom<QrToCenter | null>(null);

export const isHexGridReadyAtom = atom((get) => {
  const f = get(qrToCenterAtom);
  const R = get(hexRadiusAtom);
  return !!f && R > 0;
});