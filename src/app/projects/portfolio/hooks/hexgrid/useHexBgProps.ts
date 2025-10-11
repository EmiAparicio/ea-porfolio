'use client';

import { hexRadiusAtom } from '@portfolio/atoms/hexGridAtoms';
import {
  HexGridBackgroundValues,
  StripHexGridProps,
} from '@portfolio/components/HexGridBackground/HexGridBackground';
import { HexGridClickRippleProps } from '@portfolio/components/HexGridBackground/components/HexGridClickRipple';
import { HexGridCursorRevealProps } from '@portfolio/components/HexGridBackground/components/HexGridCursorReveal';
import { HexGridDragSparksProps } from '@portfolio/components/HexGridBackground/components/HexGridDragSparks';
import { HexGridLightProps } from '@portfolio/components/HexGridBackground/components/HexGridLight';
import { HexGridPerimeterLightProps } from '@portfolio/components/HexGridBackground/components/HexGridPerimeterLight';
import useWindowSize from '@portfolio/hooks/useWindowSize';
import { ThemeMode } from '@portfolio/providers/AppThemeProvider';
import { DeviceType } from '@portfolio/types/window';
import { useAtomValue } from '@portfolio/lib/jotai';
import { useTheme } from 'next-themes';
import { useMemo } from 'react';

/**
 * Defines the base hexagonal grid values for different device types.
 *
 * @constant
 * @type {Record<DeviceType, HexGridBackgroundValues>}
 */
export const BACKGROUND_DEVICE_VALUES: Record<
  DeviceType,
  HexGridBackgroundValues
> = {
  mobile: {
    stroke: 0.06,
    minCols: 9,
    minRows: 19,
    maxHexRadius: 32,
  },
  medium: {
    stroke: 0.07,
    minCols: 13,
    minRows: 21,
    maxHexRadius: 42,
  },
  web: {
    stroke: 0.07,
    minCols: 23,
    minRows: 15,
    maxHexRadius: 42,
  },
};

/**
 * Defines the color and other properties for various grid effects based on the theme.
 *
 * @constant
 */
const EFFECTS_COLORS: {
  gridClickRipple: Record<ThemeMode, { color: string }>;
  gridCursorReveal: Record<ThemeMode, { color: string }>;
  gridDragSparks: Record<ThemeMode, { color: string; gridColor: string }>;
  gridLight: Record<ThemeMode, { gridColor: string; flareColor: string }>;
  gridPerimeter: Record<
    ThemeMode,
    {
      gridColor: string;
      alpha: number;
      glowRadiusFactor: number;
      glowCoreFactor: number;
      glowFeatherFactor: number;
    }
  >;
} = {
  gridClickRipple: {
    light: { color: '#000a0a' },
    dark: { color: '#00ff9f' },
    system: { color: '#00ff9f' },
  },
  gridCursorReveal: {
    light: { color: '#0e6e5020' },
    dark: { color: '#089d6e09' },
    system: { color: '#089d6e09' },
  },
  gridDragSparks: {
    light: { color: '#f2f5f4', gridColor: '#01ba7575' },
    dark: { color: '#01bb75', gridColor: '#089d6e15' },
    system: { color: '#01bb75', gridColor: '#089d6e15' },
  },
  gridLight: {
    light: { gridColor: '#01ba75', flareColor: 'rgba(255,255,255,0.08)' },
    dark: { gridColor: '#089d6e15', flareColor: 'rgba(255,255,255,0.02)' },
    system: { gridColor: '#089d6e15', flareColor: 'rgba(255,255,255,0.02)' },
  },
  gridPerimeter: {
    light: {
      gridColor: '#000a0a',
      alpha: 0.25,
      glowRadiusFactor: 3,
      glowCoreFactor: 0.1,
      glowFeatherFactor: 5,
    },
    dark: {
      gridColor: '#089d6e',
      alpha: 0.15,
      glowRadiusFactor: 3,
      glowCoreFactor: 0.1,
      glowFeatherFactor: 5,
    },
    system: {
      gridColor: '#089d6e',
      alpha: 0.15,
      glowRadiusFactor: 3,
      glowCoreFactor: 0.1,
      glowFeatherFactor: 5,
    },
  },
};

export type HexEffectsFx = {
  clickRippleProps: StripHexGridProps<HexGridClickRippleProps>;
  cursorRevealProps: StripHexGridProps<HexGridCursorRevealProps>;
  dragSparksProps: StripHexGridProps<HexGridDragSparksProps>;
  lightProps: StripHexGridProps<HexGridLightProps>;
  perimeterProps: StripHexGridProps<HexGridPerimeterLightProps>;
};

export type HexProps = HexEffectsFx & {
  gridBackgroundValues: HexGridBackgroundValues;
};

/**
 * A utility function to pick a value from a map based on the device type.
 *
 * @template T - The type of the value to pick.
 * @param {Record<DeviceType, T>} map The map of values keyed by device type.
 * @param {DeviceType} d The current device type.
 * @returns {T} The value corresponding to the current device type.
 */
const pick = <T>(map: Record<DeviceType, T>, d: DeviceType): T => map[d];

/**
 * A custom hook that provides a fully resolved configuration for the hexagonal grid background and its effects.
 * The values are computed based on the current device type and the resolved theme.
 *
 * @returns {HexProps} An object containing the grid background values and the props for each effect.
 */
export function useHexBgProps(): HexProps {
  const { deviceType } = useWindowSize();
  const { resolvedTheme } = useTheme();
  const theme = (resolvedTheme ?? 'dark') as ThemeMode;

  const R = useAtomValue(hexRadiusAtom);
  const stroke = BACKGROUND_DEVICE_VALUES[deviceType].stroke * R;
  const gridBackgroundValues = {
    ...BACKGROUND_DEVICE_VALUES[deviceType],
    stroke,
  };

  const cfg = useMemo<HexEffectsFx>(() => {
    const hexGridClickRippleProps = pick<
      StripHexGridProps<HexGridClickRippleProps>
    >(
      {
        mobile: {
          color: EFFECTS_COLORS['gridClickRipple'][theme].color,
          stroke,
          rings: 3,
          ringWidth: 0.36 * R,
          durationSec: 1.5,
          stagger: 0.08,
          reachFactor: 0.55,
          maxRadiusPx: 7 * R,
          minRingSeparationPx: undefined,
          falloffExp: 3,
          startFadePct: 0.08,
          endFadePct: 0.12,
          className: undefined,
        },
        medium: {
          color: EFFECTS_COLORS['gridClickRipple'][theme].color,
          stroke,
          rings: 3,
          ringWidth: 0.36 * R,
          durationSec: 1.5,
          stagger: 0.08,
          reachFactor: 0.55,
          maxRadiusPx: 7 * R,
          minRingSeparationPx: undefined,
          falloffExp: 3,
          startFadePct: 0.08,
          endFadePct: 0.12,
          className: undefined,
        },
        web: {
          color: EFFECTS_COLORS['gridClickRipple'][theme].color,
          stroke,
          rings: 3,
          ringWidth: 0.36 * R,
          durationSec: 1.5,
          stagger: 0.08,
          reachFactor: 0.55,
          maxRadiusPx: 7 * R,
          minRingSeparationPx: undefined,
          falloffExp: 3,
          startFadePct: 0.08,
          endFadePct: 0.12,
          className: undefined,
        },
      },
      deviceType
    );

    const hexGridCursorRevealProps = pick<
      StripHexGridProps<HexGridCursorRevealProps>
    >(
      {
        mobile: {
          stroke,
          color: EFFECTS_COLORS['gridCursorReveal'][theme].color,
          radius: 1.5 * R,
          feather: 2.9 * R,
          className: undefined,
        },
        medium: {
          stroke,
          color: EFFECTS_COLORS['gridCursorReveal'][theme].color,
          radius: 1.5 * R,
          feather: 2.9 * R,
          className: undefined,
        },
        web: {
          stroke,
          color: EFFECTS_COLORS['gridCursorReveal'][theme].color,
          radius: 1.5 * R,
          feather: 2.9 * R,
          className: undefined,
        },
      },
      deviceType
    );

    const hexGridDragSparksProps = pick<
      StripHexGridProps<HexGridDragSparksProps>
    >(
      {
        mobile: {
          color: EFFECTS_COLORS['gridDragSparks'][theme].color,
          gridColor: EFFECTS_COLORS['gridDragSparks'][theme].gridColor,
          sparkCount: 10,
          speedScale: 1,
          minSpeed: 160,
          maxSpeed: 400,
          speedSigmaPct: 0.2,
          lifeSec: 0.55,
          lifeSigmaPct: 0.35,
          dragThresholdPx: 0.24 * R,
          cellSize: 1.5 * R,
          angleMinDeg: -30,
          angleMaxDeg: 30,
          lockScrollOnTouch: true,
          stroke,
          revealRadiusPx: 5 * R,
          revealFeatherPx: 2.86 * R,
          revealDecayPerSec: 0,
          sparkRadiusPx: 0.036 * R,
          sparkRadiusSigmaPct: 0.3,
          className: undefined,
        },
        medium: {
          color: EFFECTS_COLORS['gridDragSparks'][theme].color,
          gridColor: EFFECTS_COLORS['gridDragSparks'][theme].gridColor,
          sparkCount: 10,
          speedScale: 1,
          minSpeed: 160,
          maxSpeed: 400,
          speedSigmaPct: 0.2,
          lifeSec: 0.55,
          lifeSigmaPct: 0.35,
          dragThresholdPx: 0.24 * R,
          cellSize: 1.5 * R,
          angleMinDeg: -30,
          angleMaxDeg: 30,
          lockScrollOnTouch: true,
          stroke,
          revealRadiusPx: 5 * R,
          revealFeatherPx: 2.86 * R,
          revealDecayPerSec: 0,
          sparkRadiusPx: 0.036 * R,
          sparkRadiusSigmaPct: 0.3,
          className: undefined,
        },
        web: {
          color: EFFECTS_COLORS['gridDragSparks'][theme].color,
          gridColor: EFFECTS_COLORS['gridDragSparks'][theme].gridColor,
          sparkCount: 10,
          speedScale: 1,
          minSpeed: 160,
          maxSpeed: 400,
          speedSigmaPct: 0.2,
          lifeSec: 0.55,
          lifeSigmaPct: 0.35,
          dragThresholdPx: 0.24 * R,
          cellSize: 1.5 * R,
          angleMinDeg: -30,
          angleMaxDeg: 30,
          lockScrollOnTouch: true,
          stroke,
          revealRadiusPx: 5 * R,
          revealFeatherPx: 2.86 * R,
          revealDecayPerSec: 0,
          sparkRadiusPx: 0.036 * R,
          sparkRadiusSigmaPct: 0.3,
          className: undefined,
        },
      },
      deviceType
    );

    const hexGridLightProps = pick<StripHexGridProps<HexGridLightProps>>(
      {
        mobile: {
          stroke,
          gridColor: EFFECTS_COLORS['gridLight'][theme].gridColor,
          barAngleDeg: 60,
          travelAngleDeg: 120,
          bandWidthPx: 6.5 * R,
          featherPx: 13 * R,
          speedPxPerSec: 21.5 * R,
          repeatDelaySec: 15,
          startDelaySec: 0,
          flareEnabled: true,
          flareStartRatio: 0.3,
          flare1RadiusPx: 6 * R,
          flare2RadiusPx: 3 * R,
          flare1OffsetAlongPx: 3 * R,
          flare2OffsetAlongPx: -1.5 * R,
          flare1OffsetNormalPx: 1 * R,
          flare2OffsetNormalPx: -1 * R,
          flare1Alpha: 0.02 * R,
          flare2Alpha: 0.015 * R,
          flare1Color: EFFECTS_COLORS['gridLight'][theme].flareColor,
          flare2Color: EFFECTS_COLORS['gridLight'][theme].flareColor,
          flareMotionAngleDeg: 100,
          className: undefined,
        },
        medium: {
          stroke,
          gridColor: EFFECTS_COLORS['gridLight'][theme].gridColor,
          barAngleDeg: 60,
          travelAngleDeg: 120,
          bandWidthPx: 6.5 * R,
          featherPx: 13 * R,
          speedPxPerSec: 21.5 * R,
          repeatDelaySec: 15,
          startDelaySec: 0,
          flareEnabled: true,
          flareStartRatio: 0.3,
          flare1RadiusPx: 6 * R,
          flare2RadiusPx: 3 * R,
          flare1OffsetAlongPx: 3 * R,
          flare2OffsetAlongPx: -1.5 * R,
          flare1OffsetNormalPx: 1 * R,
          flare2OffsetNormalPx: -1 * R,
          flare1Alpha: 0.02 * R,
          flare2Alpha: 0.015 * R,
          flare1Color: EFFECTS_COLORS['gridLight'][theme].flareColor,
          flare2Color: EFFECTS_COLORS['gridLight'][theme].flareColor,
          flareMotionAngleDeg: 100,
          className: undefined,
        },
        web: {
          stroke,
          gridColor: EFFECTS_COLORS['gridLight'][theme].gridColor,
          barAngleDeg: 60,
          travelAngleDeg: 120,
          bandWidthPx: 6.5 * R,
          featherPx: 13 * R,
          speedPxPerSec: 21.5 * R,
          repeatDelaySec: 15,
          startDelaySec: 0,
          flareEnabled: true,
          flareStartRatio: 0.3,
          flare1RadiusPx: 6 * R,
          flare2RadiusPx: 3 * R,
          flare1OffsetAlongPx: 3 * R,
          flare2OffsetAlongPx: -1.5 * R,
          flare1OffsetNormalPx: 1 * R,
          flare2OffsetNormalPx: -1 * R,
          flare1Alpha: 0.02 * R,
          flare2Alpha: 0.015 * R,
          flare1Color: EFFECTS_COLORS['gridLight'][theme].flareColor,
          flare2Color: EFFECTS_COLORS['gridLight'][theme].flareColor,
          flareMotionAngleDeg: 100,
          className: undefined,
        },
      },
      deviceType
    );

    const hexGridPerimeterProps = pick<
      StripHexGridProps<HexGridPerimeterLightProps>
    >(
      {
        mobile: {
          gridColor: EFFECTS_COLORS['gridPerimeter'][theme].gridColor,
          stroke,
          alpha: EFFECTS_COLORS['gridPerimeter'][theme].alpha,
          glowRadiusFactor:
            EFFECTS_COLORS['gridPerimeter'][theme].glowRadiusFactor,
          glowCoreFactor: EFFECTS_COLORS['gridPerimeter'][theme].glowCoreFactor,
          glowFeatherFactor:
            EFFECTS_COLORS['gridPerimeter'][theme].glowFeatherFactor,
        },
        medium: {
          gridColor: EFFECTS_COLORS['gridPerimeter'][theme].gridColor,
          stroke,
          alpha: EFFECTS_COLORS['gridPerimeter'][theme].alpha,
          glowRadiusFactor:
            EFFECTS_COLORS['gridPerimeter'][theme].glowRadiusFactor,
          glowCoreFactor: EFFECTS_COLORS['gridPerimeter'][theme].glowCoreFactor,
          glowFeatherFactor:
            EFFECTS_COLORS['gridPerimeter'][theme].glowFeatherFactor,
        },
        web: {
          gridColor: EFFECTS_COLORS['gridPerimeter'][theme].gridColor,
          stroke,
          alpha: EFFECTS_COLORS['gridPerimeter'][theme].alpha,
          glowRadiusFactor:
            EFFECTS_COLORS['gridPerimeter'][theme].glowRadiusFactor,
          glowCoreFactor: EFFECTS_COLORS['gridPerimeter'][theme].glowCoreFactor,
          glowFeatherFactor:
            EFFECTS_COLORS['gridPerimeter'][theme].glowFeatherFactor,
        },
      },
      deviceType
    );

    return {
      clickRippleProps: hexGridClickRippleProps,
      cursorRevealProps: hexGridCursorRevealProps,
      dragSparksProps: hexGridDragSparksProps,
      lightProps: hexGridLightProps,
      perimeterProps: hexGridPerimeterProps,
    };
  }, [deviceType, R, stroke, theme]);

  return { gridBackgroundValues, ...cfg };
}
