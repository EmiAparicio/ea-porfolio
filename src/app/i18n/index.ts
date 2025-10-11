import type { Dict, Locale } from './types';

const loaders = {
  es: () => import('./dictionaries/es').then((m) => m.default),
  en: () => import('./dictionaries/en').then((m) => m.default),
} as const;

/**
 * Asynchronously loads and returns the dictionary for a specified locale.
 * This uses dynamic imports to only load the language file that is needed.
 * @param locale The locale of the dictionary to retrieve ('en' or 'es').
 * @returns A promise that resolves to the dictionary object.
 */
export async function getDictionary(locale: Locale): Promise<Dict> {
  return loaders[locale]() as Promise<Dict>;
}
