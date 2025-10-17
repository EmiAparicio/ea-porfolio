'use client';

import { useLang } from '@i18n/client';
import type { Locale } from '@i18n/types';
import { useImmediateRouter } from '@project/hooks/useImmediateRouter';
import { usePathname } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Normalizes a subpath string to ensure it starts with a '/' and is not empty.
 *
 * @param {string | null | undefined} sub The subpath to normalize.
 * @returns {string} The normalized subpath.
 */
function norm(sub: string | null | undefined): string {
  if (!sub || sub === '/') {
    return '/';
  }
  return sub.startsWith('/') ? sub : `/${sub}`;
}

/**
 * Removes the language prefix from the current pathname.
 *
 * @param {string} pathname The current pathname.
 * @param {Locale} current The current locale to strip.
 * @returns {string} The pathname without the language prefix.
 *
 * @example
 * // returns '/'
 * stripLang('/en', 'en');
 * @example
 * // returns '/webdev'
 * stripLang('/en/webdev', 'en');
 * @example
 * // returns '/webdev'
 * stripLang('/webdev', 'en');
 */
function stripLang(pathname: string, current: Locale): string {
  if (!pathname) {
    return '/';
  }
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] === current) {
    const rest = parts.slice(1).join('/');
    return rest ? `/${rest}` : '/';
  }
  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

/**
 * A router-aware hook for managing language-based navigation in Next.js.
 * It provides functions to navigate, prefetch, and switch languages while
 * maintaining the current subpath, query string, and hash.
 *
 * @returns {{go: (target: string | null, opts?: {scroll?: boolean}) => void; prefetch: (target: string | null) => void; switchLang: (next: Locale, opts?: {intentSubpath?: string | null; setCookie?: boolean}) => void; prefetchSwitchLang: (next: Locale, intentSubpath?: string | null) => void; buildWithLang: (target: string | null) => string;}} An object with navigation functions.
 */
export function useLangRouter() {
  const { lang } = useLang();
  const pathnameFromHook = usePathname();
  const { navigateImmediate, prefetch } = useImmediateRouter();

  /**
   * Builds a URL with the current language prefix.
   *
   * @param {string | null} target The target subpath.
   * @returns {string} The full URL with the language prefix.
   */
  const buildWithLang = useCallback(
    (target: string | null) => {
      const sub = norm(target);
      return sub === '/' ? `/${lang}` : `/${lang}${sub}`;
    },
    [lang]
  );

  /**
   * Navigates to a new subpath with the current language prefix.
   *
   * @param {string | null} target The target subpath to navigate to.
   * @param {object} [opts] - Navigation options.
   * @param {boolean} [opts.scroll] - Whether to scroll to the top of the page.
   */
  const go = useCallback(
    (target: string | null, opts?: { scroll?: boolean }) => {
      const href = buildWithLang(target);
      navigateImmediate(href, opts);
    },
    [buildWithLang, navigateImmediate]
  );

  /**
   * Prefetches a new subpath with the current language prefix.
   *
   * @param {string | null} target The target subpath to prefetch.
   */
  const prefetchWithLang = useCallback(
    (target: string | null) => {
      try {
        prefetch(buildWithLang(target));
      } catch {}
    },
    [buildWithLang, prefetch]
  );

  /**
   * Switches the application language and navigates to the new language's path.
   * It preserves the current subpath, search, and hash.
   *
   * @param {Locale} next The new locale to switch to.
   * @param {object} [opts] - Switching options.
   * @param {string | null} [opts.intentSubpath] - An optional subpath to navigate to instead of the current one.
   * @param {boolean} [opts.setCookie=true] - Whether to set the language cookie.
   */
  const switchLang = useCallback(
    (
      next: Locale,
      opts?: { intentSubpath?: string | null; setCookie?: boolean }
    ) => {
      let currentPath = pathnameFromHook || '/';
      let currentSearch = '';
      let currentHash = '';
      try {
        if (typeof window !== 'undefined' && window.location) {
          currentPath = window.location.pathname || currentPath;
          currentSearch = window.location.search || '';
          currentHash = window.location.hash || '';
        }
      } catch {}

      const subpath =
        opts?.intentSubpath != null && opts.intentSubpath !== ''
          ? norm(opts.intentSubpath)
          : stripLang(currentPath, lang);

      const base = subpath === '/' ? `/${next}` : `/${next}${subpath}`;
      const targetPath = `${base}${currentSearch}${currentHash}`;

      if (opts?.setCookie !== false) {
        try {
          document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
        } catch {}
      }

      navigateImmediate(targetPath, { scroll: false });
    },
    [pathnameFromHook, lang, navigateImmediate]
  );

  /**
   * Prefetches the target path for a language switch.
   *
   * @param {Locale} next The new locale to switch to.
   * @param {string | null} [intentSubpath] - An optional subpath to navigate to instead of the current one.
   */
  const prefetchSwitchLang = useCallback(
    (next: Locale, intentSubpath?: string | null) => {
      let currentPath = pathnameFromHook || '/';
      let currentSearch = '';
      let currentHash = '';
      try {
        if (typeof window !== 'undefined' && window.location) {
          currentPath = window.location.pathname || currentPath;
          currentSearch = window.location.search || '';
          currentHash = window.location.hash || '';
        }
      } catch {}

      const subpath =
        intentSubpath != null && intentSubpath !== ''
          ? norm(intentSubpath)
          : stripLang(currentPath, lang);

      const href =
        (subpath === '/' ? `/${next}` : `/${next}${subpath}`) +
        `${currentSearch}${currentHash}`;

      try {
        prefetch(href);
      } catch {}
    },
    [pathnameFromHook, lang, prefetch]
  );

  return {
    go,
    prefetch: prefetchWithLang,
    switchLang,
    prefetchSwitchLang,
    buildWithLang,
  };
}
