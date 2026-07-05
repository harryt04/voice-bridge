export type SymbolSource = 'mulberry' | 'arasaac' | 'custom' | 'opensymbols'

export type AacUserPreferences = {
  _id: string
  speakerId: string
  voiceName?: string
  speechRate: number // default 1, range 0.5–2
  speechPitch: number // default 1, range 0.5–2
  speakOnSymbolTap: boolean // default true
  phraseTapBehavior: 'speak' | 'append' // default 'speak'
  symbolSource: SymbolSource // default 'mulberry'
  symbolLabelPosition: 'below' | 'above' | 'hidden' // default 'below'
  mobileGridColumns: 2 | 3 | 4 // default 3
  updatedAt: Date
}

export type AacUserPreferencesInput = Omit<
  AacUserPreferences,
  '_id' | 'updatedAt'
>
