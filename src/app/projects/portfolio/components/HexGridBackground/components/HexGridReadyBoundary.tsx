'use client';

import { ReactNode } from 'react';
import { useHexGridReady } from '@portfolio/hooks/hexgrid/useHexGridReady';

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

export default function HexGridReadyBoundary({
  children,
  fallback = null,
}: Props) {
  const ready = useHexGridReady();
  if (!ready) return <>{fallback}</>;
  return <>{children}</>;
}
