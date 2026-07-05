import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import type { AacSymbol } from '@/lib/aac/symbol-provider'

const TOKEN_URL = 'https://www.opensymbols.org/api/v2/token'
const SEARCH_URL = 'https://www.opensymbols.org/api/v2/symbols'

// How long the Next.js Data Cache keeps a given search query's results
// before revalidating. Symbol libraries change rarely, so a long window
// avoids re-hitting OpenSymbols for repeated/shared queries. See
// docs/12-opensymbols-api.md for the full caching rationale.
const SEARCH_REVALIDATE_SECONDS = 60 * 60 * 24 // 24 hours

type OpenSymbolsResult = {
  id: string | number
  name: string
  image_url: string
  license?: string
  repo_key?: string
}

type TokenState = {
  accessToken: string
  expiresAt: number // ms epoch
}

// Module-scoped so the token is reused across requests within the same
// server instance/lifetime, avoiding a token fetch on every search. This is
// separate from (and in addition to) the Next.js Data Cache applied to the
// search request itself below.
let cachedToken: TokenState | null = null

function isTokenValid(token: TokenState | null): token is TokenState {
  // Refresh a little before actual expiry to avoid racing a 401.
  return !!token && Date.now() < token.expiresAt - 30_000
}

async function fetchAccessToken(): Promise<TokenState> {
  const secret = process.env.OPENSYMBOLS_API_SECRET
  if (!secret) {
    throw new Error('OPENSYMBOLS_API_SECRET is not configured')
  }

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret }),
    cache: 'no-store', // never cache credential requests
  })

  if (!res.ok) {
    throw new Error(`OpenSymbols token request failed: ${res.status}`)
  }

  const data = (await res.json()) as { access_token: string; expires?: string }
  const expiresAt = data.expires
    ? new Date(data.expires).getTime()
    : Date.now() + 5 * 60 * 1000 // conservative fallback if `expires` is absent

  return { accessToken: data.access_token, expiresAt }
}

async function getAccessToken(): Promise<string> {
  if (!isTokenValid(cachedToken)) {
    cachedToken = await fetchAccessToken()
  }
  return cachedToken.accessToken
}

function buildSearchUrl(query: string, accessToken: string): string {
  return `${SEARCH_URL}?q=${encodeURIComponent(query)}&locale=en&safe=1&access_token=${accessToken}`
}

async function searchOpenSymbols(query: string): Promise<OpenSymbolsResult[]> {
  let token = await getAccessToken()
  let res = await fetch(buildSearchUrl(query, token), {
    next: { revalidate: SEARCH_REVALIDATE_SECONDS },
  })

  if (res.status === 401) {
    // Token was invalidated out-of-band — force a refresh and retry once.
    cachedToken = null
    token = await getAccessToken()
    res = await fetch(buildSearchUrl(query, token), {
      next: { revalidate: SEARCH_REVALIDATE_SECONDS },
    })
  }

  if (res.status === 429) {
    throw new Error('OpenSymbols API rate limit exceeded')
  }

  if (!res.ok) {
    throw new Error(`OpenSymbols search failed: ${res.status}`)
  }

  return (await res.json()) as OpenSymbolsResult[]
}

/**
 * GET /api/aac/symbols/search?q=<term>
 * Server-side proxy for the OpenSymbols API (requires a shared secret that
 * must never be exposed to the client). Maps results to the shared
 * AacSymbol shape used by every SymbolProvider. See
 * docs/12-opensymbols-api.md for the full API contract and caching design.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const query = new URL(req.url).searchParams.get('q')
    if (!query) {
      return NextResponse.json(
        { error: 'Missing q parameter' },
        { status: 400 },
      )
    }

    const results = await searchOpenSymbols(query)

    // OpenSymbols has no equivalent to AAC_CATEGORIES' slugs, so `category`
    // is left as a placeholder — these results are only ever surfaced via
    // search, never grouped by category.
    const symbols: AacSymbol[] = results.map((r) => ({
      id: String(r.id),
      label: r.name,
      imageUrl: r.image_url,
      category: 'core',
      source: 'opensymbols',
    }))

    return NextResponse.json(symbols, { status: 200 })
  } catch (error) {
    console.error('GET /api/aac/symbols/search error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
