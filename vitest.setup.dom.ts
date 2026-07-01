import { afterEach, vi, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

afterEach(() => {
  cleanup()
})

class FakeSpeechSynthesisUtterance {
  text: string
  rate = 1
  pitch = 1
  voice: SpeechSynthesisVoice | null = null
  constructor(text: string) {
    this.text = text
  }
}

beforeEach(() => {
  const fakeSynth = {
    cancel: vi.fn(),
    speak: vi.fn(),
    getVoices: vi.fn(() => []),
    onvoiceschanged: null as (() => void) | null,
  }

  vi.stubGlobal('SpeechSynthesisUtterance', FakeSpeechSynthesisUtterance)
  vi.stubGlobal('speechSynthesis', fakeSynth)
})
