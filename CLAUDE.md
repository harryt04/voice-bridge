# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Primary references

This repo already has thorough agent-facing documentation — read it instead of expecting a duplicate summary here:

- **[AGENTS.md](AGENTS.md)** — commands, project structure, naming conventions, API route pattern, error handling, state management, ESLint config, env vars. This is the primary reference.
- **[CODEBASE_MAP.md](CODEBASE_MAP.md)** — quick navigation, "where do I add X" guide, known issues, architecture snapshot.
- **[docs/index.md](docs/index.md)** and the numbered docs in `/docs/` — deep dives on architecture, data models, API routes, components, hooks/state, database, auth, styling, and conventions.
- **[README.md](README.md)** — self-hosting and MongoDB index setup.

If documentation conflicts with code, the code wins — check the code first, then update the relevant doc.

## Quick commands

```bash
npm run dev       # Start dev server
npm run build     # Production build — also the TypeScript type checker
npm run lint      # ESLint
npm run prettify  # Format with Prettier
npx gulp create-indexes  # Create MongoDB indexes (requires DB connection)
```

There is no test framework configured in this repo. Verify changes with `npm run build && npm run lint`.

## Known issues to keep in mind

See [CODEBASE_MAP.md#known-issues](CODEBASE_MAP.md) for the full list, including: non-blocking `speakerAuthCheck()` (generic CRUD routes don't fully verify speaker ownership), fire-and-forget mutations in components, and a hardcoded production URL in `sitemap.ts` and `speaker-selector.tsx`.
