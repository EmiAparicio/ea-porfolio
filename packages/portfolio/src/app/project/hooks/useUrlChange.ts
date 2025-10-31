'use client';

import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react';

export const ROOT_PATHS = ['/es', '/en'];

export type QueryValue = string | string[];
export type QueryRecord = Record<string, QueryValue>;

export type UrlSnapshot = {
  pathname: string;
  search: string;
  query: QueryRecord;
};

export type UseUrlChangeOptions = {
  queryKeys?: string[];
  computeSignature?: boolean;
};

/**
 * Converts a URLSearchParams object into a record, handling multi-value keys.
 * @param sp The URLSearchParams object to process.
 * @returns A record of query parameters.
 * @internal
 */
function paramsToRecord(sp: URLSearchParams): QueryRecord {
  const out: QueryRecord = {};
  const keys = Array.from(new Set(Array.from(sp.keys())));
  for (const k of keys) {
    const all = sp.getAll(k);
    out[k] = all.length <= 1 ? (all[0] ?? '') : all;
  }
  return out;
}

/**
 * Filters a query record to include only a specific set of keys.
 * @param query The source query record.
 * @param keys The array of keys to keep.
 * @returns A new query record with only the specified keys.
 * @internal
 */
function pickQueryKeys(query: QueryRecord, keys?: string[]): QueryRecord {
  if (!keys || keys.length === 0) return query;
  const out: QueryRecord = {};
  for (const k of keys) if (k in query) out[k] = query[k];
  return out;
}

/**
 * Builds a normalized and sorted URL search string from a query record.
 * @param query The query record to serialize.
 * @returns A stable URL search string.
 * @internal
 */
function buildSearchString(query: QueryRecord): string {
  const qs = new URLSearchParams();
  const sortedKeys = Object.keys(query).sort();
  for (const k of sortedKeys) {
    const v = query[k];
    if (Array.isArray(v)) v.forEach((vv) => qs.append(k, vv));
    else qs.append(k, v);
  }
  return qs.toString();
}

/**
 * Creates a stable, sorted signature string from a query record for easy comparison.
 * @param query The query record to create a signature from.
 * @returns A stable signature string.
 * @internal
 */
function stableQuerySignature(query: QueryRecord): string {
  const parts: string[] = [];
  const keys = Object.keys(query).sort();
  for (const k of keys) {
    const v = query[k];
    if (Array.isArray(v)) parts.push(`${k}=[${v.join('|')}]`);
    else parts.push(`${k}=${v}`);
  }
  return parts.join('&');
}

/**
 * Normalizes a path by removing duplicate and trailing slashes.
 * @param p The pathname string to normalize.
 * @returns The normalized pathname.
 * @internal
 */
function normalizePath(p: string) {
  return p.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
}

declare global {
  interface Window {
    __URLCHANGE_PATCHED__?: boolean;
  }
}

let historyPatched =
  typeof window !== 'undefined' && !!window.__URLCHANGE_PATCHED__;

/**
 * Patches the browser's `history.pushState` and `history.replaceState` methods
 * to dispatch a custom `locationchange` event, allowing for reliable subscription
 * to URL changes initiated by client-side routers.
 * @internal
 */
function ensurePatchedHistory() {
  if (historyPatched || typeof window === 'undefined') return;
  const origPush = history.pushState.bind(history);
  const origReplace = history.replaceState.bind(history);
  history.pushState = (...args: Parameters<History['pushState']>) => {
    const ret = origPush(...args);
    window.dispatchEvent(new Event('pushstate'));
    window.dispatchEvent(new Event('locationchange'));
    return ret;
  };
  history.replaceState = (...args: Parameters<History['replaceState']>) => {
    const ret = origReplace(...args);
    window.dispatchEvent(new Event('replacestate'));
    window.dispatchEvent(new Event('locationchange'));
    return ret;
  };
  window.addEventListener('popstate', () => {
    window.dispatchEvent(new Event('locationchange'));
  });
  historyPatched = true;
  window.__URLCHANGE_PATCHED__ = true;
}

/**
 * Creates a `UrlSnapshot` object based on the current `window.location`.
 * @param queryKeys Optional list of query parameter keys to include in the snapshot.
 * @returns A snapshot of the current URL state.
 * @internal
 */
function snapshotFromLocation(queryKeys?: string[]): UrlSnapshot {
  if (typeof window === 'undefined') {
    return { pathname: '/', search: '', query: {} };
  }
  const pathname = normalizePath(window.location.pathname);
  const all = paramsToRecord(new URLSearchParams(window.location.search));
  const filtered = pickQueryKeys(all, queryKeys);
  const normalizedSearch = buildSearchString(filtered);
  return { pathname, search: normalizedSearch, query: filtered };
}

/**
 * A React hook that subscribes to URL changes, compatible with Next.js App Router.
 * It uses `useSyncExternalStore` and patches `history` methods to reliably detect
 * client-side navigation.
 * @param opts Configuration options for the hook.
 * @returns An object containing the current and previous URL state, flags
 * indicating what changed, and a stable signature of the query string.
 */
export function useUrlChange(opts: UseUrlChangeOptions = {}): {
  current: UrlSnapshot;
  previous: UrlSnapshot | null;
  pathChanged: boolean;
  queryChanged: boolean;
  querySignature: string;
} {
  const { queryKeys, computeSignature = true } = opts;

  useEffect(() => {
    ensurePatchedHistory();
  }, []);

  const subscribe = (onStoreChange: () => void) => {
    if (typeof window === 'undefined') return () => {};
    const handler = () => onStoreChange();
    window.addEventListener('locationchange', handler);
    window.addEventListener('hashchange', handler);
    return () => {
      window.removeEventListener('locationchange', handler);
      window.removeEventListener('hashchange', handler);
    };
  };

  const getSnapshot = () => {
    if (typeof window === 'undefined') return '/';
    const pathname = normalizePath(window.location.pathname);
    const filtered = pickQueryKeys(
      paramsToRecord(new URLSearchParams(window.location.search)),
      queryKeys
    );
    const qs = buildSearchString(filtered);
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const getServerSnapshot = () => '/';

  const storeValue = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const current = useMemo<UrlSnapshot>(
    () => snapshotFromLocation(queryKeys),

    [storeValue, queryKeys]
  );

  const querySignature = useMemo(
    () => (computeSignature ? stableQuerySignature(current.query) : ''),
    [computeSignature, current.query]
  );

  const prevRef = useRef<UrlSnapshot | null>(null);
  const previous = prevRef.current;

  const pathChanged = previous ? previous.pathname !== current.pathname : true;
  const queryChanged = previous ? previous.search !== current.search : true;

  useEffect(() => {
    prevRef.current = current;
  }, [current.pathname, current.search, querySignature]);

  return { current, previous, pathChanged, queryChanged, querySignature };
}
