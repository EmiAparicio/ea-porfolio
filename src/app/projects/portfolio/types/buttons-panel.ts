import { Axial } from '@portfolio/types/hexgrid';

export type Dir = 1 | 2 | 3 | 4 | 5 | 6;

export type HexScheme = 'flat' | 'pointy';

export interface PixelPos {
  left: number;
  top: number;
}

export type QrToCenter = (qr: Axial) => PixelPos;


