'use client';

import { useCallback } from 'react';
import { startTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export type NavigateOpts = {
  /**
   * Whether to restore scroll to top after navigation. Defaults to false.
   */
  scroll?: boolean;
};

export type ImmediateRouter = {
  /**
   * Normalizes a pathname by collapsing multiple slashes and removing trailing slash (except root).
   */
  normPath: (p: string) => string;
  /**
   * Immediately updates the URL bar via history.pushState (when available),
   * then schedules a router.replace inside startTransition to let Next reconcile.
   * Avoids redundant navigations when the normalized target matches the current path.
   */
  navigateImmediate: (href: string, opts?: NavigateOpts) => void;
  /**
   * Prefetches a route when possible.
   */
  prefetch: (href: string) => void;
};

/**
 * Generic immediate-navigation helper for Next.js App Router.
 * Useful for buttons/links that need snappy URL feedback before Next reconciles the tree.
 */
export function useImmediateRouter(): ImmediateRouter {
  const router = useRouter();
  const pathname = usePathname();

  const normPath = useCallback((p: string) => {
    const s = p.replace(/\/+/g, '/');
    return s !== '/' ? s.replace(/\/$/, '') : '/';
  }, []);

  const navigateImmediate = useCallback(
    (href: string, opts?: NavigateOpts) => {
      const current =
        typeof window !== 'undefined'
          ? window.location.pathname
          : pathname || '/';
      const curN = normPath(current);
      const tgtN = normPath(href);

      if (tgtN === curN) {
        startTransition(() => {
          router.replace(href, { scroll: opts?.scroll ?? false });
        });
        return;
      }

      if (typeof window !== 'undefined') {
        try {
          window.history.pushState({}, '', href);
        } catch {
          /* empty */
        }
      }

      startTransition(() => {
        router.replace(href, { scroll: opts?.scroll ?? false });
      });
    },
    [pathname, router, normPath]
  );

  const prefetch = useCallback(
    (href: string) => {
      try {
        router.prefetch(href);
      } catch {
        /* empty */
      }
    },
    [router]
  );

  return { normPath, navigateImmediate, prefetch };
}
