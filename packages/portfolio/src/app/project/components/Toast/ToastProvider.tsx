'use client';

import * as RadixToast from '@radix-ui/react-toast';
import { ReactNode } from 'react';

type ToastProviderProps = {
  /** Children tree that can include ToastViewport and hosts. */
  children: ReactNode;
  /** Swipe direction for Radix gestures. */
  swipeDirection?: 'up' | 'down' | 'left' | 'right';
};

/**
 * Provides Radix Toast context for the app, without rendering a Viewport.
 */
export default function ToastProvider({
  children,
  swipeDirection = 'right',
}: ToastProviderProps) {
  return (
    <RadixToast.Provider swipeDirection={swipeDirection} duration={2000}>
      {children}
    </RadixToast.Provider>
  );
}
