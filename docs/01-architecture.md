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
│  User Login     │ (Clerk auth)
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

Authorization uses Clerk `userId` for all checks:
- Every request must include authenticated Clerk user (`getAuth(req)`)
- `speakerAuthCheck(req, itemId)` verifies user is parent or villager of speaker owning the item
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
