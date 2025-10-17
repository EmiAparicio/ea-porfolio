'use client';

import {
  activeRevealsAtom,
  removeRevealAtom,
  setOverlayMetricsAtom,
  upsertRevealAtom,
} from '@project/atoms/hexGridAtoms';
import { useLatestRef } from '@project/hooks/useLatestRef';
import { useAtomValue, useSetAtom } from '@project/lib/jotai';
import cn from 'classnames';
import { useEffect, useMemo, useRef } from 'react';

export type HexGridCursorRevealProps = {
  /** Stacking context for the absolute wrapper. */
  zIndex: number;
  /** SVG path “d” for the hex grid stroke, in the same logical space as viewBox. */
  d: string;
  /** Logical width of the drawing area in CSS px (pre-DPR). */
  width: number;
  /** Logical height of the drawing area in CSS px (pre-DPR). */
  height: number;
  /** Stroke width in CSS px used to draw the grid path. */
  stroke: number;
  /** Stroke color used to draw the grid path. */
  color: string;
  /** * Inner hard radius (CSS px) of the reveal. Inside this radius the mask is fully opaque, * revealing the grid at full intensity. */
  radius: number;
  /** * Feather size (CSS px). The reveal fades from opaque at radius to fully transparent * at radius + feather. */
  feather: number;
  /** Optional wrapper className; wrapper is absolute and pointer-events are disabled. */
  className?: string;
};

export default function HexGridCursorReveal(props: HexGridCursorRevealProps) {
  const { zIndex, d, width, height, className } = props;
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const activeReveals = useAtomValue(activeRevealsAtom);
  const setOverlayMetrics = useSetAtom(setOverlayMetricsAtom);
  const upsertReveal = useSetAtom(upsertRevealAtom);
  const removeReveal = useSetAtom(removeRevealAtom);
  const latestProps = useLatestRef(props);

  const CURSOR_ID = 'cursor';

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    let hasPointerHover = mq.matches;
    const update = () => {
      hasPointerHover = mq.matches;
      if (!hasPointerHover) {
        removeReveal(CURSOR_ID);
      }
    };
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [removeReveal]);

  useEffect(() => {
    const host = wrapRef.current;
    if (!host) return;

    let rafId: number | null = null;
    const publish = () => {
      const r = host.getBoundingClientRect();
      setOverlayMetrics({
        left: r.left,
        top: r.top,
        width: Math.max(1, r.width),
        height: Math.max(1, r.height),
        viewWidth: Math.max(1, width),
        viewHeight: Math.max(1, height),
      });
    };

    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(host);

    const onScroll = () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(publish);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId != null) cancelAnimationFrame(rafId);
    };
  }, [setOverlayMetrics, width, height]);

  useEffect(() => {
    const host = wrapRef.current;
    if (!host) return;

    let moveRafId: number | null = null;
    let seq = 0;
    let isInside = false;

    const clearReveal = () => {
      isInside = false;
      seq++;
      if (moveRafId != null) cancelAnimationFrame(moveRafId);
      moveRafId = null;
      removeReveal(CURSOR_ID);
    };

    const updateFromXY = (clientX: number, clientY: number) => {
      const r = host.getBoundingClientRect();
      if (
        clientX < r.left ||
        clientX > r.right ||
        clientY < r.top ||
        clientY > r.bottom
      ) {
        if (isInside) clearReveal();
        return;
      }
      isInside = true;
      const currentSeq = seq;
      if (moveRafId != null) cancelAnimationFrame(moveRafId);
      moveRafId = requestAnimationFrame(() => {
        if (currentSeq !== seq || !isInside) return;
        const p = latestProps.current;
        const cx = ((clientX - r.left) * p.width) / Math.max(1, r.width);
        const cy = ((clientY - r.top) * p.height) / Math.max(1, r.height);
        upsertReveal({
          id: CURSOR_ID,
          cx,
          cy,
          hard: p.radius,
          feather: p.feather,
          stroke: p.stroke,
          color: p.color,
          active: true,
        });
      });
    };

    const onPointerMove = (e: PointerEvent) =>
      updateFromXY(e.clientX, e.clientY);
    const onPointerOutCapture = (e: PointerEvent) => {
      if (!e.relatedTarget) clearReveal();
    };
    const onVisibilityChange = () => {
      if (document.hidden) clearReveal();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerout', onPointerOutCapture, true);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', clearReveal);
    window.addEventListener('pagehide', clearReveal);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerout', onPointerOutCapture, true);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', clearReveal);
      window.removeEventListener('pagehide', clearReveal);
      clearReveal();
    };
  }, [upsertReveal, removeReveal, latestProps]);

  const gradIds = useMemo(() => {
    return activeReveals.map((r) => ({
      id: r.id,
      grad: `grid-reveal-grad-${r.id}`,
    }));
  }, [activeReveals]);

  const maskId = 'grid-reveal-mask';

  if (!d || width <= 0 || height <= 0) return null;

  return (
    <div
      ref={wrapRef}
      className={cn('pointer-events-none absolute inset-0', className)}
      style={{ zIndex }}
      aria-hidden
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${Math.max(1, width)} ${Math.max(1, height)}`}
        preserveAspectRatio="none"
      >
        <defs>
          {activeReveals.map((r, i) => {
            const gid = gradIds[i]?.grad ?? `grid-reveal-grad-${r.id}`;
            const outer = r.hard + r.feather;
            const innerStop =
              outer > 0 ? Math.max(0, Math.min(1, r.hard / outer)) : 0;
            return (
              <radialGradient
                key={gid}
                id={gid}
                cx={String(r.cx)}
                cy={String(r.cy)}
                r={String(Math.max(0, outer))}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" stopColor="#fff" stopOpacity="1" />
                <stop offset={innerStop} stopColor="#fff" stopOpacity="1" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </radialGradient>
            );
          })}
          <mask
            id={maskId}
            maskUnits="userSpaceOnUse"
            maskContentUnits="userSpaceOnUse"
            style={{ maskType: 'alpha' }}
          >
            <rect
              x="0"
              y="0"
              width={width}
              height={height}
              fill="black"
              fillOpacity="0"
            />
            {gradIds.map(({ id, grad }) => (
              <rect
                key={id}
                x="0"
                y="0"
                width={width}
                height={height}
                fill={`url(#${grad})`}
              />
            ))}
          </mask>
        </defs>
        {activeReveals.length > 0 && (
          <g mask={`url(#${maskId})`}>
            <path
              d={d}
              fill="none"
              stroke={props.color}
              strokeWidth={props.stroke}
              strokeLinejoin="round"
              strokeLinecap="round"
              shapeRendering="geometricPrecision"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        )}
      </svg>
    </div>
  );
}
