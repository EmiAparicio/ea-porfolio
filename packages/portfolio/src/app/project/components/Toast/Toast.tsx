'use client';

import { hexRadiusAtom } from '@project/atoms/hexGridAtoms';
import useWindowSize from '@project/hooks/useWindowSize';
import { useAtomValue } from '@project/lib/jotai';
import * as RadixToast from '@radix-ui/react-toast';
import cn from 'classnames';
import { ReactNode, useMemo } from 'react';
import './toast.css';

type ToastProps = {
  /** Controls visibility of the toast. */
  open: boolean;
  /** Change handler for the controlled open state. */
  onOpenChangeAction: (open: boolean) => void;
  /** Auto-dismiss delay in ms. */
  duration?: number;
  /** Optional title displayed in bold. */
  title?: ReactNode;
  /** Optional description displayed below the title. */
  description?: ReactNode;
  /** Extra class names for the root. */
  className?: string;
  /** Unique key to force remount and restart the timer. */
  itemKey?: string | number;
  /** Direction used for entry/exit animations; align with Provider swipeDirection. */
  direction?: 'up' | 'down' | 'left' | 'right';
};

/**
 * Single-variant glass toast with minimum size driven by hex radius.
 */
export default function Toast({
  open,
  onOpenChangeAction: onOpenChange,
  duration,
  title,
  description,
  className,
  itemKey,
  direction = 'right',
}: ToastProps) {
  const R = useAtomValue(hexRadiusAtom);
  const { deviceType } = useWindowSize();
  const minSize = useMemo(() => {
    const r = Math.max(1, Number.isFinite(R) ? R : 16);
    return { minWidth: `${4 * r}px`, minHeight: `${2.5 * r}px` };
  }, [R]);

  return (
    <RadixToast.Root
      key={itemKey}
      open={open}
      onOpenChange={onOpenChange}
      duration={duration}
      data-direction={direction}
      style={minSize}
      className={cn(
        'app-toast app-toast--glass -translate-1/2 border-2 tracking-wide',
        className
      )}
    >
      {title ? (
        <RadixToast.Title
          className="app-toast__title"
          style={{
            fontSize: {
              web: `${R * 0.4}px`,
              medium: `${R * 0.4}px`,
              mobile: `${R * 0.3}px`,
            }[deviceType],
          }}
        >
          {title}
        </RadixToast.Title>
      ) : null}
      {description ? (
        <RadixToast.Description className="app-toast__desc">
          {description}
        </RadixToast.Description>
      ) : null}
    </RadixToast.Root>
  );
}
