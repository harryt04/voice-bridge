# VoiceBridge Codebase Map

**Welcome!** This is the entry point for AI agents working in the VoiceBridge repository. All code is documented in `/docs/`. Start here to understand the project structure, find what you need, and contribute effectively.

---

## Quick Navigation

| Document | Purpose |
|----------|---------|
| **[docs/index.md](docs/index.md)** | Main documentation hub — start here |
| **[docs/01-architecture.md](docs/01-architecture.md)** | System design, provider hierarchy, data flow |
| **[docs/02-directory-structure.md](docs/02-directory-structure.md)** | File organization, where to add new code |
| **[docs/03-data-models.md](docs/03-data-models.md)** | TypeScript types and data structures |
| **[docs/04-api-routes.md](docs/04-api-routes.md)** | All API endpoints with full specifications |
| **[docs/05-components.md](docs/05-components.md)** | React components and their behavior |
| **[docs/06-hooks-and-state.md](docs/06-hooks-and-state.md)** | Custom hooks and state management |
| **[docs/07-database.md](docs/07-database.md)** | MongoDB patterns and utilities |
| **[docs/08-authentication.md](docs/08-authentication.md)** | Clerk auth and access control |
| **[docs/09-styling.md](docs/09-styling.md)** | Tailwind, CSS variables, Prettier, ESLint |
| **[docs/10-utilities.md](docs/10-utilities.md)** | Helper functions and utilities |
| **[docs/11-conventions-and-patterns.md](docs/11-conventions-and-patterns.md)** | Naming, imports, best practices, new resource guide |

---

## Project Overview

**VoiceBridge** is a Next.js 16 web application helping individuals with autism communicate using visual tools.

### Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS 3.4, shadcn/ui
- **Backend**: Next.js 16 App Router, Clerk (auth)
- **Database**: MongoDB (direct driver, no ORM)
- **State**: TanStack React Query, React Context
- **Analytics**: PostHog
- **Form**: react-hook-form, zod

### Core Concepts
- **Speaker** — Person with autism (user of the app)
- **Parent** — Caregiver (owner/parent role in Clerk)
- **Villager** — Read-only access user (shared speaker access)
- **Resources** — Foods, places, activities, vocabulary, villagers (all scoped to a speaker)

---

## Key File Locations

```
Root entry:           app/layout.tsx          (provider hierarchy)
Root page:            app/page.tsx            (redirects to /places)
API base:             app/api/                (13 REST endpoints)
Components (custom):  components/custom/      (GenericItemsPage, ItemComponent, etc.)
Components (UI):      components/ui/          (shadcn/ui — auto-generated)
React Hooks:          hooks/                  (useSpeakerContext, useIsMobile, VBQueryClient)
Type Definitions:     models/                 (Speaker, Food, Place, etc. — import from @/models)
Server Utilities:     lib/                    (mongo-client, mongo-utils, utils, posthog)
Client Utilities:     utils/                  (speech.ts, imageUtils.ts, directions.ts)
Configuration:        tsconfig.json, next.config.js, tailwind.config.ts, middleware.ts
```

---

## Quick Start: Where Do I Add X?

**New page?**
→ Create `app/{pageName}/page.tsx`. See [docs/02-directory-structure.md](docs/02-directory-structure.md#where-do-i-add-x).

**New resource type (foods, activities, etc.)?**
→ 8-step guide in [docs/11-conventions-and-patterns.md](docs/11-conventions-and-patterns.md#adding-a-new-resource-type-step-by-step-guide).

**New component?**
→ Create `components/custom/{componentName}.tsx`. Details: [docs/05-components.md](docs/05-components.md).

**New API endpoint?**
→ Create route handler in `app/api/{routeName}/route.ts`. Details: [docs/04-api-routes.md](docs/04-api-routes.md).

**New hook?**
→ Create `hooks/use-{hookName}.tsx`. Details: [docs/06-hooks-and-state.md](docs/06-hooks-and-state.md).

**New type?**
→ Create `models/{resourceName}.ts`, export from `models/index.ts`. Details: [docs/03-data-models.md](docs/03-data-models.md).

**Need to style something?**
→ Use Tailwind CSS. Details: [docs/09-styling.md](docs/09-styling.md).

---

## Build & Deployment

```bash
npm run dev       # Start dev server
npm run build     # Production build + TS check
npm run lint      # ESLint check
npm run prettify  # Format all files
npm run start     # Start production server
```

Run MongoDB index creation (after deploying new resources):
```bash
npx gulp create-indexes
```

---

## Important Notes for Contributors

### Known Issues
1. **Auth gaps** — `speakerAuthCheck()` is non-blocking; generic CRUD routes don't properly verify speaker ownership. See [docs/08-authentication.md](docs/08-authentication.md#auth-gaps).
2. **Fire-and-forget mutations** — Most component mutations don't await API calls or handle errors. See [docs/06-hooks-and-state.md](docs/06-hooks-and-state.md#anti-patterns--quirks).
3. **Debug artifacts** — `console.trace()` in speaker-selector.tsx, `console.log()` in items-list.tsx. Should be cleaned up.
4. **Hardcoded URLs** — Production URL `https://vb.harryt.dev` hardcoded in sitemap.ts and speaker-selector.tsx.
5. **Unused components** — ItemsList exists but is not used; left behind from an abandoned pattern.

### Code Style
- **No semicolons** (Prettier: `semi: false`)
- **Single quotes** (Prettier: `singleQuote: true`)
- **Trailing commas** (Prettier: `trailingComma: 'all'`)
- **80 char line width** (Prettier: `printWidth: 80`)
- **Tailwind class sorting** (Prettier plugin auto-sorts)
- **kebab-case files**, **PascalCase components**, **useXxx hooks**, **SCREAMING_SNAKE constants**

See [docs/11-conventions-and-patterns.md](docs/11-conventions-and-patterns.md) for detailed conventions.

---

## Architecture Snapshot

```
User Login
  ↓
Clerk Authentication
  ↓
VBQueryClient Provider
  ├→ QueryClientProvider
  └→ SpeakerProvider
      ├→ useQuery(['speakers']) → GET /api/speakers
      └→ Auto-select first speaker, provide via context
        ↓
Pages use useSpeakerContext()
  ├→ selectedSpeaker passed to API calls
  └→ GET /api/{resource}?speakerId={selectedSpeaker._id}
      ↓
MongoDB (voicebridge-{NODE_ENV})
  └→ Collections: speakers, foods, places, activities, villagers, vocabWords
```

Full details: [docs/01-architecture.md](docs/01-architecture.md).

---

## Next Steps

1. **Start here**: Read [docs/index.md](docs/index.md) for a comprehensive overview
2. **Understand the system**: Read [docs/01-architecture.md](docs/01-architecture.md)
3. **Find what you need**: Use the Quick Navigation table above
4. **Make changes**: Follow conventions in [docs/11-conventions-and-patterns.md](docs/11-conventions-and-patterns.md)
5. **Build & test**: `npm run build && npm run lint`

---

## Code is the Source of Truth

All documentation is manually maintained and reflects the actual codebase at the time of writing. **If documentation conflicts with code, code wins.** Check the code first, then update docs.

---

**Last updated**: June 29, 2026  
**AI Agents**: Use `/docs/` for detailed reference during development.
