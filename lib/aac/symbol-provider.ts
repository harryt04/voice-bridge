/**
 * Symbol Provider Architecture
 *
 * Defines the interface and types for AAC symbol providers.
 * Supports multiple provider implementations (Mulberry, ARASAAC, Custom)
 * composable at runtime via the SymbolProvider interface.
 */

export type SymbolSource = 'mulberry' | 'arasaac' | 'custom'

export type AacSymbol = {
  id: string
  label: string
  imageUrl: string // absolute URL or /public path
  tags?: string[]
  category: string // category slug, e.g. 'core', 'feelings'
  source: SymbolSource
}

export type AacCategory = {
  slug: string
  label: string
  icon: string // lucide icon name
}

export interface SymbolProvider {
  getCategories(): AacCategory[]
  getSymbolsByCategory(categorySlug: string): AacSymbol[]
  searchSymbols(query: string): AacSymbol[] // Implemented for interface contract; no UI consumer in this epic
}

/**
 * 12 AAC categories with display labels and lucide icon names.
 * Used by all symbol providers and the category grid component.
 */
export const AAC_CATEGORIES: AacCategory[] = [
  { slug: 'core', label: 'Core Words', icon: 'Star' },
  { slug: 'feelings', label: 'Feelings', icon: 'Heart' },
  { slug: 'people', label: 'People', icon: 'User' },
  { slug: 'actions', label: 'Actions', icon: 'Zap' },
  { slug: 'food-drink', label: 'Food & Drink', icon: 'UtensilsCrossed' },
  { slug: 'places', label: 'Places', icon: 'MapPin' },
  { slug: 'objects', label: 'Objects', icon: 'Box' },
  { slug: 'describing', label: 'Describing', icon: 'Palette' },
  { slug: 'social', label: 'Social', icon: 'MessageCircle' },
  { slug: 'body', label: 'Body', icon: 'PersonStanding' },
  { slug: 'time', label: 'Time', icon: 'Clock' },
  { slug: 'questions', label: 'Questions', icon: 'HelpCircle' },
]
