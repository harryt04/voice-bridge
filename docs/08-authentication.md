# 08. Authentication Layer

VoiceBridge uses Clerk for all user authentication. Clerk handles sign-up, sign-in, and session management, while the app enforces access control on specific resources via speaker ownership and villager relationships.

## Clerk Integration

### Provider Hierarchy

Clerk is the outermost provider in the app hierarchy (root layout). This ensures Clerk context is available to all child components:

```tsx
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'
import { PostHogProvider } from '@/providers/posthog-provider'
import { ThemeProvider } from '@/providers/theme-provider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        <ClerkProvider>
          <PostHogProvider>
            <ThemeProvider>
              {/* Other providers and children */}
              {children}
            </ThemeProvider>
          </PostHogProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
```

**Provider Order (Outermost to Innermost):**

1. `ClerkProvider` — Clerk authentication context
2. `PostHogProvider` — Analytics context
3. `ThemeProvider` — Dark/light mode context
4. `SidebarProvider` — Layout sidebar state
5. `VBQueryClient` — React Query provider

### User Representation

- **User Identity:** Clerk's unique `userId` (format: `user_...`)
- **User Email:** Stored in Clerk's managed system, not in VoiceBridge database
- **Marketing Analytics:** Email is extracted and sent to PostHog for retention tracking
- **Database Scoping:** All user-owned data (speakers, foods, etc.) is keyed by Clerk `userId`

**Clerk User Object:**

```ts
interface ClerkUser {
  userId: string          // e.g., "user_1234567890"
  email: string
  firstName?: string
  lastName?: string
  // ... other fields
}
```

### Clerk Configuration

Clerk credentials are stored in environment variables:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...  # Public key (safe in client code)
CLERK_SECRET_KEY=sk_test_...                    # Secret key (server-only)
```

These are injected by Clerk and required for:
- `ClerkProvider` initialization
- `getAuth()` on the server
- Clerk hosted UI for sign-in/sign-out

## Middleware

Clerk middleware is applied globally via `middleware.ts` to make Clerk context available to all routes and API endpoints.

### Configuration

```ts
// middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware()

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
```

**Matcher Logic:**

- Runs for all routes except static files (`_next`, `.css`, `.js`, images, etc.)
- **Always runs** for `/api/*` routes (second matcher rule)
- Skips Next.js internals and built-in optimizations

**Middleware Behavior:**

- `clerkMiddleware()` does **NOT** enforce authentication
- It only makes Clerk context available for downstream checks
- Individual pages and API routes implement their own auth guards
- No automatic redirects or access denials at the middleware level

### Usage in Routes

Middleware enables the use of `getAuth(req)` in API routes and `<SignedIn>`/`<SignedOut>` components on pages.

## API Route Auth Pattern

All API routes follow a consistent authentication pattern using `getAuth()` from Clerk.

### getAuth() Function

```ts
import { getAuth } from '@clerk/nextjs/server'

// In any API route handler
export async function GET(req: NextRequest) {
  const user = getAuth(req)
  
  if (!user?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // User is authenticated; proceed with business logic
  // ...
}
```

**Characteristics:**

- **Synchronous operation** (not async) — uses headers, no network calls
- **Header-based:** Extracts auth state from request headers set by middleware
- **Returns user object:** `{ userId, email, orgId, ... }` or `null` if not signed in
- **Null-safe:** Always check `user?.userId` before proceeding

### Standard Pattern

All API routes implement this pattern:

```ts
// app/api/foods/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { mongoDBConfig } from '@/lib/mongo-client'
import { fetchDataFromCollection } from '@/lib/mongo-utils'

export async function GET(req: NextRequest) {
  const user = getAuth(req)

  // Check 1: User must be authenticated
  if (!user?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check 2: Delegate to utility (which also checks auth)
  return fetchDataFromCollection(req, mongoDBConfig.collections.foods)
}
```

**Double-Check Pattern:**

Some routes check auth twice:
1. In the route handler itself
2. In the delegated utility function (`fetchDataFromCollection`)

This is redundant but harmless — both checks verify `user?.userId`.

### Injecting userId into Data

All writes inject the authenticated user's `userId`:

```ts
const user = getAuth(req)
const body = await req.json()

const updatedItem = {
  ...body,
  lastUpdatedBy: user.userId,  // Clerk userId
  updatedAt: new Date(),
}

await collection.insertOne(updatedItem)
```

This creates an audit trail of who last modified each document.

## Page-Level Auth

Pages use Clerk's UI components to guard content and trigger sign-in flows.

### Clerk UI Components

#### <SignedIn>

Renders content **only if** the user is authenticated:

```tsx
// app/speakers/page.tsx
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs'

export default function SpeakersPage() {
  return (
    <>
      <SignedIn>
        <SpeakersContent />  {/* Only visible if signed in */}
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />  {/* Redirect if not signed in */}
      </SignedOut>
    </>
  )
}
```

#### <SignedOut>

Renders content **only if** the user is NOT authenticated:

```tsx
<SignedOut>
  <div>Please sign in to continue.</div>
</SignedOut>
```

#### <RedirectToSignIn>

Triggers Clerk's hosted sign-in UI and redirects to it:

```tsx
<SignedOut>
  <RedirectToSignIn />
</SignedOut>
```

After sign-in, the user is redirected back to the original page (via `redirectUrl`).

#### <UserButton>

Renders a profile menu with sign-out, profile, and other options:

```tsx
// app/layout.tsx
import { UserButton } from '@clerk/nextjs'

export function Header() {
  return (
    <header>
      <h1>VoiceBridge</h1>
      <UserButton afterSignOutUrl="/" />
    </header>
  )
}
```

## Speaker Access Model

Speakers are the core entity that organizes access control. Two types of users can access a speaker's data:

### Access Rules

A user has access to a speaker if:
1. **Owner:** `speaker.parentId === user.userId` (they created the speaker)
2. **Villager:** `speaker.villagerIds.includes(user.userId)` (they were invited)

### Data Structure

```ts
// Speaker document
{
  _id: ObjectId,
  name: string,
  parentId: string,              // Clerk userId of owner
  villagerIds: string[],         // Array of Clerk userIds with read access
  speakerId?: string,
  // ... other fields
}
```

### Auth Check Function

The `speakerAuthCheck()` utility verifies access:

```ts
// lib/mongo-utils.ts:160-182
export const speakerAuthCheck = async (
  req: NextRequest,
  speakerId: string,
): Promise<NextResponse | undefined> => {
  const user = getAuth(req)
  const client = await getMongoClient()
  const db = client.db(mongoDBConfig.dbName)
  const speakersCollection = db.collection(mongoDBConfig.collections.speakers)

  const speaker = await speakersCollection.findOne({
    _id: new ObjectId(speakerId),
  })

  // Authorization check: owner OR villager
  if (
    !speaker ||
    !user?.userId ||
    (speaker.parentId !== user.userId &&
      !speaker.villagerIds?.includes(user.userId))
  ) {
    return NextResponse.json(
      { error: 'Speaker not found or unauthorized' },
      { status: 404 },
    )
  }
}
```

### Known Bug: Non-Blocking Auth Check

**Issue:** The `speakerAuthCheck()` function returns a 404 response if the user is not authorized, but **callers do not handle the return value**:

```ts
// lib/mongo-utils.ts:37
speakerAuthCheck(req, id as string)  // Return value not awaited or returned
// Database operation continues regardless
```

**Impact:**

- Generic CRUD routes (e.g., `GET /api/foods?speakerId=...`) do not enforce speaker access at the database layer
- The frontend is responsible for sending the correct `speakerId`
- A malicious or buggy client could theoretically fetch another user's data by guessing a `speakerId`

**Mitigation:**

- Custom routes (e.g., `/api/speaker`) implement explicit auth checks
- Frontend always passes the correct `speakerId` (stored in React Query context)
- This is a **potential security gap** but is currently non-blocking due to frontend safety

## Speaker Activation & Villager Access Flow

The activation flow allows a parent to invite other users (villagers) to access a speaker's data.

### Step-by-Step Flow

#### 1. Parent Generates Activation Link

Parent visits `/speakers/<speakerId>` and generates an invite link:

```
https://voicebridge.app/activate/507f1f77bcf86cd799439011
```

The link contains the `speakerId` as a route parameter.

#### 2. Parent Shares Link

Parent shares the link via email, messaging, or any channel.

#### 3. Recipient Opens Link (Not Signed In)

Recipient clicks the link. If not signed in, Clerk redirects to sign-in while preserving the `redirectUrl`:

```
https://voicebridge.app/activate/507f1f77bcf86cd799439011
  ↓ (if not signed in)
https://clerk.voicebridge.app/sign-in?redirectUrl=/activate/507f1f77bcf86cd799439011
```

#### 4. Recipient Signs In

Recipient completes sign-in (new account or existing). Clerk redirects back to the preserved URL.

#### 5. Recipient Lands on Activation Page

```tsx
// app/activate/[id]/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs'

export default function ActivatePage({ params: { id } }: Props) {
  const router = useRouter()

  useEffect(() => {
    const activate = async () => {
      const response = await fetch('/api/speaker/activate', {
        method: 'POST',
        body: JSON.stringify({ speakerId: id }),
      })

      if (response.ok) {
        // Redirect to places page
        window.location.assign('/places')
      }
    }

    activate()
  }, [id])

  return (
    <>
      <SignedIn>
        <p>Activating access...</p>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}
```

#### 6. Frontend Calls Activation API

The page's `useEffect` fires a POST request to `/api/speaker/activate`:

```ts
POST /api/speaker/activate
Content-Type: application/json

{ "speakerId": "507f1f77bcf86cd799439011" }
```

#### 7. Backend Adds User to Villager List

The API route updates the speaker document, adding the user's `userId` to `villagerIds`:

```ts
// app/api/speaker/activate/route.ts
export async function POST(req: NextRequest) {
  const user = getAuth(req)
  const { speakerId } = await req.json()

  // Auth check
  if (!user?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const client = await getMongoClient()
  const db = client.db(mongoDBConfig.dbName)
  const speakersCollection = db.collection(mongoDBConfig.collections.speakers)

  const existingSpeaker = await speakersCollection.findOne({
    _id: new ObjectId(speakerId),
  })

  if (!existingSpeaker) {
    return NextResponse.json(
      { error: 'Speaker not found' },
      { status: 404 },
    )
  }

  // Add user to villagerIds using $addToSet (prevents duplicates)
  const result = await speakersCollection.updateOne(
    { _id: new ObjectId(speakerId) },
    { $addToSet: { villagerIds: user.userId } },
  )

  return NextResponse.json(result, { status: 200 })
}
```

**Key Detail:** `$addToSet` ensures the userId is added only once, even if activation is called multiple times.

#### 8. Frontend Redirects to App

After successful activation, the page redirects to `/places`:

```ts
if (response.ok) {
  window.location.assign('/places')  // Hard redirect
}
```

**Result:** User now has read access to the speaker's data (foods, places, activities, vocab) via the villager relationship.

### Subsequent Logins

On future logins, the same Clerk userId automatically has access to the speaker:

```ts
// speakerAuthCheck logic
if (
  speaker.parentId === user.userId ||          // Owner
  speaker.villagerIds.includes(user.userId)    // Villager
) {
  // Access granted
}
```

No need to activate again; the villager relationship persists.

## Auth Gaps & Known Issues

### 1. speakerAuthCheck Non-Blocking

**Issue:** `speakerAuthCheck()` is called but its return value is not handled.

```ts
speakerAuthCheck(req, id as string)  // Return ignored
```

**Affected Routes:** Generic CRUD routes using `handleDatabaseOperation()` and `fetchDataFromCollection()`

**Impact:** No speaker access validation at database layer

**Fix:** Make `speakerAuthCheck()` throw or return a status code that's properly handled

### 2. GET /api/speaker Auth Check Logic

**Issue:** The auth check in `app/api/speaker/route.ts:34-38` uses OR instead of AND:

```ts
if (
  !speaker ||
  !speaker.villagerIds.includes(user.userId) ||  // OR
  speaker.parentId !== user.userId
) {
  // Reject
}
```

This logic is **broken**: a speaker with `villagerIds = []` and `parentId = "other_user"` would be rejected even for the owner.

**Correct Logic:**

```ts
if (
  !speaker ||
  (speaker.parentId !== user.userId &&
    !speaker.villagerIds.includes(user.userId))
) {
  // Reject (AND logic)
}
```

This is the correct pattern used in `speakerAuthCheck()`.

### 3. Frontend Passing speakerId

**Issue:** Generic routes like `GET /api/foods?speakerId=...` rely on the **frontend** to pass the correct `speakerId`.

```ts
// fetchDataFromCollection does not validate that speakerId matches user
const data = await collection.find({ speakerId: speakerId }).toArray()
```

**Impact:** If a user knows another user's `speakerId`, they could fetch that speaker's data.

**Mitigation:** The frontend stores `speakerId` in React Query context from logged-in user's session. A malicious client would need to guess valid ObjectIds.

**Proper Fix:** Derive `speakerId` from the authenticated speaker (stored on user's auth session), not from query parameters.

## Clerk Configuration

### Environment Variables

Required Clerk credentials in `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_abc123...
CLERK_SECRET_KEY=sk_test_xyz789...
```

**Notes:**

- `NEXT_PUBLIC_` prefix makes the publishable key available in browser code (safe)
- `CLERK_SECRET_KEY` must be kept secret (server-only)
- Both are provided by Clerk dashboard after creating an application

### Hosted Sign-In UI

VoiceBridge uses Clerk's hosted sign-in UI (not a custom login form):

```tsx
<RedirectToSignIn />
```

This redirects to Clerk's managed domain (e.g., `https://clerk.voicebridge.app/sign-in`) for authentication. Benefits:

- No custom auth form to maintain
- Automatic password reset, email verification
- Built-in security measures (rate limiting, etc.)
- SSO support (Google, GitHub, etc.) if enabled

### Session Management

Clerk automatically manages the session:
- **Sign-In:** Sets secure cookies after successful authentication
- **Session Duration:** Configurable in Clerk dashboard (default 24 hours)
- **Sign-Out:** `<UserButton>` component clears session
- **Middleware:** `clerkMiddleware()` validates session on every request

No custom session logic is needed; Clerk handles all session state server-side.

## Summary: Auth Flow for New User

1. Unauthenticated user visits `/places`
2. `<SignedOut>` component renders `<RedirectToSignIn />`
3. Clerk redirects to hosted sign-in UI
4. User completes sign-up with email + password (or OAuth)
5. Clerk redirects back to `/places` with active session
6. `<SignedIn>` component renders page content
7. API routes use `getAuth(req)` to confirm `user.userId`
8. User can create speakers or receive activation links to join existing speakers
9. `speakerAuthCheck()` (when properly enforced) verifies speaker access on each request
