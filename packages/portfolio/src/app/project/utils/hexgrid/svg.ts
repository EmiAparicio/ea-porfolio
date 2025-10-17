/**
 * Builds an inline SVG markup string for the hex grid stroke.
 * @param d SVG path "d" for the grid stroke (hollow hexagons).
 * @param width Logical width of the viewBox/canvas in CSS pixels.
 * @param height Logical height of the viewBox/canvas in CSS pixels.
 * @param color Stroke color (e.g. "#01BB75").
 * @param stroke Stroke width in CSS pixels.
 * @returns SVG markup as a string.
 */
export function buildSvgMarkup(
  d: string,
  width: number,
  height: number,
  color: string,
  stroke: number
): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <path d="${d}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linejoin="round" stroke-linecap="round" shape-rendering="geometricPrecision"/>
</svg>`;
}
