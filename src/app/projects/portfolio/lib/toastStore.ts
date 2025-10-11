'use client';

import { atom, useSetAtom } from '@portfolio/lib/jotai';
import { toPx } from '@portfolio/utils/math';

export type ToastPayload = {
  /** Message shown inside the toast. */
  message: string;
  /** Distance from the top edge in px. */
  top?: number | string;
  /** Distance from the left edge in px. */
  left?: number | string;
  /** Auto-dismiss delay in milliseconds. */
  duration?: number;
};

type ToastState = {
  id: number;
  open: boolean;
  message: string;
  top: number;
  left: number;
  duration: number;
};

/**
 * Holds the current CopyToast state for the host to render.
 */
export const toastStateAtom = atom<ToastState>({
  id: 0,
  open: false,
  message: '',
  top: 16,
  left: 16,
  duration: 2000,
});

/**
 * Triggers a new Toast. Closes current and reopens next tick to reset timers.
 */
export const showToastAtom = atom(null, (get, set, payload: ToastPayload) => {
  const prev = get(toastStateAtom);
  const top = toPx(payload.top, prev.top ?? 16);
  const left = toPx(payload.left, prev.left ?? 16);
  const durRaw = payload.duration ?? prev.duration ?? 2000;
  const duration = Math.max(800, Math.floor(durRaw));
  set(toastStateAtom, (s) => ({ ...s, open: false }));
  setTimeout(() => {
    set(toastStateAtom, {
      id: Date.now(),
      open: true,
      message: payload.message,
      top,
      left,
      duration,
    });
  }, 0);
});

/**
 * A convenience hook to get the function that triggers a new toast.
 * @returns A function of the form `(payload: ToastPayload) => void` to show a toast.
 */
export const useToast = () => {
  const trigger = useSetAtom(showToastAtom);
  return trigger;
};
