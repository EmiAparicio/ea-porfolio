import base from './dictionaries/es';

type WidenStrings<T> = T extends string
  ? string
  : { [K in keyof T]: WidenStrings<T[K]> };

type ReadonlyDeep<T> = {
  readonly [K in keyof T]: T[K] extends object ? ReadonlyDeep<T[K]> : T[K];
};

export type Dict = ReadonlyDeep<WidenStrings<typeof base>>;

export const locales = ['es', 'en'] as const;
export const SUPPORTED_LANGS: string[] = Array.from(locales);
export const SUPPORTED_LANGS_SET = new Set(SUPPORTED_LANGS);
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'es' as const;
