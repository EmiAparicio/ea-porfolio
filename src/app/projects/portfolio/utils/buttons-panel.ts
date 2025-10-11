import type { HexButtonProps } from '@portfolio/components/HexButton/HexButton';
import type {
  Dir,
  HexScheme,
  PositionedNode,
} from '@portfolio/types/buttons-panel';
import { Axial } from '@portfolio/types/hexgrid';

const DIRS_FLAT: ReadonlyArray<Axial> = Object.freeze([
  { q: 1, r: -1 },
  { q: 1, r: 0 },
  { q: 0, r: 1 },
  { q: -1, r: 1 },
  { q: -1, r: 0 },
  { q: 0, r: -1 },
]);

const DIRS_POINTY: ReadonlyArray<Axial> = Object.freeze([
  { q: 0, r: -1 },
  { q: 1, r: -1 },
  { q: 1, r: 0 },
  { q: 0, r: 1 },
  { q: -1, r: 1 },
  { q: -1, r: 0 },
]);

/**
 * Wraps a number to a valid `Dir` type, which is an integer from 1 to 6.
 * @param n The integer to wrap.
 * @returns A valid direction `Dir` (1-6).
 */
export function wrapDir(n: number): Dir {
  const m = (((n - 1) % 6) + 6) % 6;
  return (m + 1) as Dir;
}

/**
 * A type guard that checks if a given node is a valid `PositionedNode` of the 'button' kind.
 * @param n The node to check.
 * @returns `true` if the node is a button node, `false` otherwise.
 */
export function isButtonNode<P extends HexButtonProps>(
  n: unknown
): n is PositionedNode<P> & {
  kind?: 'button';
  id: string;
  as: NonNullable<unknown>;
} {
  if (!n || typeof n !== 'object') return false;
  const x = n as Partial<{ kind?: string; id?: unknown; as?: unknown }>;
  return (
    (x.kind === undefined || x.kind === 'button') &&
    typeof x.id === 'string' &&
    !!x.as
  );
}

/**
 * A type guard that checks if a given node is a valid `PositionedNode` of the 'branch' kind.
 * @param n The node to check.
 * @returns `true` if the node is a branch node, `false` otherwise.
 */
export function isBranchNode<P extends HexButtonProps>(
  n: unknown
): n is PositionedNode<P> & { kind: 'branch'; branch: 'two' | 'three' } {
  if (!n || typeof n !== 'object') return false;
  const x = n as Partial<{ kind?: unknown; branch?: unknown }>;
  return x.kind === 'branch' && (x.branch === 'two' || x.branch === 'three');
}

/**
 * Calculates the axial coordinate offset for a given direction and number of steps.
 * @param scheme The hex grid orientation ('flat' or 'pointy').
 * @param position The direction (1-6) from the center.
 * @param steps The distance in number of hexes. Defaults to 2.
 * @returns An `Axial` coordinate object representing the offset.
 */
export function dirOffset(scheme: HexScheme, position: Dir, steps = 2): Axial {
  const base = scheme === 'flat' ? DIRS_FLAT : DIRS_POINTY;
  const v = base[position - 1];
  return { q: v.q * steps, r: v.r * steps };
}

/**
 * Determines the appropriate CSS rotation in degrees for an element at a given position.
 * @param scheme The hex grid orientation ('flat' or 'pointy').
 * @param position The direction (1-6) of the element.
 * @returns The rotation angle in degrees, normalized to [0, 360).
 */
export function rotationFor(scheme: HexScheme, position: Dir): number {
  if (scheme === 'flat') return 30 + 60 * (position - 1);
  const m = [-90, -30, 30, 90, 150, -150] as const;
  const deg = m[position - 1];
  return ((deg % 360) + 360) % 360;
}
