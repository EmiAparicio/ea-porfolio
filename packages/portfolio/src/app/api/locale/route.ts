import { NextResponse } from 'next/server';

type Locale = 'es' | 'en';

/**
 * API route handler to set the user's preferred language.
 * It expects a JSON body with a `lang` property ('es' or 'en').
 * If the language is valid, it sets the `NEXT_LOCALE` cookie.
 * @param req The incoming `Request` object from Next.js.
 * @returns A `NextResponse` indicating success or failure.
 */
export async function POST(req: Request) {
  const { lang } = (await req.json()) as { lang?: Locale };

  if (lang !== 'es' && lang !== 'en') {
    return NextResponse.json(
      { ok: false, error: 'invalid lang' },
      { status: 400 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('NEXT_LOCALE', lang, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });
  return res;
}
