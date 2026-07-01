'use client'

import React, { useState, useContext, useCallback, useRef } from 'react'
import { AacPreferencesContext } from '@/app/aac/layout'
import { speak } from '@/utils/aac-speech'
import type { AacSymbol } from '@/lib/aac/symbol-provider'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ChevronDown, ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'

type AacSymbolGridProps = {
  symbols: AacSymbol[]
  onSymbolTap?: (symbol: AacSymbol) => void
}

/**
 * AacSymbolGrid: Symbol grid with responsive columns and load-more pagination
 *
 * Addresses:
 * - Responsive columns: mobileGridColumns from preferences
 * - Touch targets: min-h-72px
 * - Load-more pagination: 200 items visible, button for next batch
 * - Long-press tooltip: 500ms on touch → 96×96 image + label
 * - Tap behavior: speak or append per preferences
 * - ARIA: aria-label on each button
 */
export function AacSymbolGrid({ symbols, onSymbolTap }: AacSymbolGridProps) {
  const preferencesContext = useContext(AacPreferencesContext)
  const [visibleCount, setVisibleCount] = useState(200)

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + 200, symbols.length))
  }, [symbols.length])

  if (!preferencesContext) return null

  const { preferences } = preferencesContext
  const mobileGridColumns = preferences?.mobileGridColumns ?? 3
  const visibleSymbols = symbols.slice(0, visibleCount)
  const hasMore = visibleCount < symbols.length

  return (
    <div className="flex flex-col gap-4 p-3">
      <div
        className={cn(
          'grid gap-3',
          mobileGridColumns === 2 && 'grid-cols-2',
          mobileGridColumns === 3 && 'grid-cols-3',
          mobileGridColumns === 4 && 'grid-cols-4',
          'sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6',
        )}
      >
        {visibleSymbols.map((symbol) => (
          <AacSymbolCell
            key={symbol.id}
            symbol={symbol}
            preferences={preferences}
            onSymbolTap={onSymbolTap}
          />
        ))}
      </div>

      {/* Load-more button */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button onClick={handleLoadMore} variant="outline" className="gap-2">
            Load More
            <ChevronDown size={16} />
          </Button>
        </div>
      )}
    </div>
  )
}

type AacSymbolCellProps = {
  symbol: AacSymbol
  preferences: any // AacUserPreferences
  onSymbolTap?: (symbol: AacSymbol) => void
}

function AacSymbolCell({
  symbol,
  preferences,
  onSymbolTap,
}: AacSymbolCellProps) {
  const [isLongPressing, setIsLongPressing] = useState(false)
  const [imgError, setImgError] = useState(false)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)

  const handleTap = useCallback(() => {
    onSymbolTap?.(symbol)

    // Speak on tap if preference enabled
    if (preferences?.speakOnSymbolTap !== false) {
      speak(symbol.label, {
        voiceName: preferences?.voiceName,
        speechRate: preferences?.speechRate ?? 1,
        speechPitch: preferences?.speechPitch ?? 1,
      })
    }
  }, [symbol, preferences, onSymbolTap])

  const handleTouchStart = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      setIsLongPressing(true)
    }, 500)
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    setIsLongPressing(false)
  }, [])

  // Determine label position
  const labelPosition = preferences?.symbolLabelPosition ?? 'below'
  const showLabel = labelPosition !== 'hidden'

  return (
    <TooltipProvider>
      <Tooltip open={isLongPressing}>
        <TooltipTrigger asChild>
          <button
            onClick={handleTap}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
            className="min-h-18 flex flex-col items-center gap-1 rounded-xl border border-border/50 bg-card p-1.5 transition-colors duration-100 hover:border-primary hover:bg-primary/5 active:scale-[0.96] active:bg-primary/10"
            aria-label={symbol.label}
          >
            {labelPosition === 'above' && showLabel && (
              <span className="w-full truncate text-center font-sans text-sm font-semibold leading-tight text-foreground">
                {symbol.label}
              </span>
            )}

            {imgError ? (
              <ImageOff
                className="aspect-square w-full text-muted-foreground/50"
                strokeWidth={1.5}
              />
            ) : (
              <img
                src={symbol.imageUrl}
                alt={symbol.label}
                loading="lazy"
                onError={() => setImgError(true)}
                className="aspect-square w-full object-contain dark:invert"
              />
            )}

            {labelPosition === 'below' && showLabel && (
              <span className="w-full truncate text-center font-sans text-sm font-semibold leading-tight text-foreground">
                {symbol.label}
              </span>
            )}

            {!showLabel && <span className="sr-only">{symbol.label}</span>}
          </button>
        </TooltipTrigger>

        {/* Tooltip with larger image and label */}
        {isLongPressing && (
          <TooltipContent side="top" className="gap-2">
            <div className="flex flex-col items-center gap-2">
              {imgError ? (
                <ImageOff
                  className="h-24 w-24 text-muted-foreground/50"
                  strokeWidth={1.5}
                />
              ) : (
                <img
                  src={symbol.imageUrl}
                  alt={symbol.label}
                  className="h-24 w-24 object-contain dark:invert"
                />
              )}
              <span className="text-center font-display text-base font-semibold">
                {symbol.label}
              </span>
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
}
