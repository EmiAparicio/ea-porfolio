export interface Axial {
  q: number;
  r: number;
}

export type Ripple = {
  cx: number;
  cy: number;
  reach: number;
  born: number;
};

export type RipplePhysics = {
  rings: number;
  ringWidth: number;
  durationSec: number;
  stagger: number;
  minRingSeparationPx?: number;
  reachFactor: number;
  maxRadiusPx?: number;
  falloffExp: number;
  startFadePct: number;
  endFadePct: number;
};

export type CreateImageBitmapFn = (
  image: ImageBitmapSource
) => Promise<ImageBitmap>;

export type HexGridParamsSnapshot = {
  W: number;
  H: number;
  R: number;
  stepX: number;
  stepY: number;
  offsetSecondary: number;
  centerX: number;
  centerY: number;
  centerShiftX: number;
  centerShiftY: number;
  iStart: number;
  iEnd: number;
  jStart: number;
  jEnd: number;
  qOffset: number;
  rOffset: number;
};

export type OmitSafe<T, K extends PropertyKey> = Omit<T, Extract<K, keyof T>>;

export type HexSpec = {
  x: number;
  y: number;
  r: number;
  rotation: number;
};