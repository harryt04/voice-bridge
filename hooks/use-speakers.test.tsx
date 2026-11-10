import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { SpeakerProvider, useSpeakerContext } from './use-speakers'

const mockUseSession = vi.fn()

vi.mock('@/lib/auth-client', () => ({
  useSession: () => mockUseSession(),
}))

const fetchMock = vi.fn()

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return (
    <QueryClientProvider client={client}>
      <SpeakerProvider>{children}</SpeakerProvider>
    </QueryClientProvider>
  )
}

describe('SpeakerProvider', () => {
  beforeEach(() => {
    fetchMock.mockReset().mockResolvedValue({
      ok: true,
      json: async () => [{ _id: 's1', name: 'Sam' }],
    })
    vi.stubGlobal('fetch', fetchMock)
  })

  it('does not request speakers when signed out', async () => {
    mockUseSession.mockReturnValue({ data: null, isPending: false })

    const { result } = renderHook(() => useSpeakerContext(), { wrapper })

    expect(result.current.speakers).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('reports loading while the session is pending', () => {
    mockUseSession.mockReturnValue({ data: null, isPending: true })

    const { result } = renderHook(() => useSpeakerContext(), { wrapper })

    expect(result.current.isLoading).toBe(true)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('loads and selects the first speaker when signed in', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: 'u1' } },
      isPending: false,
    })

    const { result } = renderHook(() => useSpeakerContext(), { wrapper })

    await waitFor(() => expect(result.current.selectedSpeaker?._id).toBe('s1'))
    expect(fetchMock).toHaveBeenCalledWith('/api/speakers')
  })
})
