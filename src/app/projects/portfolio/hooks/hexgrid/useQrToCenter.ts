import { qrToCenterAtom } from '@portfolio/atoms/hexGridAtoms';
import { OUTSIDE_POSITION } from '@portfolio/hooks/hexgrid/useGlobalPositions';
import { PixelPos, QrToCenter } from '@portfolio/types/buttons-panel';
import { Axial } from '@portfolio/types/hexgrid';
import { useAtomValue } from '@portfolio/lib/jotai';

/**
 * A custom hook to convert axial coordinates (qr) to pixel coordinates.
 * It uses a Jotai atom to access the current `qrToCenter` function.
 *
 * @returns {QrToCenter | null} The `qrToCenter` function, or `null` if not available.
 */
export function useQrToCenter(): QrToCenter | null;
/**
 * A custom hook to convert specific axial coordinates (qr) to pixel coordinates.
 *
 * @param {Axial} props The axial coordinates to convert.
 * @returns {PixelPos} The corresponding pixel coordinates, or `OUTSIDE_POSITION` if the conversion function is not available.
 */
export function useQrToCenter(props: Axial): PixelPos;

/**
 * A custom hook to convert axial coordinates (qr) to pixel coordinates using a Jotai atom.
 * It can be called without arguments to get the conversion function itself, or with
 * axial coordinates to get the corresponding pixel position.
 *
 * @param {Axial} [props] The axial coordinates to convert.
 * @returns {QrToCenter | PixelPos | null} The conversion function, or the pixel position, or `null`.
 */
export function useQrToCenter(props?: Axial) {
  const qrToCenter = useAtomValue(qrToCenterAtom);

  if (!props) {
    return qrToCenter ?? null;
  }
  return qrToCenter ? qrToCenter(props) : OUTSIDE_POSITION;
}
