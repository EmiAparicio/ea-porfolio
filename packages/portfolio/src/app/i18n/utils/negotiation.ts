import type { NextRequest } from 'next/server';
import { DEFAULT_BASE, SUPPORTED_BASES, type LocaleBase } from './constants';
import { baseOf } from './normalize';

/**
 * Negotiates the best supported language from an `Accept-Language` HTTP header string.
 * It parses language tags and their quality values (q-factors) to find the best match.
 * @param header The `Accept-Language` header string (e.g., 'en-US,en;q=0.9,es;q=0.8').
 * @returns The best supported `LocaleBase` or the default language if no match is found.
 */
function negotiateFromHeader(header: string | null | undefined): LocaleBase {
  const entries = (header || '')
    .split(',')
    .map((s) => s.trim())
    .map((entry) => {
      const [tag, ...params] = entry.split(';').map((x) => x.trim());
      const base = baseOf(tag);
      let q = 1;
      for (const p of params) {
        if (p.startsWith('q=')) {
          const v = Number(p.slice(2));
          if (!Number.isNaN(v)) q = v;
        }
      }
      return { base, q };
    })
    .filter((it) => SUPPORTED_BASES.has(it.base as LocaleBase))
    .sort((a, b) => b.q - a.q);

  return (entries[0]?.base as LocaleBase) || DEFAULT_BASE;
}

/**
 * Negotiates the user's preferred language from an incoming `NextRequest`.
 * It prioritizes the `NEXT_LOCALE` cookie and falls back to the `accept-language` header.
 * @param req The incoming `NextRequest` object.
 * @returns The determined language code ('en' or 'es').
 */
export function negotiateFromRequest(req: NextRequest): LocaleBase {
  const cookieLang = req.cookies.get('NEXT_LOCALE')?.value ?? null;
  if (cookieLang) {
    const b = baseOf(cookieLang);
    if (SUPPORTED_BASES.has(b as LocaleBase)) return b as LocaleBase;
  }
  const header = req.headers.get('accept-language');
  return negotiateFromHeader(header);
}

/**
 * Negotiates the best supported language from an `Accept-Language` HTTP header string.
 * This is a public wrapper for the internal negotiation logic.
 * @param header The `Accept-Language` header string.
 * @returns The best supported `LocaleBase` or the default language if no match is found.
 */
export function negotiateFromHeaderString(
  header: string | null | undefined
): LocaleBase {
  return negotiateFromHeader(header);
}
