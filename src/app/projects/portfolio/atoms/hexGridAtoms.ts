import { atom } from '@portfolio/lib/jotai';
import { PixelPos } from '@portfolio/types/buttons-panel';
import { Axial } from '@portfolio/types/hexgrid';
import { near } from '@portfolio/utils/math';

export const hexRadiusAtom = atom(0);

export const hexGridDAtom = atom<string | null>(null);

export type QrToCenter = (qr: Axial) => PixelPos;

export const qrToCenterAtom = atom<QrToCenter | null>(null);

export const isHexGridReadyAtom = atom((get) => {
  const f = get(qrToCenterAtom);
  const R = get(hexRadiusAtom);
  return !!f && R > 0;
});

export type Reveal = {
  id: string;
  cx: number;
  cy: number;
  hard: number;
  feather: number;
  stroke: number;
  color: string;
  active: boolean;
  groupId?: string;
};
export type OverlayMetrics = {
  left: number;
  top: number;
  width: number;
  height: number;
  viewWidth: number;
  viewHeight: number;
};
export const revealsAtom = atom<Record<string, Reveal>>({});
export const activeRevealsAtom = atom((get) =>
  Object.values(get(revealsAtom)).filter((r) => r.active)
);
export const upsertRevealAtom = atom(null, (get, set, next: Reveal) => {
  const curr = get(revealsAtom);
  if (!next?.id) return;
  set(revealsAtom, { ...curr, [next.id]: next });
});
export const removeRevealAtom = atom(null, (get, set, id: string) => {
  const curr = get(revealsAtom);
  if (!curr[id]) return;
  const clone = { ...curr };
  delete clone[id];
  set(revealsAtom, clone);
});
export const overlayMetricsAtom = atom<OverlayMetrics | null>(null);

export const setOverlayMetricsAtom = atom(
  null,
  (get, set, m: OverlayMetrics | null) => {
    const prev = get(overlayMetricsAtom);
    if (!m) {
      set(overlayMetricsAtom, m);
      set(revealsAtom, {});
      return;
    }
    if (!prev) {
      set(overlayMetricsAtom, m);
      set(revealsAtom, {});
      return;
    }
    const dimsChanged =
      !near(prev.left, m.left) ||
      !near(prev.top, m.top) ||
      !near(prev.width, m.width) ||
      !near(prev.height, m.height) ||
      !near(prev.viewWidth, m.viewWidth) ||
      !near(prev.viewHeight, m.viewHeight);
    if (dimsChanged) {
      set(revealsAtom, {});
    }
    set(overlayMetricsAtom, m);
  }
);