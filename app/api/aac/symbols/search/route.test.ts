import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}))

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

describe('GET /api/aac/symbols/search', () => {
  let mockGetSession: any
  let fetchMock: any

  // The route caches its OpenSymbols access token at module scope, so each
  // test re-imports the module fresh to avoid cache bleed between cases.
  async function loadRoute() {
    vi.resetModules()
    return import('./route')
  }

  beforeEach(() => {
    mockGetSession = vi.mocked(auth.api.getSession)
    mockGetSession.mockResolvedValue({ user: { id: 'user123' } })
    process.env.OPENSYMBOLS_API_SECRET = 'test-secret'
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    mockGetSession.mockClear()
    vi.unstubAllGlobals()
    delete process.env.OPENSYMBOLS_API_SECRET
  })

  it('returns 401 when unauthenticated', async () => {
    mockGetSession.mockResolvedValue(null)
    const { GET } = await loadRoute()
    const req = new NextRequest('http://localhost/api/aac/symbols/search?q=cat')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 when q param is missing', async () => {
    const { GET } = await loadRoute()
    const req = new NextRequest('http://localhost/api/aac/symbols/search')
    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  it('fetches a token then searches, mapping results to AacSymbol shape', async () => {
    const { GET } = await loadRoute()
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ access_token: 'tok123' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [
          { id: 1, name: 'Cat', image_url: 'https://example.com/cat.png' },
        ],
      })

    const req = new NextRequest('http://localhost/api/aac/symbols/search?q=cat')
    const res = await GET(req)
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data).toEqual([
      {
        id: '1',
        label: 'Cat',
        imageUrl: 'https://example.com/cat.png',
        category: 'core',
        source: 'opensymbols',
      },
    ])

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[0][0]).toContain('/api/v2/token')
    expect(fetchMock.mock.calls[1][0]).toContain('/api/v2/symbols')
  })

  it('refreshes the token once on a 401 from the search call', async () => {
    const { GET } = await loadRoute()
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ access_token: 'expired-token' }),
      })
      .mockResolvedValueOnce({ ok: false, status: 401 })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ access_token: 'fresh-token' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [],
      })

    const req = new NextRequest('http://localhost/api/aac/symbols/search?q=cat')
    const res = await GET(req)
    expect(res.status).toBe(200)
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })

  it('reuses a cached token across requests within its expiry window', async () => {
    const { GET } = await loadRoute()
    const futureExpiry = new Date(Date.now() + 60 * 60 * 1000).toISOString()

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          access_token: 'tok123',
          expires: futureExpiry,
        }),
      })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => [] })

    const req1 = new NextRequest(
      'http://localhost/api/aac/symbols/search?q=cat',
    )
    await GET(req1)
    const req2 = new NextRequest(
      'http://localhost/api/aac/symbols/search?q=dog',
    )
    const res2 = await GET(req2)

    expect(res2.status).toBe(200)
    // Only one token fetch across both requests (token still valid).
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(fetchMock.mock.calls[0][0]).toContain('/api/v2/token')
  })

  it('refetches the token once its expiry window has passed', async () => {
    const { GET } = await loadRoute()
    const pastExpiry = new Date(Date.now() - 1000).toISOString()

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          access_token: 'stale-token',
          expires: pastExpiry,
        }),
      })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => [] })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ access_token: 'new-token', expires: pastExpiry }),
      })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => [] })

    const req1 = new NextRequest(
      'http://localhost/api/aac/symbols/search?q=cat',
    )
    await GET(req1)
    const req2 = new NextRequest(
      'http://localhost/api/aac/symbols/search?q=dog',
    )
    const res2 = await GET(req2)

    expect(res2.status).toBe(200)
    // A fresh token fetch is made for the second request since the first
    // token was already expired.
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })

  it('returns 500 when the OpenSymbols API errors', async () => {
    const { GET } = await loadRoute()
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ access_token: 'tok123' }),
    })
    fetchMock.mockResolvedValueOnce({ ok: false, status: 500 })

    const req = new NextRequest('http://localhost/api/aac/symbols/search?q=cat')
    const res = await GET(req)
    expect(res.status).toBe(500)
  })
})
