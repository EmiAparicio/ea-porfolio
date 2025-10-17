'use client';

import { hexRadiusAtom } from '@project/atoms/hexGridAtoms';
import useElementSize from '@project/hooks/useElementSize';
import useWindowSize from '@project/hooks/useWindowSize';
import { usePerformance } from '@project/providers/PerformanceProvider';
import { HexSpec } from '@project/types/hexgrid';
import { DeviceType } from '@project/types/window';
import {
  clamp,
  gaussian,
  hexPoints,
  mix,
  RNG,
  seededRng,
} from '@project/utils/math';
import { colorWithOpacity } from '@project/utils/theme';
import cn from 'classnames';
import {
  AnimatePresence,
  AnimationGeneratorType,
  Easing,
  motion,
} from 'framer-motion';
import { useAtomValue } from '@project/lib/jotai';
import { useTheme } from 'next-themes';
import {
  CSSProperties,
  ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

const DEFAULTS = {
  tint: 'var(--modal-glass)',
  solidTint: 'var(--modal-solid-glass)',
  blurPx: 12,
  glassOpacity: { dark: 0.18, light: 0.5 } as Record<string, number>,
  borderOpacity: { dark: 0.22, light: 0.1 } as Record<string, number>,
  strokeOpacity: 0.28,
  shineOpacity: 0.3,
  shadow: '0 22px 60px rgba(0,0,0,0.35)',
  baseRadiusRem: 1.25,
  clusterCount: { mobile: 2, medium: 3, web: 8 } as Record<DeviceType, number>,
  baseCount: { mobile: 6, medium: 10, web: 32 } as Record<DeviceType, number>,
  minSeparation: 1.5,
  innerCoverRect: 0.9,
  sizeJitter: 0.5,
};

/**
 * Props for the GlassHexBackdrop component.
 */
export type GlassHexBackdropProps = {
  /**
   * The content to be rendered inside the glass screen.
   */
  children: ReactNode;
  /**
   * Additional CSS class names for the container.
   */
  containerClassName?: string;
  /**
   * Additional inline styles for the container.
   */
  containerStyle?: CSSProperties;
  /**
   * Additional CSS class names for the screen element.
   */
  screenClassName?: string;
  /**
   * Additional inline styles for the screen element.
   */
  screenStyle?: CSSProperties;
  /**
   * The color tint of the glass. Defaults to a CSS variable.
   */
  tint?: string;
  /**
   * The color tint of the glass without blur applied. Defaults to a CSS variable.
   */
  solidTint?: string;
  /**
   * The blur amount in pixels. Defaults to `DEFAULTS.blurPx`.
   */
  blur?: number;
  /**
   * The density of the hexagonal pattern.
   */
  density?: number;
  /**
   * The stroke width of the hexagons.
   */
  hexStrokeWidth?: number;
  /**
   * The base radius in REM units.
   */
  radiusRem?: number;
  /**
   * The opacity of the glass effect.
   */
  glassOpacity?: number;
  /**
   * A seed for the random number generator to ensure a consistent pattern.
   */
  seed?: number;
  /**
   * The CSS box-shadow property.
   */
  boxShadow?: string;
  /**
   * The orientation of the hexagonal grid.
   */
  orientation?: 'flat' | 'pointy';
  /**
   * If true, children are mounted after a delay.
   */
  deferChildren?: boolean;
  /**
   * The delay in milliseconds before children are mounted.
   */
  childrenMountDelayMs?: number;
  /**
   * If false, hides the hexagonal background.
   */
  showHexagons?: boolean;
};

type Direction = 'top' | 'right' | 'bottom' | 'left';

const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

/**
 * Snaps a value to the device pixel grid for crisp rendering.
 *
 * @param v - The value to snap.
 * @param sw - The stroke width.
 * @param devicePR - The device pixel ratio.
 * @returns The snapped value.
 */
const snapToDeviceGrid = (v: number, sw: number, devicePR: number): number => {
  const px = v * devicePR;
  const isOddStroke = Math.round(sw * devicePR) % 2 === 1;
  const centerOffset = isOddStroke ? 0.5 : 0;
  return (Math.round(px - centerOffset) + centerOffset) / devicePR;
};

/**
 * Generates and snaps the hexagonal points to the device pixel grid.
 *
 * @param cx - The center X coordinate.
 * @param cy - The center Y coordinate.
 * @param r - The radius.
 * @param rot - The rotation in degrees.
 * @param sw - The stroke width.
 * @param devicePR - The device pixel ratio.
 * @returns A string of snapped points for an SVG polygon.
 */
const hexPointsSnapped = (
  cx: number,
  cy: number,
  r: number,
  rot: number,
  sw: number,
  devicePR: number
): string => {
  const raw = hexPoints(cx, cy, r, rot)
    .trim()
    .split(/\s+/)
    .map((pair) => pair.split(',').map(Number) as [number, number])
    .map(
      ([x, y]) =>
        [
          snapToDeviceGrid(x, sw, devicePR),
          snapToDeviceGrid(y, sw, devicePR),
        ] as [number, number]
    );
  return raw.map(([x, y]) => `${x},${y}`).join(' ');
};

/**
 * A component that renders a glass-like screen with an animated hexagonal background.
 * It uses framer-motion for animations and adapts its layout based on window size and device type.
 *
 * @param props - The component props.
 * @returns A JSX element representing the glass screen with its background.
 */
export default function GlassScreen({
  children,
  containerClassName,
  containerStyle,
  screenClassName,
  screenStyle,
  tint = DEFAULTS.tint,
  solidTint = DEFAULTS.solidTint,
  blur: blurFromProps = DEFAULTS.blurPx,
  density = 1,
  hexStrokeWidth = 4,
  radiusRem = DEFAULTS.baseRadiusRem,
  glassOpacity: glassOpacityFromProps,
  seed,
  boxShadow,
  orientation = 'flat',
  deferChildren = true,
  childrenMountDelayMs = 1000,
  showHexagons = true,
}: GlassHexBackdropProps) {
  const {
    deviceType,
    windowWidth: winW = 0,
    windowHeight: winH = 0,
  } = useWindowSize();
  const { resolvedTheme } = useTheme();
  const R = useAtomValue(hexRadiusAtom);
  const uid = useId();
  const { ref: wrapRef, size: wrapSize } = useElementSize<HTMLDivElement>();

  const { enableAnimations: enableBlur } = usePerformance('glass-screen');
  const blur = enableBlur ? blurFromProps : 0;

  const theme = resolvedTheme ?? 'dark';
  const glassOpacity = enableBlur
    ? (glassOpacityFromProps ?? DEFAULTS.glassOpacity[theme])
    : 1;

  const mountSeedRef = useRef<number | null>(null);
  if (mountSeedRef.current == null) {
    mountSeedRef.current =
      (Math.floor(Math.random() * 0xffffffff) ^ (Date.now() >>> 0)) >>> 0;
  }

  const rng: RNG = useMemo(() => {
    const base =
      typeof seed === 'number' ? seed : (mountSeedRef.current as number);
    return seededRng(base);
  }, [seed]);

  const enterDirection: Direction = useMemo(() => {
    const r = rng();
    if (r < 0.25) return 'top';
    if (r < 0.5) return 'right';
    if (r < 0.75) return 'bottom';
    return 'left';
  }, [rng]);

  const layout = useMemo(() => {
    const width = Math.max(16, wrapSize.width);
    const height = Math.max(16, wrapSize.height);

    const countBase = DEFAULTS.baseCount[deviceType];
    const count = Math.round(countBase * clamp(density, 0, 2.5));
    if (count <= 0)
      return {
        hexes: [] as HexSpec[],
        viewBox: { w: width, h: height },
        offset: { x: 0, y: 0 },
      };

    const minR = R * (1 - DEFAULTS.sizeJitter);
    const maxR = R * (1 + DEFAULTS.sizeJitter);
    const minDist = (minR + maxR) * 0.5 * DEFAULTS.minSeparation;
    const bandOutside = Math.max(width, height) * 0.22;
    const safety = Math.max(16, hexStrokeWidth * 2);
    const expandX = Math.ceil(
      Math.max(width * 0.2, bandOutside + maxR + safety)
    );
    const expandY = Math.ceil(
      Math.max(height * 0.25, bandOutside + maxR + safety)
    );

    const hexes: HexSpec[] = [];
    let attempts = 0;
    const maxAttempts = count * 50;

    while (hexes.length < count && attempts < maxAttempts) {
      attempts++;
      const sx = mix(-0.2, 1.2, rng());
      const sy = mix(-0.25, 1.25, rng());
      const x = sx * width;
      const y = sy * height;
      const r = clamp(R * (1 + gaussian(rng) * 0.5), minR, maxR);

      let ok = true;
      for (const h of hexes) {
        if (Math.hypot(h.x - (x + expandX), h.y - (y + expandY)) < minDist) {
          ok = false;
          break;
        }
      }
      if (ok) {
        hexes.push({
          x: x + expandX,
          y: y + expandY,
          r,
          rotation: orientation === 'pointy' ? 30 : 0,
        });
      }
    }
    return {
      hexes,
      viewBox: { w: width + expandX * 2, h: height + expandY * 2 },
      offset: { x: expandX, y: expandY },
    };
  }, [
    wrapSize.width,
    wrapSize.height,
    deviceType,
    density,
    R,
    rng,
    orientation,
    hexStrokeWidth,
  ]);

  const gradientId = `hex-grad-${uid.replace(/:/g, '')}`;
  const maskId = `hex-mask-${uid.replace(/:/g, '')}`;

  const screenEnterOffset = useMemo(() => {
    const extra = 120;
    const dx =
      enterDirection === 'left'
        ? -(winW + extra)
        : enterDirection === 'right'
          ? winW + extra
          : 0;
    const dy =
      enterDirection === 'top'
        ? -(winH + extra)
        : enterDirection === 'bottom'
          ? winH + extra
          : 0;
    return { x: dx, y: dy };
  }, [enterDirection, winW, winH]);

  const screenExitOffset = useMemo(
    () => ({ x: -screenEnterOffset.x, y: -screenEnterOffset.y }),
    [screenEnterOffset]
  );

  const hexInitial = { scale: 0 };
  const mkHexAnimate = (i: number) => ({
    scale: 1,
    transition: {
      delay: 0.8 + i * 0.01,
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1] as Easing,
    },
  });
  const mkHexExit = (i: number) => ({
    scale: 0,
    opacity: 0,
    transition: {
      delay: i * 0.003,
      duration: 0.25,
      ease: [0.4, 0, 0.2, 1] as Easing,
    },
  });
  const hexTransformStyle: CSSProperties = {
    transformBox: 'fill-box',
    transformOrigin: '50% 50%',
    willChange: 'transform',
  };

  const [renderChildren, setRenderChildren] = useState<boolean>(
    !deferChildren || childrenMountDelayMs <= 0
  );

  useEffect(() => {
    if (!deferChildren) return;
    setRenderChildren(false);
    const t = window.setTimeout(
      () => setRenderChildren(true),
      childrenMountDelayMs
    );
    return () => window.clearTimeout(t);
  }, [deferChildren, childrenMountDelayMs, enterDirection]);

  return (
    <AnimatePresence mode="wait">
      <div
        key="ghb-root"
        className={cn('relative isolate', containerClassName)}
        style={containerStyle}
      >
        {showHexagons && (
          <>
            <svg
              className="absolute -z-10"
              style={{
                left: `-${layout.offset.x}px`,
                top: `-${layout.offset.y}px`,
                width: `${Math.round(layout.viewBox.w)}px`,
                height: `${Math.round(layout.viewBox.h)}px`,
              }}
              viewBox={`0 0 ${Math.max(1, layout.viewBox.w)} ${Math.max(1, layout.viewBox.h)}`}
              preserveAspectRatio="xMidYMid meet"
              aria-hidden
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="white" stopOpacity="0.45" />
                  <stop offset="55%" stopColor="white" stopOpacity="0.06" />
                  <stop offset="100%" stopColor="black" stopOpacity="0.08" />
                </linearGradient>
                <mask
                  id={maskId}
                  maskUnits="userSpaceOnUse"
                  maskContentUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width={layout.viewBox.w}
                  height={layout.viewBox.h}
                >
                  <rect
                    x="0"
                    y="0"
                    width={layout.viewBox.w}
                    height={layout.viewBox.h}
                    fill="black"
                  />
                  {layout.hexes.map((h, idx) => (
                    <motion.polygon
                      key={`mask-${idx}`}
                      points={hexPointsSnapped(
                        h.x,
                        h.y,
                        h.r,
                        h.rotation,
                        hexStrokeWidth,
                        dpr
                      )}
                      fill="white"
                      shapeRendering="geometricPrecision"
                      initial={hexInitial}
                      animate={mkHexAnimate(idx)}
                      exit={mkHexExit(idx)}
                      style={hexTransformStyle}
                    />
                  ))}
                </mask>
              </defs>
              {layout.hexes.map((h, idx) => {
                const strokeCol = colorWithOpacity(
                  tint,
                  DEFAULTS.strokeOpacity
                );
                const pts = hexPointsSnapped(
                  h.x,
                  h.y,
                  h.r,
                  h.rotation,
                  hexStrokeWidth,
                  dpr
                );
                return (
                  <g key={idx}>
                    <motion.polygon
                      points={pts}
                      fill="none"
                      stroke={strokeCol as string}
                      strokeWidth={hexStrokeWidth}
                      strokeLinejoin="round"
                      shapeRendering="geometricPrecision"
                      vectorEffect="non-scaling-stroke"
                      initial={hexInitial}
                      animate={mkHexAnimate(idx)}
                      exit={mkHexExit(idx)}
                      style={hexTransformStyle}
                    />
                    <motion.polygon
                      points={pts}
                      fill="none"
                      stroke={`url(#${gradientId})`}
                      strokeWidth={Math.max(0.75, hexStrokeWidth * 0.9)}
                      strokeLinejoin="round"
                      opacity={0.8}
                      style={hexTransformStyle}
                      vectorEffect="non-scaling-stroke"
                      initial={hexInitial}
                      animate={mkHexAnimate(idx)}
                      exit={mkHexExit(idx)}
                    />
                  </g>
                );
              })}
            </svg>
            <div
              className="absolute -z-10"
              style={{
                left: `-${layout.offset.x}px`,
                top: `-${layout.offset.y}px`,
                width: `${Math.round(layout.viewBox.w)}px`,
                height: `${Math.round(layout.viewBox.h)}px`,
                backdropFilter:
                  blur > 0 ? `saturate(130%) blur(${blur}px)` : 'none',
                WebkitBackdropFilter:
                  blur > 0 ? `saturate(130%) blur(${blur}px)` : 'none',
                background: colorWithOpacity(tint, glassOpacity) as string,
                mask: `url(#${maskId})`,
                WebkitMask: `url(#${maskId})`,
              }}
            />
          </>
        )}
        <motion.div
          ref={wrapRef}
          className={cn(
            'pointer-events-auto relative isolate z-[2]',
            'rounded-[var(--glass-radius)]',
            'shadow-[var(--glass-shadow)]',
            "before:absolute before:inset-px before:rounded-[calc(var(--glass-radius)-1px)] before:content-['']",
            'before:bg-[linear-gradient(140deg,rgba(255,255,255,var(--shine-op))_0%,rgba(255,255,255,0)_40%)]',
            "after:absolute after:inset-0 after:rounded-[var(--glass-radius)] after:content-['']",
            'after:ring-1 after:ring-white/10',
            screenClassName || ''
          )}
          style={
            {
              '--glass-radius': `${radiusRem}rem`,
              '--glass-shadow': boxShadow || DEFAULTS.shadow,
              '--shine-op': DEFAULTS.shineOpacity.toString(),
              background: enableBlur
                ? (colorWithOpacity(tint, glassOpacity) as string)
                : solidTint,
              backdropFilter:
                blur > 0 ? `saturate(130%) blur(${blur}px)` : 'none',
              WebkitBackdropFilter:
                blur > 0 ? `saturate(130%) blur(${blur}px)` : 'none',
              border: `1px solid ${colorWithOpacity(tint, DEFAULTS.borderOpacity[theme]) as string}`,
              ...screenStyle,
            } as CSSProperties
          }
          initial={{ x: screenEnterOffset.x, y: screenEnterOffset.y }}
          animate={{
            x: 0,
            y: 0,
            transition: {
              type: 'spring' as AnimationGeneratorType,
              stiffness: 160,
              damping: 18,
              mass: 0.7,
            },
          }}
          exit={{
            x: screenExitOffset.x,
            y: screenExitOffset.y,
            transition: {
              type: 'spring' as AnimationGeneratorType,
              stiffness: 160,
              damping: 18,
              mass: 0.7,
              delay: 0.2,
            },
          }}
        >
          {renderChildren && (
            <div className="relative z-10 h-full w-full">{children}</div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
