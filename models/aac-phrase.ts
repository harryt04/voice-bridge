export type AacPhrase = {
  _id: string
  speakerId: string
  text: string
  icon?: string // lucide icon name or emoji character
  backgroundColor?: string // hex color string, e.g. '#f0a020'
  category?: string // display grouping label, e.g. 'Social'
  sortOrder?: number
  createdAt: Date
  updatedAt: Date
  lastUpdatedBy: string // better-auth user.id
}

export type AacPhraseInput = Omit<
  AacPhrase,
  '_id' | 'createdAt' | 'updatedAt' | 'lastUpdatedBy'
>
