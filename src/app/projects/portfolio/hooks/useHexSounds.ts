'use client';

import { audioManager } from '@portfolio/utils/audio';
import { useCallback, useEffect, useRef } from 'react';

export type SoundKey = 'hover' | 'on' | 'off' | 'click';
export type MuteMode = 'all' | 'hover' | 'action' | undefined;

let isActivationWired = false;
/**
 * Wires a global event listener to unlock the Web Audio API on the first user interaction.
 * This is necessary to comply with browser autoplay policies.
 */
function wireGlobalActivationListener() {
  if (typeof window === 'undefined' || isActivationWired) {
    return;
  }

  const unlock = () => {
    audioManager.unlock();
    window.removeEventListener('pointerdown', unlock, { capture: true });
    window.removeEventListener('keydown', unlock, { capture: true });
  };

  window.addEventListener('pointerdown', unlock, {
    passive: true,
    capture: true,
  });
  window.addEventListener('keydown', unlock, { capture: true });
  isActivationWired = true;
}

/**
 * Checks if a sound key should be muted based on the current mute mode.
 *
 * @param {SoundKey} key The sound key to check.
 * @param {MuteMode} mode The current mute mode.
 * @returns {boolean} True if the sound should be muted, otherwise false.
 */
function isMutedKey(key: SoundKey, mode: MuteMode): boolean {
  if (mode === 'all') {
    return true;
  }
  if (mode === 'hover') {
    return key === 'hover';
  }
  if (mode === 'action') {
    return key !== 'hover';
  }
  return false;
}

/**
 * A custom hook for managing sound playback in hexagonal button interactions.
 * It handles sound keys, muting based on different modes, and manages hover
 * sound suppression to prevent rapid, repetitive playback.
 *
 * @param {object} opts - The options for the hook.
 * @param {boolean} [opts.disabled] - If true, all sounds are disabled.
 * @param {MuteMode} [opts.shouldMute] - The current mute mode.
 * @returns {{play: (key: SoundKey, options?: {tailSec?: number}) => void; maybePlayHover: (hasMouse: boolean) => void; notifyPointerDown: () => void;}} An object with sound control functions.
 */
export function useHexSounds(opts: {
  disabled?: boolean;
  shouldMute?: MuteMode;
}) {
  const isDisabled = !!opts.disabled;
  const muteMode: MuteMode = opts.shouldMute;

  const lastHoverAt = useRef(0);
  const suppressHoverUntil = useRef(0);

  useEffect(() => {
    wireGlobalActivationListener();
  }, []);

  /**
   * Plays a specific sound if not disabled or muted.
   *
   * @param {SoundKey} key The sound key to play.
   * @param {{tailSec?: number}} [options] Optional playback options.
   */
  const play = useCallback(
    (key: SoundKey, options?: { tailSec?: number }) => {
      if (isDisabled || isMutedKey(key, muteMode)) {
        return;
      }
      audioManager.play(key, options);
      if (key === 'hover') {
        lastHoverAt.current = Date.now();
      }
    },
    [isDisabled, muteMode]
  );

  /**
   * Conditionally plays a 'hover' sound, with a debounce to prevent rapid playback.
   *
   * @param {boolean} hasMouse Indicates if the mouse is currently hovering.
   */
  const maybePlayHover = useCallback(
    (hasMouse: boolean) => {
      if (isDisabled || !hasMouse || isMutedKey('hover', muteMode)) {
        return;
      }

      const now = Date.now();
      if (now < suppressHoverUntil.current) {
        return;
      }
      if (now - lastHoverAt.current < 200) {
        return;
      }

      play('hover', { tailSec: 0.2 });
    },
    [isDisabled, muteMode, play]
  );

  /**
   * Notifies the hook that a pointer-down event occurred, suppressing subsequent hover sounds for a short period.
   */
  const notifyPointerDown = useCallback(() => {
    suppressHoverUntil.current = Date.now() + 220;
  }, []);

  return { play, maybePlayHover, notifyPointerDown } as const;
}
