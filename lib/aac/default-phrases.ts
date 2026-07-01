/**
 * AAC Default Phrases
 *
 * Pre-baked set of 18 common phrases organized by category.
 * These are always displayed in the Quick Phrases page regardless of speaker selection.
 * Used as a fallback when no custom phrases exist.
 * Per TRD §7.7, each phrase has: text, category, and optional icon.
 */

export type DefaultPhrase = {
  text: string
  category: string
  icon?: string
}

export const DEFAULT_PHRASES: DefaultPhrase[] = [
  // Social
  { text: 'Hello!', category: 'Social' },
  { text: 'Thank you', category: 'Social' },
  { text: 'Please', category: 'Social' },
  { text: 'Yes', category: 'Social' },
  { text: 'No', category: 'Social' },
  { text: "I don't know", category: 'Social' },

  // Needs
  { text: 'I need help', category: 'Needs' },
  { text: 'I need a break', category: 'Needs' },
  { text: 'I am hungry', category: 'Needs' },
  { text: 'I am thirsty', category: 'Needs' },
  { text: 'I need the bathroom', category: 'Needs' },

  // Feelings
  { text: 'I am happy', category: 'Feelings' },
  { text: 'I am sad', category: 'Feelings' },
  { text: 'I am upset', category: 'Feelings' },
  { text: 'I am tired', category: 'Feelings' },

  // Emergency
  { text: 'I feel sick', category: 'Emergency' },
  { text: 'I am in pain', category: 'Emergency' },
  { text: 'Call my caregiver', category: 'Emergency' },
]
