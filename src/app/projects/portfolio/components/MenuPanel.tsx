'use client';

import { useLang } from '@i18n/client';
import { activeKeyAtom } from '@portfolio/atoms/sectionsAtoms';
import HexButton from '@portfolio/components/HexButton/HexButton';
import { HexButtonsPanel } from '@portfolio/components/HexButtonsPanel';
import { MenuSvg } from '@portfolio/components/Svg/MenuSvg';
import { useGlobalPositions } from '@portfolio/hooks/hexgrid/useGlobalPositions';
import { useQrToCenter } from '@portfolio/hooks/hexgrid/useQrToCenter';
import { useCopyToast } from '@portfolio/hooks/useCopyToast';
import useWindowSize from '@portfolio/hooks/useWindowSize';
import { useSetAtom } from '@portfolio/lib/jotai';
import { Dir, PanelRoot } from '@portfolio/types/buttons-panel';
import { BiLogoGmail } from 'react-icons/bi';
import { BsLinkedin } from 'react-icons/bs';
import { FaGithub } from 'react-icons/fa';
import {
  GiBrain,
  GiConsoleController,
  GiDna1,
  GiLaptop,
  GiTechnoHeart,
} from 'react-icons/gi';

/**
 * Renders the main menu panel with hexagonal buttons.
 * This component defines the structure and behavior of the main navigation menu,
 * including sections for skills and contact information.
 *
 * @returns A JSX element representing the main menu panel.
 */
export function MenuPanel() {
  const copy = useCopyToast();
  const { dict, lang } = useLang();
  const { deviceType } = useWindowSize();
  const copiedMailPosition = useQrToCenter(useGlobalPositions('copiedMail'));
  const isEN = lang === 'en';
  const setSectionId = useSetAtom(activeKeyAtom);

  const root: PanelRoot = {
    id: 'root',
    as: HexButton,
    props: {
      title: 'Menu',
      icon: MenuSvg,
      iconScale: '40%',
      label: dict.menu.labels.menu,
      size: 'big',
      toggleable: true,
      onToggle: (next) => {
        if (!next) setSectionId(null);
      },
      labelSizeFactor: 0.6,
      labelElevation: 0.2,
      isMain: true,
      showLabelOnInteract: deviceType === 'web',
    },
    children: [
      {
        position: { web: 1, medium: 1, mobile: 1 }[deviceType] as Dir,
        node: {
          id: 'Skills',
          as: HexButton,
          props: {
            title: 'Skills',
            label: dict.menu.labels.skills.main,
            icon: GiBrain,
            size: 'big',
            iconScale: '50%',
            labelSizeFactor: isEN ? 0.55 : 1,
            labelElevation: 0.2,
            toggleable: true,
            onToggle: (next) => {
              if (!next) setSectionId(null);
            },
            showLabelOnInteract: deviceType === 'web',
          },
          children: [
            {
              position: { web: 1, medium: 6, mobile: 6 }[deviceType] as Dir,
              node: {
                kind: 'branch',
                branch: 'three',
                children: [
                  {
                    id: 'GameDesign',
                    as: HexButton,
                    url: '/gaming',
                    props: {
                      title: 'Game Design',
                      label: dict.menu.labels.skills.gaming,
                      labelSizeFactor: 0.7,
                      icon: GiConsoleController,
                      size: 'small',
                      sizeFactor: 1.1,
                      labelElevation: 0.25,
                      iconScale: '50%',
                      toggleable: true,
                      onToggle: (next) => {
                        if (next) setSectionId(null);
                      },
                      showLabelOnInteract: deviceType === 'web',
                      showLabelOnToggled: true,
                    },
                  },
                  {
                    id: 'WebDev',
                    as: HexButton,
                    url: '/webdev',
                    props: {
                      title: 'Web Dev',
                      label: dict.menu.labels.skills.webdev,
                      labelSizeFactor: isEN ? 0.8 : 0.9,
                      icon: GiLaptop,
                      size: 'small',
                      sizeFactor: 1.1,
                      labelElevation: 0.25,
                      iconScale: '45%',
                      toggleable: true,
                      onToggle: (next) => {
                        if (next) setSectionId(null);
                      },
                      showLabelOnInteract: deviceType === 'web',
                      showLabelOnToggled: true,
                    },
                  },
                  {
                    id: 'Engineering',
                    as: HexButton,
                    url: '/bioengineering',
                    props: {
                      title: 'Engineering',
                      label: dict.menu.labels.skills.eng,
                      labelSizeFactor: isEN ? 0.95 : 0.85,
                      icon: GiDna1,
                      size: 'small',
                      sizeFactor: 1.1,
                      iconScale: '50%',
                      labelElevation: 0.25,
                      toggleable: true,
                      onToggle: (next) => {
                        if (next) setSectionId(null);
                      },
                      showLabelOnInteract: deviceType === 'web',
                      showLabelOnToggled: true,
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      {
        position: { web: 3, medium: 2, mobile: 2 }[deviceType] as Dir,
        node: {
          id: 'Contact',
          as: HexButton,
          props: {
            title: 'Contact',
            label: dict.menu.labels.contact.main,
            icon: GiTechnoHeart,
            size: 'big',
            iconScale: '48%',
            labelElevation: 0.2,
            labelSizeFactor: 0.8,
            toggleable: true,
            showLabelOnInteract: deviceType === 'web',
          },
          children: [
            {
              position: { web: 3, medium: 2, mobile: 2 }[deviceType] as Dir,
              node: {
                kind: 'branch',
                branch: 'three',
                children: [
                  {
                    id: 'GitHub',
                    as: HexButton,
                    props: {
                      title: 'GitHub',
                      label: 'GitHub',
                      labelSizeFactor: 0.6,
                      icon: FaGithub,
                      size: 'small',
                      sizeFactor: 1.1,
                      labelElevation: 0.25,
                      iconScale: '45%',
                      href: 'https://github.com/EmiAparicio',
                      showLabelOnInteract: deviceType === 'web',
                    },
                  },
                  {
                    id: 'Gmail',
                    as: HexButton,
                    props: {
                      title: 'Gmail',
                      label: 'Email',
                      labelSizeFactor: 0.5,
                      icon: BiLogoGmail,
                      size: 'small',
                      sizeFactor: 1.1,
                      labelElevation: 0.25,
                      iconScale: '50%',
                      onClick: () => {
                        copy({
                          text: 'emilianojaparicio@gmail.com',
                          message: dict.menu.email,
                          top: copiedMailPosition.top,
                          left: copiedMailPosition.left,
                          duration: 1800,
                        });
                      },
                      showLabelOnInteract: deviceType === 'web',
                    },
                  },
                  {
                    id: 'LinkedIn',
                    as: HexButton,
                    props: {
                      title: 'LinkedIn',
                      label: 'LinkedIn',
                      labelSizeFactor: 0.8,
                      icon: BsLinkedin,
                      size: 'small',
                      sizeFactor: 1.1,
                      labelElevation: 0.25,
                      iconScale: '40%',
                      href: 'https://www.linkedin.com/in/emiliano-aparicio-8b9757236/',
                      showLabelOnInteract: deviceType === 'web',
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    ],
  };

  const rootOrigin = useGlobalPositions('mainMenu');

  return <HexButtonsPanel scheme="flat" root={root} rootOrigin={rootOrigin} />;
}
