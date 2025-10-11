/**
 * Resolves a display color, preferring `input`, otherwise currentColor.
 */
export function resolveColor(el?: Element | null, input?: string): string {
  if (input && input !== 'currentColor') return input;
  if (typeof window === 'undefined') return '#ffffff';
  const node = el ?? document.documentElement;
  const cs = getComputedStyle(node as Element).color;
  return cs || '#ffffff';
}
