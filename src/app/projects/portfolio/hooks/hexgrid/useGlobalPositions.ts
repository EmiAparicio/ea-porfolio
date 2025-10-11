import useWindowSize from '@portfolio/hooks/useWindowSize';
import { Axial } from '@portfolio/types/hexgrid';
import { DeviceType } from '@portfolio/types/window';

type Positions = Record<string, Axial>;

export const OUTSIDE_POSITION: Axial = { q: 9999, r: 9999 };

const POSITIONS = {
  mobile: {
    outside: OUTSIDE_POSITION,
    langToggle: { q: 0, r: 7 },
    themeToggle: { q: -1, r: 9 },
    mainMenu: { q: -7, r: 8 },
    copiedMail: { q: -3, r: 8 },
    landingTitle: { q: 4, r: -8 },
    landingText: { q: 1, r: -2 },
    webdevLandingText: { q: 1, r: -2 },
    webdevExperienceText: { q: 1, r: -2 },
    webdevButtons: { q: 1, r: 3 },
    gamingLandingText: { q: 1, r: -2 },
    gamingOblivionText: { q: 1, r: -2 },
    gamingButtons: { q: 1, r: 3 },
    engLandingText: { q: 1, r: -2 },
    engButtons: { q: 1, r: 3 },
  },
  medium: {
    outside: OUTSIDE_POSITION,
    langToggle: { q: -1, r: 9 },
    themeToggle: { q: 1, r: 9 },
    mainMenu: { q: -9, r: 8 },
    copiedMail: { q: -4, r: 8 },
    landingTitle: { q: 4, r: -8 },
    landingText: { q: 1, r: -2 },
    webdevLandingText: { q: 1, r: -2 },
    webdevExperienceText: { q: 1, r: -2 },
    webdevButtons: { q: 1, r: 3 },
    gamingLandingText: { q: 1, r: -2 },
    gamingOblivionText: { q: 1, r: -2 },
    gamingButtons: { q: 1, r: 3 },
    engLandingText: { q: 1, r: -2 },
    engButtons: { q: 1, r: 3 },
  },
  web: {
    outside: OUTSIDE_POSITION,
    langToggle: { q: -14, r: 7 },
    themeToggle: { q: -7, r: -7 },
    mainMenu: { q: -10, r: 0 },
    copiedMail: { q: 5, r: 6 },
    landingTitle: { q: 6, r: -6 },
    landingText: { q: 3, r: 0 },
    webdevLandingText: { q: 3, r: 0 },
    webdevExperienceText: { q: 3, r: 0 },
    webdevButtons: { q: 1, r: 4 },
    gamingLandingText: { q: 3, r: 0 },
    gamingOblivionText: { q: 3, r: 0 },
    gamingButtons: { q: 1, r: 4 },
    engLandingText: { q: 3, r: 0 },
    engButtons: { q: 1, r: 4 },
  },
} satisfies Record<DeviceType, Positions>;

export type PositionKeyType = keyof typeof POSITIONS.web;

type GlobalPositionKey = keyof (typeof POSITIONS)[DeviceType];

type CommonKeys = keyof (typeof POSITIONS)['mobile'] &
  keyof (typeof POSITIONS)['medium'] &
  keyof (typeof POSITIONS)['web'];

export function useGlobalPositions(): Positions;
export function useGlobalPositions(key: CommonKeys): Axial;
export function useGlobalPositions(key: GlobalPositionKey): Axial | undefined;

export function useGlobalPositions(
  key?: GlobalPositionKey
): Positions | Axial | undefined {
  const { deviceType } = useWindowSize();

  if (!key) return POSITIONS[deviceType];
  return POSITIONS[deviceType][key];
}
