'use client';

import {
  globalModalContentAtom,
  globalModalOpenAtom,
  ModalContent,
} from '@portfolio/atoms/modalAtoms';
import { useSetAtom } from '@portfolio/lib/jotai';
import { useCallback } from 'react';

/**
 * Hook to control the global modal overlay content and visibility.
 * @returns Methods to show/hide/replace modal content.
 */
export function useGlobalModal() {
  const setOpen = useSetAtom(globalModalOpenAtom);
  const setContent = useSetAtom(globalModalContentAtom);

  const show = useCallback(
    (content: ModalContent) => {
      setContent(content);
      setOpen(true);
    },
    [setContent, setOpen]
  );

  const hide = useCallback(() => {
    setOpen(false);
    setContent(null);
  }, [setOpen, setContent]);

  const replace = useCallback(
    (content: ModalContent) => {
      setContent(content);
    },
    [setContent]
  );

  return { show, hide, replace };
}
