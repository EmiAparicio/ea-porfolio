'use client';

import { createPortal } from 'react-dom';
import { JSX, useMemo } from 'react';
import { oddQ_to_axial, oddR_to_axial } from '@portfolio/utils/hexgrid/math';
import type { Orientation } from '@portfolio/components/HexGridBackground/HexGridBackground';
import type { HexGridParamsSnapshot } from '@portfolio/types/hexgrid';
import { useOverlayContainer } from '@portfolio/hooks/hexgrid/useHexGridDebugOverlay';

type Props = {
  /** If true, the debug overlay is rendered. */
  enabled: boolean;
  /** The orientation of the hex grid ('pointy' or 'flat'). */
  orientation: Orientation;
  /** A snapshot of the calculated hex grid parameters. */
  params: HexGridParamsSnapshot | null;
  /** SVG path "d" string for the main grid stroke. */
  d: string;
  /** Grid stroke width in CSS pixels. */
  stroke: number;
  /** Optional SVG path "d" string for the bounding box stroke. */
  boundsD?: string | null;
};

/**
 * Renders an overlay for debugging the hex grid layout, showing coordinates
 * of each hex cell and the overall grid structure.
 *
 * @param {Props} props - The properties for the component.
 * @returns {JSX.Element | null} The rendered debug overlay ported to a container, or null if disabled or missing parameters.
 */
export function HexGridDebugOverlay({
  enabled,
  orientation,
  params,
  d,
  stroke,
  boundsD,
}: Props): JSX.Element | null {
  const container = useOverlayContainer('hex-debug-overlay');

  const payload = useMemo(() => {
    if (!params) return null;
    const {
      W,
      H,
      stepX,
      stepY,
      offsetSecondary,
      centerX,
      centerY,
      centerShiftX,
      centerShiftY,
      iStart,
      iEnd,
      jStart,
      jEnd,
      qOffset,
      rOffset,
      R,
    } = params;

    const labels: { left: number; top: number; text: string }[] = [];
    for (let i = iStart; i <= iEnd; i++) {
      for (let j = jStart; j <= jEnd; j++) {
        if (orientation === 'flat') {
          const cx = centerX + i * stepX + centerShiftX;
          const cy =
            centerY +
            j * stepY +
            (i % 2 === 0 ? 0 : offsetSecondary) +
            centerShiftY;
          const a = oddQ_to_axial(i, j);
          labels.push({
            left: Math.round(cx),
            top: Math.round(cy),
            text: `${a.q - qOffset},${a.r - rOffset}`,
          });
        } else {
          const cx =
            centerX +
            j * stepX +
            (i % 2 === 0 ? 0 : offsetSecondary) +
            centerShiftX;
          const cy = centerY + i * stepY + centerShiftY;
          const a = oddR_to_axial(i, j);
          labels.push({
            left: Math.round(cx),
            top: Math.round(cy),
            text: `${a.q - qOffset},${a.r - rOffset}`,
          });
        }
      }
    }
    const fs = Math.floor(R * 0.4);
    return { W, H, labels, fs };
  }, [params, orientation]);

  if (!enabled || !params || !container || !payload) return null;

  const { W, H, labels, fs } = payload;

  const overlay = (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}
      >
        <path
          d={d}
          fill="none"
          stroke="#00FFFF88"
          strokeWidth={stroke}
          strokeLinejoin="round"
          strokeLinecap="round"
          shapeRendering="geometricPrecision"
          opacity={0.6}
        />
        {boundsD && (
          <path
            d={boundsD}
            fill="none"
            stroke="rgba(16,185,129,0.95)"
            strokeWidth={Math.max(1, stroke)}
            strokeDasharray="6 6"
            shapeRendering="geometricPrecision"
          />
        )}
      </svg>
      {labels.map((l, idx) => (
        <div
          key={idx}
          style={{
            position: 'absolute',
            left: `${l.left}px`,
            top: `${l.top}px`,
            transform: 'translate(-50%,-50%)',
            fontSize: `${fs}px`,
            fontWeight: 400,
            color: '#fff',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          {l.text}
        </div>
      ))}
    </div>
  );

  return createPortal(overlay, container);
}
