'use client';

import { useGlobalSelectionClear } from '@project/hooks/useGlobalSelectionClear';
import useWindowSize from '@project/hooks/useWindowSize';
import { DeviceType } from '@project/types/window';
import { AnchorAttrs, parseInlineMarkup } from '@project/utils/parser';
import cn from 'classnames';
import type { CSSProperties, ReactNode } from 'react';
import { useMemo } from 'react';
import './text.css';
import { useTheme } from 'next-themes';

const FONT_SIZES: Record<DeviceType, Record<TextSize, number>> = {
  mobile: { title: 28, subtitle: 22, body: 16, small: 14, tiny: 12 },
  medium: { title: 34, subtitle: 26, body: 18, small: 15, tiny: 13 },
  web: { title: 40, subtitle: 30, body: 18, small: 16, tiny: 14 },
};

export const SHADOW_FACTOR = { title: 0.06, text: 0.06 };
export const INTERACTIVE_TITLE_SHADOW_FACTOR = 1.25;
export const INTERACTIVE_TEXT_SHADOW_FACTOR = 3;
export const STROKE_FALLBACK_MAX_PX = 22;

const DEFAULT_COLORS: TextColorTokens = {
  text: 'var(--text-token-text)',
  bold: 'var(--text-token-bold)',
  textShadow: 'var(--text-token-text-shadow)',
  boldShadow: 'var(--text-token-bold-shadow)',
  selectionText: 'var(--text-token-selection-text)',
  selectionBold: 'var(--text-token-selection-bold)',
  selectionTextShadow: 'var(--text-token-selection-text-shadow)',
  selectionBoldShadow: 'var(--text-token-selection-bold-shadow)',
  hoverText: 'var(--text-token-hover-text)',
  hoverBold: 'var(--text-token-hover-bold)',
  hoverShadow: 'var(--text-token-hover-shadow)',
};

/**
 * Defines the style variant of the text, affecting its visual properties.
 */
export type Variant = 'title' | 'text';
/**
 * Defines the size of the text.
 */
export type TextSize = 'title' | 'subtitle' | 'body' | 'small' | 'tiny';

/**
 * Defines the color tokens for different parts of the text (normal, bold, shadow, etc.).
 */
export type TextColorTokens = {
  text: string;
  bold: string;
  textShadow: string;
  boldShadow: string;
  selectionText: string;
  selectionBold: string;
  selectionTextShadow: string;
  selectionBoldShadow: string;
  hoverText: string;
  hoverBold: string;
  hoverShadow: string;
};

/**
 * Defines the custom CSS properties used for styling the text.
 */
type TextStyleVars = CSSProperties & {
  '--text-shadow-blur'?: string;
  '--text-shadow-blur-interactive'?: string;
  '--text-color'?: string;
  '--text-bold-color'?: string;
  '--text-bold-weight'?: string | number;
  '--text-shadow-color'?: string;
  '--text-bold-shadow-color'?: string;
  '--text-selection-normal-color'?: string;
  '--text-selection-bold-color'?: string;
  '--text-selection-shadow-color'?: string;
  '--text-selection-bold-shadow-color'?: string;
  '--text-hover-color'?: string;
  '--text-hover-bold-color'?: string;
  '--text-hover-shadow-color'?: string;
};

/**
 * Props for the Text component.
 */
export interface TextProps {
  /**
   * The text style variant, 'title' or 'text'.
   */
  variant?: Variant;
  /**
   * The size of the text.
   */
  size?: TextSize;
  /**
   * A scaling factor for the font size.
   */
  scale?: number;
  /**
   * If true, applies a shadow effect.
   */
  shadow?: boolean;
  /**
   * If true, bold text only changes color, not weight.
   */
  boldColorOnly?: boolean;
  /**
   * If true, enables hover effects.
   */
  hoverable?: boolean;
  /**
   * Custom color tokens to override the defaults.
   */
  colors?: Partial<TextColorTokens>;
  /**
   * If true, applies a stroke fallback for better readability on iOS devices with a dark theme.
   */
  iosStrokeFallback?: boolean;
  /**
   * The URL for an anchor element if the text should be a link.
   */
  href?: string;
  /**
   * The target attribute for the anchor element.
   */
  target?: '_self' | '_blank' | '_parent' | '_top';
  /**
   * The rel attribute for the anchor element.
   */
  rel?: string;
  /**
   * The content to be rendered.
   */
  children: ReactNode;
  /**
   * Additional CSS class names.
   */
  className?: string;
  /**
   * Additional inline styles.
   */
  style?: CSSProperties;
  /**
   * A value to add to the font weight.
   */
  weightDelta?: number;
}

/**
 * Clamps a font weight value to a valid range [100, 1000] and rounds it to the nearest hundred.
 *
 * @param weight - The font weight to clamp.
 * @returns The clamped font weight.
 */
function clampWeight(weight: number): number {
  const n = Math.round(weight);
  if (n < 100) return 100;
  if (n > 1000) return 1000;
  return n;
}

/**
 * Rounds a number to the nearest hundred.
 *
 * @param n - The number to round.
 * @returns The number rounded to the nearest hundred.
 */
function roundToHundreds(n: number): number {
  return Math.round(n / 100) * 100;
}

/**
 * Parses a CSS font weight value to a number.
 *
 * @param input - The font weight value.
 * @returns The numerical representation of the font weight.
 */
function parseFontWeight(
  input: CSSProperties['fontWeight'] | undefined
): number {
  if (typeof input === 'number') return input;
  if (typeof input === 'string') {
    if (input === 'normal') return 400;
    if (input === 'bold') return 700;
    const n = parseInt(input, 10);
    return Number.isFinite(n) ? n : 400;
  }
  return 400;
}

/**
 * A versatile text component that supports different sizes, styles, and effects.
 * It dynamically adjusts its properties based on the device type and theme,
 * and can be rendered as a link.
 *
 * @param props - The component props.
 * @returns A JSX element representing the formatted text.
 */
export function Text({
  variant = 'text',
  size = 'body',
  scale = 1,
  shadow = true,
  boldColorOnly = false,
  hoverable = false,
  colors,
  iosStrokeFallback = true,
  href,
  target = '_blank',
  rel = 'noopener noreferrer',
  children,
  style: propStyles,
  className,
  weightDelta: weightDeltaFromProps,
}: TextProps) {
  useGlobalSelectionClear();

  const { resolvedTheme } = useTheme();
  const { deviceType } = useWindowSize() as { deviceType: DeviceType };

  const weightDelta = roundToHundreds(
    weightDeltaFromProps ?? (resolvedTheme === 'light' ? 200 : 0)
  );

  const fontSizePx = useMemo(() => {
    const base = FONT_SIZES[deviceType]?.[size] ?? FONT_SIZES.web.body;
    return base * (Number.isFinite(scale) && scale > 0 ? scale : 1);
  }, [deviceType, size, scale]);

  const blurPx = useMemo(
    () => fontSizePx * SHADOW_FACTOR[variant],
    [fontSizePx, variant]
  );
  const blurInteractivePx = useMemo(
    () =>
      blurPx *
      (variant === 'title'
        ? INTERACTIVE_TITLE_SHADOW_FACTOR
        : INTERACTIVE_TEXT_SHADOW_FACTOR),
    [blurPx, variant]
  );

  const family = variant === 'title' ? 'var(--font-russo)' : 'var(--font-mono)';

  const tokens: TextColorTokens = { ...DEFAULT_COLORS, ...(colors ?? {}) };

  const isAnchor = Boolean(href);
  const Element = isAnchor ? 'a' : 'span';
  const noSelect = isAnchor || hoverable;

  const useStroke =
    iosStrokeFallback && shadow && fontSizePx <= STROKE_FALLBACK_MAX_PX;

  // === FONT WEIGHT LOGIC ===
  const baseNormalWeight = parseFontWeight(propStyles?.fontWeight);
  const normalWeight = clampWeight(baseNormalWeight + weightDelta);

  let boldWeight: number;
  if (boldColorOnly) {
    boldWeight = normalWeight;
  } else {
    boldWeight = clampWeight(700 + weightDelta);
  }

  const style: TextStyleVars = {
    fontFamily: family,
    fontSize: `${fontSizePx}px`,
    fontWeight: normalWeight,
    '--text-shadow-blur': `${blurPx}px`,
    '--text-shadow-blur-interactive': `${blurInteractivePx}px`,
    '--text-color': tokens.text,
    '--text-bold-color': boldColorOnly ? tokens.bold : 'var(--text-color)',
    '--text-bold-weight': boldWeight,
    '--text-shadow-color': tokens.textShadow,
    '--text-bold-shadow-color': tokens.boldShadow || tokens.textShadow,
    '--text-selection-normal-color': tokens.selectionText,
    '--text-selection-bold-color': tokens.selectionBold,
    '--text-selection-shadow-color': tokens.selectionTextShadow,
    '--text-selection-bold-shadow-color':
      tokens.selectionBoldShadow || tokens.selectionTextShadow,
    '--text-hover-color': tokens.hoverText,
    '--text-hover-bold-color': tokens.hoverBold || tokens.hoverText,
    '--text-hover-shadow-color': tokens.hoverShadow,
  };

  const parsedChildren =
    typeof children === 'string'
      ? parseInlineMarkup(children, 'inline', {
          a: (attrs: AnchorAttrs, kids, key) => (
            <Text
              key={key}
              href={attrs.href}
              target={attrs.target as TextProps['target']}
              rel={attrs.rel}
              variant={variant}
              size={size}
              scale={scale}
              shadow={shadow}
              boldColorOnly={boldColorOnly}
              hoverable={hoverable}
              colors={colors}
              iosStrokeFallback={iosStrokeFallback}
              className={className}
              style={propStyles}
              weightDelta={weightDelta}
            >
              {kids}
            </Text>
          ),
        })
      : children;

  return (
    <Element
      className={cn(
        'text-root pointer-events-auto',
        shadow ? 'shadow-on' : 'shadow-off',
        hoverable ? 'hoverable' : undefined,
        isAnchor ? 'is-anchor' : undefined,
        useStroke ? 'stroke-fallback' : undefined,
        noSelect ? 'no-select' : undefined,
        className
      )}
      style={{ ...style, ...propStyles }}
      {...(isAnchor ? { href, target, rel } : {})}
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
    >
      {parsedChildren}
    </Element>
  );
}

export default Text;
