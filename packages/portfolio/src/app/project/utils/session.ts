/**
 * Safely retrieves an item from sessionStorage, returning null on error.
 * This prevents crashes if sessionStorage is disabled or unavailable.
 * @param key The key of the item to retrieve.
 * @returns The item's value, or null if not found or on error.
 */
export function safeGetSessionItem(key: string) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Safely sets an item in sessionStorage, ignoring any potential errors.
 * @param key The key of the item to set.
 * @param val The value to store.
 */
export function safeSetSessionItem(key: string, val: string) {
  try {
    sessionStorage.setItem(key, val);
  } catch {
    /* empty */
  }
}

/**
 * Safely removes an item from sessionStorage, ignoring any potential errors.
 * @param key The key of the item to remove.
 */
export function safeRemoveSessionItem(key: string) {
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* empty */
  }
}

/**
 * Asynchronously reads the first "intent" value from sessionStorage matching
 * the pattern `/^hexPanel:.*:intent$/`, and then clears all keys matching that pattern.
 * The operation is deferred to avoid blocking the main thread.
 * @param maxKeys A safeguard to limit the number of sessionStorage keys scanned.
 * @returns A promise that resolves to the intent string, or null if none was found.
 */
export function readAndClearIntentAsync(maxKeys = 128): Promise<string | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        if (typeof window === 'undefined' || !('sessionStorage' in window)) {
          resolve(null);
          return;
        }

        let found: string | null = null;
        const keysToDelete: string[] = [];
        const len = Math.min(sessionStorage.length, maxKeys);

        for (
          let i = 0, seen = 0;
          i < sessionStorage.length && seen < len;
          i++, seen++
        ) {
          const key = sessionStorage.key(i)!;
          if (!/^hexPanel:.*:intent$/.test(key)) continue;
          const val = sessionStorage.getItem(key);
          if (!found && val && val !== '/') found = val;
        }
        for (
          let i = 0, seen = 0;
          i < sessionStorage.length && seen < len;
          i++, seen++
        ) {
          const key = sessionStorage.key(i)!;
          if (/^hexPanel:.*:intent$/.test(key)) keysToDelete.push(key);
        }
        for (const k of keysToDelete) sessionStorage.removeItem(k);

        resolve(found);
      } catch {
        resolve(null);
      }
    }, 0);
  });
}
