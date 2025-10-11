'use client';

import type { HexToggleItem } from '@portfolio/components/HexToggleBar/HexToggleBar';
import { useQrToCenter } from '@portfolio/hooks/hexgrid/useQrToCenter';
import { Axial } from '@portfolio/types/hexgrid';
import { useMemo } from 'react';
import HexChildrenCarouselCore from './HexChildrenCarouselCore';

/**
 * Props for the HexChildrenCarousel component.
 */
export type HexChildrenCarouselProps = {
  /**
   * The list of child items to be displayed in the carousel.
   */
  items: HexToggleItem[];
  /**
   * The axial coordinates of the parent button on the hexagonal grid.
   */
  parentQr: Axial;
  /**
   * Additional CSS classes for the container.
   */
  className?: string;
  /**
   * The maximum number of children to show at once.
   */
  maxShownChildren?: number;
  /**
   * A scaling factor for the size of the buttons.
   */
  sizeFactor?: number;
  /**
   * The initial index of the active item in the carousel.
   */
  initialIndex?: number;
};

/**
 * A component that renders a carousel of hexagonal buttons positioned relative to a parent button on the hexagonal grid.
 * It uses `HexChildrenCarouselCore` for the main carousel logic and provides a specific positioning strategy.
 *
 * @param props - The component props.
 * @returns A JSX element representing the positioned hexagonal button carousel.
 */
export default function HexChildrenCarousel({
  items,
  parentQr,
  className,
  maxShownChildren,
  sizeFactor,
  initialIndex,
}: HexChildrenCarouselProps) {
  const qrToCenter = useQrToCenter();

  const childAnchor = useMemo(() => {
    if (!qrToCenter) return { left: 0, top: 0 };
    const childCenterQr = { q: parentQr.q - 1, r: parentQr.r + 2 };
    const { left, top } = qrToCenter(childCenterQr);
    return { left, top };
  }, [qrToCenter, parentQr]);

  const style: React.CSSProperties = {
    left: childAnchor.left,
    top: childAnchor.top,
  };

  return (
    <HexChildrenCarouselCore
      items={items}
      orientation="flat"
      maxShownChildren={maxShownChildren}
      sizeFactor={sizeFactor}
      initialIndex={initialIndex}
      blurredCurtains={true}
      className={className}
      style={style}
    />
  );
}
