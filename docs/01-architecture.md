# VoiceBridge Architecture

## 1. System Overview

### Core Domain Model

VoiceBridge operates with three primary user roles:

- **Speaker**: Individual with autism using the communication tools. Owns all resources (activities, food, places, vocabulary words, etc.). Can be controlled/managed by parent.
- **Parent**: Caregiver who creates and owns a Speaker. Has full CRUD access to Speaker's resources.
- **Villager**: Read-only user with access to a Speaker's resources. Granted explicit access by Parent.

### Resource Scoping

Every resource in the system belongs to exactly one Speaker via `speakerId` field:
- activities (activities)
- foods (foods)
- places (places)
- vocabulary words (vocabWords)
- villagers (read-only access grants)

No resource exists outside a Speaker scope.

---

## 2. Provider Hierarchy

Root layout (`app/layout.tsx`) establishes provider nesting from outermost to innermost:

```
SessionProvider
└── PostHogProvider
    └── ThemeProvider
        └── SidebarProvider
            └── VBQueryClient (= QueryClientProvider + SpeakerProvider)
                ├── QueryClientProvider (TanStack React Query)
                └── SpeakerProvider (React Context)
```

### Provider Responsibilities

- **SessionProvider**: Authentication (better-auth)
- **PostHogProvider**: Analytics tracking
- **ThemeProvider**: Dark/light mode theme switching
- **SidebarProvider**: Sidebar UI state (open/closed)
- **VBQueryClient**: Wraps both:
  - **QueryClientProvider**: Server state caching (React Query)
  - **SpeakerProvider**: Global Speaker selection (context)

### VBQueryClient (lib/mongo-utils.ts)

Mounts in root layout, initializes:
1. `QueryClient` singleton for React Query
2. `SpeakerProvider` context
   - Auto-fetches speakers via `/api/speakers` on mount
   - Auto-selects first speaker if none selected
   - Provides `useSpeakerContext()` hook across app

---

## 3. Data Flow Diagram

```
┌─────────────────┐
│  User Login     │ (better-auth)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ VBQueryClient   │ (Mount in root layout)
│ initializes     │
└────────┬────────┘
         │
         ├──► Fetch /api/speakers
         │    (auto-get parent's speakers)
         │
         ├──► setSelectedSpeaker(speakers[0])
         │    (auto-select first speaker)
         │
         └──► useSpeakerContext() available
              across all pages
              
┌──────────────────────────────────────┐
│ Page Mounts (e.g., /app/food)        │
│ useEffect → fetch with speakerId     │
└──────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ /api/{plural}?speakerId={id}         │
│ Returns array of items scoped to ID  │
└──────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ Display items, enable CRUD ops       │
│ POST/DELETE to /api/{singular}       │
└──────────────────────────────────────┘
```

---

## 4. Speaker-Scoped Data Pattern

### API Naming Convention

- **Singular CRUD endpoint** (`/api/{singular}`): GET (by id), POST (create/update), DELETE (by id)
- **Plural list endpoint** (`/api/{plural}`): GET with `?speakerId=` query param to fetch scoped list

### Examples

```
GET  /api/food?id=123              → Fetch single food item
POST /api/food                     → Create new food (body contains speakerId)
DELETE /api/food?id=123            → Delete food

GET  /api/foods?speakerId=456      → Fetch all foods for speaker 456
```

### Authorization Pattern

Authorization uses better-auth `session.user.id` for all checks:
- Every request must include authenticated session via `auth.api.getSession({ headers: req.headers })`
- `speakerAuthCheck(req, speakerId)` verifies user is parent or villager of the speaker
- **AAC mutations** use `aacMutationAuthCheck(req, speakerId)` — caregiver-only (parent only, not villager)
- **Known gaps**: Authorization check incomplete in some routes (marked in code)

### Client-Side List Fetching

Pages use `GenericItemsPage` or custom page component:

```tsx
const { selectedSpeaker } = useSpeakerContext()

useEffect(() => {
  const response = await fetch(
    `/api/{plural}?speakerId=${selectedSpeaker?._id}`
  )
  const data = await response.json()  // Array of items
  setItems(data)
}, [selectedSpeaker])
```

---

## 5. Database

### Connection

- Driver: Direct MongoDB driver (no ORM)
- Singleton pattern: `getMongoClient()` reuses connection across requests (lib/mongo-client.ts)
- Connection string: `process.env.MONGO_CONNECTION_STRING`

### Database Name

```
voicebridge-${NODE_ENV}
```

Examples:
- Development: `voicebridge-development`
- Production: `voicebridge-production`

### Collections

| Collection  | Purpose                                     | Key Fields      |
| ----------- | ------------------------------------------- | --------------- |
| speakers    | Speaker profiles                            | `_id`, `parentId`, `villagerIds`, `name` |
| activities  | Daily activities (scoped to speaker)        | `_id`, `speakerId`, `name`, ... |
| foods       | Food/drink preferences (scoped)             | `_id`, `speakerId`, `name`, ... |
| places      | Locations (scoped)                          | `_id`, `speakerId`, `name`, ... |
| villagers   | Read-only access grants (scoped)            | `_id`, `speakerId`, `userId`, ... |
| vocabWords  | Vocabulary words (scoped)                   | `_id`, `speakerId`, `word`, ... |
| aacPhrases  | Custom AAC phrases (scoped to speaker)      | `_id`, `speakerId`, `text`, `category`, ... |
| aacUserPreferences | AAC user settings (one per speaker)  | `_id`, `speakerId`, `voiceName`, `speechRate`, ... |

### CRUD Utilities

**lib/mongo-utils.ts** provides centralized functions:

- `handleDatabaseOperation(req, collectionName, operation)`: Handles GET/POST/DELETE for singular endpoints
- `fetchDataFromCollection(req, collectionName)`: Fetches filtered list (supports `?speakerId=` query param)

---

## 6. GenericItemsPage Pattern vs Places Pattern

### GenericItemsPage (Reusable Template)

Most resource pages use the `GenericItemsPage` component:

```tsx
// Example: app/food/page.tsx
import GenericItemsPage from '@/components/custom/generic-items-page'

export default function Foods() {
  const pageInfo: GenericPageInfo = {
    listModelName: 'foods',      // /api/foods
    editModelName: 'food',       // /api/food
    singularLabel: 'food',
    pluralLabel: 'foods',
    noResultsComponent: <NoResultsComponent ... />,
  }
  return <GenericItemsPage pageInfo={pageInfo} />
}
```

**Pages using GenericItemsPage:**
- app/food/page.tsx
- app/activities/page.tsx
- app/people/page.tsx
- app/vocabulary/page.tsx

**GenericItemsPage features:**
- Fetch list via `/api/{plural}?speakerId=`
- Create/update via `/api/{singular}` POST
- Delete via `/api/{singular}` DELETE
- Search/filter by name
- Toggle edit mode

### Places Page (Hand-Rolled)

`app/places/page.tsx` does NOT use `GenericItemsPage`. Instead:
- Duplicates list/CRUD logic
- Uses custom `PlaceComponent` (typed component with custom UI)
- Includes "Directions" button calling `getDirections()` utility

**Why asymmetry?**
Places resource requires custom behavior:
- "Directions" button (navigates to place via geolocation or map)
- Place-specific rendering logic (address, coordinates, etc.)
- Cannot be abstracted into generic template without loss of functionality

**Solution for Places:**
If Places page evolves, consider extracting common patterns into `GenericItemsPage` with optional plugin system for custom actions (Directions button). Current hand-rolled approach prioritizes clarity over DRY.

---

## 7. Key Architectural Constraints

### No Shared Resources Across Speakers
Each Speaker has isolated data. No cross-speaker resource sharing exists (by design).

### Parent-Centric Ownership
Parent creates Speaker and owns all initial resources. Villagers cannot create; only view.

### Synchronous CRUD
All CRUD operations are synchronous fetch calls. No real-time sync (WebSocket) implemented.

### No Global Error Boundary
Error handling is per-page/component with `catch(err)` and state-driven UI. No app-wide error fallback.

### Authorization Gaps (Known Issues)
- `speakerAuthCheck()` exists but not consistently applied across all endpoints
- Some list endpoints may lack villager access verification
- Audit: Review all `/api/{plural}` routes for authorization coverage

---

## 8. AAC (Augmentative and Alternative Communication) Architecture

### Symbol Provider Pattern

AAC uses a **Symbol Provider** abstraction to support multiple symbol sources at runtime:

```
SymbolProvider (interface)
├── MulberrySymbolProvider (current: static JSON)
├── ArasaacSymbolProvider (future: REST API)
├── CustomSymbolProvider (future: cards integration)
└── CompositeSymbolProvider (future: multi-source merging)
```

**Current Implementation (Mulberry):**
- Symbol metadata: Static JSON file (`lib/aac/mulberry-symbols.json`)
- ~500 core symbols bundled in `public/symbols/mulberry/`
- Remaining ~3,000 symbols via GitHub CDN URLs
- No API calls at runtime — all data loaded at module init

**Structure:**
```ts
interface AacSymbol {
  id: string
  label: string
  imageUrl: string    // /symbols/mulberry/{name}.svg or CDN URL
  category: string    // 'core', 'feelings', 'people', etc.
  source: 'mulberry'
  tags?: string[]
}
```

**12 Categories:** core, feelings, people, actions, food-drink, places, objects, describing, social, body, time, questions.

### AAC State Management

**Sentence Bar State** — Local component state, not persisted:
- Managed in `app/aac/layout.tsx` via `AacSentenceContext`
- Stores `SentenceWord[]` (id, label, imageUrl)
- Cleared on navigation or user action
- Context provides `addWord()`, `removeWord()`, `clearSentence()`

**AAC Preferences** — React Query cached state:
- Fetched once per page tree via `useAacPreferences(speakerId)` in layout
- Stale time: 5 minutes
- Mutations: `POST /api/aac/preferences` (caregiver-only)
- Distributed to pages via `AacPreferencesContext`

**Collections Involved:**
- `aacPhrases`: Custom phrases created by caregiver
- `aacUserPreferences`: Settings (voice, rate, pitch, etc.)

### AAC Authorization Model

**Read Operations** — Parent or Villager:
- GET `/api/aac/phrases?speakerId=`
- GET `/api/aac/preferences?speakerId=`

**Write Operations** — Parent (caregiver) only:
- POST `/api/aac/phrase` (create)
- PUT `/api/aac/phrase?id=` (update)
- DELETE `/api/aac/phrase?id=` (delete)
- POST `/api/aac/preferences` (upsert settings)

Uses `aacMutationAuthCheck(req, speakerId)` which verifies `speaker.parentId === session.user.id`.

### TTS (Text-to-Speech) Utility

Centralized speech output via `speak(text, preferences)` from `utils/aac-speech.ts`:
- Wraps `window.speechSynthesis`
- All symbol taps, phrase taps, and sentence speaks use this utility
- Applies user preferences: `voiceName`, `speechRate`, `speechPitch`
- Error handling: graceful degradation (no throw, just console.error)
- **Client-side only** — never called on server
