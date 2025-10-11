import { LocaleBase, SUPPORTED_BASES } from '@i18n/utils/constants';
import { setLangCookieOnResponse } from '@i18n/utils/cookies';
import { negotiateFromRequest } from '@i18n/utils/negotiation';
import { normalizeBase } from '@i18n/utils/normalize';
import { NextResponse, type NextRequest } from 'next/server';

const KNOWN_SUBPATHS = new Set(['webdev', 'gaming', 'bioengineering']);

/**
 * Normalizes a pathname by removing duplicate and trailing slashes.
 * @param pathname The raw pathname string.
 * @returns The cleaned pathname.
 * @internal
 */
function cleanPath(pathname: string) {
  const s = pathname.replace(/\/+/g, '/');
  return s !== '/' ? s.replace(/\/$/, '') : '/';
}

/**
 * The main middleware for handling internationalization routing.
 * It performs the following tasks:
 * 1. Skips execution for static assets, API routes, and files.
 * 2. Redirects paths without a language prefix (e.g., `/about`) to a localized
 * path (e.g., `/en/about`) based on language negotiation.
 * 3. Synchronizes the `NEXT_LOCALE` cookie with the language in the URL.
 * 4. Redirects any unknown subpaths (e.g., `/en/unknown-page`) to the
 * language's home page (e.g., `/en`).
 * @param req The incoming `NextRequest` object.
 */
export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    /\.[\w]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const path = cleanPath(pathname);
  const segs = path.split('/').filter(Boolean);
  const first: LocaleBase | undefined = segs[0] as LocaleBase | undefined;

  if (!first || !SUPPORTED_BASES.has(first)) {
    const lang = negotiateFromRequest(req);
    const url = req.nextUrl.clone();
    url.pathname = `/${lang}${path === '/' ? '' : path}`;
    url.search = search;
    const res = NextResponse.redirect(url);
    setLangCookieOnResponse(res, lang);
    return res;
  }

  const res = NextResponse.next();
  const cookieLang = req.cookies.get('NEXT_LOCALE')?.value ?? null;
  if (cookieLang !== first) {
    setLangCookieOnResponse(res, normalizeBase(first));
  }

  const hasSubpath = segs.length > 1;
  if (hasSubpath && !KNOWN_SUBPATHS.has(segs[1])) {
    const home = req.nextUrl.clone();
    home.pathname = `/${first}`;
    home.search = '';
    return NextResponse.redirect(home);
  }

  return res;
}

export const config = {
  matcher: ['/:path*'],
};
