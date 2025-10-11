'use client';

import { hexRadiusAtom } from '@portfolio/atoms/hexGridAtoms';
import {
  HexGridBackgroundValues
} from '@portfolio/components/HexGridBackground/HexGridBackground';
import useWindowSize from '@portfolio/hooks/useWindowSize';
import { useAtomValue } from '@portfolio/lib/jotai';
import { DeviceType } from '@portfolio/types/window';
import { useTheme } from 'next-themes';

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

export type HexProps = {
  gridBackgroundValues: HexGridBackgroundValues;
};

/**
 * A custom hook that provides a fully resolved configuration for the hexagonal grid background and its effects.
 * The values are computed based on the current device type and the resolved theme.
 *
 * @returns {HexProps} An object containing the grid background values and the props for each effect.
 */
export function useHexBgProps(): HexProps {
  const { deviceType } = useWindowSize();
  const { resolvedTheme } = useTheme();

  const R = useAtomValue(hexRadiusAtom);
  const stroke = BACKGROUND_DEVICE_VALUES[deviceType].stroke * R;
  const gridBackgroundValues = {
    ...BACKGROUND_DEVICE_VALUES[deviceType],
    stroke,
  };

  return { gridBackgroundValues };
}
