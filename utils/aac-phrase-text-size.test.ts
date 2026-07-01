import { describe, it, expect } from 'vitest'
import { getPhraseTailwindClass } from './aac-phrase-text-size'

describe('getPhraseTailwindClass', () => {
  it('returns text-base for text with 15 chars or less', () => {
    expect(getPhraseTailwindClass('Hello')).toBe('text-base')
    expect(getPhraseTailwindClass('Hi there')).toBe('text-base')
    expect(getPhraseTailwindClass('a'.repeat(15))).toBe('text-base')
  })

  it('returns text-sm for text with 16+ chars', () => {
    expect(getPhraseTailwindClass('a'.repeat(16))).toBe('text-sm')
    expect(getPhraseTailwindClass('a'.repeat(20))).toBe('text-sm')
    expect(getPhraseTailwindClass('This is a longer phrase')).toBe('text-sm')
  })

  it('returns text-base for empty string', () => {
    expect(getPhraseTailwindClass('')).toBe('text-base')
  })

  it('returns text-base for single character', () => {
    expect(getPhraseTailwindClass('a')).toBe('text-base')
  })

  it('boundary: exactly 15 chars is text-base', () => {
    const text15 = 'x'.repeat(15)
    expect(text15.length).toBe(15)
    expect(getPhraseTailwindClass(text15)).toBe('text-base')
  })

  it('boundary: exactly 16 chars is text-sm', () => {
    const text16 = 'x'.repeat(16)
    expect(text16.length).toBe(16)
    expect(getPhraseTailwindClass(text16)).toBe('text-sm')
  })
})
