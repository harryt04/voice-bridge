'use client'

import { useContext, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AacSymbolGrid } from '@/components/custom/aac-symbol-grid'
import { useSpeakerContext } from '@/hooks/use-speakers'
import { AAC_CATEGORIES } from '@/lib/aac/symbol-provider'
import { mulberryProvider } from '@/lib/aac/mulberry-provider'
import {
  AacPreferencesContext,
  type AacPreferencesContextValue,
} from '@/app/aac/layout'

/**
 * AAC Symbol Grid Page
 *
 * Client component for displaying symbols by category.
 * - Receives categorySlug as a param
 * - Gets category label from AAC_CATEGORIES
 * - Gets preferences from context (not calling useAacPreferences again)
 * - Header with back button and category label
 * - AacSymbolGrid component with preferences-based props
 *
 * Per TRD §7.6, exact JSX for header.
 */
export default function AacCategoryPage({
  params,
}: {
  params: { categorySlug: string }
}) {
  const router = useRouter()
  const { selectedSpeaker } = useSpeakerContext()
  const preferencesContext = useContext(AacPreferencesContext)

  const preferencesContextValue = preferencesContext as AacPreferencesContextValue

  // Find category label from slug
  const category = AAC_CATEGORIES.find((cat) => cat.slug === params.categorySlug)

  // Safely extract preferences from context
  const preferences = preferencesContextValue?.preferences

  // Fetch symbols for this category (useMemo to avoid re-fetching)
  const symbols = useMemo(() => {
    return mulberryProvider.getSymbolsByCategory(params.categorySlug)
  }, [params.categorySlug])

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-muted-foreground">Category not found</p>
      </div>
    )
  }

  if (!selectedSpeaker) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-muted-foreground">No speaker selected</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with back button and category label - exact JSX per TRD §7.6 */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/aac')}
        >
          <ChevronLeft size={20} />
        </Button>
        <h1 className="font-display text-2xl font-semibold">{category.label}</h1>
      </div>

      {/* Symbol grid - component from WU-3-F */}
      <div className="flex-1 overflow-y-auto">
        <AacSymbolGrid symbols={symbols} />
      </div>
    </div>
  )
}
