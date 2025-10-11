import { ThemeMode } from '@portfolio/providers/AppThemeProvider';
import { CSSProperties } from 'react';

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
