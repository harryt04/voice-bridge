import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAacPhrases } from './use-aac-phrases'
import { ReactNode } from 'react'

describe('useAacPhrases', () => {
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
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it('disables query when speakerId is falsy', () => {
    const { result } = renderHook(() => useAacPhrases(''), { wrapper })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBeUndefined()
  })

  it('disables query when speakerId is null', () => {
    const { result } = renderHook(() => useAacPhrases(null as any), {
      wrapper,
    })

    expect(result.current.isLoading).toBe(false)
  })

  it('fetches phrases when speakerId is provided', async () => {
    const mockPhrase = {
      _id: '123',
      speakerId: 'speaker123',
      text: 'Hello',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => [mockPhrase],
      } as Response),
    )

    const { result } = renderHook(() => useAacPhrases('speaker123'), {
      wrapper,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual([mockPhrase])
  })

  it('fetches correct API URL with speakerId', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => [],
      } as Response),
    )

    renderHook(() => useAacPhrases('speaker123'), { wrapper })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('speakerId=speaker123'),
      )
    })
  })

  it('sets error state when fetch fails', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 403,
        json: async () => ({ error: 'Unauthorized' }),
      } as Response),
    )

    const { result } = renderHook(() => useAacPhrases('speaker123'), {
      wrapper,
    })

    await waitFor(() => {
      expect(result.current.error).toBeDefined()
    })
  })

  it('throws when response is not ok', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
      } as Response),
    )

    const { result } = renderHook(() => useAacPhrases('speaker123'), {
      wrapper,
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })

  it('returns empty array when no phrases exist', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => [],
      } as Response),
    )

    const { result } = renderHook(() => useAacPhrases('speaker123'), {
      wrapper,
    })

    await waitFor(() => {
      expect(result.current.data).toEqual([])
    })
  })
})
