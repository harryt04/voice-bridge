import { Speaker } from '@/models'

/**
 * Sentinel ID used to identify the pre-made speaker.
 * This value will never collide with a real MongoDB ObjectId.
 */
export const PRE_MADE_SPEAKER_ID = 'premade'

/**
 * A virtual speaker that ships with the app. When selected, the UI
 * renders the static card sets below instead of fetching from the API.
 */
export const PRE_MADE_SPEAKER: Speaker = {
  _id: PRE_MADE_SPEAKER_ID,
  name: 'Pre-made Cards',
  parentId: '',
  villagerIds: [],
}

export function isPremadeSpeaker(speaker: Speaker | null): boolean {
  return speaker?._id === PRE_MADE_SPEAKER_ID
}

// ─── Shared card type ──────────────────────────────────────────────
export type PremadeCard = {
  _id: string
  name: string
  description?: string
  icon: string // lucide-react icon name in PascalCase
  speakerId: typeof PRE_MADE_SPEAKER_ID
}

export type PremadePlaceCard = PremadeCard & {
  address?: string
}

// Helper to create a card with a stable _id
export const card = (
  category: string,
  index: number,
  name: string,
  icon: string,
  description?: string,
): PremadeCard => ({
  _id: `premade-${category}-${index}`,
  name,
  icon,
  description: description || '',
  speakerId: PRE_MADE_SPEAKER_ID,
})

export const placeCard = (
  index: number,
  name: string,
  icon: string,
  description?: string,
  address?: string,
): PremadePlaceCard => ({
  ...card('places', index, name, icon, description),
  address,
})
