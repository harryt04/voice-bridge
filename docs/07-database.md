# 07. Database Layer

VoiceBridge uses MongoDB directly (no ORM) via the native Node.js driver. Database operations are centralized in utility functions to maintain consistent patterns across all API routes.

## MongoDB Connection

### Singleton Pattern

The MongoDB client is managed as a singleton at the module level in `lib/mongo-client.ts:lib/mongo-client.ts:15`. This ensures a single client instance is reused across all requests, improving performance and connection pooling.

```ts
// lib/mongo-client.ts
import { MongoClient } from 'mongodb'

let client: MongoClient | null = null
let clientPromise: Promise<MongoClient> | null = null

export async function getMongoClient(): Promise<MongoClient> {
  if (!client) {
    client = new MongoClient(MONGO_CONNECTION_STRING)
    clientPromise = client.connect()
  }
  if (clientPromise) {
    await clientPromise
  }
  return client
}
```

### Connection String

The connection string is provided via the `MONGO_CONNECTION_STRING` environment variable. If not set, the module throws an error on load:

```ts
const MONGO_CONNECTION_STRING =
  process.env.MONGO_CONNECTION_STRING ?? defaultConnectionString

if (!MONGO_CONNECTION_STRING) {
  throw new Error('MONGO_CONNECTION_STRING environment variable is not set.')
}
```

**Usage in API routes:**

```ts
import { getMongoClient } from '@/lib/mongo-client'

const client = await getMongoClient()
const db = client.db(mongoDBConfig.dbName)
```

## Database Naming

The database name is dynamically constructed based on the Node environment:

```ts
// lib/mongo-client.ts
export const mongoDBConfig = {
  dbName: `voicebridge-${process.env.NODE_ENV}`,
  // ... collections
}
```

**Examples:**

- **Development:** `voicebridge-development`
- **Production:** `voicebridge-production`

This ensures data isolation between environments.

## Collections

VoiceBridge uses six main collections:

```ts
// lib/mongo-client.ts
export const mongoDBConfig = {
  dbName: `voicebridge-${process.env.NODE_ENV}`,
  collections: {
    activities: 'activities',
    foods: 'foods',
    places: 'places',
    speakers: 'speakers',
    villagers: 'villagers',
    vocabWords: 'vocabWords',
  },
}
```

**Collection purposes:**

- **speakers:** Core entity; represents a child/person with autism using the app
- **activities:** Activities associated with a speaker
- **foods:** Food items associated with a speaker
- **places:** Locations associated with a speaker
- **vocabWords:** Custom vocabulary words for a speaker
- **villagers:** Tracks villager relationships (explicit access grants)

## Central CRUD Functions

All database operations route through two utility functions in `lib/mongo-utils.ts` to maintain consistency:

### handleDatabaseOperation()

Handles GET, POST (create/update), and DELETE operations for any collection.

**Signature:**

```ts
export async function handleDatabaseOperation(
  req: NextRequest,
  collectionName: string,
  operation: 'GET' | 'POST' | 'DELETE',
): Promise<NextResponse>
```

**Operations:**

#### GET: Fetch Single Document

- Requires query parameter: `?id=<ObjectId>`
- Returns the document or 404 if not found
- Returns: `{ _id, name, speakerId, ... }`
- Uses better-auth `auth.api.getSession()` for authentication

```ts
// app/api/food/route.ts
export async function GET(req: NextRequest) {
  return handleDatabaseOperation(req, mongoDBConfig.collections.foods, 'GET')
}

// Request: GET /api/food?id=507f1f77bcf86cd799439011
// Response: { _id: ObjectId, name: 'Pizza', speakerId: ObjectId, ... }
```

#### POST: Create or Update Document

- If `?id=<ObjectId>` is provided: calls `updateOne($set)` with new fields
- If no `id`: calls `insertOne()` to create a new document
- Injects `lastUpdatedBy` (better-auth user ID) and `updatedAt` (current timestamp)
- Does NOT preserve `_id` on updates (deleted from payload before $set)

```ts
// app/api/food/route.ts
export async function POST(req: NextRequest) {
  return handleDatabaseOperation(req, mongoDBConfig.collections.foods, 'POST')
}

// Request body (create): { "name": "Pizza", "speakerId": ObjectId }
// Request body (update): { "name": "Spaghetti" } with ?id=507f1f77bcf86cd799439011
// Response: { success: true, modifiedCount: 1, updatedItem: { ... } }
```

#### DELETE: Remove Document

- Requires query parameter: `?id=<ObjectId>`
- Calls `deleteOne()` by `_id`
- Returns delete confirmation

```ts
// app/api/food/route.ts
export async function DELETE(req: NextRequest) {
  return handleDatabaseOperation(req, mongoDBConfig.collections.foods, 'DELETE')
}

// Request: DELETE /api/food?id=507f1f77bcf86cd799439011
// Response: { success: true, deletedCount: 1 }
```

**Authentication & Field Injection:**

```ts
const user = getAuth(req)  // lib/mongo-utils.ts:26
if (!user?.userId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// All writes inject:
const updatedItem = {
  ...body,
  lastUpdatedBy: user.userId,    // Clerk userId
  updatedAt: new Date(),
}
```

**Known Bug:**

The `speakerAuthCheck()` is called at line 37 of `lib/mongo-utils.ts:37` but the return value is **never awaited or returned**. This means auth rejection responses are silently ignored, and the database operation proceeds regardless. This is a **non-blocking issue** in terms of current functionality (frontend typically sends correct speakerId), but represents a potential security gap.

```ts
speakerAuthCheck(req, id as string)  // Line 37 — return value not used
// Database operation proceeds without checking auth result
```

### fetchDataFromCollection()

Fetches all documents in a collection scoped to a specific speaker.

**Signature:**

```ts
export async function fetchDataFromCollection(
  req: NextRequest,
  collectionName: string,
): Promise<NextResponse>
```

**Query Parameters:**

- `?speakerId=<ObjectId>` — required; filters documents to this speaker

**Example:**

```ts
// app/api/foods/route.ts
export async function GET(req: NextRequest) {
  return fetchDataFromCollection(req, mongoDBConfig.collections.foods)
}

// Request: GET /api/foods?speakerId=507f1f77bcf86cd799439011
// Response: [ { _id, name, speakerId, ... }, { _id, name, speakerId, ... } ]
```

**Database Query:**

```ts
const data = await collection.find({ speakerId: speakerId }).toArray()
```

**Authentication:**

```ts
const user = getAuth(req)
if (!user?.userId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

speakerAuthCheck(req, speakerId as string)  // Called but return not used (same bug)
```

### speakerAuthCheck()

Verifies that the authenticated user has access to a specific speaker.

**Signature:**

```ts
export const speakerAuthCheck = async (
  req: NextRequest,
  speakerId: string,
): Promise<NextResponse | undefined>
```

**Authorization Rule:**

A user has access to a speaker if:
- `speaker.parentId === user.userId` (they own the speaker), OR
- `speaker.villagerIds.includes(user.userId)` (they are a villager with read access)

**Logic:**

```ts
const speaker = await speakersCollection.findOne({
  _id: new ObjectId(speakerId),
})

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
```

**Known Bug:**

This function returns a NextResponse with a 404 error if the user is not authorized. However, **callers do not handle the return value**, so rejections are silently ignored:

```ts
// lib/mongo-utils.ts:37
speakerAuthCheck(req, id as string)  // Not awaited or returned
// Database operation continues regardless
```

**Impact:** Generic CRUD routes (e.g., `/api/foods`) do not enforce speaker access control at the database layer. The frontend is expected to send the correct speakerId, but a malicious or buggy client could theoretically fetch another user's data by guessing a speakerId.

## MongoDB Indexes

Indexes are created to optimize query performance. They are defined and applied via the `createMongoDbIndexes()` function in `lib/mongo-utils.ts:187`.

**Indexes by Collection:**

```ts
// activities: speakerId
// foods: speakerId
// places: speakerId
// speakers: isArchived, parentId, villagerIds
// villagers: villagerId, speakerId
// vocabWords: speakerId
```

**Creating Indexes:**

Indexes are applied automatically when collections are created. To manually run index creation:

```bash
npx gulp create-indexes
```

This executes the `create-indexes` task defined in `gulpfile.ts`, which:
1. Connects to MongoDB via `MONGO_CONNECTION_STRING`
2. Calls `createMongoDbIndexes(voicebridge-development)` or `voicebridge-production`
3. Creates or updates indexes on all collections

**Implementation:**

```ts
// lib/mongo-utils.ts:187-223
export async function createMongoDbIndexes(dbName: string) {
  const client = await getMongoClient()
  const db = client.db(dbName)

  async function ensureIndex(collectionName: string, indexes: any[]) {
    if (!collectionNames.includes(collectionName)) {
      await db.createCollection(collectionName)  // Create if missing
    }
    await db.collection(collectionName).createIndexes(indexes)
  }

  await ensureIndex(coll.activities, [{ key: { speakerId: 1 } }])
  await ensureIndex(coll.foods, [{ key: { speakerId: 1 } }])
  // ... etc
}
```

## ObjectId Handling

MongoDB uses `ObjectId` as the primary key type. VoiceBridge uses a string-based representation in TypeScript but converts to ObjectId for queries.

**TypeScript Layer:**

In type definitions (`models/index.ts`), `_id` is stored as a string:

```ts
export type Speaker = {
  _id: string
  name: string
  parentId: string
  villagerIds: string[]
  speakerId?: string
  createdAt?: Date
  updatedAt?: Date
  lastUpdatedBy?: string
}
```

**API Layer Conversion:**

When receiving an `id` from query parameters or the request body, convert to ObjectId for MongoDB queries:

```ts
// lib/mongo-utils.ts:46
const item = await collection.findOne({ _id: new ObjectId(id!) })
```

**Pattern in API Routes:**

```ts
// app/api/food/route.ts:31
const speaker = await speakersCollection.findOne({
  _id: new ObjectId(id),
})
```

## Document Structure Pattern

All resource documents follow a consistent structure with metadata injected by the API layer:

```ts
{
  _id: ObjectId,              // MongoDB primary key
  name: string,               // User-provided
  speakerId: ObjectId,        // Required; scopes data to speaker
  userId: string,             // Clerk userId of creator
  lastUpdatedBy: string,      // Clerk userId of last editor
  updatedAt: Date,            // Timestamp of last update
  // ... other fields specific to resource type
}
```

**Creation Pattern:**

When an API route creates a new document via POST:

```ts
const body = await req.json()
const updatedItem = {
  ...body,                   // User-provided fields
  lastUpdatedBy: user.userId,
  updatedAt: new Date(),
}

await collection.insertOne(updatedItem)  // _id auto-generated by MongoDB
```

**Update Pattern:**

When updating an existing document:

```ts
const updatedItem = {
  ...body,
  lastUpdatedBy: user.userId,
  updatedAt: new Date(),
}

delete updatedItem._id  // Remove _id from payload

const result = await collection.updateOne(
  { _id: new ObjectId(id) },
  { $set: updatedItem },
)
```

## Database Operations in API Routes

API routes follow a consistent pattern for database operations:

### Generic CRUD Route Pattern

Generic routes use the centralized utility functions:

```ts
// app/api/foods/route.ts
import { NextRequest } from 'next/server'
import { mongoDBConfig } from '@/lib/mongo-client'
import { fetchDataFromCollection } from '@/lib/mongo-utils'

export async function GET(req: NextRequest) {
  return fetchDataFromCollection(req, mongoDBConfig.collections.foods)
}
```

### Custom Route Pattern

Custom routes (e.g., `/api/speaker`) implement their own logic:

```ts
// app/api/speaker/route.ts
import { getAuth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient, mongoDBConfig } from '@/lib/mongo-client'
import { ObjectId } from 'mongodb'

export async function GET(req: NextRequest) {
  const user = getAuth(req)
  const id = extractIdFromQuery(req)

  if (!id) {
    return NextResponse.json({ error: 'Missing ID' }, { status: 400 })
  }

  try {
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await getMongoClient()
    const db = client.db(mongoDBConfig.dbName)
    const speakersCollection = db.collection(mongoDBConfig.collections.speakers)

    const speaker = await speakersCollection.findOne({
      _id: new ObjectId(id),
    })

    // Explicit auth check (unlike generic routes)
    if (
      !speaker ||
      (speaker.parentId !== user.userId &&
        !speaker.villagerIds.includes(user.userId))
    ) {
      return NextResponse.json(
        { error: 'Speaker not found or unauthorized' },
        { status: 404 },
      )
    }

    return NextResponse.json(speaker, { status: 200 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
```

### Standard Response Format

All database operations return `NextResponse.json()` with appropriate HTTP status codes:

**Success Responses:**

- **GET (single):** `200` with document object
- **GET (list):** `200` with array of documents
- **POST (create):** `200` with `{ success: true, updatedItem }`
- **POST (update):** `200` with `{ success: true, modifiedCount, updatedItem }`
- **DELETE:** `200` with `{ success: true, deletedCount }`

**Error Responses:**

- **400:** Missing required parameters (e.g., `id`, `speakerId`)
- **401:** User not authenticated
- **404:** Resource not found or user not authorized to access
- **500:** Internal server error

```ts
// Error response pattern
return NextResponse.json(
  { error: 'Item not found' },
  { status: 404 },
)
```

---

## AAC (Augmentative and Alternative Communication) Collections

Two new collections support AAC functionality:

### aacPhrases Collection

Stores custom quick phrases created by caregivers for a speaker.

**Schema:**

```ts
{
  _id: ObjectId,
  speakerId: ObjectId (string in TypeScript),  // Foreign key to speakers._id
  text: string,                                 // Phrase text (1-200 chars)
  icon?: string,                                // Lucide icon name or emoji
  backgroundColor?: string,                     // Hex color (#ffd700)
  category?: string,                            // Display grouping (Social, Needs, etc.)
  sortOrder?: number,                           // Sort priority
  createdAt: Date,                              // Server-set on insert
  updatedAt: Date,                              // Server-set on insert/update
  lastUpdatedBy: string,                        // better-auth user.id
}
```

**Index (Required):**

```bash
db.collection('aacPhrases').createIndex({ speakerId: 1 })
```

**Rationale:** Queries filter by `speakerId` to fetch phrases for a specific speaker. Index accelerates this lookup.

**Authorization:**
- GET (read): Parent or Villager of speaker
- POST/PUT/DELETE (write): Parent (caregiver) only
- Use `aacMutationAuthCheck()` for all writes

**Example Query:**

```ts
const phrases = await collection
  .find({ speakerId: new ObjectId(speakerId) })
  .sort({ sortOrder: 1, createdAt: 1 })
  .toArray()
```

---

### aacUserPreferences Collection

Stores per-speaker AAC settings (voice, speech rate, grid layout, etc.).

**Schema:**

```ts
{
  _id: ObjectId,
  speakerId: ObjectId (string in TypeScript),  // Foreign key to speakers._id
  voiceName?: string,                           // TTS voice name
  speechRate: number,                           // 0.5-2.0 (default 1)
  speechPitch: number,                          // 0.5-2.0 (default 1)
  speakOnSymbolTap: boolean,                    // Auto-speak on symbol tap
  phraseTapBehavior: 'speak' | 'append',       // How phrases are used
  symbolSource: 'mulberry' | 'arasaac' | 'custom' | 'opensymbols', // Symbol provider
  symbolLabelPosition: 'below' | 'above' | 'hidden', // Label placement
  mobileGridColumns: 2 | 3 | 4,                 // Grid column count
  updatedAt: Date,                              // Server-set on upsert
}
```

**Index (Required):**

```bash
db.collection('aacUserPreferences').createIndex(
  { speakerId: 1 },
  { unique: true }
)
```

**Rationale:** 
- Index on `speakerId` for fast lookups
- `unique: true` enforces one preferences document per speaker
- Upsert pattern: `findOneAndUpdate({ speakerId }, ..., { upsert: true })`

**Authorization:**
- GET (read): Parent or Villager of speaker
- POST (write/upsert): Parent (caregiver) only
- Use `aacMutationAuthCheck()` for all writes

**Example Query (Upsert):**

```ts
const prefs = await collection.findOneAndUpdate(
  { speakerId: new ObjectId(speakerId) },
  { $set: { ...newPrefs, updatedAt: new Date() } },
  { upsert: true, returnDocument: 'after' }
)
```

**Default Fallback:**

When GET finds no document, return this default (not 404):

```ts
const DEFAULT_PREFERENCES = {
  speakerId,
  voiceName: null,
  speechRate: 1,
  speechPitch: 1,
  speakOnSymbolTap: true,
  phraseTapBehavior: 'speak',
  symbolSource: 'mulberry',
  symbolLabelPosition: 'below',
  mobileGridColumns: 3,
}
```

---

### Index Creation Task

Use `gulpfile.ts` to create all indexes at setup:

```bash
npx gulp create-indexes
```

This task creates indexes for all collections, including:
- `speakers`: (no primary index needed; _id is implicit)
- `activities`, `foods`, `places`, `villagers`, `vocabWords`: `{ speakerId: 1 }`
- `aacPhrases`: `{ speakerId: 1 }`
- `aacUserPreferences`: `{ speakerId: 1, unique: true }`

Run on first deployment to all environments.

---

## No Transactions

VoiceBridge does not use MongoDB transactions. All operations are single-document:

- No multi-document atomic writes
- No session-based transactions
- Each API call is an isolated database operation

If multi-document consistency is needed in the future, consider:
1. Denormalizing data to single documents
2. Using idempotent operations with unique identifiers
3. Implementing application-level coordination logic
