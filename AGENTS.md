# AGENTS.md - Coding Agent Guidelines for VoiceBridge

## Project Overview

VoiceBridge is a full-stack Next.js 16 (App Router) web app helping individuals with autism
communicate using visual tools. Stack: TypeScript, React 18, shadcn/ui, Tailwind CSS 3.4,
MongoDB (direct driver), Clerk auth, TanStack React Query, PostHog analytics.

## Build / Lint / Format Commands

```bash
npm run dev          # Start dev server (next dev)
npm run build        # Production build (next build) — also serves as the type checker
npm run start        # Start production server
npm run lint         # ESLint via next lint
npm run prettify     # Format all files with Prettier (prettier --write .)
npx gulp create-indexes  # Create MongoDB indexes (requires DB connection)
```

There is **no test framework** configured. No jest, vitest, or any test runner exists.
No `*.test.*` or `*.spec.*` files are present. `/coverage` is gitignored for future use.

To verify changes, run:

```bash
npm run build        # Catches TypeScript errors and build issues
npm run lint         # Catches ESLint violations
```

## Project Structure

```
app/                    # Next.js App Router: pages and API route handlers
  api/                  # REST API routes (singular = CRUD, plural = list)
components/
  ui/                   # shadcn/ui generated components (do not hand-edit)
  custom/               # App-specific components
hooks/                  # React hooks (use-mobile, use-speakers, use-query-client)
lib/                    # Core utilities: mongo-client, mongo-utils, posthog-server, utils
models/                 # TypeScript type definitions with barrel export (models/index.ts)
providers/              # React context providers (PostHog, theme)
utils/                  # Client-side utilities (directions, imageUtils, speech)
public/                 # Static assets
```

## Code Style

### Formatting (Prettier — enforced)

- **No semicolons** (`semi: false`)
- **Single quotes** (`singleQuote: true`)
- **Trailing commas**: all (`trailingComma: 'all'`)
- **Print width**: 80 characters
- **Tailwind class sorting** via `prettier-plugin-tailwindcss`

Always run `npm run prettify` or let Prettier handle formatting. Do not manually
adjust Tailwind class order — the plugin handles it.

### Imports

- Use `@/*` path aliases for all internal imports (maps to project root):
  ```ts
  import { cn } from '@/lib/utils'
  import { Button } from '@/components/ui/button'
  import { Speaker, SpeakerInput } from '@/models'
  ```
- Order: third-party imports first, then `@/` internal imports, then relative imports.
- Prefer named imports. Use barrel exports from `@/models` (via `models/index.ts`).

### Naming Conventions

| Element           | Convention        | Example                                        |
| ----------------- | ----------------- | ---------------------------------------------- |
| Files             | kebab-case        | `generic-items-page.tsx`                       |
| Components        | PascalCase        | `GenericItemsPage`, `AppSidebar`               |
| Hooks (files)     | `use-` prefix     | `use-speakers.tsx`                             |
| Hooks (functions) | `use` prefix      | `useSpeakerContext`, `useIsMobile`             |
| Types             | PascalCase        | `Food`, `FoodInput`, `Speaker`                 |
| Input types       | `*Input` suffix   | `PlaceInput`, `SpeakerInput`                   |
| Constants         | SCREAMING_SNAKE   | `MOBILE_BREAKPOINT`, `MONGO_CONNECTION_STRING` |
| API routes        | singular for CRUD | `/api/food` (GET/POST/DELETE)                  |
| API list routes   | plural            | `/api/foods` (GET list)                        |

### TypeScript

- Strict mode is enabled (`strict: true`, `strictNullChecks: true`)
- **`noImplicitAny` is false** — implicit `any` is allowed
- `@typescript-eslint/no-explicit-any` is **off** — explicit `any` is used freely
- Types are defined using `type` keyword (not `interface`) in `models/` directory
- JSDoc comments on utility and library functions in `lib/`

### Components

- **Server Components** are the default (no directive needed)
- **Client Components** must have `'use client'` directive at the top of the file
- shadcn/ui components live in `components/ui/` — these are generated, avoid modifying
- Custom components live in `components/custom/`
- Use `GenericItemsPage` with a `GenericPageInfo` config for standard CRUD pages
- Auth UI: `<SignedIn>`, `<SignedOut>`, `<RedirectToSignIn>` from `@clerk/nextjs`

### State Management

- **Server state**: TanStack React Query (`useQuery` / fetch)
- **Local state**: `useState` / `useEffect`
- **Global state**: React Context (`SpeakerContext`) wrapping React Query
- **Provider hierarchy** (in root layout):
  `ClerkProvider > PostHogProvider > ThemeProvider > SidebarProvider > VBQueryClient`

### Error Handling

- API routes use try/catch returning `NextResponse.json({ error: ... }, { status })`:
  - `401` — unauthorized
  - `400` — missing or invalid parameters
  - `404` — resource not found
  - `500` — internal server error
- Client-side: `catch(err)` with `console.error` and state-driven error display
- No global error boundary exists

### Database

- Direct MongoDB driver (no ORM) via singleton `MongoClient` in `lib/mongo-client.ts`
- Centralized CRUD in `lib/mongo-utils.ts` (`handleDatabaseOperation`, `fetchDataFromCollection`)
- Database name: `voicebridge-${process.env.NODE_ENV}` (environment-based)
- Auth check per request via `speakerAuthCheck` (verifies parent or villager of speaker)

### API Route Pattern

Standard API route handler structure:

```ts
import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // ... business logic using mongo-utils
    return NextResponse.json(result)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
```

## ESLint Configuration

Extends: `next/core-web-vitals`, `eslint:recommended`, `plugin:react/recommended`,
`plugin:@typescript-eslint/recommended`.

**Disabled rules** (intentionally permissive):

- `no-undef` — off
- `react/react-in-jsx-scope` — off
- `react/prop-types` — off
- `@typescript-eslint/no-unused-vars` — off
- `@typescript-eslint/no-explicit-any` — off

## Environment Variables

Required (see `.env.sample`):

```
NEXT_PUBLIC_POSTHOG_KEY      # PostHog analytics key
NEXT_PUBLIC_POSTHOG_HOST     # PostHog host URL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY  # Clerk auth public key
CLERK_SECRET_KEY             # Clerk auth secret
MONGO_CONNECTION_STRING      # MongoDB connection URI
```

## Git Conventions

- Loosely follows conventional commits: `fix:`, `chore:`, `refactor:` prefixes
- Not enforced by tooling (no commitlint or husky)
- No pre-commit hooks

## Key Dependencies to Know

- `@clerk/nextjs` — all authentication
- `mongodb` — database (direct driver, no ORM)
- `@tanstack/react-query` — server state / caching
- `zod` + `react-hook-form` — form validation
- `sonner` — toast notifications
- `lucide-react` — icons
- `next-themes` — dark/light mode
- `browser-image-compression` — client-side image compression
- npm is the package manager; `.npmrc` sets `legacy-peer-deps=true`
