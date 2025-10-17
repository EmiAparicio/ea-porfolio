import type { NextResponse } from 'next/server';
import { COOKIE_LANG, type LocaleBase } from './constants';

/**
 * Sets the language preference cookie on a given NextResponse object.
 * This function mutates the response object by adding a `Set-Cookie` header.
 * @param res The NextResponse object to modify.
 * @param lang The language code ('en' or 'es') to set.
 */
export function setLangCookieOnResponse(res: NextResponse, lang: LocaleBase) {
  res.cookies.set(COOKIE_LANG, lang, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });
}
