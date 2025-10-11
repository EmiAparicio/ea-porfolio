import { ThemeMode } from '@portfolio/providers/AppThemeProvider';
import { CSSProperties } from 'react';

/**
 * Sets the 'theme' cookie in the browser.
 * @param value The theme to set ('light', 'dark', or 'system').
 */
export function setThemeCookie(value: 'light' | 'dark' | 'system') {
  const maxAge = 60 * 60 * 24 * 365;
  const secure =
    typeof window !== 'undefined' && window.location.protocol === 'https:'
      ? '; Secure'
      : '';
  document.cookie = `theme=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

/**
 * Normalizes a string to a valid CSS color value, primarily for handling CSS variables.
 * Ensures that custom property names are wrapped in `var()`.
 * @param input The raw color string (e.g., '--primary-color', 'var(--primary-color)', '#FFF').
 * @returns A valid CSS color value string, or undefined if the input is empty.
 */
export function normalizeColor(input?: string) {
  if (!input) return undefined;
  const s = input.trim();
  if (s.startsWith('var(')) return s;
  if (s.startsWith('--')) return `var(${s})`;
  return s;
}

/**
 * Generates the necessary HTML attributes to apply a specific theme.
 * This is used to set `data-theme` and `color-scheme` for fixed themes ('light'/'dark').
 * @param theme The current theme.
 * @returns An object containing the attributes to be spread onto the `<html>` element.
 */
export function htmlThemeAttrs(theme: ThemeMode): {
  'data-theme'?: 'light' | 'dark';
  style?: CSSProperties;
} {
  const isFixed = theme === 'light' || theme === 'dark';
  return isFixed ? { 'data-theme': theme, style: { colorScheme: theme } } : {};
}

/**
 * Safely sets the 'theme' cookie on the client side, ignoring potential errors.
 * @param theme The theme to set.
 */
export function setThemeCookieClient(theme: ThemeMode) {
  try {
    document.cookie = `theme=${theme}; path=/; max-age=${
      60 * 60 * 24 * 365
    }; samesite=lax`;
  } catch {}
}

/**
 * Creates a CSS `color-mix` string to apply opacity to a CSS color variable.
 * @param colorVar The CSS color variable string (e.g., 'var(--primary-color)').
 * @param opacity The desired opacity, from 0 to 1.
 * @returns A string compatible with the CSS `color` property.
 */
export function colorWithOpacity(
  colorVar: string,
  opacity: number
): CSSProperties['color'] {
  return `color-mix(in oklab, ${colorVar} ${Math.round(
    opacity * 100
  )}%, transparent)`;
}
