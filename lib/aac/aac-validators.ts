import { z } from 'zod'

export const AacPhraseInputSchema = z.object({
  speakerId: z.string().min(1, 'Speaker ID required'),
  text: z
    .string()
    .min(1, 'Phrase text required')
    .max(200, 'Phrase text must be 200 characters or less'),
  icon: z.string().optional(),
  backgroundColor: z.string().optional(),
  category: z.string().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
})

export const AacPreferencesInputSchema = z.object({
  speakerId: z.string().min(1, 'Speaker ID required'),
  voiceName: z.string().optional(),
  speechRate: z
    .number()
    .min(0.5, 'Speech rate must be at least 0.5')
    .max(2, 'Speech rate must be at most 2'),
  speechPitch: z
    .number()
    .min(0.5, 'Speech pitch must be at least 0.5')
    .max(2, 'Speech pitch must be at most 2'),
  speakOnSymbolTap: z.boolean(),
  phraseTapBehavior: z.enum(['speak', 'append']),
  symbolSource: z.enum(['mulberry', 'arasaac', 'custom']),
  symbolLabelPosition: z.enum(['below', 'above', 'hidden']),
  mobileGridColumns: z
    .enum(['2', '3', '4'])
    .transform((v) => parseInt(v) as 2 | 3 | 4),
})

export type AacPhraseInputType = z.infer<typeof AacPhraseInputSchema>
export type AacPreferencesInputType = z.infer<typeof AacPreferencesInputSchema>
