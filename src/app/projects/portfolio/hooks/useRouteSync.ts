'use client';

import { useUrlChange } from '@portfolio/hooks/useUrlChange';
import { useMemo } from 'react';

export type PathToId = Record<string, string>;

/**
 * A hook to synchronize UI state with route changes, providing semantic information
 * about transitions. It maps URL paths to meaningful IDs and detects transitions
 * into or out of a specified root path.
 * @param args The hook's arguments.
 * @param args.rootPath The specific path considered to be the "root" (e.g., '/en').
 * @param args.pathToId A mapping from full URL pathnames to string IDs.
 * @returns An object with the current/previous path, route IDs, and boolean flags for transitions.
 */
export function useRouteSync(args: { rootPath: string; pathToId: PathToId }) {
  const { rootPath, pathToId } = args;

  const { current, previous, pathChanged } = useUrlChange();

  const currentRouteId = useMemo<string | null>(() => {
    return pathToId[current.pathname] ?? null;
  }, [pathToId, current.pathname]);

  const previousRouteId = useMemo<string | null>(() => {
    const prevPath = previous?.pathname ?? null;
    return prevPath ? (pathToId[prevPath] ?? null) : null;
  }, [pathToId, previous?.pathname]);

  const atRoot = current.pathname === rootPath;
  const wasAtRoot = previous?.pathname ? previous.pathname === rootPath : false;

  const justEnteredRoot = pathChanged && atRoot && !wasAtRoot;
  const justLeftRoot = pathChanged && !atRoot && wasAtRoot;

  const justEnteredRouteId =
    pathChanged && currentRouteId && currentRouteId !== previousRouteId
      ? currentRouteId
      : null;

  const justLeftRouteId =
    pathChanged && previousRouteId && previousRouteId !== currentRouteId
      ? previousRouteId
      : null;

  return {
    currentPath: current.pathname,
    previousPath: previous?.pathname ?? null,
    atRoot,
    justEnteredRoot,
    justLeftRoot,
    currentRouteId,
    previousRouteId,
    justEnteredRouteId,
    justLeftRouteId,
  };
}
