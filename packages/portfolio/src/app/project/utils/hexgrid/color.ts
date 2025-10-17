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

/**
 * Returns rgba string with alpha applied to a base color.
 */
export function withAlpha(input: string, a: number): string {
  const { r, g, b } = parseCssColor(input);
  const alpha = Math.max(0, Math.min(1, a));
  return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${alpha})`;
}

/**
 * Parses CSS color to RGB.
 */
export function parseCssColor(input: string) {
  const str = (input || '').trim().toLowerCase();
  if (str.startsWith('#')) {
    const h = str.slice(1);
    const hex = (v: string) => parseInt(v, 16);
    if (h.length === 3)
      return { r: hex(h[0] + h[0]), g: hex(h[1] + h[1]), b: hex(h[2] + h[2]) };
    if (h.length === 6)
      return {
        r: hex(h.slice(0, 2)),
        g: hex(h.slice(2, 4)),
        b: hex(h.slice(4, 6)),
      };
  }
  const m = str.match(/^rgba?\(([^)]+)\)$/);
  if (m) {
    const [r, g, b] = m[1].split(',').map((s) => parseFloat(s.trim()));
    return { r, g, b };
  }
  const m2 = str.match(/^hsla?\(([^)]+)\)$/);
  if (m2) {
    const [h, s, l] = m2[1].split(',').map((s) => s.trim());
    const hh = parseFloat(h);
    const ss = parseFloat(s) / 100;
    const ll = parseFloat(l) / 100;
    const { r, g, b } = hslToRgb(hh, ss, ll);
    return { r, g, b };
  }
  return { r: 255, g: 255, b: 255 };
}

/**
 * HSL → RGB.
 */
export function hslToRgb(h: number, s: number, l: number) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = (h % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0,
    g = 0,
    b = 0;
  if (hp >= 0 && hp < 1) {
    r = c;
    g = x;
  } else if (hp < 2) {
    r = x;
    g = c;
  } else if (hp < 3) {
    g = c;
    b = x;
  } else if (hp < 4) {
    g = x;
    b = c;
  } else if (hp < 5) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  const m = l - c / 2;
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}
