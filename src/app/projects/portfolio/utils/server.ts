import { ThemeMode } from '@portfolio/providers/AppThemeProvider';
import { cookies } from 'next/headers';
import 'server-only';

/**
 * Reads the theme preference from the 'theme' cookie on the server.
 * This is a server-only function.
 * @returns A promise that resolves to the saved `ThemeMode` or 'dark' as a default.
 */
export async function readThemeCookieServer(): Promise<ThemeMode> {
  const v = (await cookies()).get('theme')?.value as ThemeMode | undefined;
  return v ?? 'dark';
}
