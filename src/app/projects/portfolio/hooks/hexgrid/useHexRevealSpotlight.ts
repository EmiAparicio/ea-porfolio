'use client';

import {
  hexRadiusAtom,
  overlayMetricsAtom,
  qrToCenterAtom,
  removeGroupRevealsAtom,
  replaceGroupRevealsAtom,
} from '@portfolio/atoms/hexGridAtoms';
import { Axial } from '@portfolio/types/hexgrid';
import { useAtomValue, useSetAtom } from '@portfolio/lib/jotai';
import { useCallback, useEffect, useId, useMemo, type RefObject } from 'react';

/**
 * A custom hook to manage a spotlight effect on hexagonal grid elements.
 * This hook can create a spotlight on a single HTML element or multiple hexagonal grid nodes
 * by publishing reveal data to Jotai atoms.
 *
 * @template T - The type of the HTML element to target, defaults to `HTMLElement`.
 * @param {object} opts - Options for the spotlight effect.
 * @param {boolean} opts.enabled - Whether the spotlight is enabled.
 * @param {'small' | 'big'} opts.size - The size of the spotlight.
 * @param {RefObject<T | null>} [opts.nodeRef] - A ref to the HTML element for a single spotlight.
 * @param {Axial[]} [opts.qrs] - An array of axial coordinates for a multi-spotlight effect.
 * @param {string} [opts.id] - An optional unique ID for the spotlight.
 * @param {ReadonlyArray<unknown>} [opts.deps] - Additional dependencies for the effect.
 * @param {string} [opts.color='var(--hx-grid-reveal-spotlight)'] - The color of the spotlight effect.
 * @param {number} [opts.stroke=2] - The stroke width of the spotlight effect.
 * @param {string} [opts.baseId] - The base ID for the multi-spotlight group.
 */
export function useHexRevealSpotlight<
  T extends HTMLElement = HTMLElement,
>(opts: {
  enabled: boolean;
  size: 'small' | 'big';
  nodeRef?: RefObject<T | null>;
  qrs?: Axial[];
  id?: string;
  deps?: ReadonlyArray<unknown>;
  color?: string;
  stroke?: number;
  baseId?: string;
}) {
  const {
    enabled,
    size,
    nodeRef,
    qrs,
    id,
    deps = [],
    color = 'var(--hx-grid-reveal-spotlight)',
    stroke = 2,
    baseId,
  } = opts;

  const metrics = useAtomValue(overlayMetricsAtom);
  const qrToCenter = useAtomValue(qrToCenterAtom);
  const hexR = useAtomValue(hexRadiusAtom);

  const replaceGroup = useSetAtom(replaceGroupRevealsAtom);
  const removeGroup = useSetAtom(removeGroupRevealsAtom);

  const rawId = useId();
  const revealId = useMemo(
    () => id ?? `hxrev-${rawId.replace(/[^a-zA-Z0-9-_:]/g, '')}`,
    [id, rawId]
  );

  const groupIdSingle = revealId;
  const groupIdMulti = useMemo(
    () => `hxspgrp-${(baseId ?? rawId).replace(/[^a-zA-Z0-9-_:]/g, '')}`,
    [baseId, rawId]
  );

  const factor = size === 'small' ? 0.7 : 1;

  /**
   * Publishes the spotlight data for a single HTML element.
   */
  const publishSingle = useCallback(() => {
    if (!nodeRef?.current || !metrics) {
      return;
    }
    const rect = nodeRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const cx =
      ((centerX - metrics.left) * metrics.viewWidth) /
      Math.max(1, metrics.width);
    const cy =
      ((centerY - metrics.top) * metrics.viewHeight) /
      Math.max(1, metrics.height);
    replaceGroup({
      groupId: groupIdSingle,
      items: [
        {
          id: groupIdSingle,
          cx,
          cy,
          hard: 40 * factor,
          feather: 160 * factor,
          stroke,
          color,
          active: true,
          groupId: groupIdSingle,
        },
      ],
    });
  }, [metrics, nodeRef, groupIdSingle, replaceGroup, factor, stroke, color]);

  /**
   * Publishes the spotlight data for multiple hexagonal grid nodes.
   */
  const publishMulti = useCallback(() => {
    if (!metrics || !qrToCenter || !qrs) {
      return;
    }
    const items = [];
    for (const { q, r } of qrs) {
      const c = qrToCenter({ q, r });
      const cx =
        ((c.left - metrics.left) * metrics.viewWidth) /
        Math.max(1, metrics.width);
      const cy =
        ((c.top - metrics.top) * metrics.viewHeight) /
        Math.max(1, metrics.height);
      const id = `hxsp-${groupIdMulti}-${q}_${r}`;
      items.push({
        id,
        cx,
        cy,
        hard: 1,
        feather: 100,
        stroke,
        color,
        active: true,
        groupId: groupIdMulti,
      });
    }
    replaceGroup({ groupId: groupIdMulti, items });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    metrics,
    qrToCenter,
    qrs,
    groupIdMulti,
    replaceGroup,
    hexR,
    stroke,
    color,
  ]);

  useEffect(() => {
    if (!enabled) {
      removeGroup(groupIdSingle);
      removeGroup(groupIdMulti);
      return;
    }
    if (!metrics) {
      return;
    }
    const run = () => {
      if (nodeRef) {
        publishSingle();
      } else if (qrs) {
        publishMulti();
      }
    };
    const id = requestAnimationFrame(run);
    return () => cancelAnimationFrame(id);
  }, [
    enabled,
    metrics,
    nodeRef,
    qrs,
    publishSingle,
    publishMulti,
    removeGroup,
    groupIdSingle,
    groupIdMulti,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...deps,
  ]);

  useEffect(() => {
    return () => {
      removeGroup(groupIdSingle);
      removeGroup(groupIdMulti);
    };
  }, [removeGroup, groupIdSingle, groupIdMulti]);
}
