import { ReactNode } from 'react';
import AppThemeProvider, { ThemeMode } from './AppThemeProvider';
import { PerformanceProvider } from './PerformanceProvider';

export function AppProviders({
  children,
  defaultTheme,
}: {
  children: ReactNode;
  defaultTheme: ThemeMode;
}) {
  return (
    <PerformanceProvider>
      <AppThemeProvider defaultTheme={defaultTheme}>
        {children}
      </AppThemeProvider>
    </PerformanceProvider>
  );
}
