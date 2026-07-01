import { describe, it, expect } from 'vitest'
import { DEFAULT_PHRASES } from './default-phrases'

describe('DEFAULT_PHRASES', () => {
  it('contains exactly 18 phrases', () => {
    expect(DEFAULT_PHRASES).toHaveLength(18)
  })

  it('all phrases have non-empty text', () => {
    DEFAULT_PHRASES.forEach((phrase) => {
      expect(phrase.text).toBeTruthy()
      expect(typeof phrase.text).toBe('string')
      expect(phrase.text.length).toBeGreaterThan(0)
    })
  })

  it('all phrases have non-empty category', () => {
    DEFAULT_PHRASES.forEach((phrase) => {
      expect(phrase.category).toBeTruthy()
      expect(typeof phrase.category).toBe('string')
      expect(phrase.category.length).toBeGreaterThan(0)
    })
  })

  it('has no duplicate text values', () => {
    const texts = DEFAULT_PHRASES.map((p) => p.text)
    const uniqueTexts = new Set(texts)
    expect(uniqueTexts.size).toBe(texts.length)
  })

  it('contains phrases from multiple categories', () => {
    const categories = new Set(DEFAULT_PHRASES.map((p) => p.category))
    expect(categories.size).toBeGreaterThan(1)
  })

  it('includes social phrases', () => {
    const socialPhrases = DEFAULT_PHRASES.filter((p) => p.category === 'Social')
    expect(socialPhrases.length).toBeGreaterThan(0)
  })

  it('includes needs phrases', () => {
    const needsPhrases = DEFAULT_PHRASES.filter((p) => p.category === 'Needs')
    expect(needsPhrases.length).toBeGreaterThan(0)
  })

  it('includes feelings phrases', () => {
    const feelingsPhrases = DEFAULT_PHRASES.filter(
      (p) => p.category === 'Feelings',
    )
    expect(feelingsPhrases.length).toBeGreaterThan(0)
  })

  it('includes emergency phrases', () => {
    const emergencyPhrases = DEFAULT_PHRASES.filter(
      (p) => p.category === 'Emergency',
    )
    expect(emergencyPhrases.length).toBeGreaterThan(0)
  })
})
