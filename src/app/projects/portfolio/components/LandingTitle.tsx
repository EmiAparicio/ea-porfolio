'use client';

import cn from 'classnames';
import { useLang } from '@i18n/client';
import { SUPPORTED_LANGS_SET } from '@i18n/types';
import { hexRadiusAtom } from '@portfolio/atoms/hexGridAtoms';
import GlitchTitle from '@portfolio/components/GlitchTitle/GlitchTitle';
import Text from '@portfolio/components/Text/Text';
import { ROOT_PATHS, useUrlChange } from '@portfolio/hooks/useUrlChange';
import { PixelPos } from '@portfolio/types/buttons-panel';
import { useAtomValue } from '@portfolio/lib/jotai';
import { useTheme } from 'next-themes';
import { memo, useMemo } from 'react';
import { shuffle } from '@portfolio/utils/math';
import GlobalPosition from './HexGridBackground/components/GlobalPosition';
import { motion } from 'framer-motion';
import useWindowSize from '@portfolio/hooks/useWindowSize';

const TEXT_SCALE_BY_DEVICETYPE = {
  mobile: 0.06,
  medium: 0.06,
  web: 0.07,
};

/**
 * Props for the Section component.
 */
type SectionProps = {
  /** Optional absolute pixel position */
  position?: PixelPos;
};

/**
 * A memoized component that renders the main title and a glitching subtitle.
 * The titles and their animation behavior change based on the current URL path.
 *
 * @param props - The component props.
 * @returns A JSX element representing the animated section title.
 */
const Section = memo(({ position }: SectionProps) => {
  const R = useAtomValue(hexRadiusAtom);
  const { deviceType } = useWindowSize();
  const { resolvedTheme } = useTheme();
  const { dict } = useLang();
  const { current, previous } = useUrlChange({ computeSignature: false });

  const atRoot = ROOT_PATHS.includes(current.pathname);

  const titlesByKey = useMemo(() => {
    const obj = dict.pages.titles as Record<string, string | undefined>;
    const entries = Object.entries(obj).filter(([, v]) => !!v) as [
      string,
      string,
    ][];
    if (entries.length === 0) return { '': ' ' } as Record<string, string>;
    return Object.fromEntries(entries);
  }, [dict.pages.titles]);

  const sectionKey = useMemo(() => {
    const segs = current.pathname.split('/').filter(Boolean);
    if (segs.length === 0) return null;
    const first = segs[0];
    if (SUPPORTED_LANGS_SET.has(first)) return segs[1] ?? null;
    return segs[0] ?? null;
  }, [current.pathname]);

  const previousSectionKey = useMemo(() => {
    const prevPath = previous?.pathname || '';
    const segs = prevPath.split('/').filter(Boolean);
    if (segs.length === 0) return null;
    const first = segs[0];
    if (SUPPORTED_LANGS_SET.has(first)) return segs[1] ?? null;
    return segs[0] ?? null;
  }, [previous?.pathname]);

  const rootTitles = useMemo(() => {
    const keys = Object.keys(titlesByKey);
    if (keys.length === 0) return [' '];

    const prefKey =
      previousSectionKey && keys.includes(previousSectionKey)
        ? previousSectionKey
        : null;

    if (!prefKey) {
      return shuffle(keys).map((k) => titlesByKey[k]);
    }

    const rest = keys.filter((k) => k !== prefKey);
    const shuffledRest = shuffle(rest).map((k) => titlesByKey[k]);
    return [titlesByKey[prefKey], ...shuffledRest];
  }, [titlesByKey, previousSectionKey]);

  const titles = useMemo(() => {
    if (atRoot) return rootTitles;
    const single = (dict.pages.titles as Record<string, string | undefined>)[
      sectionKey ?? ''
    ];
    return single ? [single] : rootTitles;
  }, [atRoot, rootTitles, dict.pages.titles, sectionKey]);

  if (!position) return null;

  return (
    <motion.div
      className="absolute flex -translate-1/2 flex-col items-end"
      style={{
        left: position.left,
        top: position.top,
        gap: R * 0.3,
      }}
      initial={false}
      animate={{
        scale: atRoot ? 1 : 0.5,
        marginTop: atRoot ? 0 : -R,
      }}
      transition={{
        type: 'tween',
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Text
        colors={{
          text:
            resolvedTheme === 'dark'
              ? 'color-mix(in oklab, var(--foreground-main), transparent 0%)'
              : 'var(--foreground-mid)',
          textShadow:
            resolvedTheme === 'dark'
              ? 'var(--foreground-extreme)'
              : 'var(--foreground-shine)',
          hoverText: 'var(--foreground-contrast)',
          hoverShadow:
            resolvedTheme === 'dark'
              ? 'var(--foreground-shine)'
              : 'var(--foreground-mid)',
        }}
        hoverable
        size="title"
        variant="title"
        scale={TEXT_SCALE_BY_DEVICETYPE[deviceType] * R}
        className="![font-family:var(--font-russo)] leading-[100%] whitespace-nowrap !select-none"
        weightDelta={0}
      >
        Emiliano Aparicio
      </Text>

      <GlitchTitle
        titles={titles}
        intervalMs={atRoot ? 5000 : undefined}
        fontSizeFactor={deviceType === 'mobile' ? 0.8 : 1}
        className={cn(
          'self-center ![font-family:var(--font-russo)]',
          deviceType === 'web' && 'ml-[48%]'
        )}
      />
    </motion.div>
  );
});
Section.displayName = 'Section';

/**
 * The main landing page title component.
 * It uses a global position provider to correctly place the title on the hex grid.
 *
 * @returns A JSX element containing the animated landing title.
 */
const LandingTitle = () => {
  return (
    <GlobalPosition globalPosition="landingTitle">
      <Section />
    </GlobalPosition>
  );
};

export default LandingTitle;
