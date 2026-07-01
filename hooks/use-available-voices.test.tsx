import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useAvailableVoices } from './use-available-voices'

describe('useAvailableVoices', () => {
  let mockSynth: any
  let voiceChangeCallback: (() => void) | null

  beforeEach(() => {
    // shouldAdvanceTime lets real wall-clock time still tick the fake clock,
    // so RTL's waitFor() (which polls via setTimeout) can observe state
    // changes while vi.advanceTimersByTime() still fast-forwards the hook's
    // own 3s timeout on demand.
    vi.useFakeTimers({ shouldAdvanceTime: true })
    voiceChangeCallback = null

    const mockVoices = [
      {
        name: 'Google UK English Female',
        lang: 'en-GB',
        default: true,
      },
      {
        name: 'Google US English Male',
        lang: 'en-US',
        default: false,
      },
    ] as SpeechSynthesisVoice[]

    mockSynth = {
      getVoices: vi.fn(() => mockVoices),
      cancel: vi.fn(),
      speak: vi.fn(),
      onvoiceschanged: null,
    }

    Object.defineProperty(mockSynth, 'onvoiceschanged', {
      set: (callback: () => void) => {
        voiceChangeCallback = callback
      },
      get: () => voiceChangeCallback,
    })

    vi.stubGlobal('speechSynthesis', mockSynth)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('loads voices when available immediately', async () => {
    const { result } = renderHook(() => useAvailableVoices())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.voices.length).toBeGreaterThan(0)
  })

  it('sets loading to false after voices load', async () => {
    const { result } = renderHook(() => useAvailableVoices())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it('fires onvoiceschanged callback', async () => {
    const { result } = renderHook(() => useAvailableVoices())

    if (voiceChangeCallback) {
      act(() => {
        voiceChangeCallback!()
      })
    }

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockSynth.getVoices).toHaveBeenCalled()
  })

  it('uses 3 second timeout fallback when voices not ready', async () => {
    mockSynth.getVoices.mockReturnValue([])

    const { result } = renderHook(() => useAvailableVoices())

    expect(result.current.loading).toBe(true)

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it('clears timeout when voices load before timeout', async () => {
    const { result } = renderHook(() => useAvailableVoices())

    if (voiceChangeCallback) {
      act(() => {
        voiceChangeCallback!()
      })
    }

    act(() => {
      vi.advanceTimersByTime(500)
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockSynth.getVoices).toHaveBeenCalled()
  })

  it('handles unmount before voices load', async () => {
    mockSynth.getVoices.mockReturnValue([])

    const { unmount } = renderHook(() => useAvailableVoices())

    unmount()

    act(() => {
      vi.advanceTimersByTime(3000)
    })
  })

  it('returns empty array when no voices available', async () => {
    mockSynth.getVoices.mockReturnValue([])

    const { result } = renderHook(() => useAvailableVoices())

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    await waitFor(() => {
      expect(result.current.voices).toEqual([])
    })
  })
})
