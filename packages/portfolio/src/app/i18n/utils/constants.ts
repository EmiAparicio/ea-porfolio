export type LocaleBase = 'en' | 'es';

export const SUPPORTED_BASES = new Set<LocaleBase>(['en', 'es']);
export const DEFAULT_BASE: LocaleBase = 'en';

export const COOKIE_LANG = 'NEXT_LOCALE';
