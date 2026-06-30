# Conventions and Patterns

Comprehensive guide to VoiceBridge coding conventions, naming standards, and common architectural patterns.

---

## 1. File Naming Conventions

Consistent naming conventions enable quick pattern recognition and maintainability across the codebase.

### Files and Components

| Element              | Convention           | Location            | Examples                                    |
| -------------------- | -------------------- | ------------------- | ------------------------------------------- |
| File names           | `kebab-case`         | All folders         | `generic-items-page.tsx`, `use-speakers.tsx`, `mongo-client.ts` |
| Component files      | `kebab-case`         | `components/`       | `app-sidebar.tsx`, `speaker-selector.tsx`   |
| Component functions  | `PascalCase`         | In component files  | `AppSidebar`, `SpeakerSelector`, `PlaceComponent` |
| Hook files           | `use-*` prefix       | `hooks/`            | `use-mobile.tsx`, `use-speakers.tsx`, `use-query-client.tsx` |
| Hook functions       | `useXxx` camelCase   | In hook files       | `useSpeakerContext()`, `useIsMobile()`, `useQueryClient()` |
| Type definitions     | `PascalCase`         | `models/`           | `Speaker`, `Food`, `SpeakerInput`, `Activity` |
| Input types          | `*Input` suffix      | `models/`           | `SpeakerInput`, `FoodInput`, `PlaceInput`   |
| Constants            | `SCREAMING_SNAKE`    | Anywhere            | `MOBILE_BREAKPOINT`, `MONGO_CONNECTION_STRING` |
| Utility functions    | `camelCase`          | `lib/`, `utils/`    | `cn()`, `compressImage()`, `fetchDataFromCollection()` |

### API Routes

API routes follow REST naming conventions:

- **Singular routes** (CRUD operations): `/api/{singularName}`
  - `GET` — retrieve single item by query param
  - `POST` — create new item
  - `DELETE` — delete item by id

- **Plural routes** (List operations): `/api/{pluralNames}`
  - `GET` — list all items with optional filters

**Examples:**

```
/api/food       (GET: retrieve one, POST: create, DELETE: remove)
/api/foods      (GET: list all foods)
/api/speaker    (GET: retrieve one, POST: create, DELETE: remove)
/api/speakers   (GET: list all speakers)
/api/activity   (GET: retrieve one, POST: create, DELETE: remove)
/api/activities (GET: list all activities)
```

---

## 2. Import Ordering

Consistent import ordering improves readability and reduces merge conflicts.

### Import Groups

Organize imports in the following order:

1. **Third-party packages** (React, Next.js, external libraries)
2. **@/ internal imports** (project-scoped via path alias)
3. **Relative imports** (./, ../)

Separate each group with a blank line.

### Examples

#### Client Component with mixed imports:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { Food, FoodInput } from '@/models'
import { cn } from '@/lib/utils'
import { SpeakerSelector } from '@/components/custom/speaker-selector'
import { useSpeakerContext } from '@/hooks/use-speakers'

import { ImageUpload } from './image-upload'
import { useFormState } from './form-context'
```

#### Server Component with API call:

```typescript
import { currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { Food } from '@/models'
import { handleDatabaseOperation } from '@/lib/mongo-utils'
import { speakerAuthCheck } from '@/lib/auth-check'
```

### Preferences

- **Named imports over default imports**: `import { Button }` not `import Button`
- **Group related imports**: Put all UI components together, all hooks together
- **Avoid wildcard imports**: `import * as utils` — be explicit
- **Use `@/models` barrel export**: Never import individual type files
  - ✅ `import { Food, FoodInput } from '@/models'`
  - ❌ `import { Food } from '@/models/food'`

---

## 3. Type System Patterns

VoiceBridge maintains a strict type organization pattern using a barrel export pattern.

### Type File Organization

All types live in `models/` directory and are re-exported from `models/index.ts`.

### Type Definition Pattern

Each resource type follows a consistent pattern:

**Step 1: Input type** (for creation, without id/userId fields)

```typescript
type FoodInput = {
  name: string
  speakerId: string
  imageUrl?: string
  description?: string
  dictationUrl?: string
}
```

**Step 2: Main type** (extends Input, adds id and userId fields)

```typescript
type Food = FoodInput & {
  _id: string        // MongoDB ObjectId as string
  userId: string     // Clerk userId of creator
  lastUpdatedBy?: string
  updatedAt?: Date | string
}
```

**Step 3: Export from models/index.ts**

```typescript
export type { FoodInput, Food }
export type { Speaker, SpeakerInput }
export type { Place, PlaceInput }
// ... etc
```

### Importing Types

Always import from `@/models`, never relative:

```typescript
// ✅ Correct
import { Food, FoodInput, Speaker } from '@/models'

// ❌ Wrong
import { Food } from '@/models/food'
import { Speaker } from '../models/speaker'
```

### Type Syntax

- Use `type` keyword, not `interface`
  - ✅ `type Food = { ... }`
  - ❌ `interface Food { ... }`

- Use `&` for type intersection (extending Input type)
  - ✅ `type Food = FoodInput & { _id: string }`
  - ❌ `type Food extends FoodInput`

- Optional fields use `?:` syntax
  - ✅ `description?: string`
  - ❌ `description: string | undefined`

---

## 4. Component Patterns

### Server vs Client Components

**Server Components** (default, no directive):

```typescript
// app/foods/page.tsx
import { Food } from '@/models'
import { GenericItemsPage } from '@/components/custom/generic-items-page'

export default async function FoodsPage() {
  return (
    <GenericItemsPage
      collectionName="foods"
      // ... config
    />
  )
}
```

**Client Components** (must have `'use client'` at top):

```typescript
'use client'

import { useEffect, useState } from 'react'
import { Food } from '@/models'

export function FoodEditor({ food }: { food: Food }) {
  const [name, setName] = useState(food.name)
  // ... component logic
}
```

### Component Structure

Prefer named exports over default exports (though many pages use default):

```typescript
// ✅ Preferred (reusable components)
export function SpeakerSelector() { ... }
export function SpeakerCard({ speaker }: Props) { ... }

// ✅ Acceptable (page-level components)
export default function FoodsPage() { ... }

// ❌ Avoid (harder to import)
export default function SpeakerSelector() { ... }
```

### Props Definition

Define props as inline types or interfaces:

```typescript
// Option 1: Inline type annotation
export function FoodCard({ food, onDelete }: {
  food: Food
  onDelete: (id: string) => Promise<void>
}) {
  // ...
}

// Option 2: Separate Props type
type FoodCardProps = {
  food: Food
  onDelete: (id: string) => Promise<void>
}

export function FoodCard(props: FoodCardProps) {
  // ...
}
```

### UI Components

- **shadcn/ui components**: Live in `components/ui/` (auto-generated, do not edit)
  - `Button`, `Dialog`, `Input`, `Select`, `Checkbox`, etc.
  - Import: `import { Button } from '@/components/ui/button'`

- **Custom components**: Live in `components/custom/`
  - `SpeakerSelector`, `AppSidebar`, `ItemsList`, etc.
  - Import: `import { SpeakerSelector } from '@/components/custom/speaker-selector'`

---

## 5. API Route Patterns

All API routes follow a consistent structure.

### Standard Pattern

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { handleDatabaseOperation } from '@/lib/mongo-utils'

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For list routes: delegate to fetchDataFromCollection
    // For single routes: implement custom logic or use handleDatabaseOperation
    const result = await handleDatabaseOperation(
      'GET',
      'foods',
      { speakerId },
      { user: user.id },
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const result = await handleDatabaseOperation(
      'POST',
      'foods',
      body,
      { user: user.id },
    )

    return NextResponse.json({ success: true, item: result })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await request.json()

    const result = await handleDatabaseOperation(
      'DELETE',
      'foods',
      { _id: id },
      { user: user.id },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
```

### HTTP Status Codes

- **200** — Success (GET, POST, DELETE)
- **400** — Bad request (missing/invalid parameters)
- **401** — Unauthorized (no auth, auth check failed)
- **404** — Not found (resource doesn't exist)
- **500** — Internal server error (unexpected exception)

### Response Format

Responses should be JSON with consistent structure:

```typescript
// Successful GET list
{ items: [...] }

// Successful GET single
{ item: {...} }

// Successful POST/PUT
{ success: true, item: {...} }

// Successful DELETE
{ success: true }

// Error
{ error: "Error message", status: 400 }
```

---

## 6. Adding a New Resource Type

Step-by-step guide to add a complete new resource type to VoiceBridge.

### Step 1: Create Types

Create `models/{resourceName}.ts`:

```typescript
// models/animal.ts
export type AnimalInput = {
  name: string
  speakerId: string
  species?: string
  imageUrl?: string
  description?: string
}

export type Animal = AnimalInput & {
  _id: string
  userId: string
  lastUpdatedBy?: string
  updatedAt?: Date | string
}
```

Add to `models/index.ts`:

```typescript
export type { AnimalInput, Animal } from './animal'
```

### Step 2: Create API List Route

Create `app/api/animals/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { fetchDataFromCollection } from '@/lib/mongo-utils'

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const speakerId = searchParams.get('speakerId')

    if (!speakerId) {
      return NextResponse.json(
        { error: 'speakerId required' },
        { status: 400 },
      )
    }

    const items = await fetchDataFromCollection(
      'animals',
      { speakerId },
      user.id,
    )

    return NextResponse.json({ items })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
```

### Step 3: Create API CRUD Route

Create `app/api/animal/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { handleDatabaseOperation } from '@/lib/mongo-utils'

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    const item = await handleDatabaseOperation(
      'GET',
      'animals',
      { _id: id },
      { user: user.id },
    )

    return NextResponse.json({ item })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const item = await handleDatabaseOperation(
      'POST',
      'animals',
      body,
      { user: user.id },
    )

    return NextResponse.json({ success: true, item })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await request.json()

    await handleDatabaseOperation(
      'DELETE',
      'animals',
      { _id: id },
      { user: user.id },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
```

### Step 4: Add Collection to MongoDB Config

In `lib/mongo-client.ts`, add to `mongoDBConfig.collections`:

```typescript
const mongoDBConfig = {
  collections: {
    speakers: { name: 'speakers', collectionName: 'speakers' },
    foods: { name: 'foods', collectionName: 'foods' },
    places: { name: 'places', collectionName: 'places' },
    animals: { name: 'animals', collectionName: 'animals' }, // ADD THIS
    // ... etc
  },
}
```

### Step 5: Create Page

Create `app/animals/page.tsx`:

```typescript
import { GenericItemsPage } from '@/components/custom/generic-items-page'
import { Animal } from '@/models'

const animalPageInfo = {
  resourceName: 'animal',
  collectionName: 'animals',
  icon: 'paw-print', // lucide icon name
}

export default function AnimalsPage() {
  return <GenericItemsPage<Animal> pageInfo={animalPageInfo} />
}
```

### Step 6: Add Navigation

In `components/custom/app-sidebar.tsx`, add to the items array:

```typescript
{
  title: 'Animals',
  url: '/animals',
  icon: PawPrint,
}
```

### Step 7: Create MongoDB Index

In `lib/mongo-utils.ts`, add to `createMongoDbIndexes()`:

```typescript
export async function createMongoDbIndexes() {
  const client = getMongoClient()
  const db = client.db(DATABASE_NAME)

  await db.collection('animals').createIndex({ speakerId: 1 })
  await db.collection('animals').createIndex({ userId: 1 })
  // ... other indexes
}
```

### Step 8: Deploy & Initialize

```bash
npm run build           # Verify build succeeds
npm run start          # Start production server
npx gulp create-indexes # Create MongoDB indexes
```

---

## 7. Known Gotchas and Debug Artifacts

VoiceBridge contains some known issues and left-over debug code. Be aware of these when working:

### Debug Artifacts (Left in Code)

- **`components/custom/speaker-selector.tsx`** (delete handler)
  - Contains `console.trace()` left over from debugging
  - Should be removed before production deployment

- **`components/custom/items-list.tsx`** (initialization)
  - Contains `console.log('initialItems: ')` left over from debugging
  - Should be removed before production deployment

### Unused/Abandoned Code

- **`PostHogServerClient`** in `lib/posthog-server.ts`
  - Exported but never called anywhere in the application
  - Consider removing if not needed

- **`ItemsList` component** in `components/custom/items-list.tsx`
  - Has no consumers in the application
  - Appears to be abandoned; consider removing

### Hardcoded Production URLs

Production URL is hardcoded in multiple locations. Update all if domain changes:

- **`app/sitemap.ts`** — routes array
- **`components/custom/speaker-selector.tsx`** — share link generation
- Hardcoded value: `https://vb.harryt.dev`

### Fire-and-Forget Mutations

Throughout the codebase, mutations are executed without proper error handling:

```typescript
// ❌ Common pattern (fire-and-forget)
const { mutate: deleteFood } = useMutation({
  mutationFn: async (id: string) => {
    const res = await fetch('/api/food', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    })
    return res.json()
  },
  // No onError handler
})

deleteFood(foodId)
```

**Better approach:**

```typescript
// ✅ With error handling
const { mutate: deleteFood } = useMutation({
  mutationFn: async (id: string) => {
    const res = await fetch('/api/food', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    })
    if (!res.ok) throw new Error('Failed to delete')
    return res.json()
  },
  onError: (error) => {
    console.error('Delete failed:', error)
    toast.error('Failed to delete item')
  },
})
```

### TanStack Query Cache Mutation

The `SpeakerProvider` mutates the React Query cache directly:

```typescript
// In hooks/use-speakers.tsx
setSelectedSpeaker: (speaker: Speaker) => {
  queryClient.setQueryData(['speakers'], (old: Speaker[]) => [
    ...old,
    speaker,
  ])
  // ...
}
```

This can cause cache inconsistencies. Consider using proper mutation handlers instead.

---

## 8. Next.js Best Practices Used

VoiceBridge leverages modern Next.js features:

### App Router (Not Pages Router)

- All pages in `app/` directory
- Dynamic routes: `app/[id]/page.tsx`
- API routes: `app/api/route.ts` as route handlers

### Server Components by Default

```typescript
// app/foods/page.tsx
// No 'use client' — this is a Server Component

import { Food } from '@/models'

export default function FoodsPage() {
  return <div>Foods Page</div>
}
```

### Client Components for Interactivity

```typescript
// components/custom/food-editor.tsx
'use client'

import { useState } from 'react'

export function FoodEditor() {
  const [name, setName] = useState('')
  return <input value={name} onChange={(e) => setName(e.target.value)} />
}
```

### API Routes as Route Handlers

```typescript
// app/api/foods/route.ts
export async function GET(request: NextRequest) {
  // Handle GET /api/foods
}

export async function POST(request: NextRequest) {
  // Handle POST /api/foods
}
```

### Dynamic Routes

```typescript
// app/[speakerId]/page.tsx
export default function SpeakerPage({ params }: { params: { speakerId: string } }) {
  return <div>Speaker {params.speakerId}</div>
}
```

### Image Optimization

`next.config.ts` configured with `remotePatterns` for external image URLs.

### Dark Mode via next-themes

Integrated `ThemeProvider` for dark/light mode switching. See `providers/theme-provider.tsx`.

---

## 9. TypeScript Best Practices

### Strict Mode Enabled

```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true
  }
}
```

### noImplicitAny is False

Implicit `any` is allowed intentionally. Use explicit `any` when necessary:

```typescript
// ✅ Allowed (intentional)
function handleData(data: any) {
  return data.foo
}
```

### @typescript-eslint/no-explicit-any is Off

Explicit `any` is used freely throughout the codebase for complex integrations.

### Path Aliases

`@/*` maps to project root. Use in all imports:

```typescript
import { Button } from '@/components/ui/button'
import { Food } from '@/models'
import { cn } from '@/lib/utils'
```

### No Unused Imports Enforcement

The `@typescript-eslint/no-unused-vars` rule is off intentionally. Unused imports are permitted.

---

## 10. Common Tasks and Recipes

Quick patterns for common development tasks.

### Add a New Page

1. Create `app/{pageName}/page.tsx`
2. Export default component:

```typescript
export default function PageName() {
  return <div>Page content</div>
}
```

### Add a Modal Dialog

Use shadcn/ui Dialog with react-hook-form:

```typescript
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function AddItemDialog() {
  const [open, setOpen] = useState(false)
  const { register, handleSubmit } = useForm()

  return (
    <>
      <Button onClick={() => setOpen(true)}>Add Item</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit((data) => {
            // Handle submission
            setOpen(false)
          })}>
            <Input {...register('name')} placeholder="Item name" />
            <Button type="submit">Add</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
```

### Add a Form

Use react-hook-form with zod validation:

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const schema = z.object({
  name: z.string().min(1, 'Name required'),
  description: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function ItemForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  return (
    <form onSubmit={handleSubmit((data) => {
      // Handle form submission
    })}>
      <Input {...register('name')} placeholder="Name" />
      {errors.name && <span>{errors.name.message}</span>}
      <Input {...register('description')} placeholder="Description" />
      <Button type="submit">Submit</Button>
    </form>
  )
}
```

### Fetch Data in useEffect

```typescript
'use client'

import { useEffect, useState } from 'react'
import { Food } from '@/models'
import { useSpeakerContext } from '@/hooks/use-speakers'

export function FoodsList() {
  const [foods, setFoods] = useState<Food[]>([])
  const [loading, setLoading] = useState(true)
  const { selectedSpeaker } = useSpeakerContext()

  useEffect(() => {
    if (!selectedSpeaker) return

    const fetchFoods = async () => {
      try {
        const res = await fetch(`/api/foods?speakerId=${selectedSpeaker._id}`)
        const data = await res.json()
        setFoods(data.items)
      } catch (error) {
        console.error('Failed to fetch foods:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFoods()
  }, [selectedSpeaker?._id])

  if (loading) return <div>Loading...</div>
  return <div>{foods.map((f) => <div key={f._id}>{f.name}</div>)}</div>
}
```

### Display Toast Notification

```typescript
'use client'

import { toast } from 'sonner'

export function ItemForm() {
  const handleSubmit = async () => {
    try {
      // Do something
      toast.success('Item created successfully')
    } catch (error) {
      console.error(error)
      toast.error('Failed to create item')
    }
  }

  return <button onClick={handleSubmit}>Create</button>
}
```

### Get Current User (Client Component)

```typescript
'use client'

import { useUser } from '@clerk/nextjs'

export function UserProfile() {
  const { user } = useUser()

  if (!user) return <div>Not authenticated</div>
  return <div>Logged in as: {user.emailAddresses[0].emailAddress}</div>
}
```

### Get Current User (Server Component)

```typescript
import { currentUser } from '@clerk/nextjs/server'

export default async function ProtectedPage() {
  const user = await currentUser()

  if (!user) {
    return <div>Not authenticated</div>
  }

  return <div>Logged in as: {user.id}</div>
}
```

---

## Summary

VoiceBridge follows opinionated conventions to maintain consistency and facilitate rapid development:

- **Naming**: kebab-case files, PascalCase components, camelCase functions
- **Types**: Centralized in `models/`, re-exported via barrel export
- **Imports**: Third-party → @/ internal → relative, with blank line separation
- **Components**: Server by default, Client when needed, use shadcn/ui
- **APIs**: Consistent request/response format, auth check first, try/catch all
- **Resources**: Follow the 8-step guide to add new types
- **Patterns**: Use hooks for state, mutations with error handling, React Query for caching

Following these patterns ensures code consistency, maintainability, and faster onboarding for new developers.
