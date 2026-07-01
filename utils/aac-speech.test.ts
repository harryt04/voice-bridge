// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { speak } from './aac-speech'

describe('speak utility', () => {
  let mockSynth: any
  let mockUtterance: any
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    mockUtterance = {
      rate: 1,
      pitch: 1,
      voice: null,
    }

    mockSynth = {
      cancel: vi.fn(),
      speak: vi.fn(),
      getVoices: vi.fn(() => []),
    }

    vi.stubGlobal(
      'SpeechSynthesisUtterance',
      vi.fn(() => mockUtterance),
    )
    vi.stubGlobal('speechSynthesis', mockSynth)

    // speak() intentionally logs caught errors to console.error; several
    // tests below exercise that path on purpose, so silence it here rather
    // than let expected error output pollute the test run.
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('does not speak empty text', () => {
    speak('')
    expect(mockSynth.speak).not.toHaveBeenCalled()
  })

  it('does not speak whitespace-only text', () => {
    speak('   ')
    expect(mockSynth.speak).not.toHaveBeenCalled()
  })

  it('calls cancel before speaking', () => {
    speak('Hello')
    expect(mockSynth.cancel).toHaveBeenCalled()
  })

  it('calls speak with utterance', () => {
    speak('Hello')
    expect(mockSynth.speak).toHaveBeenCalledWith(mockUtterance)
  })

  it('sets speechRate from preferences', () => {
    speak('Hello', { speechRate: 1.5 })
    expect(mockUtterance.rate).toBe(1.5)
  })

  it('sets speechPitch from preferences', () => {
    speak('Hello', { speechPitch: 0.8 })
    expect(mockUtterance.pitch).toBe(0.8)
  })

  it('defaults speechRate to 1 when not provided', () => {
    speak('Hello')
    expect(mockUtterance.rate).toBe(1)
  })

  it('defaults speechPitch to 1 when not provided', () => {
    speak('Hello')
    expect(mockUtterance.pitch).toBe(1)
  })

  it('finds voice by name and assigns it', () => {
    const mockVoice = { name: 'Google UK English Female', lang: 'en-GB' }
    mockSynth.getVoices.mockReturnValue([mockVoice])

    speak('Hello', { voiceName: 'Google UK English Female' })
    expect(mockUtterance.voice).toBe(mockVoice)
  })

  it('sets voice to null when voice name not found', () => {
    mockSynth.getVoices.mockReturnValue([{ name: 'Voice A', lang: 'en-US' }])

    speak('Hello', { voiceName: 'NonexistentVoice' })
    expect(mockUtterance.voice).toBeNull()
  })

  it('sets voice to null when voiceName not provided', () => {
    speak('Hello')
    expect(mockUtterance.voice).toBeNull()
  })

  it('does not throw when speechSynthesis error occurs', () => {
    mockSynth.speak.mockImplementation(() => {
      throw new Error('Speech API error')
    })

    expect(() => speak('Hello')).not.toThrow()
  })

  it('logs error to console when error occurs', () => {
    mockSynth.speak.mockImplementation(() => {
      throw new Error('Speech API error')
    })

    speak('Hello')
    expect(consoleErrorSpy).toHaveBeenCalled()
  })

  it('handles all error types gracefully', () => {
    mockSynth.cancel.mockImplementation(() => {
      throw new Error('Cancel failed')
    })

    expect(() => speak('Hello')).not.toThrow()
  })
})
