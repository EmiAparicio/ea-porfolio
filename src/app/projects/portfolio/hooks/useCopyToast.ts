'use client';

import { useToast } from '@portfolio/lib/toastStore';

type Ms = number;

export type CopyHandlerArgs = {
  /** Text that will be copied to clipboard. */
  text: string;
  /** Message shown inside the toast after copy succeeds. */
  message?: string;
  /** Distance from the top edge in px. */
  top?: number;
  /** Distance from the left edge in px. */
  left?: number;
  /** Auto-dismiss delay in milliseconds. */
  duration?: Ms;
};

/**
 * Returns a handler that copies text to clipboard and triggers the CopyToast.
 */
export function useCopyToast() {
  const trigger = useToast();
  const copy = async (args: CopyHandlerArgs) => {
    try {
      await navigator.clipboard.writeText(args.text);
      trigger({
        message: args.message ?? '¡Copiado al portapapeles!',
        top: args.top,
        left: args.left,
        duration: args.duration,
      });
      return true;
    } catch {
      trigger({
        message: 'No se pudo copiar',
        top: args.top,
        left: args.left,
        duration: args.duration ?? 2500,
      });
      return false;
    }
  };
  return copy;
}
