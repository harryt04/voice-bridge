# AGENTS.md - Coding Agent Guidelines for VoiceBridge

## Project Overview

VoiceBridge is a full-stack Next.js 16 (App Router) web app helping individuals with autism
communicate using visual tools. Stack: TypeScript, React 19, UI SDK, Tailwind CSS 4,
MongoDB (direct driver), better-auth, TanStack React Query, PostHog analytics.

## Comprehensive Codebase Documentation

For detailed codebase documentation, reference:
- **[`/docs/index.md`](docs/index.md)** — Main documentation hub (start here)
- **[`CODEBASE_MAP.md`](CODEBASE_MAP.md)** — Quick navigation and overview

The `/docs/` directory contains 11 comprehensive markdown files covering:
- System architecture and design patterns
- Complete API endpoint specifications  
- All React components and their behavior
- React hooks and state management
- Database patterns and MongoDB operations
- Authentication and authorization flows
- Styling configuration and best practices
- Naming conventions and contribution guidelines

Refer to the docs when building or modifying any feature. If you have made changes that make something in the documentation outdated, please update the documentation. **This is the primary reference for AI agents working in this repository.**


## Build / Lint / Format Commands

```bash
pnpm run dev          # Start dev server (next dev)
pnpm run build        # Production build (next build) — also serves as the type checker
pnpm run start        # Start production server
pnpm run lint         # ESLint via next lint
pnpm run prettify     # Format all files with Prettier (prettier --write .)
pnpm run prep         # Alias for prettify — run before opening a PR
pnpm run ci           # PR merge gate: format check + lint + build + test (non-mutating)
pnpm exec gulp create-indexes  # Create MongoDB indexes (requires DB connection)
```

To verify changes before opening a PR, run:

```bash
pnpm run ci           # Runs everything CI runs: format check, lint, build, test
```

`pnpm run ci` is also run automatically on every pull request into `master` via
[.github/workflows/ci.yml](.github/workflows/ci.yml).

## Project Structure

```
app/                    # Next.js App Router: pages and API route handlers
  api/                  # REST API routes (singular = CRUD, plural = list)
components/
  ui/                   # styled UI SDK wrappers
  custom/               # App-specific components
hooks/                  # React hooks (use-mobile, use-speakers, use-query-client)
lib/                    # Core utilities: mongo-client, mongo-utils, posthog-server, utils
models/                 # TypeScript type definitions with barrel export (models/index.ts)
providers/              # React context providers (PostHog, theme)
utils/                  # Client-side utilities (directions, imageUtils, speech)
public/                 # Static assets (favicon/PWA icons + site.webmanifest live at the root)
```

## Testing

- **Framework**: Vitest, with two projects defined in `vitest.config.ts`:
  - `node` — `app/api/**/*.test.ts`, `lib/**/*.test.ts`, `utils/**/*.test.ts`
  - `jsdom` — `components/**/*.test.tsx`, `hooks/**/*.test.tsx`
  - A file can override its project's default environment with a
    `// @vitest-environment jsdom` comment at the top (used for `utils/`
    files that touch browser APIs like `window`/`Image`/canvas).
- **Database tests**: `mongodb-memory-server` provides a real in-memory
  MongoDB, started once in `vitest.global-setup.ts` (sets
  `MONGO_CONNECTION_STRING` before any module loads). Tests talk to real
  collections via `getMongoClient()` — do not mock the MongoDB driver.
  `fileParallelism` is disabled repo-wide so test files sharing the DB don't
  race each other's `deleteMany()` calls.
- **Auth**: `@/lib/auth` (better-auth) is mocked per-test-file with
  `vi.mock('@/lib/auth', () => ({ auth: { api: { getSession: vi.fn() } } }))`,
  then `vi.mocked(auth.api.getSession).mockResolvedValue(...)` controls the
  session per test.
- **Env var boilerplate**: node-project test files set
  `MONGO_CONNECTION_STRING` / `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL`
  fallbacks at the top of the file (before other imports) — copy this from
  an existing file like `lib/mongo-utils.test.ts` rather than reinventing it.
- **API route tests**: import the route's `GET`/`POST`/`DELETE` handlers
  directly and call them with a constructed `NextRequest`; assert on
  `res.status` and `await res.json()`. Route handlers that are thin wrappers
  around `handleDatabaseOperation`/`fetchDataFromCollection`
  (`lib/mongo-utils.ts`) only need a small wiring test, since the shared
  logic itself is covered by `lib/mongo-utils.test.ts`.
- **Component tests**: `@testing-library/react` + `@testing-library/user-event`.
  Mock `next/navigation` (`useRouter`, `useSearchParams`) and `@/lib/auth-client`
  per test file. Use `fireEvent.submit(form)` (not a button click) to test
  validation branches that run before a native `required` field would block
  submission in jsdom.
- Run `pnpm run test` (or `pnpm run test:watch`); `pnpm run ci` runs the suite
  as part of the PR gate.

## Code Style

### Formatting (Prettier — enforced)

- **No semicolons** (`semi: false`)
- **Single quotes** (`singleQuote: true`)
- **Trailing commas**: all (`trailingComma: 'all'`)
- **Print width**: 80 characters
- **Tailwind class sorting** via `prettier-plugin-tailwindcss`

Always run `pnpm run prettify` or let Prettier handle formatting. Do not manually
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
- App-owned UI SDK wrappers live in `components/ui/`
- Custom components live in `components/custom/`
- Use `GenericItemsPage` with a `GenericPageInfo` config for standard CRUD pages
- Auth UI: `LoginForm`, `RegisterForm`, `UserMenu` custom components

### State Management

- **Server state**: TanStack React Query (`useQuery` / fetch)
- **Local state**: `useState` / `useEffect`
- **Global state**: React Context (`SpeakerContext`) wrapping React Query
- **Provider hierarchy** (in root layout):
  `SessionProvider > PostHogProvider > ThemeProvider > SidebarProvider > VBQueryClient`

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
NEXT_PUBLIC_POSTHOG_KEY       # PostHog analytics key
NEXT_PUBLIC_POSTHOG_HOST      # PostHog host URL
BETTER_AUTH_SECRET            # better-auth secret (min 32 chars)
BETTER_AUTH_URL               # Server-side auth base URL
NEXT_PUBLIC_BETTER_AUTH_URL   # Client-side auth base URL
GOOGLE_CLIENT_ID              # Google OAuth client ID
GOOGLE_CLIENT_SECRET          # Google OAuth client secret
NEXT_PUBLIC_APP_URL           # Public app URL for callbacks and links
MONGO_CONNECTION_STRING       # MongoDB connection URI
```

## Git Conventions

- Loosely follows conventional commits: `fix:`, `chore:`, `refactor:` prefixes
- Not enforced by tooling (no commitlint or husky)
- No pre-commit hooks

## Key Dependencies to Know

- `better-auth` — authentication (with MongoDB adapter)
- `mongodb` — database (direct driver, no ORM)
- `@tanstack/react-query` — server state / caching
- `zod` + `react-hook-form` — form validation
- `@ui-sdk/react/toast` — toast notifications
- `lucide-react` — icons
- `next-themes` — dark/light mode
- `browser-image-compression` — client-side image compression
- pnpm is the package manager; use the version pinned in `package.json`

## UI SDK

VoiceBridge wraps UI SDK's unstyled, accessible React primitives in `components/ui/`. Its framework-independent core owns interaction state, keyboard behavior, focus, and agent actions. Both SDK packages are beta and exact-pinned together at `0.1.0-beta.17`.

Read `node_modules/@ui-sdk/react/docs/llms.txt` and `node_modules/@ui-sdk/core/skills/ui-sdk/SKILL.md` before touching components. This library postdates model training data. Consult the installed component page and declarations for the pinned release. Import parts from per-component entries such as `@ui-sdk/react/select`. App code imports the styled wrappers from `@/components/ui/...`. Add new components by wrapping SDK parts. Never run `shadcn add` or regenerate wrappers, which brings Radix or Base UI back.

Tailwind 4 theme tokens and layer order live in `app/globals.css`. Declare the SDK layer first and keep VoiceBridge's existing wrapper classes. The optional SDK web stylesheet changes global links and dialog geometry, so this app supplies its own styling. Use documented SDK state attributes and a separate app-owned attribute for test or styling hooks. Give option values and tab/panel pairs stable values. Portal popups out of forms. Verify keyboard dismissal, focus return, and sheet dimensions.

Controlled inputs use `value` and `onValueChange` so typing and agent edits reach the same React state. Keep the theme provider mounted over hydration. Scope status assertions to the relevant output because the SDK adds a live announcer.

`components/agent-bridge.tsx` mounts once in the root client layout and registers WebMCP tools. `lib/agent-policy.ts` decides each action at execution time. Snapshots and passive queries are available. The allowlist covers reviewed navigation and local list filters. Make an explicit policy decision for each new control. Mark credential, API key, and personal values with `data-agent-secret`, and use `data-agent-hidden` when labels or options contain private information. Put the marks on portal content too. Mark consequential operations with `data-agent-confirm` or leave them denied. The current policy denies every confirmation-marked action. Test positive and negative cases and drive SDK tests by a ref returned by the snapshot.

No Radix UI, Base UI, Sonner, cmdk, react-day-picker, Embla or react-resizable-panels package remains; do not add one back. Resizable wraps `@ui-sdk/react/resizable` and keeps the shadcn names, with `direction` mapped to the SDK's `orientation`. `components/ui/slot.tsx` is the local `asChild` helper for wrappers with no SDK part behind them (Sidebar and the React Hook Form `Form` wrapper); it is built on the SDK's `renderElement`, so props merge exactly as a part's `render` prop does. Form keeps React Hook Form for field registration, validation and messages. Sidebar is a local composite built on the styled wrappers and that helper. Icons come from `lucide-react`. Card, Skeleton and Typography are presentational. Toasts use the SDK toast queue through `components/ui/toaster.tsx` and `use-toast.ts`. Image pickers use `components/ui/file-input.tsx` (SDK `FileInput` with a Button-styled trigger), never a hidden native `<input type="file">` clicked from a ref. The SDK Select has no scroll-arrow parts, so `SelectContent` renders its own: they appear only when the list can scroll that way, scroll while hovered, and stay out of the tab order and accessibility tree.

Menu items run on `onSelect`, which fires for both pointer and keyboard. An `onClick` on a `DropdownMenuItem` runs only for a real click, so Enter would do nothing.
