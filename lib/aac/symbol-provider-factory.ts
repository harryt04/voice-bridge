/**
 * Resolves the SymbolProvider implementation for a given preference value.
 * 'arasaac' and 'custom' have no dedicated provider implementation yet, so
 * they fall back to Mulberry.
 */

import type { SymbolProvider, SymbolSource } from './symbol-provider'
import { mulberryProvider } from './mulberry-provider'
import { openSymbolsProvider } from './opensymbols-provider'

export function getSymbolProvider(source: SymbolSource): SymbolProvider {
  switch (source) {
    case 'opensymbols':
      return openSymbolsProvider
    case 'mulberry':
    case 'arasaac':
    case 'custom':
    default:
      return mulberryProvider
  }
}
