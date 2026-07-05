/**
 * OpenSymbols Symbol Provider
 *
 * Implements the SymbolProvider interface backed by the OpenSymbols API
 * (opensymbols.org), which requires a shared secret to authenticate — so
 * all network calls go through the server-side proxy at
 * /api/aac/symbols/search rather than calling the external API directly.
 */

import type { SymbolProvider, AacSymbol, AacCategory } from './symbol-provider'
import { AAC_CATEGORIES } from './symbol-provider'

export class OpenSymbolsProvider implements SymbolProvider {
  getCategories(): AacCategory[] {
    return AAC_CATEGORIES
  }

  // OpenSymbols has no slug-based category filter equivalent to
  // AAC_CATEGORIES, and category browsing must stay synchronous per the
  // SymbolProvider interface — so this always returns empty. Category
  // browsing under 'opensymbols' falls back to whatever the search bar
  // returns; use searchSymbols() for actual results.
  getSymbolsByCategory(_categorySlug: string): AacSymbol[] {
    return []
  }

  async searchSymbols(query: string): Promise<AacSymbol[]> {
    const res = await fetch(
      `/api/aac/symbols/search?q=${encodeURIComponent(query)}`,
    )
    if (!res.ok) return []
    return (await res.json()) as AacSymbol[]
  }
}

/**
 * Singleton instance of the OpenSymbols provider.
 * Used across AAC pages and components for symbol lookup.
 */
export const openSymbolsProvider = new OpenSymbolsProvider()
