'use client'

import React, { createContext, useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import { useSpeakerContext } from '@/hooks/use-speakers'
import { useAacPreferences } from '@/hooks/use-aac-preferences'
import type { AacUserPreferences } from '@/models'
import { AacSentenceBar } from '@/components/custom/aac-sentence-bar'

/**
 * SentenceWord: A word in the AAC sentence bar
 */
export type SentenceWord = {
  id: string
  label: string
  imageUrl: string
}

/**
 * AacSentenceContextValue: Context value for sentence bar state management
 */
export type AacSentenceContextValue = {
  sentence: SentenceWord[]
  addWord: (word: Omit<SentenceWord, 'id'>) => void
  removeWord: (id: string) => void
  clearSentence: () => void
}

/**
 * AacPreferencesContextValue: Context value for AAC preferences with loading state
 */
export type AacPreferencesContextValue = {
  preferences: AacUserPreferences | null
  loading: boolean
  error: Error | null
}

/**
 * AacSentenceContext: Provides sentence bar state to sub-pages
 */
export const AacSentenceContext = createContext<AacSentenceContextValue | null>(
  null
)

/**
 * AacPreferencesContext: Provides AAC preferences to sub-pages
 */
export const AacPreferencesContext = createContext<AacPreferencesContextValue | null>(
  null
)

/**
 * AAC Layout: Client component that provides sentence and preferences contexts
 *
 * - Auth guard: redirects to /login if no session
 * - Preferences fetching: single hook call for entire AAC tree
 * - Sentence bar: rendered above children
 * - Contexts: exported for use in sub-pages (WU-3-F, WU-3-G)
 */
export default function AacLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { data: session } = useSession()
  const { selectedSpeaker } = useSpeakerContext()
  const speakerId = selectedSpeaker?._id

  // Fetch preferences once per layout
  const { data: preferences, isLoading, error } = useAacPreferences(speakerId ?? '')

  // Auth guard: redirect to /login if no session
  useEffect(() => {
    if (session === null || session === undefined) {
      router.push('/login')
    }
  }, [session, router])

  // Sentence bar state management
  const [sentence, setSentence] = useState<SentenceWord[]>([])

  const addWord = useCallback((word: Omit<SentenceWord, 'id'>) => {
    setSentence((prev) => [
      ...prev,
      {
        ...word,
        id: `${Date.now()}-${Math.random()}`, // Simple ID generation
      },
    ])
  }, [])

  const removeWord = useCallback((id: string) => {
    setSentence((prev) => prev.filter((w) => w.id !== id))
  }, [])

  const clearSentence = useCallback(() => {
    setSentence([])
  }, [])

  // If not authenticated, don't render anything (auth guard will redirect)
  if (!session) {
    return null
  }

  const sentenceContextValue: AacSentenceContextValue = {
    sentence,
    addWord,
    removeWord,
    clearSentence,
  }

  const preferencesContextValue: AacPreferencesContextValue = {
    preferences: preferences ?? null,
    loading: isLoading,
    error: error instanceof Error ? error : null,
  }

  return (
    <AacSentenceContext.Provider value={sentenceContextValue}>
      <AacPreferencesContext.Provider value={preferencesContextValue}>
        <AacSentenceBar />
        {children}
      </AacPreferencesContext.Provider>
    </AacSentenceContext.Provider>
  )
}
