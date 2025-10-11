import './global.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mi Portafolio',
  description: 'Un portafolio profesional construido con Next.js y TypeScript.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}