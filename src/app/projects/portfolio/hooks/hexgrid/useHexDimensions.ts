import { odd } from '@portfolio/utils/hexgrid/math';

/**
 * A custom hook that calculates the dimensions of a hexagonal shape.
 * It adjusts the size based on a base radius, orientation, and a size modifier.
 * The dimensions are rounded or adjusted to an odd number for specific rendering needs.
 *
 * @param {number} baseRadius The base radius of the hexagon.
 * @param {'flat' | 'pointy'} orientation The orientation of the hexagon.
 * @param {'small' | 'big'} size The size modifier for the hexagon.
 * @param {number} [sizeFactor=1] An additional factor to scale the size.
 * @returns {{width: number; height: number; rScaled: number;}} An object containing the calculated width, height, and scaled radius.
 */
export function useHexDimensions(
  baseRadius: number,
  orientation: 'flat' | 'pointy',
  size: 'small' | 'big',
  sizeFactor: number = 1
) {
  const scale = (size === 'big' ? 1.5 : 1) * sizeFactor;
  const r = baseRadius * scale;
  const sqrt3 = Math.sqrt(3);
  let w = orientation === 'pointy' ? sqrt3 * r : 2 * r;
  let h = orientation === 'pointy' ? 2 * r : sqrt3 * r;
  if (size === 'big') {
    w = odd(w);
    h = odd(h);
  } else {
    w = Math.round(w);
    h = Math.round(h);
  }
  return { width: w, height: h, rScaled: r };
}
