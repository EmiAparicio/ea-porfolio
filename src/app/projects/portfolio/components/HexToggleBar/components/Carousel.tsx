'use client';

import { hexRadiusAtom } from '@portfolio/atoms/hexGridAtoms';
import { carouselActiveIdxAtom } from '@portfolio/atoms/sectionsAtoms';
import { MAIN_TEXT_COLORS } from '@portfolio/components/_pages/LandingPage';
import HexButton, {
  type HexButtonProps,
  type HexOrientation,
} from '@portfolio/components/HexButton/HexButton';
import type { HexToggleItem } from '@portfolio/components/HexToggleBar/HexToggleBar';
import Text from '@portfolio/components/Text/Text';
import { useQrToCenter } from '@portfolio/hooks/hexgrid/useQrToCenter';
import useWindowSize from '@portfolio/hooks/useWindowSize';
import { useAtomValue } from '@portfolio/lib/jotai';
import { mod } from '@portfolio/utils/hexgrid/math';
import { range } from '@portfolio/utils/math';
import { useAtom } from 'jotai';
import { useTheme } from 'next-themes';
import {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CgArrowLongLeftR, CgArrowLongRightR } from 'react-icons/cg';

/**
 * Props for the Carousel component.
 */
export type CarouselProps = {
  /**
   * The list of items to display in the carousel.
   */
  items: HexToggleItem[];
  /**
   * The orientation of the hexagons.
   */
  orientation?: HexOrientation;
  /**
   * The maximum number of children to show at once.
   */
  maxShownChildren?: number;
  /**
   * A scaling factor for the size of the buttons.
   */
  sizeFactor?: number;
  /**
   * The initial index of the active item.
   */
  initialIndex?: number;
  /**
   * If true, the carousel is enabled even if the grid projector is not available.
   */
  enabledWhenNoProjector?: boolean;
  /**
   * A scaling factor for the arrow buttons.
   */
  arrowSizeFactor?: number;
  /**
   * If true, applies a blurred effect to the curtains at the ends of the carousel.
   */
  blurredCurtains?: boolean;
  /**
   * Additional CSS classes.
   */
  className?: string;
};

/**
 * A carousel component for displaying a scrollable list of hexagonal buttons.
 * It features navigation arrows, swipe gestures, and dynamic positioning based on the hexagonal grid.
 *
 * @param props - The component props.
 * @returns A JSX element representing the hexagonal carousel.
 */
export default function Carousel({
  items,
  orientation = 'flat',
  maxShownChildren = 3,
  sizeFactor = 1,
  initialIndex = 0,
  enabledWhenNoProjector = false,
  arrowSizeFactor = 2 / 3,
  blurredCurtains = false,
  className,
}: CarouselProps) {
  const n = items.length;
  const { resolvedTheme } = useTheme();
  const { deviceType } = useWindowSize();
  const R = useAtomValue(hexRadiusAtom);
  const qrToCenter = useQrToCenter();
  const base = useMemo(
    () => (qrToCenter ? qrToCenter({ q: 0, r: 0 }) : { left: 0, top: 0 }),
    [qrToCenter]
  );
  const step1 = useMemo(
    () => (qrToCenter ? qrToCenter({ q: 2, r: 0 }) : { left: 4 * R, top: 0 }),
    [qrToCenter, R]
  );
  const stepLeft = step1.left - base.left;
  const stepTop = step1.top - base.top;
  const colW = Math.max(1, Math.abs(stepLeft) || 2 * R);
  const half = Math.max(0, Math.floor((Math.max(1, maxShownChildren) - 1) / 2));
  const slots = half * 2 + 1;
  const [carouselActiveIdx, setCarouselActiveIdx] = useAtom(
    carouselActiveIdxAtom
  );
  const [centerIndex, setCenterIndex] = useState<number>(
    mod(initialIndex, Math.max(1, n))
  );
  const [animating, setAnimating] = useState<boolean>(false);
  const [trackDx, setTrackDx] = useState<number>(0);
  const [trackDy, setTrackDy] = useState<number>(0);

  useEffect(() => {
    setCarouselActiveIdx(centerIndex);
  }, [centerIndex, setCarouselActiveIdx]);

  useEffect(() => {
    setCenterIndex(carouselActiveIdx);
  }, [carouselActiveIdx]);

  const rScaled = R * (sizeFactor ?? 1);
  const hexHeight =
    orientation === 'flat' ? Math.sqrt(3) * rScaled : 2 * rScaled;
  const widthPxNumber = Math.max(1, slots) * colW;
  const widthPx = `${widthPxNumber}px`;
  const containerHeight = Math.ceil(hexHeight * 2);
  const heightPx = `${containerHeight}px`;
  const centerLeft = useMemo(
    () => Math.round(Math.max(1, slots) * colW * 0.5),
    [slots, colW]
  );
  const centerTop = useMemo(
    () => Math.round(containerHeight * 0.5),
    [containerHeight]
  );
  const bufferOffsets = useMemo(() => range(-half - 1, half + 1), [half]);
  const indicesForOffsets = useMemo(
    () => bufferOffsets.map((o) => mod(centerIndex + o, n)),
    [bufferOffsets, centerIndex, n]
  );

  const setCenter = useCallback(
    (idx: number) => {
      const bounded = mod(idx, Math.max(1, n));
      setCenterIndex(bounded);
    },
    [n]
  );

  const commitJump = useCallback(
    (visualDelta: number) => {
      const indexDelta = -visualDelta;
      setCenter(mod(centerIndex + indexDelta, n));
      setAnimating(false);
      setTrackDx(0);
      setTrackDy(0);
    },
    [centerIndex, n, setCenter]
  );

  const requestJump = useCallback(
    (visualDelta: number) => {
      if (animating || n === 0 || visualDelta === 0) return;
      setAnimating(true);
      setTrackDx(visualDelta * stepLeft);
      setTrackDy(visualDelta * stepTop);
    },
    [animating, n, stepLeft, stepTop]
  );

  const arrowsSize = (arrowSizeFactor <= 0 ? 2 / 3 : arrowSizeFactor) * R;
  const enabled = !!qrToCenter || enabledWhenNoProjector;
  const displayIndex = centerIndex + 1;

  const backdropBlurPx = 6;
  const maskStyle: CSSProperties & Record<string, string> = {
    '--fade-width': '25%',
    maskImage:
      'linear-gradient(to right, rgba(0,0,0,0) 0, rgba(0,0,0,1) var(--fade-width), rgba(0,0,0,1) calc(100% - var(--fade-width)), rgba(0,0,0,0) 100%)',
    WebkitMaskImage:
      'linear-gradient(to right, rgba(0,0,0,0) 0, rgba(0,0,0,1) var(--fade-width), rgba(0,0,0,1) calc(100% - var(--fade-width)), rgba(0,0,0,0) 100%)',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
    maskSize: '100% 100%',
    WebkitMaskSize: '100% 100%',
  };

  const dominantIsX = Math.abs(stepLeft) >= Math.abs(stepTop);
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [dragCommitted, setDragCommitted] = useState(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);

  if (n === 0) return null;

  return (
    <div
      className={['inline-flex w-full flex-col items-center', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className="relative outline-none select-none"
        style={{
          width: widthPx,
          height: heightPx,
          pointerEvents: enabled ? 'auto' : 'none',
          opacity: enabled ? 1 : 0,
        }}
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label="children"
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            requestJump(-1);
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            requestJump(1);
          }
        }}
        onPointerDown={(e) => {
          if (!enabled || animating) return;
          setIsPointerDown(true);
          setDragCommitted(false);
          startXRef.current = e.clientX;
          startYRef.current = e.clientY;
        }}
        onPointerMove={(e) => {
          if (!isPointerDown || animating || dragCommitted) return;
          const dx = e.clientX - startXRef.current;
          const dy = e.clientY - startYRef.current;
          if (dominantIsX) {
            setTrackDx(dx);
            setTrackDy(0);
            const ratio = dx / (stepLeft || 1);
            if (Math.abs(ratio) >= 0.5) {
              setDragCommitted(true);
              requestJump(Math.sign(ratio));
            }
          } else {
            setTrackDy(dy);
            setTrackDx(0);
            const ratio = dy / (stepTop || 1);
            if (Math.abs(ratio) >= 0.5) {
              setDragCommitted(true);
              requestJump(Math.sign(ratio));
            }
          }
        }}
        onPointerUp={() => {
          if (!isPointerDown) return;
          setIsPointerDown(false);
          if (!dragCommitted && (trackDx !== 0 || trackDy !== 0)) {
            setAnimating(true);
            setTrackDx(0);
            setTrackDy(0);
          }
        }}
        onPointerCancel={() => {
          if (!isPointerDown) return;
          setIsPointerDown(false);
          if (!dragCommitted && (trackDx !== 0 || trackDy !== 0)) {
            setAnimating(true);
            setTrackDx(0);
            setTrackDy(0);
          }
        }}
        onPointerLeave={() => {
          if (!isPointerDown) return;
          setIsPointerDown(false);
          if (!dragCommitted && (trackDx !== 0 || trackDy !== 0)) {
            setAnimating(true);
            setTrackDx(0);
            setTrackDy(0);
          }
        }}
      >
        <button
          type="button"
          aria-label="prev"
          className="pointer-events-auto absolute top-1/2 left-0 z-20 -translate-x-[80%] -translate-y-[45%] cursor-pointer rounded-full outline-[color:var(--white-main)] focus:outline"
          onClick={() => requestJump(1)}
          data-animating={animating ? 'true' : 'false'}
        >
          <CgArrowLongLeftR
            size={arrowsSize}
            color="var(--white-main)"
            style={{ opacity: animating ? 0.6 : 1 }}
          />
        </button>
        <button
          type="button"
          aria-label="next"
          className="pointer-events-auto absolute top-1/2 right-0 z-20 translate-x-[82%] -translate-y-[45%] cursor-pointer rounded-full outline-[color:var(--white-main)] focus:outline"
          onClick={() => requestJump(-1)}
          data-animating={animating ? 'true' : 'false'}
        >
          <CgArrowLongRightR
            size={arrowsSize}
            color="var(--white-main)"
            style={{ opacity: animating ? 0.6 : 1 }}
          />
        </button>
        <div className="absolute inset-0 overflow-hidden" style={maskStyle}>
          <div
            className="absolute inset-0"
            style={{
              transform: `translate(${trackDx}px, ${trackDy}px)`,
              transition: animating ? 'transform 280ms ease' : 'none',
              willChange: 'transform',
            }}
            onTransitionEnd={() => {
              if (!animating) return;
              const visualDelta =
                trackDx === 0 && trackDy === 0
                  ? 0
                  : Math.round(
                      Math.abs(stepLeft) >= Math.abs(stepTop)
                        ? trackDx / (stepLeft || 1)
                        : trackDy / (stepTop || 1)
                    );
              commitJump(visualDelta);
            }}
          >
            {bufferOffsets.map((offset, slot) => {
              const idx = indicesForOffsets[slot];
              const item = items[idx];
              const left = centerLeft + offset * stepLeft;
              const top = centerTop + offset * stepTop;
              const { toggleable: toggleableProp, ...btnProps } = item;
              const isToggleable =
                typeof toggleableProp === 'boolean' ? toggleableProp : false;
              return (
                <div
                  key={`slot-${slot}`}
                  className="absolute"
                  style={{ transform: `translate(${left}px, ${top}px)` }}
                  onClick={(e) => {
                    if (offset !== 0) {
                      e.stopPropagation();
                      requestJump(Math.sign(-offset));
                    }
                  }}
                >
                  <HexButton
                    size="small"
                    borderType="outer"
                    orientation={orientation}
                    sizeFactor={sizeFactor}
                    toggleable={isToggleable}
                    toggled={false}
                    onToggle={() => {}}
                    onClick={(e) => {
                      (btnProps as HexButtonProps).onClick?.(e);
                    }}
                    className={(btnProps as HexButtonProps).className}
                    style={(btnProps as HexButtonProps).style}
                    {...(btnProps as HexButtonProps)}
                  />
                </div>
              );
            })}
          </div>
          <div
            className="pointer-events-none absolute top-1/2 left-0 h-[150%] -translate-y-1/2"
            style={{
              width: R * 2,
              display:
                blurredCurtains && maxShownChildren > 1 ? 'block' : 'none',
            }}
          >
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="absolute h-full w-full"
                style={{
                  background:
                    i === 0
                      ? 'color-mix(in srgb, var(--background) 60%, transparent)'
                      : 'transparent',
                  backdropFilter: `blur(${backdropBlurPx}px)`,
                  WebkitBackdropFilter: `blur(${backdropBlurPx}px)`,
                  WebkitMaskImage:
                    'linear-gradient(to right, black 20%, transparent 100%)',
                  maskImage:
                    'linear-gradient(to right, black 20%, transparent 100%)',
                  maskMode: 'alpha',
                  willChange: 'backdrop-filter',
                }}
              />
            ))}
          </div>
          <div
            className="pointer-events-none absolute top-1/2 right-0 h-[150%] -translate-y-1/2"
            style={{
              width: R * 2,
              display:
                blurredCurtains && maxShownChildren > 1 ? 'block' : 'none',
            }}
          >
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="absolute h-full w-full"
                style={{
                  background:
                    i === 0
                      ? 'color-mix(in srgb, var(--background) 60%, transparent)'
                      : 'transparent',
                  backdropFilter: `blur(${backdropBlurPx}px)`,
                  WebkitBackdropFilter: `blur(${backdropBlurPx}px)`,
                  WebkitMaskImage:
                    'linear-gradient(to left, black 20%, transparent 100%)',
                  maskImage:
                    'linear-gradient(to left, black 20%, transparent 100%)',
                  maskMode: 'alpha',
                  willChange: 'backdrop-filter',
                }}
              />
            ))}
          </div>
        </div>
        <Text
          variant="text"
          size="small"
          scale={deviceType === 'mobile' ? 0.5 : 1}
          aria-live="polite"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 ![font-family:var(--font-russo)]"
          colors={MAIN_TEXT_COLORS[resolvedTheme ?? 'light']}
        >
          {displayIndex} / {n}
        </Text>
      </div>
    </div>
  );
}
