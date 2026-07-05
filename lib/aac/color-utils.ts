/**
 * Utility functions for color calculations in AAC components.
 */

/**
 * Compute WCAG relative luminance for an RGB color.
 * @param r Red component (0-255)
 * @param g Green component (0-255)
 * @param b Blue component (0-255)
 * @returns Relative luminance (0-1)
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rNorm, gNorm, bNorm] = [r, g, b].map((val) => {
    const normalized = val / 255
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rNorm + 0.7152 * gNorm + 0.0722 * bNorm
}

/**
 * Parse a hex color string to RGB components.
 * Handles both 3-digit (#fff) and 6-digit (#f0a020) hex formats.
 * Returns null if the input is not a valid hex color.
 * @param hex Hex color string (e.g., '#f0a020' or '#fff')
 * @returns [r, g, b] tuple or null if invalid
 */
function hexToRgb(hex: string): [number, number, number] | null {
  // Remove # if present
  const clean = hex.startsWith('#') ? hex.slice(1) : hex

  // Handle 3-digit hex (expand to 6-digit)
  let expanded = clean
  if (clean.length === 3) {
    expanded = clean
      .split('')
      .map((c) => c + c)
      .join('')
  }

  // Validate 6-digit hex format
  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) {
    return null
  }

  const r = parseInt(expanded.slice(0, 2), 16)
  const g = parseInt(expanded.slice(2, 4), 16)
  const b = parseInt(expanded.slice(4, 6), 16)

  return [r, g, b]
}

/**
 * Determine a readable text color (dark or light) for a given background color.
 *
 * Uses the standard WCAG luminance threshold (0.179) to decide whether
 * the background is "light" or "dark", then returns dark text (#1a1a1a)
 * for light backgrounds or light text (#f5f5f5) for dark backgrounds.
 *
 * Returns undefined if the input is not a valid hex color, allowing
 * the caller to fall back to theme-based text color.
 *
 * @param hexOrCssColor A hex color string (e.g., '#f0a020', '#fff') or CSS color
 * @returns A hex color string for readable text, or undefined if the input is not a valid hex
 */
export function getReadableTextColor(
  hexOrCssColor: string,
): string | undefined {
  const rgb = hexToRgb(hexOrCssColor)
  if (!rgb) return undefined

  const luminance = getRelativeLuminance(rgb[0], rgb[1], rgb[2])

  // Standard threshold: backgrounds above this luminance are "light"
  return luminance > 0.179 ? '#1a1a1a' : '#f5f5f5'
}
