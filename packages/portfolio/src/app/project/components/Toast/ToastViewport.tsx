'use client';

import * as RadixToast from '@radix-ui/react-toast';

type ToastViewportProps = {
  /** Distance from the top edge in px. */
  top: number;
  /** Distance from the left edge in px. */
  left: number;
  /** z-index used to ensure visibility above app chrome. */
  zIndex?: number;
  /** When true, allow interactions to pass-through outside the toast. */
  pointerEventsNone?: boolean;
};

/**
 * Fixed-position Radix Toast viewport that can be placed anywhere on screen.
 */
export default function ToastViewport({
  top,
  left,
  zIndex = 1000,
  pointerEventsNone = true,
}: ToastViewportProps) {
  return (
    <RadixToast.Viewport
      style={{
        position: 'fixed',
        top,
        left,
        right: 'auto',
        bottom: 'auto',
        width: 'auto',
        height: 'auto',
        zIndex,
        pointerEvents: pointerEventsNone ? 'none' : undefined,
      }}
    />
  );
}
