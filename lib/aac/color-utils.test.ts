import { describe, it, expect } from 'vitest'
import { getReadableTextColor } from './color-utils'

describe('getReadableTextColor', () => {
  it('returns dark text for light hex background', () => {
    // White background should get dark text
    const result = getReadableTextColor('#ffffff')
    expect(result).toBe('#1a1a1a')
  })

  it('returns dark text for light hex background (short form)', () => {
    // White background in short form
    const result = getReadableTextColor('#fff')
    expect(result).toBe('#1a1a1a')
  })

  it('returns light text for dark hex background', () => {
    // Black background should get light text
    const result = getReadableTextColor('#000000')
    expect(result).toBe('#f5f5f5')
  })

  it('returns light text for dark hex background (short form)', () => {
    // Black background in short form
    const result = getReadableTextColor('#000')
    expect(result).toBe('#f5f5f5')
  })

  it('returns light text for a mid-dark color', () => {
    // Dark gray should get light text
    const result = getReadableTextColor('#404040')
    expect(result).toBe('#f5f5f5')
  })

  it('returns dark text for a mid-light color', () => {
    // Light gray should get dark text
    const result = getReadableTextColor('#e0e0e0')
    expect(result).toBe('#1a1a1a')
  })

  it('returns undefined for non-hex CSS color string', () => {
    // hsl(var(--secondary)) should return undefined to fall back to theme
    const result = getReadableTextColor('hsl(var(--secondary))')
    expect(result).toBeUndefined()
  })

  it('returns undefined for invalid hex format', () => {
    const result = getReadableTextColor('#gggggg')
    expect(result).toBeUndefined()
  })

  it('handles hex without # prefix', () => {
    // Should work with or without #
    const result1 = getReadableTextColor('ffffff')
    const result2 = getReadableTextColor('#ffffff')
    expect(result1).toBe(result2)
    expect(result1).toBe('#1a1a1a')
  })

  it('is case-insensitive for hex colors', () => {
    const result1 = getReadableTextColor('#FFFFFF')
    const result2 = getReadableTextColor('#ffffff')
    expect(result1).toBe(result2)
  })
})
