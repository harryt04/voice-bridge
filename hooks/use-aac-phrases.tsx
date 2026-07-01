'use client'

import { useQuery } from '@tanstack/react-query'
import type { AacPhrase } from '@/models'

/**
 * React Query hook to fetch AAC phrases for a speaker.
 *
 * Fetches from GET /api/aac/phrases?speakerId=
 * Throws if response is not ok.
 * Disabled when speakerId is not provided.
 *
 * Used to display custom quick phrases alongside default phrases.
 *
 * @param speakerId - The speaker ID to fetch phrases for
 * @returns Query result with data (AacPhrase[]), loading, error states
 */
export function useAacPhrases(speakerId: string) {
  return useQuery({
    queryKey: ['aacPhrases', speakerId],
    queryFn: async () => {
      const res = await fetch(`/api/aac/phrases?speakerId=${speakerId}`)
      if (!res.ok) throw new Error(`Phrases fetch failed: ${res.status}`)
      return res.json() as Promise<AacPhrase[]>
    },
    enabled: !!speakerId,
  })
}
