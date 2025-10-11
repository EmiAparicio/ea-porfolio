import type { LocaleBase } from './constants';
import { SUPPORTED_BASES } from './constants';

/**
 * Replaces the language segment of a URL pathname with a new language.
 * For example, it can turn `/en/about` into `/es/about`. It also handles
 * root paths or paths without a language prefix.
 * @param pathname The current URL pathname (e.g., '/en/projects').
 * @param next The target language code (e.g., 'es').
 * @param current The current language code to be replaced (e.g., 'en').
 * @returns The new pathname string with the language updated.
 */
export function replaceLangInPath(
  pathname: string | null,
  next: LocaleBase,
  current: LocaleBase
): string {
  const path = pathname || `/${current}`;
  const parts = path.split('/');

  if (parts.length > 1) {
    if (parts[1] === current) {
      parts[1] = next;
      return parts.join('/') || `/${next}`;
    }
    if (!SUPPORTED_BASES.has(parts[1] as LocaleBase)) {
      return `/${next}${path.startsWith('/') ? '' : '/'}${path.replace(
        /^\/+/,
        ''
      )}`;
    }
  }
  return `/${next}`;
}
