'use client';

import { ThemeProvider } from 'next-themes';
import * as React from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

type Props = {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
};

/**
 * Provides the theme context to the application using the `next-themes` library.
 * This component sets up the standard configuration for theme management,
 * including the attribute, storage key, and system theme integration.
 * @param props The component props.
 * @param props.children The rest of the application to be wrapped by the provider.
 * @param props.defaultTheme The default theme to use ('light', 'dark', or 'system').
 */
export default function AppThemeProvider({
  children,
  defaultTheme = 'system',
}: Props) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme={defaultTheme}
      enableSystem
      disableTransitionOnChange
      storageKey="theme"
    >
      {children}
    </ThemeProvider>
  );
}
