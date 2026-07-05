import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { OpenSymbolsProvider } from './opensymbols-provider'
import { AAC_CATEGORIES } from './symbol-provider'

describe('OpenSymbolsProvider', () => {
  const provider = new OpenSymbolsProvider()
  let fetchMock: any

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('getCategories', () => {
    it('returns all AAC categories', () => {
      expect(provider.getCategories()).toEqual(AAC_CATEGORIES)
    })
  })

  describe('getSymbolsByCategory', () => {
    it('always returns an empty array (no sync category endpoint)', () => {
      expect(provider.getSymbolsByCategory('core')).toEqual([])
      expect(provider.getSymbolsByCategory('unknown-slug')).toEqual([])
    })
  })

  describe('searchSymbols', () => {
    it('calls the server-side proxy route with the query', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: '1',
            label: 'Cat',
            imageUrl: 'https://example.com/cat.png',
            category: 'core',
            source: 'opensymbols',
          },
        ],
      })

      const results = await provider.searchSymbols('cat')

      expect(fetchMock).toHaveBeenCalledWith('/api/aac/symbols/search?q=cat')
      expect(results).toHaveLength(1)
      expect(results[0].label).toBe('Cat')
    })

    it('returns an empty array when the proxy route errors', async () => {
      fetchMock.mockResolvedValueOnce({ ok: false })
      const results = await provider.searchSymbols('cat')
      expect(results).toEqual([])
    })

    it('URL-encodes the query', async () => {
      fetchMock.mockResolvedValueOnce({ ok: true, json: async () => [] })
      await provider.searchSymbols('big cat')
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/aac/symbols/search?q=big%20cat',
      )
    })
  })
})
