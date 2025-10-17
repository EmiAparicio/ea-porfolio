import {
  PositionKeyType,
  useGlobalPositions,
} from '@project/hooks/hexgrid/useGlobalPositions';
import { useQrToCenter } from '@project/hooks/hexgrid/useQrToCenter';
import { PixelPos } from '@project/types/buttons-panel';
import React from 'react';

type Axial = { q: number; r: number };
type ChildWithPosition = { position?: PixelPos };
type InferChildProps<T> = T extends React.ReactElement<infer P> ? P : never;

export type GlobalPositionType = { globalPosition: PositionKeyType | Axial };
export type GlobalOptPositionType = {
  globalPosition?: PositionKeyType | Axial;
};
export type UseGlobal = { useGlobal?: boolean };

/**
 * Props for the GlobalPosition component.
 * @template C A single React element that accepts a `position` prop of type PixelPos.
 */
export type GlobalPositionProps<
  C extends React.ReactElement<ChildWithPosition>,
> = Omit<InferChildProps<C>, 'position'> &
  GlobalPositionType & {
    /** The single child element to clone and inject the `position` prop into. */
    children: C;
  };

/**
 * Type guard to check if a value is an Axial coordinate object ({q: number, r: number}).
 * @param {PositionKeyType | Axial} v - The value to check.
 * @returns {v is Axial} True if the value is an Axial coordinate.
 */
function isAxial(v: PositionKeyType | Axial): v is Axial {
  return (
    typeof (v as Axial).q === 'number' && typeof (v as Axial).r === 'number'
  );
}

const FALLBACK_KEY = 'outside' as PositionKeyType;

/**
 * Component that resolves a symbolic global position key or an explicit Axial coordinate
 * into pixel coordinates, and injects them as a `position` prop into its single child element.
 *
 * @template C The type of the child component, which must accept a `position` prop.
 * @param {GlobalPositionProps<C>} props - The component props.
 * @param {PositionKeyType | Axial} props.globalPosition - The position key (string) or the explicit Axial coordinate ({q, r}).
 * @param {C} props.children - The single child element to clone and inject the `position` prop into.
 * @returns {React.ReactElement} A clone of the child element with the resolved pixel position.
 */
export default function GlobalPosition<
  C extends React.ReactElement<ChildWithPosition>,
>(props: GlobalPositionProps<C>) {
  const { globalPosition, children, ...rest } = props;

  const keyArg: PositionKeyType =
    typeof globalPosition === 'string'
      ? (globalPosition as PositionKeyType)
      : FALLBACK_KEY;

  const axialFromKey = useGlobalPositions(keyArg);
  const axial = isAxial(globalPosition) ? globalPosition : axialFromKey;
  const pixelPos = useQrToCenter(axial);

  const merged = {
    ...children.props,
    ...(rest as unknown as Omit<InferChildProps<C>, 'position'>),
    position: pixelPos,
  } as InferChildProps<C>;

  return React.cloneElement(children, merged);
}
