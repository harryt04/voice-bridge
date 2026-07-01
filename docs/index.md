# VoiceBridge Documentation Index

Central hub for VoiceBridge AI agent documentation. Complete reference for understanding, building, and maintaining the codebase.

---

## Documentation Map

Navigate to each section using the links below:

| # | Document | Purpose |
|---|----------|---------|
| 01 | [Architecture](01-architecture.md) | System design, domain model, provider hierarchy, data flow |
| 02 | [Directory Structure](02-directory-structure.md) | Project layout, file organization, folder purposes |
| 03 | [Data Models](03-data-models.md) | Type definitions, database schemas, model patterns |
| 04 | [API Routes](04-api-routes.md) | REST endpoints, request/response patterns, error handling |
| 05 | [Components](05-components.md) | React components, UI library, component composition |
| 06 | [Hooks and State](06-hooks-and-state.md) | React hooks, state management, context patterns |
| 07 | [Database](07-database.md) | MongoDB patterns, collections, queries, indexes |
| 08 | [Authentication](08-authentication.md) | Clerk auth, authorization, user roles, security |
| 09 | [Styling](09-styling.md) | Tailwind CSS, theme system, design tokens |
| 10 | [Utilities](10-utilities.md) | Helper functions, client utils, server utils |
| 11 | [Conventions and Patterns](11-conventions-and-patterns.md) | Naming conventions, import ordering, common recipes |

---

## Quick Reference

### Technology Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 18
- **Language**: TypeScript (strict mode)
- **Database**: MongoDB (direct driver)
- **Authentication**: better-auth
- **Styling**: Tailwind CSS 3.4
- **State Management**: TanStack React Query + React Context
- **Forms**: react-hook-form + zod
- **Analytics**: PostHog
- **Icons**: lucide-react
- **Notifications**: sonner
- **Theme**: next-themes
- **Package Manager**: npm

### Key File Locations

| Location | Purpose |
|----------|---------|
| `app/layout.tsx` | Root layout, provider hierarchy |
| `app/api/` | REST API endpoints |
| `components/ui/` | shadcn/ui components (auto-generated) |
| `components/custom/` | Application-specific components |
| `models/` | TypeScript type definitions |
| `hooks/` | React hooks |
| `lib/` | Server-side utilities, MongoDB, auth checks |
| `utils/` | Client-side utilities |
| `providers/` | React context providers |
| `public/` | Static assets |

### Root Configuration Files

| File | Purpose |
|------|---------|
| `next.config.ts` | Next.js configuration (image patterns, redirects) |
| `tsconfig.json` | TypeScript configuration (strict mode, path aliases) |
| `tailwind.config.ts` | Tailwind CSS configuration (colors, spacing, fonts) |
| `.eslintrc.json` | ESLint rules and exceptions |
| `.prettierrc` | Prettier formatting rules (no semicolons, trailing commas) |
| `package.json` | Dependencies and scripts |
| `.env.sample` | Environment variables template |

---

## Where Do I Add X?

Quick navigation to find the right place for common development tasks:

### Adding a New Feature

| Task | See | Quick Steps |
|------|-----|------------|
| **New page** | [02: Directory Structure](02-directory-structure.md) | Create `app/{name}/page.tsx` and export default component |
| **New resource type** | [11: Conventions & Patterns §6](11-conventions-and-patterns.md#6-adding-a-new-resource-type) | Follow 8-step guide (types → API routes → page) |
| **New component** | [05: Components](05-components.md) | Create in `components/custom/`, use `'use client'` if needed |
| **New API endpoint** | [04: API Routes](04-api-routes.md) | Create `app/api/{name}/route.ts` with GET/POST/DELETE handlers |
| **New hook** | [06: Hooks and State](06-hooks-and-state.md) | Create `hooks/use-{name}.tsx`, export `use{Name}()` function |
| **New type/model** | [03: Data Models](03-data-models.md) | Create `models/{name}.ts`, add to `models/index.ts` barrel export |
| **New utility function** | [10: Utilities](10-utilities.md) | Create in `lib/` (server) or `utils/` (client) |
| **Styling/colors** | [09: Styling](09-styling.md) | Update `tailwind.config.ts` or add utility classes |

---

## Key Architectural Concepts

### Speaker-Scoped Data

All resources (foods, places, activities, etc.) belong to exactly one Speaker. Every database query filters by `speakerId` to ensure data isolation.

**See:** [01: Architecture §1](01-architecture.md#1-system-overview)

### Provider Hierarchy

Root layout nests 5 providers: SessionProvider → PostHog → Theme → Sidebar → VBQueryClient (Query + Speaker context).

**See:** [01: Architecture §2](01-architecture.md#2-provider-hierarchy)

### Authentication & Authorization

better-auth handles user identity. Speaker ownership enforced via `speakerAuthCheck()`. Three roles: Parent (full access), Speaker (limited), Villager (read-only).

**See:** [08: Authentication](08-authentication.md)

### Database Patterns

Direct MongoDB driver (no ORM). Collections indexed on `speakerId` and `userId`. Centralized CRUD via `handleDatabaseOperation()` and `fetchDataFromCollection()`.

**See:** [07: Database](07-database.md)

### Component Architecture

Server Components by default. Client Components only when interactivity needed. Use GenericItemsPage for standard CRUD pages.

**See:** [05: Components](05-components.md)

### State Management

TanStack React Query for server state. React Context for global Speaker selection. Local `useState` for component state.

**See:** [06: Hooks and State](06-hooks-and-state.md)

### API Route Pattern

All routes: get auth → check speaker → execute operation → return JSON. Consistent error handling with proper HTTP status codes.

**See:** [04: API Routes](04-api-routes.md)

---

## Gotchas & Important Notes

### Known Authentication Gaps

- **Missing authorization checks**: Some API routes don't verify speaker ownership (speakerAuthCheck ignored)
- **Villager access incomplete**: Villagers should have read-only access, but not fully enforced
- **No role-based middleware**: Auth checks are per-route, not centralized

**See:** [08: Authentication §Gaps](08-authentication.md#known-gaps)

### Fire-and-Forget Mutations

Many mutations lack error handling. Use `onError` callbacks in all mutation handlers.

```typescript
// ❌ Don't do this
const { mutate: deleteFood } = useMutation({
  mutationFn: deleteFoodFn,
  // Missing onError!
})

// ✅ Do this
const { mutate: deleteFood } = useMutation({
  mutationFn: deleteFoodFn,
  onError: (error) => toast.error('Delete failed'),
})
```

**See:** [11: Conventions & Patterns §7](11-conventions-and-patterns.md#7-known-gotchas-and-debug-artifacts)

### Debug Artifacts in Code

- `console.trace()` in `components/custom/speaker-selector.tsx` (delete handler)
- `console.log('initialItems:')` in `components/custom/items-list.tsx`
- Remove before production deployment

**See:** [11: Conventions & Patterns §7](11-conventions-and-patterns.md#debug-artifacts-left-in-code)

### Hardcoded Production URL

`https://vb.harryt.dev` is hardcoded in:
- `app/sitemap.ts` (routes array)
- `components/custom/speaker-selector.tsx` (share link)

Update all if domain changes.

**See:** [11: Conventions & Patterns §7](11-conventions-and-patterns.md#hardcoded-production-urls)

### Unused Components

- `ItemsList` in `components/custom/items-list.tsx` — no consumers
- `PostHogServerClient` in `lib/posthog-server.ts` — never called

Consider removing these if not needed.

**See:** [11: Conventions & Patterns §7](11-conventions-and-patterns.md#unused--abandoned-code)

### Cache Mutation Issues

`SpeakerProvider` directly mutates React Query cache. Can cause inconsistencies.

**See:** [06: Hooks and State §Cache Mutation](06-hooks-and-state.md#cache-mutation-issues)

---

## Build and Deployment

### Local Development

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build + type check
npm run start        # Start production server
npm run lint         # Check for ESLint violations
npm run prettify     # Format all files with Prettier
npx gulp create-indexes  # Create MongoDB indexes
```

### Build Verification

Always run before committing:

```bash
npm run build        # Catches TypeScript errors and build issues
npm run lint         # Catches ESLint violations
npm run prettify     # Format to project standards
```

### Database Initialization

First time setup:

```bash
npx gulp create-indexes  # Creates MongoDB indexes for all collections
```

This requires `MONGO_CONNECTION_STRING` environment variable set.

---

## Code Style Standards

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Files | kebab-case | `speaker-selector.tsx`, `use-mobile.ts` |
| Components | PascalCase | `SpeakerSelector`, `AppSidebar` |
| Functions | camelCase | `fetchFoods()`, `handleDelete()` |
| Constants | SCREAMING_SNAKE | `MOBILE_BREAKPOINT`, `MAX_FILE_SIZE` |
| Types | PascalCase | `Speaker`, `SpeakerInput`, `Food` |

**See:** [11: Conventions & Patterns §1](11-conventions-and-patterns.md#1-file-naming-conventions)

### Import Ordering

1. Third-party imports
2. @/ internal imports (by category)
3. Relative imports (./, ../)

Blank lines between groups.

**See:** [11: Conventions & Patterns §2](11-conventions-and-patterns.md#2-import-ordering)

### Formatting (Prettier)

- No semicolons
- Single quotes
- 80 character line width
- Trailing commas
- Tailwind class sorting

Run `npm run prettify` before committing.

**See:** [AGENTS.md](../AGENTS.md)

### TypeScript

- Strict mode enabled
- Implicit `any` allowed (intentional)
- Explicit `any` allowed (intentional)
- Path aliases (`@/*`) for all internal imports

**See:** [11: Conventions & Patterns §9](11-conventions-and-patterns.md#9-typescript-best-practices)

---

## Common Recipes

Ready-to-use patterns for common tasks:

### Fetch Data in Component

```typescript
'use client'

import { useEffect, useState } from 'react'
import { Food } from '@/models'
import { useSpeakerContext } from '@/hooks/use-speakers'

export function FoodsList() {
  const [foods, setFoods] = useState<Food[]>([])
  const { selectedSpeaker } = useSpeakerContext()

  useEffect(() => {
    if (!selectedSpeaker) return
    fetch(`/api/foods?speakerId=${selectedSpeaker._id}`)
      .then(r => r.json())
      .then(data => setFoods(data.items))
      .catch(err => console.error(err))
  }, [selectedSpeaker?._id])

  return <>{foods.map(f => <div key={f._id}>{f.name}</div>)}</>
}
```

**See:** [11: Conventions & Patterns §10](11-conventions-and-patterns.md#common-tasks-and-recipes)

### Create a Form with Validation

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1, 'Name required'),
})

export function CreateForm() {
  const form = useForm({ resolver: zodResolver(schema) })

  return (
    <form onSubmit={form.handleSubmit((data) => {
      // POST to API
    })}>
      <input {...form.register('name')} />
      <button type="submit">Create</button>
    </form>
  )
}
```

**See:** [11: Conventions & Patterns §10](11-conventions-and-patterns.md#add-a-form)

### Show Toast Notification

```typescript
import { toast } from 'sonner'

function handleDelete() {
  try {
    // Delete logic
    toast.success('Deleted successfully')
  } catch (error) {
    toast.error('Failed to delete')
  }
}
```

**See:** [11: Conventions & Patterns §10](11-conventions-and-patterns.md#display-toast-notification)

### Add a New Resource Type

Follow the complete 8-step guide to add foods, places, activities, etc.

**See:** [11: Conventions & Patterns §6](11-conventions-and-patterns.md#6-adding-a-new-resource-type)

---

## Troubleshooting

### Build Fails with TypeScript Errors

Run `npm run build` to see all errors:

```bash
npm run build
```

Fix reported type errors. See [TypeScript docs](https://www.typescriptlang.org/docs/) for help.

### Linting Errors

Fix with:

```bash
npm run lint
```

Some errors auto-fixable. See `.eslintrc.json` for rules.

### Formatting Issues

Auto-format with:

```bash
npm run prettify
```

This applies Prettier to all files.

### MongoDB Connection Fails

Verify environment variables:

```bash
echo $MONGO_CONNECTION_STRING
```

Should output a valid MongoDB URI. Check `.env.local` file.

### API Returns 401 Unauthorized

User not authenticated. Verify:
1. User is logged in (check Clerk dashboard)
2. Request includes auth headers (automatic with Clerk middleware)
3. API route calls `currentUser()`

**See:** [08: Authentication](08-authentication.md)

---

## Additional Resources

### External Documentation

- **Next.js 16**: https://nextjs.org/docs
- **React 18**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **MongoDB**: https://docs.mongodb.com/
- **Clerk**: https://clerk.com/docs
- **TanStack Query**: https://tanstack.com/query/latest
- **React Hook Form**: https://react-hook-form.com/
- **Zod**: https://zod.dev

### Internal Resources

- **AGENTS.md** — Coding standards and best practices
- **package.json** — Dependencies and versions
- **next.config.ts** — Next.js configuration

---

## Contributing

When adding new documentation:

1. Create a new markdown file in `/docs/` with a descriptive name
2. Add a link to `index.md` in the Documentation Map table
3. Use consistent heading structure (h1 for title, h2 for sections, h3 for subsections)
4. Include code examples where helpful
5. Link to related docs using cross-references

---

## Document Version

Last updated: June 29, 2026

These docs are intended for AI agents working in VoiceBridge. For questions or corrections, see the AGENTS.md file.
