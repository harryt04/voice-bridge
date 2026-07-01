import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAacPreferences } from './use-aac-preferences'
import { ReactNode } from 'react'

describe('useAacPreferences', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    queryClient.clear()
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  it('disables query when speakerId is falsy', () => {
    const { result } = renderHook(() => useAacPreferences(''), { wrapper })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBeUndefined()
  })

  it('fetches preferences when speakerId is provided', async () => {
    const mockPrefs = {
      speakerId: 'speaker123',
      speechRate: 1,
      speechPitch: 1,
      speakOnSymbolTap: true,
      phraseTapBehavior: 'speak',
      symbolSource: 'mulberry',
      symbolLabelPosition: 'below',
      mobileGridColumns: 3,
      updatedAt: new Date().toISOString(),
    }

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => mockPrefs,
      } as Response)
    )

    const { result } = renderHook(() => useAacPreferences('speaker123'), {
      wrapper,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(mockPrefs)
  })

  it('fetches correct API URL with speakerId', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({}),
      } as Response)
    )

    renderHook(() => useAacPreferences('speaker123'), { wrapper })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('speakerId=speaker123')
      )
    })
  })

  it('sets error state when fetch fails', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
      } as Response)
    )

    const { result } = renderHook(() => useAacPreferences('speaker123'), {
      wrapper,
    })

    await waitFor(() => {
      expect(result.current.error).toBeDefined()
    })
  })

  it('uses staleTime of 5 minutes', async () => {
    const mockPrefs = {
      speakerId: 'speaker123',
      speechRate: 1.2,
      speechPitch: 1,
    }

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => mockPrefs,
      } as Response)
    )

    const { result, rerender } = renderHook(
      () => useAacPreferences('speaker123'),
      { wrapper }
    )

    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    const callCount = (global.fetch as any).mock.calls.length
    rerender()

    await waitFor(() => {
      expect((global.fetch as any).mock.calls.length).toBe(callCount)
    })
  })
})
