# AAC Branch Test Setup Status

## Current Status: ✅ 159/159 Tests Passing

All test files described in the coverage plan (Tiers 1–3) are implemented and green, stable across repeated runs.

## Root causes found and fixed

1. **`vitest@^1.0.0` didn't support `test.projects`** (added in Vitest 3) — the node/jsdom
   environment split was silently ignored, so hook tests ran in `node` and failed with
   "document is not defined". Fixed by upgrading to `vitest@^3.2.6`.
2. **`vitest.global-setup.ts` was never wired into `vitest.config.ts`** — no shared
   `MongoMemoryServer` was ever started, and `lib/mongo-client.ts` caches
   `MONGO_CONNECTION_STRING` in a module-level const at import time, so every route/auth
   test fell back to the hardcoded `mongodb://localhost:27017/test` before any real
   server existed. Fixed by adding `globalSetup` to the `node` project only (jsdom tests
   don't touch Mongo), and removing the redundant per-file `MongoMemoryServer.create()`
   in `vitest.setup.node.ts` that was also causing hook timeouts.
3. **`test.projects` calling `globalSetup` more than once** — since global setup is a
   per-project option, restricting it to only the `node` project avoided starting
   multiple Mongo instances with different connection strings.
4. **`fileParallelism` isn't honored at the per-project level** — node-project test files
   share one Mongo instance/db and clear their own collections in `beforeEach`; running
   files in parallel let one file's `deleteMany()` wipe another file's freshly inserted
   fixtures mid-test. Fixed by setting `fileParallelism: false` at the root `test` config.
5. **`utils/aac-speech.ts` touches `window.speechSynthesis`** but its test was routed to
   the `node` environment glob. Fixed with a `// @vitest-environment jsdom` pragma.
6. **`vi.useFakeTimers()` + RTL's `waitFor()`** — `waitFor` polls via `setTimeout`, which
   fake timers intercept, so it never resolved. Fixed with
   `vi.useFakeTimers({ shouldAdvanceTime: true })` in `hooks/use-available-voices.test.tsx`,
   and wrapped explicit `vi.advanceTimersByTime()` calls in `act()` to silence React
   act() warnings.

## Running Tests

```bash
npm install
npm run test          # 159/159 passing
npm run test:watch    # watch mode
npx vitest run lib/aac/aac-validators.test.ts   # single file
```

## Explicitly out of scope

Tier 4 (component tests: `aac-phrase-grid`, `aac-sentence-bar`, `aac-settings-form`,
`aac-symbol-grid`) was not implemented — per the plan, lowest ROI without E2E coverage.
