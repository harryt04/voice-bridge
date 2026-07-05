import { describe, it, expect } from 'vitest'
import { CATEGORY_COLORS } from './category-colors'

describe('CATEGORY_COLORS', () => {
  it('includes all 23 AAC category slugs', () => {
    const expectedSlugs = [
      'core',
      'feelings',
      'people',
      'actions',
      'food-drink',
      'places',
      'objects',
      'describing',
      'social',
      'body',
      'time',
      'questions',
      'needs',
      'emergency',
      'rejecting',
      'directing',
      'mealtime',
      'school',
      'community',
      'play',
      'home',
      'choices',
      'conversation',
    ]

    expectedSlugs.forEach((slug) => {
      expect(CATEGORY_COLORS).toHaveProperty(slug)
    })
  })

  it('each category has bg and fg color properties', () => {
    Object.values(CATEGORY_COLORS).forEach((colors) => {
      expect(colors).toHaveProperty('bg')
      expect(colors).toHaveProperty('fg')
      expect(typeof colors.bg).toBe('string')
      expect(typeof colors.fg).toBe('string')
    })
  })

  it('color values are HSL format strings', () => {
    Object.values(CATEGORY_COLORS).forEach((colors) => {
      expect(colors.bg).toMatch(/^hsl\(/)
      expect(colors.fg).toMatch(/^hsl\(/)
    })
  })

  it('returns undefined for unmapped category slug', () => {
    expect(CATEGORY_COLORS['unmapped-slug']).toBeUndefined()
  })

  it('contains exactly 23 categories', () => {
    const keys = Object.keys(CATEGORY_COLORS)
    expect(keys).toHaveLength(23)
  })

  it('all light and dark mode color pairs have WCAG AA contrast (≥4.5:1)', () => {
    // Helper to parse HSL string and convert to RGB
    function hslToRgb(hslStr: string): [number, number, number] {
      const match = hslStr.match(/hsl\((\d+)\s+(\d+)%\s+(\d+)%\)/)
      if (!match) throw new Error(`Invalid HSL format: ${hslStr}`)

      const h = parseInt(match[1])
      const s = parseInt(match[2]) / 100
      const l = parseInt(match[3]) / 100

      // HSL to RGB conversion
      const c = (1 - Math.abs(2 * l - 1)) * s
      const hPrime = h / 60
      const x = c * (1 - Math.abs((hPrime % 2) - 1))
      let r = 0,
        g = 0,
        b = 0

      if (hPrime >= 0 && hPrime < 1) {
        r = c
        g = x
        b = 0
      } else if (hPrime >= 1 && hPrime < 2) {
        r = x
        g = c
        b = 0
      } else if (hPrime >= 2 && hPrime < 3) {
        r = 0
        g = c
        b = x
      } else if (hPrime >= 3 && hPrime < 4) {
        r = 0
        g = x
        b = c
      } else if (hPrime >= 4 && hPrime < 5) {
        r = x
        g = 0
        b = c
      } else if (hPrime >= 5 && hPrime < 6) {
        r = c
        g = 0
        b = x
      }

      const m = l - c / 2
      return [
        Math.round((r + m) * 255),
        Math.round((g + m) * 255),
        Math.round((b + m) * 255),
      ]
    }

    // Calculate WCAG relative luminance
    function getRelativeLuminance(rgb: [number, number, number]): number {
      const [r, g, b] = rgb.map((val) => {
        const normalized = val / 255
        return normalized <= 0.03928
          ? normalized / 12.92
          : Math.pow((normalized + 0.055) / 1.055, 2.4)
      })
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }

    // Calculate WCAG contrast ratio
    function getContrastRatio(color1: string, color2: string): number {
      const lum1 = getRelativeLuminance(hslToRgb(color1))
      const lum2 = getRelativeLuminance(hslToRgb(color2))
      const lighter = Math.max(lum1, lum2)
      const darker = Math.min(lum1, lum2)
      return (lighter + 0.05) / (darker + 0.05)
    }

    // Test all categories
    Object.entries(CATEGORY_COLORS).forEach(([slug, colors]) => {
      const lightContrast = getContrastRatio(colors.bg, colors.fg)
      const darkContrast = getContrastRatio(colors.darkBg, colors.darkFg)

      expect(lightContrast).toBeGreaterThanOrEqual(
        4.5,
        `${slug} light mode contrast (${lightContrast.toFixed(2)}:1) below 4.5:1`,
      )
      expect(darkContrast).toBeGreaterThanOrEqual(
        4.5,
        `${slug} dark mode contrast (${darkContrast.toFixed(2)}:1) below 4.5:1`,
      )
    })
  })
})
