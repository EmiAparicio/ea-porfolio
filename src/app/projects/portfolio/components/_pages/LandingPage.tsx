'use client';

import { useLang } from '@i18n/client';
import { hexRadiusAtom } from '@portfolio/atoms/hexGridAtoms';
import BackgroundedElement from '@portfolio/components/BackgroundedElement';
import Text, { TextColorTokens } from '@portfolio/components/Text/Text';
import { useGlobalPositions } from '@portfolio/hooks/hexgrid/useGlobalPositions';
import { useQrToCenter } from '@portfolio/hooks/hexgrid/useQrToCenter';
import cn from 'classnames';
import { useAtomValue } from '@portfolio/lib/jotai';
import { useTheme } from 'next-themes';
import useWindowSize from '../../hooks/useWindowSize';

export const MAIN_TEXT_COLORS: Record<string, Partial<TextColorTokens>> = {
  dark: {
    text: 'var(--foreground-main)',
    bold: 'var(--foreground-color-contrast)',
    textShadow: 'var(--foreground-extreme)',
    boldShadow: 'var(--foreground-extreme)',
    selectionText: 'var(--foreground-contrast)',
    selectionBold: 'var(--foreground-extreme)',
    selectionTextShadow: 'var(--foreground-shine)',
    selectionBoldShadow: 'var(--foreground-shine)',
    hoverText: 'var(--foreground-mid)',
    hoverBold: 'var(--foreground-color-dark)',
    hoverShadow: 'var(--foreground-shine)',
  },
  light: {
    text: 'var(--foreground-main)',
    bold: 'var(--foreground-main)',
    textShadow: 'var(--foreground-extreme)',
    boldShadow: 'var(--foreground-contrast)',
    selectionText: 'var(--foreground-mid)',
    selectionBold: 'var(--foreground-color-dark)',
    selectionTextShadow: 'var(--foreground-shine)',
    selectionBoldShadow: 'var(--foreground-shine)',
    hoverText: 'var(--foreground-mid)',
    hoverBold: 'var(--foreground-color-dark)',
    hoverShadow: 'var(--foreground-shine)',
  },
};

export default function LandingPage() {
  const { dict } = useLang();
  const { resolvedTheme } = useTheme();
  const { deviceType } = useWindowSize();
  const R = useAtomValue(hexRadiusAtom);
  const qrToCenter = useQrToCenter();
  const globalPositions = useGlobalPositions();

  if (!qrToCenter) return null;

  const mainTextPosition = qrToCenter(globalPositions.landingText);

  return (
    <BackgroundedElement
      as="article"
      className="absolute -translate-1/2 px-[0%] py-[0%] text-center"
      style={{
        top: mainTextPosition.top,
        left: mainTextPosition.left,
        width: deviceType === 'mobile' ? `${R * 14}px` : `${R * 20}px`,
      }}
    >
      <Text
        variant="text"
        size={deviceType === 'mobile' ? 'body' : 'title'}
        scale={deviceType === 'mobile' ? 0.9 : 0.7}
        boldColorOnly
        className={cn(
          resolvedTheme === 'light' && 'tracking-[-0.015rem]',
          deviceType !== 'mobile' && '!leading-[1.1]',
          deviceType === 'mobile' && '!leading-[1.1]'
        )}
        weightDelta={resolvedTheme === 'light' ? 300 : 100}
        colors={MAIN_TEXT_COLORS[resolvedTheme ?? 'light']}
      >
        {dict.pages.landing.text}
      </Text>
    </BackgroundedElement>
  );
}
