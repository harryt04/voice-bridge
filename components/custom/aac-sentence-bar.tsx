'use client'

import React, { useContext, useRef, useCallback } from 'react'
import { AacSentenceContext, AacPreferencesContext } from '@/app/aac/layout'
import { speak } from '@/utils/aac-speech'
import { Button } from '@/components/ui/button'
import { Play, Trash2, X } from 'lucide-react'

/**
 * AacSentenceBar: Sticky sentence bar for AAC board
 *
 * Addresses:
 * - G15 hidden-button DOM pattern: Invisible button behind chip strip
 * - G9 dark mode testing: Verify colors in dark mode
 * - Touch targets: Speak/Clear 48px, remove buttons 44×44px
 * - Accessibility: aria-live on chip strip, proper focus management
 */
export function AacSentenceBar() {
  const sentenceContext = useContext(AacSentenceContext)
  const preferencesContext = useContext(AacPreferencesContext)
  const speakButtonRef = useRef<HTMLButtonElement>(null)

  const handleSpeakSentence = useCallback(() => {
    if (!sentenceContext) return
    const text = sentenceContext.sentence.map((w) => w.label).join(' ')
    speak(text, {
      voiceName: preferencesContext?.preferences?.voiceName,
      speechRate: preferencesContext?.preferences?.speechRate ?? 1,
      speechPitch: preferencesContext?.preferences?.speechPitch ?? 1,
    })
  }, [sentenceContext, preferencesContext])

  const handleClear = useCallback(() => {
    sentenceContext?.clearSentence()
    // Move focus back to Speak button
    setTimeout(() => speakButtonRef.current?.focus(), 0)
  }, [sentenceContext])

  const handleRemoveWord = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation()
      sentenceContext?.removeWord(id)
    },
    [sentenceContext]
  )

  if (!sentenceContext || !preferencesContext) {
    return null
  }

  const { sentence, removeWord, clearSentence } = sentenceContext
  const { preferences } = preferencesContext

  return (
    <div className="sticky top-0 z-50 flex min-h-16 items-center gap-2 bg-primary px-3 py-2 shadow-md">
      {/* Hidden button behind chip strip for tap-to-speak (G15 pattern) */}
      <div className="relative flex-1">
        <button
          onClick={handleSpeakSentence}
          className="absolute inset-0 z-0 cursor-pointer opacity-0"
          aria-hidden="true"
          aria-label="Tap to speak sentence"
        />

        {/* Chip strip - z-10 above button, aria-live for screen readers */}
        <div
          className="relative z-10 flex gap-2 overflow-x-auto scroll-smooth"
          aria-live="polite"
          aria-atomic="false"
        >
          {sentence.length === 0 ? (
            <p className="flex items-center font-sans text-sm italic text-primary-foreground/50">
              Tap symbols to build a sentence
            </p>
          ) : (
            sentence.map((word) => (
              <button
                key={word.id}
                className="flex min-h-11 shrink-0 items-center gap-1 rounded-full border border-primary-foreground/30 bg-primary-foreground/20 px-2 py-1 text-primary-foreground animate-in slide-in-from-right-2 fade-in duration-150"
              >
                <img
                  src={word.imageUrl}
                  alt={word.label}
                  className="h-6 w-6 rounded-sm object-contain"
                />
                <span className="font-sans text-base font-medium">{word.label}</span>
                <button
                  onClick={(e) => handleRemoveWord(e, word.id)}
                  className="flex h-11 w-11 items-center justify-center text-sm hover:text-primary-foreground/80"
                  aria-label={`Remove ${word.label}`}
                  type="button"
                >
                  ×
                </button>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex shrink-0 gap-2">
        <Button
          ref={speakButtonRef}
          onClick={handleSpeakSentence}
          disabled={sentence.length === 0}
          className="flex h-12 min-w-20 items-center gap-2 rounded-xl bg-accent px-4 font-sans font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
          aria-label="Speak sentence"
        >
          <Play size={18} />
          <span className="hidden sm:inline">Speak</span>
        </Button>

        <Button
          onClick={handleClear}
          disabled={sentence.length === 0}
          className="flex h-12 w-12 items-center justify-center rounded-xl text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 disabled:opacity-50"
          variant="ghost"
          aria-label="Clear sentence"
        >
          <Trash2 size={20} />
        </Button>
      </div>
    </div>
  )
}
