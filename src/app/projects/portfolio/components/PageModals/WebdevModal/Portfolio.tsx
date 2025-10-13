'use client';

import { useLang } from '@i18n/client';
import HexButton from '@portfolio/components/HexButton/HexButton';
import Text from '@portfolio/components/Text/Text';
import useWindowSize from '@portfolio/hooks/useWindowSize';
import cn from 'classnames';
import { FC } from 'react';
import { FaGithub } from 'react-icons/fa';
import { MAIN_TEXT_COLORS } from '../../_pages/LandingPage';
import { useTheme } from 'next-themes';

export type PortfolioProps = {
  /** Optional CSS class for the container */
  className?: string;
};

const Portfolio: FC<PortfolioProps> = ({ className }) => {
  const { resolvedTheme } = useTheme();
  const { deviceType } = useWindowSize();
  const { dict } = useLang();

  return (
    <div className="pointer-events-none relative h-full w-full">
      <div
        className={cn('pointer-events-none relative h-full w-full', className)}
      >
        <Text
          variant="text"
          size="body"
          colors={MAIN_TEXT_COLORS[resolvedTheme ?? 'light']}
          className={cn(
            'absolute left-1/2 -translate-1/2 text-center',
            {
              web: 'top-[40%] w-[60%]',
              medium: 'top-[35%] w-[85%] !text-[calc(min(2.2vw,1.5dvh))]',
              mobile: 'top-[40%] w-[85%] !text-[3.4vw]',
            }[deviceType],
            resolvedTheme === 'light' && 'tracking-[-0.015rem]'
          )}
          weightDelta={resolvedTheme === 'light' ? 100 : 0}
        >
          {dict.pages.webdev.portfolioText}
        </Text>
      </div>
      <HexButton
        id="portfolio-repository"
        title={dict.pages.webdev.github}
        label={dict.pages.webdev.github}
        icon={FaGithub}
        sizeFactor={1.5}
        iconScale="40%"
        labelSizeFactor={0.8}
        labelElevation={0.2}
        href="https://github.com/EmiAparicio/ea-porfolio"
        toggleable={false}
        showLabelOnToggled={true}
        className={cn(
          'pointer-events-auto !absolute',
          deviceType === 'web' && 'top-1/2 left-[5%]',
          deviceType === 'medium' && 'bottom-[15%] left-1/2',
          deviceType === 'mobile' && 'bottom-[12%] left-1/2'
        )}
      />
    </div>
  );
};

export default Portfolio;
