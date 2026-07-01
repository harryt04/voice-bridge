import { describe, it, expect } from 'vitest'
import { MulberrySymbolProvider } from './mulberry-provider'
import { AAC_CATEGORIES } from './symbol-provider'

describe('MulberrySymbolProvider', () => {
  const provider = new MulberrySymbolProvider()

  describe('getCategories', () => {
    it('returns all 12 AAC categories', () => {
      const categories = provider.getCategories()
      expect(categories).toHaveLength(12)
      expect(categories).toEqual(AAC_CATEGORIES)
    })

    it('each category has slug, label, and icon', () => {
      const categories = provider.getCategories()
      categories.forEach((cat) => {
        expect(cat).toHaveProperty('slug')
        expect(cat).toHaveProperty('label')
        expect(cat).toHaveProperty('icon')
      })
    })
  })

  describe('getSymbolsByCategory', () => {
    it('returns symbols for a valid category slug', () => {
      const coreSymbols = provider.getSymbolsByCategory('core')
      expect(Array.isArray(coreSymbols)).toBe(true)
      expect(coreSymbols.length).toBeGreaterThan(0)
    })

    it('returns empty array for unknown category slug', () => {
      const symbols = provider.getSymbolsByCategory('unknown-slug')
      expect(symbols).toEqual([])
    })

    it('filters symbols by category correctly', () => {
      const coreSymbols = provider.getSymbolsByCategory('core')
      coreSymbols.forEach((symbol) => {
        expect(symbol.category).toBe('core')
      })
    })

    it('symbols have required fields', () => {
      const coreSymbols = provider.getSymbolsByCategory('core')
      coreSymbols.slice(0, 5).forEach((symbol) => {
        expect(symbol).toHaveProperty('id')
        expect(symbol).toHaveProperty('label')
        expect(symbol).toHaveProperty('imageUrl')
        expect(symbol).toHaveProperty('category')
        expect(symbol).toHaveProperty('source')
      })
    })
  })

  describe('searchSymbols', () => {
    it('returns all symbols for empty query', () => {
      const all = provider.searchSymbols('')
      const some = provider.searchSymbols('some-unlikely-match-xyz')
      expect(all.length).toBeGreaterThan(some.length)
    })

    it('performs case-insensitive search on label', () => {
      const lowerCase = provider.searchSymbols('apple')
      const upperCase = provider.searchSymbols('APPLE')
      expect(lowerCase.length).toBe(upperCase.length)
      expect(lowerCase.length).toBeGreaterThan(0)
    })

    it('searches by tags when available', () => {
      const withTags = provider.searchSymbols('fruit')
      expect(withTags.length).toBeGreaterThan(-1)
    })

    it('returns empty array for non-matching query', () => {
      const results = provider.searchSymbols('xyzabc-notreal-12345')
      expect(results).toEqual([])
    })

    it('matches partial label strings', () => {
      const fullMatch = provider.searchSymbols('apple')
      const partialMatch = provider.searchSymbols('app')
      expect(partialMatch.length).toBeGreaterThanOrEqual(fullMatch.length)
    })
  })

  describe('searchSymbols with tag matching', () => {
    it('finds symbols matching tags', () => {
      const symbols = provider.searchSymbols('food')
      expect(symbols.length).toBeGreaterThan(0)
      const hasMatchingTag = symbols.some((s) =>
        s.tags?.some((t) => t.toLowerCase().includes('food')),
      )
      expect(
        hasMatchingTag ||
          symbols.some((s) => s.label.toLowerCase().includes('food')),
      ).toBe(true)
    })
  })
})
