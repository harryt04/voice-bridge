import { describe, it, expect } from 'vitest'
import {
  AacPhraseInputSchema,
  AacPreferencesInputSchema,
} from './aac-validators'

describe('AacPhraseInputSchema', () => {
  it('accepts valid phrase input', () => {
    const input = {
      speakerId: 'speaker123',
      text: 'Hello',
      category: 'greetings',
    }
    expect(AacPhraseInputSchema.parse(input)).toEqual(input)
  })

  it('rejects empty speakerId', () => {
    const input = { speakerId: '', text: 'Hello' }
    expect(() => AacPhraseInputSchema.parse(input)).toThrow()
  })

  it('rejects empty text', () => {
    const input = { speakerId: 'speaker123', text: '' }
    expect(() => AacPhraseInputSchema.parse(input)).toThrow()
  })

  it('accepts text exactly 200 chars', () => {
    const text = 'a'.repeat(200)
    const input = { speakerId: 'speaker123', text }
    expect(AacPhraseInputSchema.parse(input).text).toBe(text)
  })

  it('rejects text over 200 chars', () => {
    const input = { speakerId: 'speaker123', text: 'a'.repeat(201) }
    expect(() => AacPhraseInputSchema.parse(input)).toThrow()
  })

  it('accepts optional icon, backgroundColor, category', () => {
    const input = {
      speakerId: 'speaker123',
      text: 'Hello',
      icon: 'smile',
      backgroundColor: '#ff0000',
      category: 'social',
    }
    expect(AacPhraseInputSchema.parse(input)).toEqual(input)
  })

  it('accepts optional sortOrder 0', () => {
    const input = { speakerId: 'speaker123', text: 'Hello', sortOrder: 0 }
    expect(AacPhraseInputSchema.parse(input).sortOrder).toBe(0)
  })

  it('rejects negative sortOrder', () => {
    const input = { speakerId: 'speaker123', text: 'Hello', sortOrder: -1 }
    expect(() => AacPhraseInputSchema.parse(input)).toThrow()
  })

  it('rejects non-integer sortOrder', () => {
    const input = { speakerId: 'speaker123', text: 'Hello', sortOrder: 1.5 }
    expect(() => AacPhraseInputSchema.parse(input)).toThrow()
  })

  it('omits optional fields when not provided', () => {
    const input = { speakerId: 'speaker123', text: 'Hello' }
    const result = AacPhraseInputSchema.parse(input)
    expect(result).not.toHaveProperty('icon')
    expect(result).not.toHaveProperty('sortOrder')
  })
})

describe('AacPreferencesInputSchema', () => {
  const validInput = {
    speakerId: 'speaker123',
    voiceName: 'Google UK English Female',
    speechRate: 1,
    speechPitch: 1,
    speakOnSymbolTap: true,
    phraseTapBehavior: 'speak' as const,
    symbolSource: 'mulberry' as const,
    symbolLabelPosition: 'below' as const,
    mobileGridColumns: '3' as const,
  }

  it('accepts valid preferences input', () => {
    const result = AacPreferencesInputSchema.parse(validInput)
    expect(result.mobileGridColumns).toBe(3)
  })

  it('rejects empty speakerId', () => {
    expect(() =>
      AacPreferencesInputSchema.parse({ ...validInput, speakerId: '' })
    ).toThrow()
  })

  it('accepts speechRate at boundary 0.5', () => {
    const result = AacPreferencesInputSchema.parse({
      ...validInput,
      speechRate: 0.5,
    })
    expect(result.speechRate).toBe(0.5)
  })

  it('accepts speechRate at boundary 2', () => {
    const result = AacPreferencesInputSchema.parse({
      ...validInput,
      speechRate: 2,
    })
    expect(result.speechRate).toBe(2)
  })

  it('rejects speechRate below 0.5', () => {
    expect(() =>
      AacPreferencesInputSchema.parse({ ...validInput, speechRate: 0.49 })
    ).toThrow()
  })

  it('rejects speechRate above 2', () => {
    expect(() =>
      AacPreferencesInputSchema.parse({ ...validInput, speechRate: 2.01 })
    ).toThrow()
  })

  it('accepts speechPitch at boundary 0.5', () => {
    const result = AacPreferencesInputSchema.parse({
      ...validInput,
      speechPitch: 0.5,
    })
    expect(result.speechPitch).toBe(0.5)
  })

  it('accepts speechPitch at boundary 2', () => {
    const result = AacPreferencesInputSchema.parse({
      ...validInput,
      speechPitch: 2,
    })
    expect(result.speechPitch).toBe(2)
  })

  it('rejects speechPitch below 0.5', () => {
    expect(() =>
      AacPreferencesInputSchema.parse({ ...validInput, speechPitch: 0.49 })
    ).toThrow()
  })

  it('rejects speechPitch above 2', () => {
    expect(() =>
      AacPreferencesInputSchema.parse({ ...validInput, speechPitch: 2.01 })
    ).toThrow()
  })

  it('rejects invalid phraseTapBehavior enum', () => {
    expect(() =>
      AacPreferencesInputSchema.parse({
        ...validInput,
        phraseTapBehavior: 'invalid',
      })
    ).toThrow()
  })

  it('rejects invalid symbolSource enum', () => {
    expect(() =>
      AacPreferencesInputSchema.parse({
        ...validInput,
        symbolSource: 'unknown',
      })
    ).toThrow()
  })

  it('rejects invalid symbolLabelPosition enum', () => {
    expect(() =>
      AacPreferencesInputSchema.parse({
        ...validInput,
        symbolLabelPosition: 'center',
      })
    ).toThrow()
  })

  it('rejects invalid mobileGridColumns enum', () => {
    expect(() =>
      AacPreferencesInputSchema.parse({
        ...validInput,
        mobileGridColumns: '5',
      })
    ).toThrow()
  })

  it('transforms mobileGridColumns string to number', () => {
    const result = AacPreferencesInputSchema.parse({
      ...validInput,
      mobileGridColumns: '4',
    })
    expect(result.mobileGridColumns).toBe(4)
    expect(typeof result.mobileGridColumns).toBe('number')
  })

  it('accepts optional voiceName', () => {
    const result = AacPreferencesInputSchema.parse({
      ...validInput,
      voiceName: 'Google Voice',
    })
    expect(result.voiceName).toBe('Google Voice')
  })
})
