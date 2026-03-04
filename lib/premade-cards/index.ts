/**
 * Pre-made cards for VoiceBridge - comprehensive communication cards
 * for autistic children learning to speak and interact.
 *
 * This module provides 5 categories of premade cards:
 * - Foods (125 cards): meals, snacks, drinks, condiments, textures
 * - Activities (125 cards): play, sensory, regulation, daily routines
 * - Places (120 cards): destinations, home rooms, therapy locations
 * - People (110 cards): family, friends, professionals, behavioral supports
 * - Vocabulary Words (135 cards): core vocabulary, emotions, sensory descriptors
 *
 * Total: 615 professionally curated cards by BCBA standards
 */

export * from './types'
export { PREMADE_FOODS } from './foods'
export { PREMADE_ACTIVITIES } from './activities'
export { PREMADE_PLACES } from './places'
export { PREMADE_PEOPLE } from './people'
export { PREMADE_VOCAB_WORDS } from './vocab-words'

import { PremadeCard, PremadePlaceCard } from './types'
import { PREMADE_FOODS } from './foods'
import { PREMADE_ACTIVITIES } from './activities'
import { PREMADE_PLACES } from './places'
import { PREMADE_PEOPLE } from './people'
import { PREMADE_VOCAB_WORDS } from './vocab-words'

/**
 * Lookup premade cards by list model name (the plural API route name).
 * Returns undefined for unrecognized model names.
 */
export function getPremadeCards(
  listModelName: string,
): PremadeCard[] | PremadePlaceCard[] | undefined {
  switch (listModelName) {
    case 'foods':
      return PREMADE_FOODS
    case 'activities':
      return PREMADE_ACTIVITIES
    case 'places':
      return PREMADE_PLACES
    case 'villagers':
      return PREMADE_PEOPLE
    case 'vocabWords':
      return PREMADE_VOCAB_WORDS
    default:
      return undefined
  }
}
