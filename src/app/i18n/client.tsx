'use client';

import en from '@i18n/dictionaries/en';
import es from '@i18n/dictionaries/es';
import type { Dict, Locale } from '@i18n/types';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const DICTS: Record<Locale, Dict> = { es, en };

type Ctx = {
  /** Current language, driven by the URL segment in app/[lang]. */
  lang: Locale;
  /** Translated dictionary for current lang. */
  dict: Dict;
  /**
   * Optional optimistic setter for local UI states.
   * Avoid calling this before navigating to the new /[lang] to prevent flicker.
   */
  setLang: (l: Locale) => void;
};

const LangCtx = createContext<Ctx | null>(null);

/**
 * Provides i18n context; source of truth is the route param (initialLang).
 */
export function LangProvider({
  initialLang,
  children,
}: {
  initialLang: Locale;
  children: React.ReactNode;
}) {
  const [lang, setLang] = useState<Locale>(initialLang);

  useEffect(() => {
    setLang(initialLang);
    document.documentElement.lang = initialLang;
  }, [initialLang]);

  const dict = useMemo(() => DICTS[lang], [lang]);

  const value = useMemo(() => ({ lang, dict, setLang }), [lang, dict]);
  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}

export function useLang() {
  const ctx = useContext(LangCtx);
  if (!ctx) throw new Error('useLang must be used within <LangProvider>');
  return ctx;
}
