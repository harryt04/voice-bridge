# Hooks and State Management

This document covers all custom hooks, state management patterns, and data flow in the VoiceBridge application.

---

## Table of Contents

1. [useIsMobile](#useismobile)
2. [useSpeakerContext](#usespeakercontext)
3. [SpeakerProvider](#speakerprovider)
4. [VBQueryClient](#vbqueryclient)
5. [State Management Patterns](#state-management-patterns)
6. [Data Fetching Patterns](#data-fetching-patterns)
7. [Known Quirks & Anti-Patterns](#known-quirks--anti-patterns)

---

## useIsMobile

**File:** `hooks/use-mobile.tsx`  
**Exported:** `useIsMobile(): boolean`

### Overview

Hook that returns `true` if the current viewport width is less than 768px (mobile breakpoint), `false` otherwise.

### Signature

```typescript
const MOBILE_BREAKPOINT = 768

export function useIsMobile(): boolean
```

### Behavior

1. **Initial State:** `undefined` (prevents hydration mismatch)
2. **On Mount:**
   - Creates `MediaQueryList` via `window.matchMedia('(max-width: 767px)')`
   - Registers resize listener via `addEventListener('change', ...)`
   - Calls `onChange()` immediately to set initial state
3. **On Resize:** `onChange()` checks `window.innerWidth < MOBILE_BREAKPOINT` and updates state
4. **On Unmount:** Removes listener via `removeEventListener()`
5. **Return Value:** Returns `!!isMobile` (coerces `undefined` to `false`)

### Usage Example

```typescript
'use client'

import { useIsMobile } from '@/hooks/use-mobile'

export function MyComponent() {
  const isMobile = useIsMobile()

  return (
    <>
      {isMobile ? (
        <MobileLayout />
      ) : (
        <DesktopLayout />
      )}
    </>
  )
}
```

### Return Values

| State | Initial | After Mount | During Resize |
|-------|---------|------------|---------------|
| Hydration | `false` (coerced from `undefined`) | `true` or `false` | `true` or `false` |

### Known Quirks

- Initial state is `undefined`, returns `false` until mounted
- Relies on `window` object (client-side only)
- If used in Server Component, will cause hydration mismatch
- Resize listener persists until component unmounts (could accumulate if re-mounted frequently)

### Constants

```typescript
MOBILE_BREAKPOINT = 768  // CSS: max-width breakpoint
```

---

## useSpeakerContext

**File:** `hooks/use-speakers.tsx`  
**Exported:** `useSpeakerContext(): SpeakerContextType`

### Overview

Hook that provides access to the global speaker state (speakers list, selected speaker, loading).

### Signature

```typescript
type SpeakerContextType = {
  speakers: Speaker[]
  selectedSpeaker: Speaker | null
  setSelectedSpeaker: (speaker: Speaker | null) => void
  isLoading: boolean
}

export const useSpeakerContext = (): SpeakerContextType
```

### Return Values

| Property | Type | Purpose |
|----------|------|---------|
| `speakers` | `Speaker[]` | All available speakers for current user |
| `selectedSpeaker` | `Speaker \| null` | Currently selected speaker (null until loaded) |
| `setSelectedSpeaker` | `(speaker) => void` | Update selected speaker (has side effects) |
| `isLoading` | `boolean` | Fetching speakers from API |

### Behavior

1. **Fetch on Mount:**
   - Uses `useQuery(['speakers'], fetchSpeakers)` from TanStack React Query
   - Calls `GET /api/speakers` on component mount
   - Caches result with key `['speakers']`

2. **Auto-Select First Speaker:**
   - `useEffect` watches `speakers` and `selectedSpeaker`
   - When speakers load and no speaker selected: auto-selects `speakers[0]`

3. **setSelectedSpeaker Quirk (Anti-Pattern):**
   - If speaker NOT in current speakers array:
     - Mutates TanStack Query cache: `speakers.push(speaker)`
     - **This is fragile and anti-pattern behavior**
   - Updates local state: `setSelectedSpeakerState(speaker)`
   - Used for scenarios where speaker is added externally

### Usage Example

```typescript
'use client'

import { useSpeakerContext } from '@/hooks/use-speakers'

export function SpeakerInfo() {
  const { speakers, selectedSpeaker, isLoading } = useSpeakerContext()

  if (isLoading) return <p>Loading speakers...</p>
  if (!selectedSpeaker) return <p>No speaker selected</p>

  return (
    <div>
      <p>Speaker: {selectedSpeaker.name}</p>
      <p>Total speakers: {speakers.length}</p>
    </div>
  )
}
```

### Common Patterns

**Switching Speakers:**
```typescript
const { speakers, setSelectedSpeaker } = useSpeakerContext()

const handleSwitchSpeaker = (speakerId: string) => {
  const speaker = speakers.find(s => s._id === speakerId)
  if (speaker) {
    setSelectedSpeaker(speaker)
  }
}
```

**Fetching Items for Selected Speaker:**
```typescript
const { selectedSpeaker } = useSpeakerContext()

useEffect(() => {
  if (selectedSpeaker) {
    fetch(`/api/foods?speakerId=${selectedSpeaker._id}`)
      .then(r => r.json())
      .then(data => setItems(data))
  }
}, [selectedSpeaker])
```

### Error Handling

- Throws error if used outside `SpeakerProvider`:
  ```
  Error: useSpeakerContext must be used within a SpeakerProvider
  ```
- No error message if API fetch fails (TanStack Query silent fail)

### Known Quirks

- **Cache Mutation Anti-Pattern:** `setSelectedSpeaker()` directly mutates TanStack Query cache array
  - Could cause stale data if same speaker exists in original array
  - No re-validation or cache invalidation
- **No Error State:** `isError` from useQuery is not exposed
- **Silent Failures:** If `GET /api/speakers` fails, no error exposed to consumers
- **Auto-Select Logic:** Assumes first speaker is appropriate default (may not be)

---

## SpeakerProvider

**File:** `hooks/use-speakers.tsx`  
**Exported:** `<SpeakerProvider children>`

### Overview

React Context provider component that wraps the application and provides speaker context to all child components.

### Signature

```typescript
export const SpeakerProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // ... implementation
}
```

### Behavior

1. **Data Fetching:**
   - Calls `useQuery(['speakers'], fetchSpeakers)` on mount
   - Fetches from `GET /api/speakers`
   - Provides cached result via `data` property

2. **State Management:**
   - Local state: `selectedSpeaker` (null initially)
   - Wrapped setter: `setSelectedSpeaker()` with cache mutation logic

3. **Auto-Selection:**
   - On speakers load: auto-selects first speaker if none selected
   - `useEffect([selectedSpeaker, speakers])`

4. **Context Value:**
   - Provides `SpeakerContextType` with speakers, selectedSpeaker, setSelectedSpeaker, isLoading

### Usage in App Layout

```typescript
// app/layout.tsx (root layout)

import { VBQueryClient } from '@/hooks/use-query-client'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        <VBQueryClient>
          {children}
        </VBQueryClient>
      </body>
    </html>
  )
}
```

The provider hierarchy is:
```
QueryClientProvider
  └─ SpeakerProvider
       └─ children
```

---

## VBQueryClient

**File:** `hooks/use-query-client.tsx`  
**Exported:** `<VBQueryClient children>`

### Overview

Root provider component that sets up TanStack React Query and speaker context for the entire app.

### Signature

```typescript
const queryClient = new QueryClient()  // Singleton at module level

export const VBQueryClient = ({ children }: { children: any }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <SpeakerProvider>{children}</SpeakerProvider>
    </QueryClientProvider>
  )
}
```

### Hierarchy

```
QueryClientProvider (TanStack React Query)
  └─ SpeakerProvider (Speaker context)
       └─ children (app content)
```

### Behavior

1. **QueryClient Creation:** Singleton instance created at module load time
2. **Provider Wrapping:** Wraps SpeakerProvider
3. **Configuration:** Uses TanStack React Query defaults (no custom config)

### Usage

Typically used in `app/layout.tsx` as the topmost provider:

```typescript
import { VBQueryClient } from '@/hooks/use-query-client'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <VBQueryClient>{children}</VBQueryClient>
      </body>
    </html>
  )
}
```

### Known Quirks

- `queryClient` is module-level singleton (persists across requests in SSR)
- No custom configuration (could add staleTime, cacheTime, etc.)
- TanStack Query's `devtools` not enabled (could help debugging)

---

## State Management Patterns

### Overview

VoiceBridge uses a **hybrid state management** approach:

| Concern | Solution | Details |
|---------|----------|---------|
| Server State | TanStack React Query | Caches API responses; used only for `/api/speakers` |
| Local State | `useState` | Pages manage lists (items, foods, places) locally |
| Global State | React Context | SpeakerContext provides selected speaker app-wide |

### Server State (TanStack React Query)

**Used For:**
- `GET /api/speakers` — fetched once and cached

**Setup:**
```typescript
const { data: speakers = [] } = useQuery({ 
  queryKey: ['speakers'], 
  queryFn: fetchSpeakers 
})
```

**Advantages:**
- Automatic caching and stale-while-revalidate
- Single source of truth for speakers list
- Built-in loading/error states

**Limitations:**
- Only used for speakers (not foods, places, people)
- Cache mutations (via `setSelectedSpeaker()`) fragile
- No cache invalidation on mutations

### Local State (useState)

**Used For:**
- Item lists on generic pages (foods, places, activities, people, vocabulary)
- Form state (FormState objects)
- UI state (loading, error, isFormOpen, editMode)

**Example from GenericItemsPage:**
```typescript
const [items, setItems] = useState<any[]>([])
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
const [isFormOpen, setIsFormOpen] = useState(false)
const [editMode, setEditMode] = useState(false)
const [searchQuery, setSearchQuery] = useState('')
```

**Fetching:**
```typescript
useEffect(() => {
  if (!selectedSpeaker?._id) return
  
  fetch(`/api/foods?speakerId=${selectedSpeaker._id}`)
    .then(r => r.json())
    .then(data => setItems(data))
    .catch(err => setError(err.message))
}, [selectedSpeaker])
```

**Mutations:**
```typescript
// Add/Edit (fire-and-forget)
const handleUpsertItem = async (newItem) => {
  const response = await fetch(`/api/food`, {
    method: 'POST',
    body: JSON.stringify(newItem),
  })
  const data = await response.json()
  setItems(prev => [...prev, data.updatedItem])  // Optimistic
}

// Delete (fire-and-forget)
const handleDeleteItem = async (item) => {
  fetch(`/api/food?id=${item._id}`, { method: 'DELETE' })
  setItems(items.filter(i => i._id !== item._id))  // Optimistic
}
```

### Global State (React Context)

**Used For:**
- Selected speaker (used by every page)
- Loading state during fetch

**Provider:**
```typescript
<SpeakerProvider>
  <app />
</SpeakerProvider>
```

**Consumer:**
```typescript
const { selectedSpeaker, speakers, setSelectedSpeaker } = useSpeakerContext()
```

**Scope:** Application-wide; all components access same speaker state

---

## Data Fetching Patterns

### Pattern 1: Fetch on Speaker Change

**Location:** `GenericItemsPage`, `PersonPage`, `PlacesPage`, etc.

**Code:**
```typescript
const { selectedSpeaker } = useSpeakerContext()

useEffect(() => {
  if (!selectedSpeaker?._id) return

  fetch(`/api/foods?speakerId=${selectedSpeaker._id}`)
    .then(r => r.json())
    .then(data => {
      setItems(data)
      setLoading(false)
    })
    .catch(err => {
      setError(err.message)
      setLoading(false)
    })
}, [selectedSpeaker])
```

**Trigger:** When `selectedSpeaker` changes (user switches speaker)
**State:** `loading`, `error`, `items`

### Pattern 2: Add Item (Fire-and-Forget)

**Location:** `ItemComponent`, `PlaceComponent`, all CRUD pages

**Code:**
```typescript
const handleUpsertItem = async (newItem) => {
  fetch(`/api/food`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...newItem, speakerId: selectedSpeaker._id }),
  })
    .then(r => r.json())
    .then(data => {
      setItems(prev => [...prev, data.updatedItem])
    })
    .catch(err => console.error(err))  // Silent failure
}
```

**Behavior:**
- Optimistic update: add item to state immediately
- Fire-and-forget: don't await response
- No error handling in UI
- User sees item immediately, but if API fails, data inconsistent

### Pattern 3: Edit Item (Fire-and-Forget)

**Location:** `ItemComponent`, `PlaceComponent`

**Code:**
```typescript
const handleSubmit = (updatedItemData) => {
  setUpdatedItem(updatedItemData)  // Immediate UI update
  setIsEditing(false)
  
  fetch(`/api/food?id=${updatedItemData._id}`, {
    method: 'POST',
    body: JSON.stringify(updatedItemData),
  })  // Fire-and-forget
}
```

**Behavior:**
- Local state updated immediately (optimistic)
- API call sent but not awaited
- Parent component also receives callback but doesn't await
- If API fails, local state persists but server diverges

### Pattern 4: Delete Item (Fire-and-Forget)

**Location:** `GenericItemsPage`, `ItemComponent`, etc.

**Code:**
```typescript
const handleDeleteItem = async (item) => {
  setItems(items.filter(i => i._id !== item._id))  // Immediate removal
  
  fetch(`/api/food?id=${item._id}`, {
    method: 'DELETE',
  })  // Fire-and-forget
}
```

**Behavior:**
- Remove from state immediately (optimistic)
- DELETE request sent without waiting
- If API fails, item stays removed locally but exists on server

### Pattern 5: Speaker Management

**Location:** `SpeakerSelector`, `SpeakerForm`

**Add Speaker:**
```typescript
const handleFormSubmit = async (speaker) => {
  const response = await fetch('/api/speaker', {
    method: 'POST',
    body: JSON.stringify(speaker),
  })
  const data = await response.json()
  setSelectedSpeaker(data.updatedSpeaker)  // This mutates TanStack Query cache!
}
```

**Delete Speaker:**
```typescript
const handleDeleteSpeaker = async (speaker) => {
  await fetch(`/api/speaker?id=${speaker._id}`, {
    method: 'POST',
    body: JSON.stringify({ ...speaker, isArchived: true }),
  })
  window.location.assign('/places')  // Hard page reload
}
```

**Differences:**
- Add: awaits response, updates selected speaker
- Delete: soft delete (isArchived: true), hard redirect to reload page

---

## Known Quirks & Anti-Patterns

### 1. Fire-and-Forget Mutations (Pervasive)

**Issue:** Add/edit/delete operations don't await, no error handling

```typescript
// BAD: No error handling
fetch('/api/food', { method: 'POST', body })
  .then(r => r.json())
  .then(data => setItems(prev => [...prev, data]))
  // Error silently ignored!
```

**Impact:**
- Users don't see errors if API fails
- Local state may diverge from server
- No loading state during request
- Optimistic updates can fail silently

**Recommendation:** Use TanStack Query's `useMutation()` hooks instead

```typescript
// BETTER: With error handling
const mutation = useMutation({
  mutationFn: (item) => fetch('/api/food', { 
    method: 'POST', 
    body: JSON.stringify(item) 
  }).then(r => r.json()),
  onSuccess: (data) => setItems(prev => [...prev, data]),
  onError: (err) => toast.error('Failed to add item'),
})
```

### 2. TanStack Query Cache Mutation (ItemComponent, SpeakerSelector)

**Issue:** `setSelectedSpeaker()` directly mutates Query cache array

```typescript
// From useSpeakerContext hook
const setSelectedSpeaker = (speaker: Speaker | null) => {
  if (!speakers.find((s) => s._id === speaker?._id)) {
    speakers.push(speaker as any)  // Direct mutation!
  }
  setSelectedSpeakerState(speaker)
}
```

**Problems:**
- TanStack Query doesn't detect mutation (expects immutable updates)
- Cache may become inconsistent
- Could cause re-render loops or stale data
- Anti-pattern per TanStack Query best practices

**Recommendation:** Use `queryClient.setQueryData()` or `queryClient.invalidateQueries()` instead

```typescript
// BETTER
const queryClient = useQueryClient()

const setSelectedSpeaker = (speaker: Speaker | null) => {
  queryClient.setQueryData(
    ['speakers'],
    (old: Speaker[]) => [...old, speaker]
  )
  setSelectedSpeakerState(speaker)
}
```

### 3. Unused Component (ItemsList)

**Issue:** Component exists but never imported

**File:** `components/custom/items-list.tsx`

**Status:** UNUSED — replaced by `GenericItemsPage`

**Artifacts:** Debug `console.log('initialItems: ', initialItems)` left in

**Recommendation:** Remove if confirmed not used

### 4. No Cache Invalidation on Mutations

**Issue:** Pages never invalidate TanStack Query caches

```typescript
// Missing: 
// queryClient.invalidateQueries(['speakers'])
// queryClient.invalidateQueries(['foods', speakerId])

// Instead, pages rely on local useState
```

**Impact:**
- If speaker list is updated by another user, cache never refreshes
- Only refreshes on manual page reload
- Breaks multi-tab scenarios

**Recommendation:** Add cache invalidation after mutations

```typescript
const handleUpsertItem = async (newItem) => {
  const response = await fetch('/api/food', { /* ... */ })
  const data = await response.json()
  queryClient.invalidateQueries(['foods', selectedSpeaker._id])
  setItems(prev => [...prev, data])
}
```

### 5. Auto-Select First Speaker (Fragile)

**Issue:** If no speakers, `speakers[0]` is undefined

```typescript
// From SpeakerProvider
useEffect(() => {
  if (speakers?.length > 0 && !selectedSpeaker) {
    setSelectedSpeakerState(speakers[0])  // Could be undefined if empty
  }
}, [selectedSpeaker, speakers])
```

**Impact:**
- If user has no speakers, selectedSpeaker is null
- Pages try to fetch with null speakerId: `/api/foods?speakerId=null`
- API may reject requests or return unexpected data

**Recommendation:** Handle empty speakers case gracefully

```typescript
useEffect(() => {
  if (speakers?.length > 0 && !selectedSpeaker) {
    setSelectedSpeakerState(speakers[0])
  } else if (speakers?.length === 0) {
    setSelectedSpeakerState(null)
    // Show "Create your first speaker" message
  }
}, [selectedSpeaker, speakers])
```

### 6. Only Speakers Use TanStack Query

**Issue:** All other resources (foods, places, people) use raw `fetch()` + useState

**Current:**
- `useQuery()` for `/api/speakers` only
- `fetch()` + `useState` for everything else

**Impact:**
- Inconsistent data fetching patterns
- Hard to add features like pagination, refetching, caching
- Code duplication across pages

**Recommendation:** Extend TanStack Query to all resources

```typescript
// Create custom hooks
export const useFoods = (speakerId: string) => {
  return useQuery({
    queryKey: ['foods', speakerId],
    queryFn: () => fetch(`/api/foods?speakerId=${speakerId}`).then(r => r.json()),
    enabled: !!speakerId,
  })
}

export const useFood = (id: string) => {
  return useMutation({
    mutationFn: (data) => fetch(`/api/food?id=${id}`, { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries(['foods']),
  })
}
```

### 7. Hard Redirects Instead of Soft Navigation

**Issue:** Delete speaker uses `window.location.assign('/places')`

```typescript
// From SpeakerSelector
const handleDeleteSpeaker = async (speaker) => {
  await fetch(`/api/speaker?id=${speaker._id}`, {
    method: 'POST',
    body: JSON.stringify({ ...speaker, isArchived: true }),
  })
  window.location.assign('/places')  // Hard reload!
}
```

**Impact:**
- Full page reload (slow)
- Lost component state, scroll position, etc.
- Poor UX compared to soft navigation

**Recommendation:** Use Next.js router and cache invalidation

```typescript
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'

const handleDeleteSpeaker = async (speaker) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  
  await fetch(`/api/speaker?id=${speaker._id}`, {
    method: 'POST',
    body: JSON.stringify({ ...speaker, isArchived: true }),
  })
  
  queryClient.invalidateQueries(['speakers'])
  router.push('/places')  // Soft navigation
}
```

### 8. Console Artifacts Left in Production

**Issues:**
- `console.log('initialItems: ', initialItems)` in `items-list.tsx` (line 29)
- `console.trace()` in `speaker-selector.tsx` (line 75)

**Recommendation:** Remove or wrap in development-only guards

```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('initialItems: ', initialItems)
}
```

### 9. Type Safety Issues

**Issues:**
- Generic `any` types used in ItemComponent, ItemForm
- No type safety for item shape
- `editingSpeaker: any` in SpeakerSelector

**Impact:**
- Runtime errors if item shape changes
- IDE autocomplete doesn't work
- Hard to refactor safely

**Recommendation:** Create strict item types

```typescript
type Food = {
  _id: string
  name: string
  description: string
  imageUrl?: string
  imageBase64?: string
  speakerId: string
}

type FoodInput = Omit<Food, '_id' | 'speakerId'>
```

---

## Summary of Anti-Patterns

| Anti-Pattern | Location | Severity | Fix |
|---|---|---|---|
| Fire-and-forget mutations | All pages | High | Use TanStack Query mutations |
| Query cache mutation | `use-speakers.tsx` | High | Use `queryClient.setQueryData()` |
| No cache invalidation | All pages | Medium | Add `invalidateQueries()` calls |
| Unused component | `items-list.tsx` | Low | Remove if confirmed unused |
| Only speakers use Query | Hooks layer | Medium | Extend Query to all resources |
| Hard page redirects | `speaker-selector.tsx` | Medium | Use soft navigation + cache clearing |
| Console artifacts | Multiple files | Low | Remove or guard with dev check |
| Generic `any` types | All components | Medium | Add strict TypeScript types |

---

## State Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│ Root Layout                                         │
│  <VBQueryClient>                                    │
│    <QueryClientProvider>                            │
│      <SpeakerProvider>                              │
│        {pages}                                      │
└─────────────────────────────────────────────────────┘
         │
         ├─ SpeakerContext
         │   ├─ speakers[] (from useQuery)
         │   ├─ selectedSpeaker (auto-selected)
         │   └─ setSelectedSpeaker() (mutates cache)
         │
         └─ Pages (GenericItemsPage, etc.)
             ├─ useSpeakerContext() → selectedSpeaker
             ├─ useEffect([selectedSpeaker])
             │   └─ fetch(`/api/foods?speakerId=${id}`)
             │       └─ setItems(data)
             │
             └─ ItemComponent
                 ├─ Edit → ItemForm → handleSubmit
                 │   └─ fetch POST (fire-and-forget)
                 │       └─ setUpdatedItem(data)
                 │
                 └─ Delete → onDelete callback
                     └─ fetch DELETE (fire-and-forget)
```

---

## Best Practices

### 1. Use TanStack Query for All Server State

```typescript
// ✅ Good
const { data: foods } = useQuery({
  queryKey: ['foods', speakerId],
  queryFn: () => fetch(`/api/foods?speakerId=${speakerId}`),
  enabled: !!speakerId,
})

// ❌ Bad
const [foods, setFoods] = useState([])
useEffect(() => {
  fetch(`/api/foods?speakerId=${speakerId}`)
    .then(r => r.json())
    .then(setFoods)
}, [speakerId])
```

### 2. Use Mutations for Side Effects

```typescript
// ✅ Good
const mutation = useMutation({
  mutationFn: (food) => fetch('/api/food', { /* ... */ }),
  onSuccess: (data) => {
    queryClient.invalidateQueries(['foods'])
    toast.success('Food added!')
  },
  onError: (err) => toast.error(`Error: ${err.message}`),
})

// ❌ Bad
const handleAdd = async (food) => {
  fetch('/api/food', { /* ... */ })
  setFoods(prev => [...prev, food])  // Optimistic, no error handling
}
```

### 3. Handle Loading and Error States

```typescript
// ✅ Good
const { data, isLoading, error } = useQuery(...)

if (isLoading) return <Skeleton />
if (error) return <ErrorCard message={error.message} />
return <ItemList items={data} />

// ❌ Bad
const { data } = useQuery(...)
return <ItemList items={data} />  // No loading/error states
```

### 4. Type Everything

```typescript
// ✅ Good
type Food = {
  _id: string
  name: string
  description: string
  speakerId: string
}

const { data: foods } = useQuery<Food[]>(...)

// ❌ Bad
const { data: foods } = useQuery(...)
// foods is implicitly 'any'
```

### 5. Avoid Direct Query Cache Mutations

```typescript
// ✅ Good
queryClient.setQueryData(['foods', speakerId], (old: Food[]) => [
  ...old,
  newFood,
])

// ❌ Bad
const foods = queryClient.getQueryData(['foods'])
foods.push(newFood)  // Mutation not detected!
```
