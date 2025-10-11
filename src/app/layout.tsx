import { ThemeMode } from '@portfolio/providers/AppThemeProvider';
import { Russo_One, Ubuntu } from 'next/font/google';
import { cookies } from 'next/headers';

const russoOne = Russo_One({
  variable: '--font-russo-one',
  weight: '400',
  subsets: ['latin'],
});
const ubuntu = Ubuntu({
  variable: '--font-ubuntu',
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
});

/**
 * The root layout for the entire application.
 * It sets up the global fonts (`Russo One`, `Ubuntu`) and handles the initial
 * server-side theme rendering to prevent a flash of unstyled content (FOUC)
 * by reading the theme cookie.
 * @param props The component props.
 * @param props.children The nested layouts and pages of the application.
 */
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme =
    ((await cookies()).get('theme')?.value as ThemeMode | undefined) ??
    'system';
  const isFixed = theme === 'light' || theme === 'dark';

  return (
    <html
      suppressHydrationWarning
      data-theme={isFixed ? theme : undefined}
      style={
        isFixed ? ({ colorScheme: theme } as React.CSSProperties) : undefined
      }
    >
      <body className={`${russoOne.variable} ${ubuntu.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
