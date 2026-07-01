'use client'

import { useQuery } from '@tanstack/react-query'
import type { AacUserPreferences } from '@/models'

/**
 * React Query hook to fetch AAC preferences for a speaker.
 *
 * Fetches from GET /api/aac/preferences?speakerId=
 * Throws if response is not ok.
 * Disabled when speakerId is not provided.
 *
 * Addresses G10: Centralized query hook with sensible stale times.
 *
 * @param speakerId - The speaker ID to fetch preferences for
 * @returns Query result with data (AacUserPreferences), loading, error states
 */
export function useAacPreferences(speakerId: string) {
  return useQuery({
    queryKey: ['aacPreferences', speakerId],
    queryFn: async () => {
      const res = await fetch(`/api/aac/preferences?speakerId=${speakerId}`)
      if (!res.ok) throw new Error(`Preferences fetch failed: ${res.status}`)
      return res.json() as Promise<AacUserPreferences>
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!speakerId,
  })
}
