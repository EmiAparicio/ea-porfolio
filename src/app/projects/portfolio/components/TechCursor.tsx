'use client';

import { hexRadiusAtom } from '@portfolio/atoms/hexGridAtoms';
import { globalModalOpenAtom } from '@portfolio/atoms/modalAtoms';
import { useMediaQuery } from '@portfolio/hooks/useMediaQuery';
import { usePerformance } from '@portfolio/providers/PerformanceProvider';
import { inNoCustomZone, isDisabledish } from '@portfolio/utils/dom';
import { hexPoints } from '@portfolio/utils/math';
import { normalizeColor } from '@portfolio/utils/theme';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtomValue } from '@portfolio/lib/jotai';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import useWindowSize from '../hooks/useWindowSize';

/**
 * Class name used to disable the custom cursor on specific elements.
 */
export const NO_CUSTOM_CLASS = 'no-custom-cursor';
const OVERLAY_SELECTOR = '[data-tech-cursor-root]';
const INTERACTIVE_SELECTOR =
  'button, a[href], [role="button"], input:not([type="hidden"]), select, textarea, summary, label[for], [contenteditable="true"], [tabindex]:not([tabindex="-1"]), [data-interactive]';

/**
 * Type representing the different states of the custom cursor.
 */
type CursorKind = 'default' | 'pointer' | 'forbidden';

/**
 * Interface for defining the color scheme of the cursor.
 */
interface CursorColors {
  main?: string;
  accent?: string;
  danger?: string;
  contrast?: string;
}

/**
 * Props for the TechCursor component.
 */
export interface TechCursorProps {
  /**
   * Whether to activate the custom cursor. Defaults to `true`.
   */
  enabled?: boolean;
  /**
   * Multiplier applied to the hex radius (from Jotai atom state) to scale the cursor size.
   */
  sizeFactor?: number;
  /**
   * The z-index of the fixed overlay element.
   */
  zIndex?: number;
  /**
   * CSS tokens or variables used for strokes and fills (accepts `"--var"` or `"var(--var)"`).
   */
  colors?: CursorColors;
  /**
   * If `true`, the cursor is disabled on coarse pointers (e.g., touch devices).
   */
  onlyFinePointer?: boolean;
}

/**
 * A custom cursor component that replaces the default cursor with a hexagonal, animated design.
 * It provides different visual states for interactive elements, disabled elements, and modal overlays.
 *
 * @param props - The component props.
 * @returns A React Portal containing the animated cursor SVG.
 */
export function TechCursor({
  enabled = true,
  sizeFactor = 1,
  zIndex = 2147483646,
  colors: colorsFromProps = {
    main: '--foreground-main',
    accent: '--foreground-color-contrast',
    danger: '--foreground-danger',
    contrast: '--foreground-contrast',
  },
  onlyFinePointer = true,
}: TechCursorProps) {
  const { enableAnimations } = usePerformance(2);
  const { deviceType } = useWindowSize();
  const prefersFine = useMediaQuery('(any-pointer: fine)');
  const prefersReduce = useMediaQuery('(prefers-reduced-motion: reduce)');
  const isModal = useAtomValue(globalModalOpenAtom);

  const R = useAtomValue(hexRadiusAtom);
  const size = sizeFactor * R;

  const globallyActive =
    enabled &&
    (!onlyFinePointer || prefersFine) &&
    !prefersReduce &&
    deviceType === 'web';

  const [visible, setVisible] = useState(false);
  const [hasPos, setHasPos] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [suspended, setSuspended] = useState(false);
  const [kind, setKind] = useState<CursorKind>('default');
  const [pos, setPos] = useState({ x: -9999, y: -9999 });

  const draggingRef = useRef(false);
  const portalHost = typeof document !== 'undefined' ? document.body : null;
  const vb = useMemo(
    () => ({ w: size, h: size, cx: size / 2, cy: size / 2 }),
    [size]
  );

  const colors = isModal
    ? {
        main: '--white-main',
        accent: '--green-main',
        danger: '--foreground-danger',
        contrast: '--black-main',
      }
    : colorsFromProps;

  useEffect(() => {
    if (!globallyActive || typeof document === 'undefined') return;
    const root = document.documentElement;
    root.setAttribute('data-custom-cursor', 'on');
    return () => root.removeAttribute('data-custom-cursor');
  }, [globallyActive]);

  const MAIN = normalizeColor(colors?.main);
  const ACCENT = normalizeColor(colors?.accent);
  const DANGER = normalizeColor(colors?.danger);
  const CONTRAST = normalizeColor(colors?.contrast);

  const strokeW = Math.max(2, Math.round(size * 0.06));
  const r = Math.max(8, Math.round(size * 0.32));
  const dotR = Math.max(1.5, Math.round(size * 0.06));

  const getTopElement = (x: number, y: number): Element | null => {
    const stack = (document.elementsFromPoint?.(x, y) ??
      [document.elementFromPoint(x, y)].filter(Boolean)) as Element[];
    const el = stack.find((e) => !(e as HTMLElement).closest(OVERLAY_SELECTOR));
    return el ?? null;
  };

  useEffect(() => {
    if (!globallyActive || typeof window === 'undefined') return;

    const updateFromXY = (x: number, y: number) => {
      if (draggingRef.current) return;

      const el = getTopElement(x, y);
      const noZone = inNoCustomZone(el);
      setSuspended(noZone);

      setPos({ x, y });
      setHasPos(true);
      setVisible(!noZone);

      if (!noZone) {
        const interactive = el?.closest(INTERACTIVE_SELECTOR) ?? null;
        if (isDisabledish(interactive ?? el)) setKind('forbidden');
        else if (interactive) setKind('pointer');
        else setKind('default');
      }
    };

    const onMove = (e: PointerEvent) => updateFromXY(e.clientX, e.clientY);
    const onOver = (e: PointerEvent) => updateFromXY(e.clientX, e.clientY);

    const hide = () => setVisible(false);
    const onOut = (e: MouseEvent) => {
      if (!e.relatedTarget) setVisible(false);
    };
    const onVisibility = () => {
      if (document.hidden) setVisible(false);
    };

    const onDragStart = () => {
      draggingRef.current = true;
      setDragging(true);
      setVisible(false);
    };
    const endDrag = () => {
      draggingRef.current = false;
      setDragging(false);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerover', onOver, { passive: true });
    window.addEventListener('blur', hide);
    window.addEventListener('mouseout', onOut);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pointerleave', hide);
    window.addEventListener('pointercancel', hide);
    window.addEventListener('dragstart', onDragStart);
    window.addEventListener('dragend', endDrag);
    window.addEventListener('drop', endDrag);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerover', onOver);
      window.removeEventListener('blur', hide);
      window.removeEventListener('mouseout', onOut);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointerleave', hide);
      window.removeEventListener('pointercancel', hide);
      window.removeEventListener('dragstart', onDragStart);
      window.removeEventListener('dragend', endDrag);
      window.removeEventListener('drop', endDrag);
    };
  }, [globallyActive]);

  if (!portalHost || !enableAnimations) return null;

  return createPortal(
    <>
      <style>{`
        [data-custom-cursor="on"] * { cursor: none !important; }
        [data-custom-cursor="on"] .${NO_CUSTOM_CLASS}, 
        [data-custom-cursor="on"] .${NO_CUSTOM_CLASS} * { cursor: auto !important; }
      `}</style>

      {globallyActive && (
        <AnimatePresence>
          {visible && hasPos && !dragging && !suspended && (
            <motion.div
              key="cursor-root"
              aria-hidden
              data-tech-cursor-root
              style={{
                position: 'fixed',
                inset: 0,
                pointerEvents: 'none',
                zIndex,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ x: pos.x - vb.cx, y: pos.y - vb.cy }}
                animate={{ x: pos.x - vb.cx, y: pos.y - vb.cy }}
                transition={{
                  type: 'spring',
                  stiffness: 8000,
                  damping: 150,
                  mass: 0.1,
                }}
                style={{ position: 'absolute', willChange: 'transform' }}
                data-kind={kind}
              >
                <svg
                  width={vb.w}
                  height={vb.h}
                  viewBox={`0 0 ${vb.w} ${vb.h}`}
                  role="presentation"
                >
                  <g
                    opacity={
                      kind === 'pointer' ? 0 : kind === 'forbidden' ? 0.15 : 0.9
                    }
                  >
                    <circle
                      cx={vb.cx}
                      cy={vb.cy}
                      r={r}
                      fill="none"
                      stroke={ACCENT}
                      strokeWidth={strokeW}
                    />
                    <circle
                      cx={vb.cx}
                      cy={vb.cy}
                      r={r - strokeW * 2}
                      fill="none"
                      stroke={MAIN}
                      strokeWidth={1}
                      opacity={0.5}
                    />
                  </g>

                  <circle
                    cx={vb.cx}
                    cy={vb.cy}
                    r={dotR}
                    fill={kind === 'forbidden' ? DANGER : MAIN}
                  />

                  <g
                    style={{
                      opacity: kind === 'pointer' ? 1 : 0,
                      transition: 'opacity 120ms ease',
                    }}
                  >
                    <polygon
                      points={hexPoints(vb.cx, vb.cy, r * 0.9, 30)}
                      fill="none"
                      stroke={CONTRAST}
                      strokeWidth={strokeW + 2}
                      strokeLinejoin="round"
                    />
                    <polygon
                      points={hexPoints(vb.cx, vb.cy, r * 0.9, 30)}
                      fill="none"
                      stroke={MAIN}
                      strokeWidth={strokeW}
                      strokeLinejoin="round"
                    />
                  </g>

                  <g
                    style={{
                      opacity: kind === 'forbidden' ? 1 : 0,
                      transition: 'opacity 120ms ease',
                    }}
                  >
                    <polygon
                      points={hexPoints(vb.cx, vb.cy, r, 30)}
                      fill="none"
                      stroke={DANGER}
                      strokeWidth={strokeW}
                      strokeLinejoin="round"
                    />
                    <line
                      x1={vb.cx - r * 0.8}
                      y1={vb.cy + r * 0.8}
                      x2={vb.cx + r * 0.8}
                      y2={vb.cy - r * 0.8}
                      stroke={DANGER}
                      strokeWidth={strokeW}
                      strokeLinecap="round"
                    />
                  </g>
                </svg>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>,
    portalHost
  );
}

export default TechCursor;
