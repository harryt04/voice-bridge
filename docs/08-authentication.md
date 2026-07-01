# 08. Authentication Layer

VoiceBridge uses better-auth for all user authentication. better-auth handles sign-up, sign-in, and session management, while the app enforces access control on specific resources via speaker ownership and villager relationships.

## better-auth Integration

### Provider Hierarchy

better-auth is wrapped in a `SessionProvider` at the app hierarchy (root layout). This ensures session context is available to all child components:

```tsx
// app/layout.tsx
import { SessionProvider } from '@/lib/auth-client'
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
        <SessionProvider>
          <PostHogProvider>
            <ThemeProvider>
              {/* Other providers and children */}
              {children}
            </ThemeProvider>
          </PostHogProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
```

**Provider Order (Outermost to Innermost):**

1. `SessionProvider` — better-auth session context
2. `PostHogProvider` — Analytics context
3. `ThemeProvider` — Dark/light mode context
4. `SidebarProvider` — Layout sidebar state
5. `VBQueryClient` — React Query provider

### User Representation

- **User Identity:** better-auth's unique `user.id` (format: app-specific)
- **User Email:** Stored in better-auth's managed system, accessible via `session.user.email`
- **Marketing Analytics:** Email is extracted and sent to PostHog for retention tracking
- **Database Scoping:** All user-owned data (speakers, foods, etc.) is keyed by better-auth `user.id`

**better-auth User Object:**

```ts
interface AuthUser {
  id: string                  // Unique user ID from better-auth
  email: string
  name?: string
  image?: string
  // ... other fields
}
```

### better-auth Configuration

better-auth credentials and URLs are stored in environment variables:

```env
BETTER_AUTH_SECRET=xyz789...              # Server-side secret (min 32 chars)
BETTER_AUTH_URL=http://localhost:3000     # Server-side auth base URL
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000  # Client-side auth URL
GOOGLE_CLIENT_ID=abc123...                # Google OAuth client ID
GOOGLE_CLIENT_SECRET=xyz789...            # Google OAuth client secret
NEXT_PUBLIC_APP_URL=https://vb.harryt.dev # Public app URL for callbacks
```

These are injected by environment configuration and required for:
- Server-side session extraction via `auth.api.getSession()`
- Client-side API calls via `authClient`
- Google OAuth sign-in
- Hardcoded URL references (sitemap, activation links)

## Middleware

better-auth middleware is applied globally via `middleware.ts` to provide session context to all routes.

### Configuration

```ts
// middleware.ts
import { NextResponse } from 'next/server'

export function middleware(req) {
  return NextResponse.next()
}

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

- Middleware is a pass-through (Option B fallback, since `nextJsMiddleware` is not available in better-auth@1.6.23)
- Session extraction happens in individual API routes via `auth.api.getSession()`
- No automatic redirects or access denials at the middleware level
- Pages implement their own auth guards

## API Route Auth Pattern

All API routes follow a consistent authentication pattern using `auth.api.getSession()`.

### getSession() Function

```ts
import { auth } from '@/lib/auth'

// In any API route handler
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // User is authenticated; use session.user.id and session.user.email
  // ...
}
```

**Characteristics:**

- **Asynchronous operation** (async/await) — uses headers for session extraction
- **Header-based:** Extracts session from request headers set by better-auth
- **Returns session object:** `{ user: { id, email, name, ... }, ... }` or `null` if not signed in
- **Null-safe:** Always check `!session` before proceeding

### Standard Pattern

All API routes implement this pattern:

```ts
// app/api/foods/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { mongoDBConfig } from '@/lib/mongo-client'
import { fetchDataFromCollection } from '@/lib/mongo-utils'

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })

  // Check 1: User must be authenticated
  if (!session) {
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

This is redundant but harmless — both checks verify session exists.

### Injecting userId into Data

All writes inject the authenticated user's ID:

```ts
const session = await auth.api.getSession({ headers: req.headers })
const body = await req.json()

const updatedItem = {
  ...body,
  lastUpdatedBy: session.user.id,  // better-auth user ID
  updatedAt: new Date(),
}

await collection.insertOne(updatedItem)
```

This creates an audit trail of who last modified each document.

## Page-Level Auth

Pages use server-side session checks or client-side hooks to guard content and trigger auth flows.

### Server-Side Session Check

For server components, check session at render time:

```tsx
// app/login/page.tsx (server component)
import { auth } from '@/lib/auth'

export default async function LoginPage() {
  const session = await auth.api.getSession({ headers: {} })
  
  if (session) {
    // User is already signed in, redirect to app
    redirect('/places')
  }

  return (
    <div>
      <LoginForm />
    </div>
  )
}
```

### Client-Side Session Hook

For client components, use the `useSession()` hook:

```tsx
// components/custom/user-menu.tsx
'use client'

import { useSession, signOut } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

export function UserMenu() {
  const session = useSession()
  const router = useRouter()

  if (!session) {
    return null
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <div>
      <p>Welcome, {session.user.email}</p>
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  )
}
```

## Auth Forms

VoiceBridge provides custom authentication forms:

### LoginForm

Located at `components/custom/login-form.tsx`, handles email/password and Google OAuth sign-in:

```tsx
'use client'

import { useForm } from 'react-hook-form'
import { signIn } from '@/lib/auth-client'
import { useRouter, useSearchParams } from 'next/navigation'

export function LoginForm() {
  const { register, handleSubmit } = useForm()
  const router = useRouter()
  const searchParams = useSearchParams()

  const onSubmit = async (data) => {
    const response = await signIn.email({
      email: data.email,
      password: data.password,
    })

    if (response) {
      const redirect = searchParams.get('redirect') || '/places'
      router.push(redirect)
    }
  }

  const handleGoogleSignIn = async () => {
    await signIn.social({ provider: 'google' })
  }

  return (
    // Form JSX
  )
}
```

### RegisterForm

Located at `components/custom/register-form.tsx`, handles email/password sign-up only:

```tsx
'use client'

import { useForm } from 'react-hook-form'
import { signUp } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

export function RegisterForm() {
  const { register, handleSubmit } = useForm()
  const router = useRouter()

  const onSubmit = async (data) => {
    const response = await signUp.email({
      email: data.email,
      password: data.password,
      name: data.name,
    })

    if (response) {
      router.push('/places')
    }
  }

  return (
    // Form JSX
  )
}
```

## Speaker Access Model

Speakers are the core entity that organizes access control. Two types of users can access a speaker's data:

### Access Rules

A user has access to a speaker if:
1. **Owner:** `speaker.parentId === session.user.id` (they created the speaker)
2. **Villager:** `speaker.villagerIds.includes(session.user.id)` (they were invited)

### Data Structure

```ts
// Speaker document
{
  _id: ObjectId,
  name: string,
  parentId: string,              // better-auth user ID of owner
  villagerIds: string[],         // Array of better-auth user IDs with read access
  speakerId?: string,
  // ... other fields
}
```

### Auth Check Function

The `speakerAuthCheck()` utility verifies access:

```ts
// lib/mongo-utils.ts
export const speakerAuthCheck = async (
  req: NextRequest,
  speakerId: string,
): Promise<NextResponse | undefined> => {
  const session = await auth.api.getSession({ headers: req.headers })
  const client = await getMongoClient()
  const db = client.db(mongoDBConfig.dbName)
  const speakersCollection = db.collection(mongoDBConfig.collections.speakers)

  const speaker = await speakersCollection.findOne({
    _id: new ObjectId(speakerId),
  })

  // Authorization check: owner OR villager
  if (
    !speaker ||
    !session ||
    (speaker.parentId !== session.user.id &&
      !speaker.villagerIds?.includes(session.user.id))
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
https://vb.harryt.dev/activate/507f1f77bcf86cd799439011
```

The link contains the `speakerId` as a route parameter. The base URL is pulled from `process.env.NEXT_PUBLIC_APP_URL`.

#### 2. Parent Shares Link

Parent shares the link via email, messaging, or any channel.

#### 3. Recipient Opens Link (Not Signed In)

Recipient clicks the link. If not signed in, they are redirected to the login page:

```
https://vb.harryt.dev/activate/507f1f77bcf86cd799439011
  ↓ (if not signed in)
https://vb.harryt.dev/login?redirect=/activate/507f1f77bcf86cd799439011
```

#### 4. Recipient Signs In

Recipient completes sign-in (new account or existing). After authentication, they are redirected back to the preserved activation URL.

#### 5. Recipient Lands on Activation Page

```tsx
// app/activate/[id]/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'

export default function ActivatePage({ params: { id } }: Props) {
  const router = useRouter()
  const session = useSession()

  useEffect(() => {
    if (!session) return

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
  }, [id, session])

  return session ? <p>Activating access...</p> : null
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

The API route updates the speaker document, adding the user's ID to `villagerIds`:

```ts
// app/api/speaker/activate/route.ts
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  const { speakerId } = await req.json()

  // Auth check
  if (!session) {
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
    { $addToSet: { villagerIds: session.user.id } },
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

On future logins, the same better-auth user ID automatically has access to the speaker:

```ts
// speakerAuthCheck logic
if (
  speaker.parentId === session.user.id ||          // Owner
  speaker.villagerIds.includes(session.user.id)    // Villager
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

**Issue:** The auth check in `app/api/speaker/route.ts` may use OR instead of AND:

```ts
if (
  !speaker ||
  !speaker.villagerIds.includes(session.user.id) ||  // OR
  speaker.parentId !== session.user.id
) {
  // Reject
}
```

This logic is **broken**: a speaker with `villagerIds = []` and `parentId = "other_user"` would be rejected even for the owner.

**Correct Logic:**

```ts
if (
  !speaker ||
  (speaker.parentId !== session.user.id &&
    !speaker.villagerIds.includes(session.user.id))
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

## better-auth Configuration

### Environment Variables

Required better-auth credentials in `.env.local`:

```env
BETTER_AUTH_SECRET=xyz789abcdef1234567890abcdef1234  # Min 32 characters
BETTER_AUTH_URL=http://localhost:3000                 # Server-side URL
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000     # Client-side URL
GOOGLE_CLIENT_ID=abc123...                            # From Google Cloud
GOOGLE_CLIENT_SECRET=xyz789...                        # From Google Cloud
NEXT_PUBLIC_APP_URL=https://vb.harryt.dev             # Public app URL
```

**Notes:**

- `BETTER_AUTH_SECRET` must be at least 32 characters (randomize it)
- `BETTER_AUTH_URL` and `NEXT_PUBLIC_BETTER_AUTH_URL` are usually the same
- `NEXT_PUBLIC_` prefix makes values available in browser code (safe for public URLs)
- `GOOGLE_CLIENT_SECRET` must be kept secret (server-only)
- Both Google credentials are provided by Google Cloud Console after creating an OAuth 2.0 application

### Custom Auth Pages

VoiceBridge uses custom login and register pages instead of a hosted provider UI:

- `/login` — Custom login form with email/password and Google OAuth
- `/register` — Custom register form with email/password only
- Forms are located in `components/custom/login-form.tsx` and `components/custom/register-form.tsx`

Benefits:
- Full control over UI/UX
- Consistent branding
- Custom validation
- Integrated error handling

### Session Management

better-auth automatically manages the session via HTTP-only cookies and headers. The session is:
- Created on successful sign-in
- Validated on each request via `auth.api.getSession()`
- Destroyed on sign-out
- Persisted across browser refreshes
