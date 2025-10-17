import { atom } from '@project/lib/jotai';
import { PixelPos } from '@project/types/buttons-panel';
import { Axial } from '@project/types/hexgrid';
import { near } from '@project/utils/math';
import { RefObject } from 'react';

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

export const clearRevealsAtom = atom(null, (_get, set) => {
  set(revealsAtom, {});
});

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

export const replaceGroupRevealsAtom = atom(
  null,
  (get, set, params: { groupId: string; items: Reveal[] }) => {
    const curr = get(revealsAtom);
    const next: Record<string, Reveal> = {};
    for (const [id, r] of Object.entries(curr)) {
      if (r.groupId !== params.groupId) next[id] = r;
    }
    for (const r of params.items) {
      next[r.id] = { ...r, groupId: params.groupId };
    }
    set(revealsAtom, next);
  }
);

export const removeGroupRevealsAtom = atom(
  null,
  (get, set, groupId: string) => {
    const curr = get(revealsAtom);
    const next: Record<string, Reveal> = {};
    for (const [id, r] of Object.entries(curr)) {
      if (r.groupId !== groupId) next[id] = r;
    }
    set(revealsAtom, next);
  }
);

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

export const setHexRadiusAndClearAtom = atom(null, (get, set, R: number) => {
  if (get(hexRadiusAtom) !== R) {
    set(hexRadiusAtom, R);
    set(revealsAtom, {});
  }
});

export const setQrToCenterAndClearAtom = atom(
  null,
  (get, set, f: QrToCenter | null) => {
    if (get(qrToCenterAtom) !== f) {
      set(qrToCenterAtom, f);
      set(revealsAtom, {});
    }
  }
);

export type HexTarget = HTMLElement | RefObject<HTMLElement | null> | null;
export type HexTargetType = 'perimeter' | 'spotlight';

export type HexTargetEntry = {
  id: string;
  type: HexTargetType;
  target: HexTarget;
};

export const hexTargetsRegistryAtom = atom<Record<string, HexTargetEntry>>({});

export const upsertHexTargetAtom = atom(
  null,
  (get, set, entry: HexTargetEntry) => {
    const curr = get(hexTargetsRegistryAtom);
    const next = { ...curr, [entry.id]: entry };
    for (const [id, e] of Object.entries(next)) {
      const raw = e.target;
      const el: HTMLElement | null =
        raw && typeof raw === 'object' && 'current' in raw ? raw.current : raw;
      if (!el || !el.isConnected) {
        delete next[id];
      }
    }
    set(hexTargetsRegistryAtom, next);
  }
);

export const removeHexTargetAtom = atom(null, (get, set, id: string) => {
  const curr = get(hexTargetsRegistryAtom);
  if (!curr[id]) return;
  const next = { ...curr };
  delete next[id];
  set(hexTargetsRegistryAtom, next);
});

export const hexTargetsByTypeAtom = (type: HexTargetType) =>
  atom((get) => {
    const entries = Object.values(get(hexTargetsRegistryAtom)).filter(
      (e) => e.type === type
    );
    const seen = new Set<HTMLElement>();
    const out: HexTarget[] = [];
    for (const e of entries) {
      const raw = e.target;
      const el: HTMLElement | null =
        raw && typeof raw === 'object' && 'current' in raw ? raw.current : raw;
      if (el && el.isConnected && !seen.has(el)) {
        seen.add(el);
        out.push(e.target);
      }
    }
    return out;
  });

export const hexTargetByIdAtom = (id: string) =>
  atom((get) => get(hexTargetsRegistryAtom)[id]?.target ?? null);
