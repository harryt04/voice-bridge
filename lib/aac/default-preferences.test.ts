import { describe, it, expect } from 'vitest'
import { getDefaultPreferences, DEFAULT_PREFERENCES } from './default-preferences'

describe('getDefaultPreferences', () => {
  it('returns object with speakerId bound', () => {
    const result = getDefaultPreferences('speaker123')
    expect(result.speakerId).toBe('speaker123')
  })

  it('returns default speechRate of 1', () => {
    const result = getDefaultPreferences('speaker123')
    expect(result.speechRate).toBe(1)
  })

  it('returns default speechPitch of 1', () => {
    const result = getDefaultPreferences('speaker123')
    expect(result.speechPitch).toBe(1)
  })

  it('returns default mobileGridColumns of 3', () => {
    const result = getDefaultPreferences('speaker123')
    expect(result.mobileGridColumns).toBe(3)
  })

  it('returns default speakOnSymbolTap of true', () => {
    const result = getDefaultPreferences('speaker123')
    expect(result.speakOnSymbolTap).toBe(true)
  })

  it('returns default phraseTapBehavior of "speak"', () => {
    const result = getDefaultPreferences('speaker123')
    expect(result.phraseTapBehavior).toBe('speak')
  })

  it('returns default symbolSource of "mulberry"', () => {
    const result = getDefaultPreferences('speaker123')
    expect(result.symbolSource).toBe('mulberry')
  })

  it('returns default symbolLabelPosition of "below"', () => {
    const result = getDefaultPreferences('speaker123')
    expect(result.symbolLabelPosition).toBe('below')
  })

  it('does not include _id or updatedAt fields', () => {
    const result = getDefaultPreferences('speaker123')
    expect(result).not.toHaveProperty('_id')
    expect(result).not.toHaveProperty('updatedAt')
  })

  it('returns different objects for different speakerIds', () => {
    const result1 = getDefaultPreferences('speaker1')
    const result2 = getDefaultPreferences('speaker2')
    expect(result1.speakerId).not.toBe(result2.speakerId)
    expect(result1.speakerId).toBe('speaker1')
    expect(result2.speakerId).toBe('speaker2')
  })
})

describe('DEFAULT_PREFERENCES constant', () => {
  it('has speechRate of 1', () => {
    expect(DEFAULT_PREFERENCES.speechRate).toBe(1)
  })

  it('has speechPitch of 1', () => {
    expect(DEFAULT_PREFERENCES.speechPitch).toBe(1)
  })

  it('has mobileGridColumns of 3', () => {
    expect(DEFAULT_PREFERENCES.mobileGridColumns).toBe(3)
  })

  it('has speakOnSymbolTap of true', () => {
    expect(DEFAULT_PREFERENCES.speakOnSymbolTap).toBe(true)
  })

  it('has phraseTapBehavior of "speak"', () => {
    expect(DEFAULT_PREFERENCES.phraseTapBehavior).toBe('speak')
  })

  it('has symbolSource of "mulberry"', () => {
    expect(DEFAULT_PREFERENCES.symbolSource).toBe('mulberry')
  })

  it('has symbolLabelPosition of "below"', () => {
    expect(DEFAULT_PREFERENCES.symbolLabelPosition).toBe('below')
  })

  it('has voiceName undefined', () => {
    expect(DEFAULT_PREFERENCES.voiceName).toBeUndefined()
  })
})
