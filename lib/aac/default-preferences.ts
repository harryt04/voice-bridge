/**
 * AAC Default Preferences
 *
 * Sensible defaults for AAC user preferences.
 * Used by GET /api/aac/preferences when no preferences document exists for a speaker.
 * Per TRD §6.5, returned as-is (not a 404) to allow graceful degradation.
 * This constant is centralized for API reuse and ensures consistency across the app.
 *
 * Addresses G10: Centralized default preferences for API fallback.
 */

import type { AacUserPreferences } from '@/models'

/**
 * Factory function to create default preferences for a given speaker.
 * @param speakerId - The speaker ID to bind preferences to
 * @returns Default preferences object
 */
export function getDefaultPreferences(
  speakerId: string,
): Omit<AacUserPreferences, '_id' | 'updatedAt'> {
  return {
    speakerId,
    voiceName: undefined,
    speechRate: 1,
    speechPitch: 1,
    speakOnSymbolTap: true,
    phraseTapBehavior: 'speak',
    symbolSource: 'mulberry',
    symbolLabelPosition: 'below',
    mobileGridColumns: 3,
  }
}

/**
 * Default preference values (without speakerId binding).
 * Used in API routes when no custom preferences exist.
 * The spread of this object + speakerId is returned to the client.
 */
export const DEFAULT_PREFERENCES = {
  voiceName: undefined,
  speechRate: 1,
  speechPitch: 1,
  speakOnSymbolTap: true,
  phraseTapBehavior: 'speak' as const,
  symbolSource: 'mulberry' as const,
  symbolLabelPosition: 'below' as const,
  mobileGridColumns: 3 as const,
}
