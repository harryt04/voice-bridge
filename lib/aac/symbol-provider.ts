/**
 * Symbol Provider Architecture
 *
 * Defines the interface and types for AAC symbol providers.
 * Supports multiple provider implementations (Mulberry, ARASAAC, Custom)
 * composable at runtime via the SymbolProvider interface.
 */

export type SymbolSource = 'mulberry' | 'arasaac' | 'custom' | 'opensymbols'

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
  // Network-backed providers (e.g. OpenSymbols) resolve this asynchronously;
  // callers should always `await` the result.
  searchSymbols(query: string): AacSymbol[] | Promise<AacSymbol[]>
}

/**
 * 23 AAC categories with display labels and lucide icon names.
 * Used by all symbol providers, the category grid component, and phrase
 * category grouping (phrase categories and symbol categories share this
 * one taxonomy).
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
  { slug: 'needs', label: 'Needs', icon: 'HandHelping' },
  { slug: 'emergency', label: 'Emergency', icon: 'AlertTriangle' },
  { slug: 'rejecting', label: 'Rejecting', icon: 'XCircle' },
  { slug: 'directing', label: 'Directing', icon: 'ArrowRight' },
  { slug: 'mealtime', label: 'Mealtime', icon: 'Utensils' },
  { slug: 'school', label: 'School', icon: 'GraduationCap' },
  { slug: 'community', label: 'Community', icon: 'Building2' },
  { slug: 'play', label: 'Play', icon: 'Gamepad2' },
  { slug: 'home', label: 'Home', icon: 'Home' },
  { slug: 'choices', label: 'Choices', icon: 'ListChecks' },
  { slug: 'conversation', label: 'Conversation', icon: 'MessagesSquare' },
]
