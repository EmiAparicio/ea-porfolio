'use client';

import { useLang } from '@i18n/client';
import { hexRadiusAtom } from '@portfolio/atoms/hexGridAtoms';
import {
  globalModalItemsAtom,
  globalModalOpenAtom,
} from '@portfolio/atoms/modalAtoms';
import { activeKeyAtom } from '@portfolio/atoms/sectionsAtoms';
import { MAIN_TEXT_COLORS } from '@portfolio/components/_pages/LandingPage';
import BackgroundedElement from '@portfolio/components/BackgroundedElement';
import HexToggleBar, {
  HexToggleItem,
} from '@portfolio/components/HexToggleBar/HexToggleBar';
import { PageModal } from '@portfolio/components/PageModal';
import InvasionTours from '@portfolio/components/PageModals/WebdevModal/InvasionTours';
import Resume from '@portfolio/components/PageModals/WebdevModal/Resume';
import StarCards from '@portfolio/components/PageModals/WebdevModal/StarCards';
import { StarcraftSvg } from '@portfolio/components/Svg/StarcraftSvg';
import Text, { TextSize } from '@portfolio/components/Text/Text';
import { useGlobalPositions } from '@portfolio/hooks/hexgrid/useGlobalPositions';
import { useQrToCenter } from '@portfolio/hooks/hexgrid/useQrToCenter';
import { useGlobalModal } from '@portfolio/hooks/useGlobalModal';
import useWindowSize from '@portfolio/hooks/useWindowSize';
import { PixelPos } from '@portfolio/types/buttons-panel';
import cn from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtomValue, useSetAtom } from '@portfolio/lib/jotai';
import { useTheme } from 'next-themes';
import { useEffect, useMemo, useState } from 'react';
import { BiSolidBriefcase } from 'react-icons/bi';
import { FaFileDownload, FaPlane } from 'react-icons/fa';

const ACTIVE_CONTENT = ['landing', 'experience'];
type ActiveContent = (typeof ACTIVE_CONTENT)[number];

export default function WebdevPageClient() {
  const { dict, lang } = useLang();
  const { resolvedTheme } = useTheme();
  const { deviceType } = useWindowSize();
  const R = useAtomValue(hexRadiusAtom);
  const isModalOpen = useAtomValue(globalModalOpenAtom);
  const setModalItems = useSetAtom(globalModalItemsAtom);
  const qrToCenter = useQrToCenter();
  const globalPositions = useGlobalPositions();
  const { show, replace } = useGlobalModal();
  const modalFunction = isModalOpen ? replace : show;
  const activeCarouselId = useAtomValue(activeKeyAtom);

  const [openTab, setOpenTab] = useState<ActiveContent>('landing');

  useEffect(() => {
    if (!!activeCarouselId && ACTIVE_CONTENT.includes(activeCarouselId))
      setOpenTab(activeCarouselId);
  }, [activeCarouselId]);

  const landingContent = useMemo(
    () =>
      ({
        landing: {
          text: dict.pages.webdev.text,
          position: qrToCenter
            ? qrToCenter(globalPositions.webdevLandingText)
            : null,
          textScale: deviceType === 'mobile' ? R * 0.035 : R * 0.018,
          textSize: deviceType === 'mobile' ? 'body' : 'title',
          className: '!-translate-y-[80%]',
          textClassName: cn(
            resolvedTheme === 'light' && 'tracking-[-0.015rem]',
            deviceType !== 'mobile' && '!leading-[1.1]',
            deviceType === 'mobile' && '!leading-[1.1]'
          ),
          boldColorOnly: true,
        },
        experience: {
          text: dict.pages.webdev.experienceText,
          position: qrToCenter
            ? qrToCenter(globalPositions.webdevExperienceText)
            : null,
          textScale: deviceType === 'mobile' ? R * 0.032 : R * 0.03,
          textSize: 'body',
          className:
            deviceType === 'mobile'
              ? '!-translate-y-[60%]'
              : '!-translate-y-[67%]',
          textClassName: cn(
            resolvedTheme === 'light' && 'tracking-[-0.015rem]',
            deviceType !== 'mobile' && '!leading-[1.1]',
            deviceType === 'mobile' && '!leading-[1.2]'
          ),
          boldColorOnly: true,
        },
      }) as Record<
        ActiveContent,
        {
          text: string;
          position: PixelPos;
          textScale: number;
          textSize: TextSize;
          className?: string;
          textClassName?: string;
          boldColorOnly: boolean;
        }
      >,
    [
      dict.pages.webdev.text,
      dict.pages.webdev.experienceText,
      qrToCenter,
      globalPositions.webdevLandingText,
      globalPositions.webdevExperienceText,
      R,
      resolvedTheme,
      deviceType,
    ]
  );

  const items: HexToggleItem[] = [
    {
      id: 'cv-download',
      title: dict.pages.webdev.resume,
      label: dict.pages.webdev.resume,
      icon: FaFileDownload,
      sizeFactor: 1.2,
      iconScale: '40%',
      labelSizeFactor: lang === 'es' ? 0.9 : 0.7,
      labelElevation: 0.2,
      toggleable: false,
      soundMuted: 'hover',
      showLabelOnToggled: true,
      onClick: () => {
        show({ child: <Resume /> });
        setOpenTab('landing');
      },
    },
    {
      id: 'experience',
      title: dict.pages.webdev.experienceButton,
      label: dict.pages.webdev.experienceButton,
      icon: BiSolidBriefcase,
      sizeFactor: 1.2,
      iconScale: '50%',
      labelSizeFactor: 1,
      labelElevation: 0.2,
      toggleable: true,
      soundMuted: 'hover',
      showLabelOnToggled: true,
      onClick: () => {
        setOpenTab((prev) =>
          prev !== 'experience' ? 'experience' : 'landing'
        );
      },
      children: [
        {
          id: 'invasion-tours',
          title: 'Invasion Tours Project',
          label: 'Invasion<br/>Tours',
          sizeFactor: 1,
          icon: FaPlane,
          iconScale: '50%',
          labelSizeFactor: 0.8,
          soundMuted: 'hover',
          hiddenBorders: false,
          showLabelOnToggled: true,
          onClick: () => {
            modalFunction({
              child: (
                <PageModal>
                  <InvasionTours />
                </PageModal>
              ),
              info: 'pages.webdev.invasionToursInfo',
            });
          },
        },
        {
          id: 'starcards',
          title: 'StarCards Project',
          label: 'StarCards',
          sizeFactor: 1,
          icon: StarcraftSvg,
          iconScale: '47%',
          labelSizeFactor: 1,
          labelElevation: 0.2,
          soundMuted: 'hover',
          hiddenBorders: false,
          showLabelOnToggled: true,
          onClick: () => {
            modalFunction({
              child: (
                <PageModal>
                  <StarCards />
                </PageModal>
              ),
              info: 'pages.webdev.starcardsInfo',
            });
          },
        },
      ],
    },
  ];

  useEffect(() => {
    const modalItems = items.find((it) => it.id === activeCarouselId)?.children;

    if (modalItems) setModalItems(modalItems);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, activeCarouselId, setModalItems]);

  if (!qrToCenter) return null;

  const content = landingContent[openTab];
  const mainTextPosition = content.position;

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={openTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          <BackgroundedElement
            as="article"
            className={cn(
              'absolute -translate-1/2 px-[0%] py-[0%] text-center',
              content.className
            )}
            style={{
              top: mainTextPosition.top,
              left: mainTextPosition.left,
              width: {
                web: `${R * 22}px`,
                medium: `${R * 20}px`,
                mobile: `${R * 15}px`,
              }[deviceType],
            }}
          >
            <Text
              variant="text"
              size={content.textSize}
              scale={content.textScale}
              boldColorOnly={content.boldColorOnly}
              className={content.textClassName}
              colors={MAIN_TEXT_COLORS[resolvedTheme ?? 'light']}
              weightDelta={resolvedTheme === 'light' ? 100 : 0}
            >
              {content.text}
            </Text>
          </BackgroundedElement>
        </motion.div>
      </AnimatePresence>
      <HexToggleBar
        items={items}
        position={globalPositions.webdevButtons}
        orientation="flat"
        sizeFactor={1}
        childrenMaxShown={{ web: 3, medium: 3, mobile: 1 }[deviceType]}
        childrenSizeFactor={1}
        centerAtom={activeKeyAtom}
      />
    </>
  );
}
