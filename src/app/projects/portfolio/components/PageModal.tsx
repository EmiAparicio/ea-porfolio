import { globalModalItemsAtom } from '@portfolio/atoms/modalAtoms';
import { carouselActiveIdxAtom } from '@portfolio/atoms/sectionsAtoms';
import HexChildrenCarouselCore from '@portfolio/components/HexToggleBar/components/HexChildrenCarouselCore';
import useWindowSize from '@portfolio/hooks/useWindowSize';
import cn from 'classnames';
import { useAtomValue } from '@portfolio/lib/jotai';
import { FC, PropsWithChildren } from 'react';

/**
 * Props for the PageModal component.
 */
type PageModalProps = PropsWithChildren;

/**
 * A modal component that serves as a container for modal content and an optional carousel.
 * It uses the global state to manage the visibility and content of modal items.
 *
 * @param props - The component props, including children to be rendered inside the modal.
 * @returns A JSX element representing the modal container.
 */
export const PageModal: FC<PageModalProps> = ({ children }) => {
  const { deviceType } = useWindowSize();
  const items = useAtomValue(globalModalItemsAtom);
  const carouselActiveIdx = useAtomValue(carouselActiveIdxAtom);

  return (
    <div className="pointer-events-none absolute top-0 h-full w-full">
      {children}
      {items.length > 1 && (
        <HexChildrenCarouselCore
          items={items}
          className={cn(
            deviceType === 'web' && '-bottom-[5%] left-1/2',
            deviceType !== 'web' && '-bottom-[2%] left-1/2'
          )}
          initialIndex={carouselActiveIdx}
        />
      )}
    </div>
  );
};
