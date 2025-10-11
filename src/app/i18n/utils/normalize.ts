import { SUPPORTED_BASES, DEFAULT_BASE, type LocaleBase } from './constants';

/**
 * Extracts the base language code from a full locale string.
 * For example, 'en-US' becomes 'en'. It's case-insensitive.
 * @param input The full locale string (e.g., 'en-US', 'es-AR').
 * @returns The base language code (e.g., 'en', 'es').
 */
export function baseOf(input?: string | null): string {
  return (input || '').toLowerCase().split('-')[0];
}

/**
 * Normalizes a given locale string to a supported base language.
 * It extracts the base language and returns it if supported,
 * otherwise it falls back to the default application language.
 * @param input The full locale string (e.g., 'en-US', 'fr-FR').
 * @returns A supported language code, guaranteed to be 'en' or 'es'.
 */
export function normalizeBase(input?: string | null): LocaleBase {
  const base = baseOf(input);
  return (
    SUPPORTED_BASES.has(base as LocaleBase) ? base : DEFAULT_BASE
  ) as LocaleBase;
}
