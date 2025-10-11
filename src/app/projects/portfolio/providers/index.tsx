import { ReactNode } from 'react';
import AppThemeProvider, { ThemeMode } from './AppThemeProvider';

export function AppProviders({
  children,
  defaultTheme,
}: {
  children: ReactNode;
  defaultTheme: ThemeMode;
}) {
  return (
    <AppThemeProvider defaultTheme={defaultTheme}>{children}</AppThemeProvider>
  );
}
