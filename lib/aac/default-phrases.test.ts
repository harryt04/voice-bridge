import { describe, it, expect } from 'vitest'
import { DEFAULT_PHRASES } from './default-phrases'
import { AAC_CATEGORIES } from './symbol-provider'

describe('DEFAULT_PHRASES', () => {
  it('contains exactly 152 phrases', () => {
    expect(DEFAULT_PHRASES).toHaveLength(152)
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

  it('contains phrases from 15 categories', () => {
    const categories = new Set(DEFAULT_PHRASES.map((p) => p.category))
    expect(categories.size).toBe(15)
  })

  it('every phrase category is a valid AAC_CATEGORIES slug', () => {
    const validSlugs = new Set(AAC_CATEGORIES.map((c) => c.slug))
    DEFAULT_PHRASES.forEach((phrase) => {
      expect(validSlugs.has(phrase.category)).toBe(true)
    })
  })

  const expectedCategories = [
    'social',
    'needs',
    'rejecting',
    'feelings',
    'questions',
    'describing',
    'directing',
    'mealtime',
    'school',
    'community',
    'emergency',
    'play',
    'home',
    'choices',
    'conversation',
  ]

  it.each(expectedCategories)('includes %s phrases', (category) => {
    const phrases = DEFAULT_PHRASES.filter((p) => p.category === category)
    expect(phrases.length).toBeGreaterThan(0)
  })
})
