/**
 * Mulberry Symbol Provider
 *
 * Implements the SymbolProvider interface using static Mulberry symbol data.
 * Provides ~3,500 AAC symbols across 12 categories.
 */

import type { SymbolProvider, AacSymbol, AacCategory } from './symbol-provider'
import { AAC_CATEGORIES } from './symbol-provider'
import symbolData from './mulberry-symbols.json'

export class MulberrySymbolProvider implements SymbolProvider {
  getCategories(): AacCategory[] {
    return AAC_CATEGORIES
  }

  getSymbolsByCategory(categorySlug: string): AacSymbol[] {
    return (symbolData as AacSymbol[]).filter(s => s.category === categorySlug)
  }

  searchSymbols(query: string): AacSymbol[] {
    const q = query.toLowerCase()
    return (symbolData as AacSymbol[]).filter(
      s => s.label.toLowerCase().includes(q) || s.tags?.some(t => t.toLowerCase().includes(q))
    )
  }
}

/**
 * Singleton instance of the Mulberry provider.
 * Used across AAC pages and components for symbol lookup.
 */
export const mulberryProvider = new MulberrySymbolProvider()
