import type { ComponentType } from 'react';
import type { HexButtonProps } from '@portfolio/components/HexButton/HexButton';
import { Axial } from '@portfolio/types/hexgrid';

export type Dir = 1 | 2 | 3 | 4 | 5 | 6;

export type HexScheme = 'flat' | 'pointy';

export type BranchKind = 'two' | 'three';

export interface PixelPos {
  left: number;
  top: number;
}

export type QrToCenter = (qr: Axial) => PixelPos;

export interface ButtonNode<P extends HexButtonProps = HexButtonProps> {
  kind?: 'button';
  id: string;
  as: ComponentType<P>;
  props?: Partial<P>;
  url?: string;
  children?: Array<{ position: Dir; node: PositionedNode<P> }>;
}

export interface BranchNode<P extends HexButtonProps = HexButtonProps> {
  kind: 'branch';
  branch: BranchKind;
  url?: string;
  children: PositionedNode<P>[];
}

export type PositionedNode<P extends HexButtonProps = HexButtonProps> =
  | ButtonNode<P>
  | BranchNode<P>;

export type PanelRoot<P extends HexButtonProps = HexButtonProps> =
  ButtonNode<P> & {
    routeMap?: Record<string, string>;
  } & { storageKey?: string };
export interface Placed<P extends HexButtonProps = HexButtonProps> {
  id: string;
  node: ButtonNode<P>;
  qr: Axial;
  px: PixelPos;
  toggled: boolean;
  visible: boolean;
  parentId?: string;
  fromDir?: Dir;
}

export interface PlacedBranch {
  qr: Axial;
  px: PixelPos;
  visible: boolean;
  dir: Dir;
  kind: BranchKind;
}

export interface PlaceTree<P extends HexButtonProps = HexButtonProps> {
  nodes: Placed<P>[];
  edges: Array<{ from: Placed<P>; to: Placed<P>; dir: Dir }>;
  branches: PlacedBranch[];
  childMap: Record<string, string[]>;
}
