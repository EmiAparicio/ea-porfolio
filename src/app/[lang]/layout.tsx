import '@app/globals.css';
import { LangProvider } from '@i18n/client';
import { LocaleBase } from '@i18n/utils/constants';
import { normalizeBase } from '@i18n/utils/normalize';
import GlobalModal from '@portfolio/components/GlobalModal';
import HexGridReadyBoundary from '@portfolio/components/HexGridBackground/components/HexGridReadyBoundary';
import HexGridBackground from '@portfolio/components/HexGridBackground/HexGridBackground';
import LandingTitle from '@portfolio/components/LandingTitle';
import TechCursor from '@portfolio/components/TechCursor';
import { AppProviders } from '@portfolio/providers';
import { isThenable } from '@portfolio/utils/promise';
import { readThemeCookieServer } from '@portfolio/utils/server';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

const titles: Record<LocaleBase, string> = {
  en: 'Emiliano Aparicio | Engineer & Frontend Developer',
  es: 'Emiliano Aparicio | Ingeniero y Desarrollador Frontend',
};
const descriptions: Record<LocaleBase, string> = {
  en: "Emiliano Aparicio's portfolio: web development with React, game design, bioengineering and prompt engineering.",
  es: 'Portfolio de Emiliano Aparicio: desarrollo web con React, diseño de juegos, bioingeniería y prompt engineering.',
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

type MaybePromiseParams =
  | { params: { lang: string } }
  | { params: Promise<{ lang: string }> };

/**
 * Resolves the language from route parameters, which might be a promise.
 * This is a helper to handle Next.js's generateMetadata and component props patterns.
 * @param p The props object containing the `params`.
 * @returns A promise that resolves to the normalized language code (`'en'` or `'es'`).
 */
async function resolveLangFromProps(
  p: MaybePromiseParams
): Promise<LocaleBase> {
  const raw = isThenable<{ lang: string }>(p.params)
    ? (await p.params).lang
    : p.params.lang;
  return normalizeBase(raw);
}

/**
 * Generates dynamic page metadata based on the current language.
 * This function is used by Next.js to set the `<title>`, `<meta>` tags, etc.
 * in the document's `<head>`.
 * @param props The props containing the route parameters.
 * @returns A promise that resolves to the `Metadata` object for the page.
 */
export async function generateMetadata(
  props: MaybePromiseParams
): Promise<Metadata> {
  const lang = await resolveLangFromProps(props);

  return {
    title: titles[lang],
    description: descriptions[lang],
    manifest: '/manifest.webmanifest',
    icons: {
      icon: [{ url: '/favicons/favicon.ico' }],
      apple: [{ url: '/favicons/apple-icon.png' }],
    },
    alternates: {
      canonical: `/${lang}`,
      languages: { en: '/en', es: '/es' },
    },
    openGraph: {
      title: titles[lang],
      description: descriptions[lang],
      url: `${siteUrl}/${lang}`,
      siteName: 'Emiliano Aparicio Portfolio',
      locale: lang === 'en' ? 'en_US' : 'es_ES',
      type: 'website',
    },
    other: {
      'apple-mobile-web-app-title': 'EA-Portfolio',
      'color-scheme': 'dark light',
    },
  };
}

type LayoutProps =
  | { children: React.ReactNode; params: { lang: string } }
  | { children: React.ReactNode; params: Promise<{ lang: string }> };

/**
 * The root layout for language-specific routes (e.g., `/en/...`, `/es/...`).
 * It sets up all global providers, server-side data fetching (like theme),
 * and renders the core structure of the application, including global UI elements.
 * @param props The layout props, containing the page content (`children`) and route `params`.
 */
export default async function LangLayout(props: LayoutProps) {
  const p = isThenable<{ lang: string }>(props.params)
    ? await props.params
    : props.params;
  const lang = normalizeBase(p.lang) as LocaleBase;

  if (lang !== 'en' && lang !== 'es') notFound();

  const initialTheme = await readThemeCookieServer();

  return (
    <div>
      <AppProviders defaultTheme={initialTheme}>
        <main className="relative min-h-dvh overflow-hidden">
          <HexGridBackground debug={false} />
          <HexGridReadyBoundary fallback={null}>
            <LangProvider initialLang={lang}>
              {props.children}
              <LandingTitle />
              <GlobalModal />
            </LangProvider>
            <TechCursor />
          </HexGridReadyBoundary>
        </main>
      </AppProviders>
    </div>
  );
}
