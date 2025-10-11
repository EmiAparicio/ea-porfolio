'use client';

import {
  removeHexTargetAtom,
  upsertHexTargetAtom,
} from '@portfolio/atoms/hexGridAtoms';
import { useSetAtom } from '@portfolio/lib/jotai';
import React, {
  RefObject,
  useCallback,
  useId,
  useRef,
  type CSSProperties,
} from 'react';

/**
 * Base props for a component that has a hexagonal background effect.
 */
export type BackgroundedElementBaseProps = {
  /**
   * The type of background effect to apply: 'perimeter' or 'spotlight'.
   * Defaults to 'spotlight'.
   */
  type?: 'perimeter' | 'spotlight';
  /**
   * Additional CSS classes.
   */
  className?: string;
  /**
   * Inline styles.
   */
  style?: CSSProperties;
  /**
   * The child elements to be rendered inside the component.
   */
  children?: React.ReactNode;
};

/**
 * A polymorphic component that allows specifying the underlying HTML element.
 *
 * @template T - The HTML element type.
 * @template P - The component props.
 */
export type PolymorphicProps<T extends React.ElementType, P> = P & {
  /**
   * The HTML element to render as. Defaults to 'article'.
   */
  as?: T;
} & Omit<React.ComponentPropsWithoutRef<T>, keyof P | 'as' | 'ref'>;

/**
 * A polymorphic component that renders an element with an interactive hexagonal background effect.
 * This component uses a ref to track the rendered DOM node and updates a Jotai atom to inform
 * the background grid system about the element's position and type.
 *
 * @template T - The HTML element to render as.
 * @param props - The component props.
 * @returns A JSX element with the hexagonal background effect.
 */
function BackgroundedElement<T extends React.ElementType = 'article'>({
  as,
  type = 'spotlight',
  className,
  style,
  children,
  ...rest
}: PolymorphicProps<T, BackgroundedElementBaseProps>) {
  const reactId = useId();
  const targetId = `hxtgt-${reactId}`;

  const upsertTarget = useSetAtom(upsertHexTargetAtom);
  const removeTarget = useSetAtom(removeHexTargetAtom);

  const publishedRef = useRef<HTMLElement | null>(null);
  const lastNodeRef = useRef<HTMLElement | null>(null);

  const attach = useCallback(
    (node: HTMLElement | null) => {
      publishedRef.current = node;

      if (lastNodeRef.current === node) return;
      lastNodeRef.current = node;

      if (node) {
        upsertTarget({
          id: targetId,
          type,
          target: publishedRef as unknown as RefObject<HTMLElement | null>,
        });
      } else {
        removeTarget(targetId);
      }
    },
    [targetId, type, upsertTarget, removeTarget]
  );

  const Comp = (as || 'article') as React.ElementType;

  return (
    <Comp
      ref={attach}
      data-hx-target-id={targetId}
      className={className}
      style={style}
      {...rest}
    >
      {children}
    </Comp>
  );
}

export default BackgroundedElement as <T extends React.ElementType = 'article'>(
  props: PolymorphicProps<T, BackgroundedElementBaseProps>
) => React.ReactElement | null;
