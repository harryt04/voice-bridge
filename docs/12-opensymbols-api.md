# 12. OpenSymbols API Integration

VoiceBridge integrates with the third-party [OpenSymbols](https://www.opensymbols.org)
API to expand the symbol library beyond the bundled Mulberry set (~3,500
symbols) to 50,000+ searchable symbols across multiple libraries (ARASAAC,
Sclera, Mulberry, etc.), with search.

This document records the **actual verified contract** of that API (endpoint
shapes, auth flow, response fields) so future agents don't have to
re-discover it from scratch. It was confirmed directly against the live API
on 2026-07-04 — if OpenSymbols changes their API, update this doc alongside
the code.

## Why a server-side proxy

The OpenSymbols API requires a **shared secret** to authenticate. That secret
must never reach the client, so all VoiceBridge code that talks to
OpenSymbols lives server-side, behind one route:

```
GET /api/aac/symbols/search?q=<term>
```

implemented in [`app/api/aac/symbols/search/route.ts`](../app/api/aac/symbols/search/route.ts).
The client-side `OpenSymbolsProvider`
([`lib/aac/opensymbols-provider.ts`](../lib/aac/opensymbols-provider.ts)) only
ever calls this internal route — never the OpenSymbols API directly.

**Env var:** `OPENSYMBOLS_API_SECRET` (see `.env.sample`). Without it, the
route throws and returns a 500.

## Auth flow

OpenSymbols uses a two-step token exchange:

### 1. Get an access token

```
POST https://www.opensymbols.org/api/v2/token
Content-Type: application/json

{ "secret": "<OPENSYMBOLS_API_SECRET>" }
```

Response:

```json
{
  "access_token": "token::369-1:...",
  "expires": "2026-07-05T02:22:38Z"
}
```

- `expires` is an ISO 8601 timestamp — **this field exists but is not
  mentioned in OpenSymbols' own public docs page**; it was only discovered by
  making a real request. Use it to proactively refresh before expiry rather
  than waiting for a 401.
- Tokens are short-lived (observed ~24h window in testing, but treat this as
  an implementation detail, not a guarantee — always honor `expires`).

### 2. Search symbols with the token

```
GET https://www.opensymbols.org/api/v2/symbols?q=<term>&locale=en&safe=1&access_token=<token>
```

- `q` — required, the search term.
- `locale` — optional, two-character language code, default `en`.
- `safe` — optional, `1` enables safe search (default), `0` disables it.
- The access token may also be passed via an `Authorization` header instead
  of the query param — VoiceBridge uses the query param for simplicity.

Response is a **JSON array** of symbol objects. Verified real fields
(observed directly, not just from docs — the actual response has more
fields than OpenSymbols' own documentation lists):

```json
{
  "id": 2217,
  "symbol_key": "cat-e58706c7",
  "name": "cat",
  "locale": "en",
  "license": "CC BY-NC-SA",
  "license_url": "http://creativecommons.org/licenses/by-nc-sa/3.0/",
  "enabled": true,
  "author": "Sergio Palao",
  "author_url": "http://www.catedu.es/arasaac/condiciones_uso.php",
  "source_url": null,
  "repo_key": "arasaac",
  "hc": false,
  "protected_symbol": false,
  "extension": "png",
  "image_url": "https://d18vdu4p71yql0.cloudfront.net/libraries/arasaac/cat.png",
  "search_string": "cat - , cat, tom , mittens, ...",
  "unsafe_result": false,
  "_href": "/api/v1/symbols/arasaac/cat-e58706c7?id=2217",
  "details_url": "/symbols/arasaac/cat-e58706c7?id=2217",
  "use_score": 11,
  "relevance": 567.29684,
  "repo_index": 2
}
```

VoiceBridge only maps `id`, `name` → `label`, and `image_url` → `imageUrl`
into the shared `AacSymbol` shape today (`category` is a placeholder — see
below). The other fields (`license`, `author`, `repo_key`, etc.) are
available in the raw OpenSymbols response if a future feature needs
attribution or license filtering.

### Error responses

- `401` with `{ "token_expired": true }` — token expired or invalid. The
  route refreshes the token once and retries the search once.
- `429` with `{ "throttled": true }` — rate limited. The route surfaces this
  as a 500 to the client rather than retrying (no backoff logic implemented
  yet).

## Category mismatch (known limitation)

OpenSymbols has no equivalent to VoiceBridge's `AAC_CATEGORIES` slugs — it's
search-only, with an optional `repo:[repo_key]` filter for narrowing to a
specific symbol library (e.g. `q=repo:arasaac cat`), which is not the same
concept as a fixed category taxonomy. Because of this:

- `OpenSymbolsProvider.getSymbolsByCategory()` always returns `[]` — category
  *browsing* under the OpenSymbols source shows nothing.
- `OpenSymbolsProvider.searchSymbols()` is the only way to get real results
  from this provider — VoiceBridge's symbol search UI
  ([`components/custom/aac-symbol-search.tsx`](../components/custom/aac-symbol-search.tsx))
  is what surfaces this in practice.
- Mapped `AacSymbol.category` is hardcoded to `'core'` as a placeholder; it's
  not meaningful for OpenSymbols results and should not be relied on.

## Caching strategy

Two independent caching layers, both server-side (per the project's Next.js
best-practice preference — no client-side symbol caching, e.g. no
localStorage or long-lived React Query caching of search results):

1. **Access token** — cached in a module-level variable in `route.ts`
   (`cachedToken`), reused across requests within the same server
   instance/lifetime until 30 seconds before its `expires` timestamp. This
   avoids a token round-trip on every single search request. On an
   unexpected `401` (token invalidated out-of-band), the cache is cleared
   and a fresh token is fetched once before retrying.

2. **Search results** — cached via Next.js's built-in fetch Data Cache:
   ```ts
   fetch(searchUrl, { next: { revalidate: 60 * 60 * 24 } }) // 24h
   ```
   This is the idiomatic Next.js App Router caching mechanism (as opposed to
   a hand-rolled in-memory `Map` or an external cache) — repeated identical
   queries within the revalidate window are served from Next's Data Cache
   instead of re-hitting OpenSymbols. The token request itself is explicitly
   `cache: 'no-store'` since credential requests should never be cached by
   the Data Cache (its lifecycle is managed manually via `cachedToken`
   instead).

If OpenSymbols content needs to be invalidated sooner than 24h (e.g. a
symbol was reported/removed), either lower `SEARCH_REVALIDATE_SECONDS` in
`route.ts` or switch to tag-based invalidation (`next: { tags: [...] }` +
`revalidateTag()`) — not implemented yet since there's no current trigger
for it.

## Testing

- [`lib/aac/opensymbols-provider.test.ts`](../lib/aac/opensymbols-provider.test.ts) —
  mocks `global.fetch` to test the provider's `searchSymbols`/`getCategories`/
  `getSymbolsByCategory` behavior in isolation from the real network route.
- [`app/api/aac/symbols/search/route.test.ts`](../app/api/aac/symbols/search/route.test.ts) —
  mocks `global.fetch` to test the route's token fetch/cache/refresh logic
  and response mapping. Each test re-imports the route module fresh
  (`vi.resetModules()`) to avoid the module-level token cache bleeding
  between test cases.

Neither test suite hits the real OpenSymbols API — that would require a live
secret and network access in CI. If you need to manually verify the real
contract still holds, hit the endpoints directly with `OPENSYMBOLS_API_SECRET`
from `.env.local` (never print the resulting access token to logs/output —
treat it as a live credential).
