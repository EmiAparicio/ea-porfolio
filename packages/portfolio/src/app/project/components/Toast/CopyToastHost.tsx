'use client';

import { toastStateAtom } from '@project/lib/toastStore';
import { useAtom } from '@project/lib/jotai';
import Toast from './Toast';
import ToastViewport from './ToastViewport';

type CopyToastHostProps = {
  /** Optional variant for the copy toast look. */
  variant?: 'default' | 'success' | 'error' | 'warning';
  /** Extra className for the toast root. */
  className?: string;
};

/**
 * Always-mounted host that renders the styled Toast for copy events.
 */
export default function CopyToastHost({ className }: CopyToastHostProps) {
  const [state, setState] = useAtom(toastStateAtom);

  return (
    <>
      <ToastViewport top={state.top} left={state.left} zIndex={1000} />
      <Toast
        itemKey={state.id}
        open={state.open}
        onOpenChangeAction={(next) => setState((s) => ({ ...s, open: next }))}
        duration={state.duration}
        title={state.message}
        direction="right"
        className={className}
      />
    </>
  );
}
