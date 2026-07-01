import { describe, it, expect } from 'vitest'
import { CATEGORY_COLORS } from './category-colors'

describe('CATEGORY_COLORS', () => {
  it('includes all 12 AAC category slugs', () => {
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

  it('contains exactly 12 categories', () => {
    const keys = Object.keys(CATEGORY_COLORS)
    expect(keys).toHaveLength(12)
  })
})
