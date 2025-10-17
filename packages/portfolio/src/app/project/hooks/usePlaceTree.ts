import type { HexButtonProps } from '@project/components/HexButton/HexButton';
import type {
  Dir,
  HexScheme,
  PlaceTree,
  Placed,
  PlacedBranch,
  PositionedNode,
  QrToCenter,
} from '@project/types/buttons-panel';
import { Axial } from '@project/types/hexgrid';
import {
  dirOffset,
  isBranchNode,
  isButtonNode,
  wrapDir,
} from '@project/utils/buttons-panel';
import { useMemo } from 'react';

interface UsePlaceTreeParams<P extends HexButtonProps> {
  scheme: HexScheme;
  root: PositionedNode<P>;
  origin: Axial;
  toggles: Record<string, boolean>;
  qrToCenter: QrToCenter | null;
}

/**
 * A custom hook to calculate the layout of a tree of hexagonal buttons and branches.
 * It traverses the tree and determines the position of each node (button or branch)
 * and the edges connecting them, based on the specified scheme and toggle states.
 *
 * @template P - The type of props for the HexButton.
 * @param {object} params - The parameters for the hook.
 * @param {HexScheme} params.scheme - The hexagonal grid scheme to use.
 * @param {PositionedNode<P>} params.root - The root node of the tree.
 * @param {Axial} params.origin - The axial coordinates of the root node.
 * @param {Record<string, boolean>} params.toggles - A record of toggle states for the buttons.
 * @param {QrToCenter | null} params.qrToCenter - A function to convert axial coordinates to center pixel coordinates.
 * @returns {PlaceTree<P>} An object containing the placed nodes, edges, branches, and a child map.
 */
export function usePlaceTree<P extends HexButtonProps>({
  scheme,
  root,
  origin,
  toggles,
  qrToCenter,
}: UsePlaceTreeParams<P>): PlaceTree<P> {
  return useMemo<PlaceTree<P>>(() => {
    if (!qrToCenter) {
      return { nodes: [], edges: [], branches: [], childMap: {} };
    }

    type StackItem = {
      node: PositionedNode<P>;
      qr: Axial;
      parentButton?: Placed<P>;
      fromDir?: Dir;
      visible: boolean;
      suppressEdge?: boolean;
    };

    const nodes: Placed<P>[] = [];
    const edges: Array<{ from: Placed<P>; to: Placed<P>; dir: Dir }> = [];
    const branches: PlacedBranch[] = [];
    const childMap: Record<string, string[]> = {};

    const effToggled = (n: { id: string; props?: Partial<P> }) =>
      toggles[n.id] ?? Boolean(n.props?.toggled);

    const stack: StackItem[] = [{ node: root, qr: origin, visible: true }];

    while (stack.length) {
      const item = stack.pop() as StackItem;

      if (isButtonNode<P>(item.node)) {
        const center = qrToCenter(item.qr);
        const toggled = effToggled(item.node);
        const placed: Placed<P> = {
          id: item.node.id,
          node: item.node,
          qr: item.qr,
          px: center,
          toggled,
          visible: item.visible,
          parentId: item.parentButton?.id,
          fromDir: item.fromDir,
        };
        nodes.push(placed);

        if (
          item.parentButton &&
          item.fromDir !== undefined &&
          !item.suppressEdge
        ) {
          edges.push({
            from: item.parentButton,
            to: placed,
            dir: item.fromDir,
          });
          const pid = item.parentButton.id;
          (childMap[pid] ||= []).push(placed.id);
        }

        const children = item.node.children;
        if (children && children.length) {
          const nextVisible = item.visible && toggled;
          for (const c of children) {
            if (!c || c.position < 1 || c.position > 6) {
              continue;
            }
            const off = dirOffset(scheme, c.position, 2);
            const childQR = { q: item.qr.q + off.q, r: item.qr.r + off.r };
            stack.push({
              node: c.node,
              qr: childQR,
              parentButton: placed,
              fromDir: c.position,
              visible: nextVisible,
            });
          }
        }
      } else if (isBranchNode<P>(item.node)) {
        if (item.fromDir === undefined) {
          continue;
        }
        const center = qrToCenter(item.qr);
        branches.push({
          qr: item.qr,
          px: center,
          visible: item.visible,
          dir: item.fromDir,
          kind: item.node.branch,
        });

        const p0 = item.fromDir;
        const slots: Dir[] =
          item.node.branch === 'two'
            ? [wrapDir(p0 + 2), wrapDir(p0 + 4)]
            : [wrapDir(p0 + 2), wrapDir(p0), wrapDir(p0 + 4)];

        const nextVisible = item.visible;
        item.node.children.forEach((childNode, idx) => {
          const dir = slots[idx];
          if (!dir) {
            return;
          }
          const off = dirOffset(scheme, dir, 1);
          const childQR = { q: item.qr.q + off.q, r: item.qr.r + off.r };
          stack.push({
            node: childNode,
            qr: childQR,
            parentButton: item.parentButton,
            fromDir: dir,
            visible: nextVisible,
            suppressEdge: true,
          });
        });
      }
    }

    return { nodes, edges, branches, childMap };
  }, [origin, qrToCenter, root, scheme, toggles]);
}
