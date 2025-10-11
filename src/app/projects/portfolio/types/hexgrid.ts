export interface Axial {
  q: number;
  r: number;
}

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
