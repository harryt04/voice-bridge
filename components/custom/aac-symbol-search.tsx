'use client'

import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { AacSymbolGrid } from '@/components/custom/aac-symbol-grid'
import type { AacSymbol, SymbolProvider } from '@/lib/aac/symbol-provider'

type AacSymbolSearchProps = {
  provider: SymbolProvider
  categorySymbols: AacSymbol[]
  onSymbolTap?: (symbol: AacSymbol) => void
}

const DEBOUNCE_MS = 300

/**
 * AacSymbolSearch: search box + symbol grid
 *
 * Falls back to the category-filtered `categorySymbols` when the search box
 * is empty; otherwise debounces the query and shows `provider.searchSymbols`
 * results. Works with both synchronous providers (Mulberry) and
 * network-backed providers (OpenSymbols) since `searchSymbols` may return
 * either an array or a Promise.
 */
export function AacSymbolSearch({
  provider,
  categorySymbols,
  onSymbolTap,
}: AacSymbolSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<AacSymbol[] | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (!query.trim()) {
      setResults(null)
      setIsSearching(false)
      return
    }

    let cancelled = false
    setIsSearching(true)

    const timer = setTimeout(async () => {
      const found = await provider.searchSymbols(query)
      if (!cancelled) {
        setResults(found)
        setIsSearching(false)
      }
    }, DEBOUNCE_MS)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query, provider])

  const symbolsToShow = results ?? categorySymbols

  return (
    <div className="flex flex-col gap-3">
      <div className="relative px-3 pt-2">
        <Search
          size={16}
          className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="search"
          placeholder="Search symbols..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
          aria-label="Search symbols"
        />
      </div>

      {isSearching && (
        <p className="px-3 text-sm text-muted-foreground">Searching…</p>
      )}

      <AacSymbolGrid symbols={symbolsToShow} onSymbolTap={onSymbolTap} />
    </div>
  )
}
