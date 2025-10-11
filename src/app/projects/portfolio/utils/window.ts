import { DeviceType } from '@portfolio/types/window';

/**
 * Computes device type from aspect ratio and breakpoints.
 */
export function computeDeviceType(
  w: number,
  h: number,
  bp: { web: number; medium: number }
): DeviceType {
  const aspect = w / Math.max(1, h);
  if (aspect >= bp.web) return 'web';
  if (aspect >= bp.medium) return 'medium';
  return 'mobile';
}
