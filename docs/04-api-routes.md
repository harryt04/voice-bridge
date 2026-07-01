# API Routes

All API routes require better-auth authentication and use `auth.api.getSession()` with request headers.

## Naming Convention

- **Singular routes** (`/api/food`, `/api/place`, `/api/speaker`, etc.): Handle CRUD operations (GET, POST, DELETE)
- **Plural routes** (`/api/foods`, `/api/places`, `/api/speakers`, etc.): Handle list retrieval (GET only)

## Auth Pattern

All routes require better-auth authentication.

```ts
import { auth } from '@/lib/auth'

const session = await auth.api.getSession({ headers: req.headers })
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

**Known Issue:** `speakerAuthCheck()` is called but its 404 response is not propagated in generic routes (`handleDatabaseOperation`). Auth check is non-blocking.

## Query Params Conventions

- Singular routes: `?id=<ObjectId>` for GET/DELETE, POST without id creates new item
- Plural routes: `?speakerId=<ObjectId>` for filtering collections by speaker

---

## Endpoints

### GET /api/speakers

**List all speakers for authenticated user**

**Auth:** Required (Clerk userId)

**Response:** `Speaker[]`

**Status Codes:**
- `200` — Success
- `401` — Unauthorized
- `500` — Internal server error

**Behavior:**
- Returns speakers where user is `parentId` OR in `villagerIds`
- Filters out speakers with `isArchived === true`
- **Auto-creates default speaker** if none exist: `{ name: 'Default', parentId: user.userId }`
- **Side effect:** Registers user with external analytics service (POST to `https://harryt.dev/api/user`) with email and `usesApps: ['voicebridge']`

**Example Response:**

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Default",
    "parentId": "user_123abc",
    "villagerIds": ["user_456def"],
    "lastUpdatedBy": "user_123abc",
    "updatedAt": "2026-06-29T10:30:00Z",
    "isArchived": false
  }
]
```

---

### GET /api/speaker?id=<id>

**Fetch a specific speaker**

**Auth:** Required

**Query Params:**
- `id` (required): Speaker ObjectId as string

**Response:** `Speaker`

**Status Codes:**
- `200` — Success
- `400` — Missing ID
- `401` — Unauthorized
- `404` — Speaker not found or unauthorized
- `500` — Internal server error

**Auth Check:**
- User must be `parentId` OR in `villagerIds`

**Known Bug:** Auth check uses `||` (should be `&&`). Line 36: `!speaker.villagerIds.includes(user.userId) || speaker.parentId !== user.userId` — currently returns 404 only if EITHER condition is true, allowing unauthorized access in some cases.

**Example Response:**

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Emma",
  "parentId": "user_123abc",
  "villagerIds": ["user_456def"],
  "lastUpdatedBy": "user_123abc",
  "updatedAt": "2026-06-29T10:30:00Z",
  "isArchived": false
}
```

---

### POST /api/speaker

**Create or update a speaker**

**Auth:** Required

**Query Params:**
- `id` (optional): Speaker ObjectId. If provided, updates existing speaker; if omitted, creates new.

**Request Body:**

```json
{
  "name": "Emma",
  "villagerIds": ["user_456def"]
}
```

**Response:**

```json
{
  "success": true,
  "updatedCount": 1,
  "updatedSpeaker": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Emma",
    "parentId": "user_123abc",
    "villagerIds": ["user_456def"],
    "lastUpdatedBy": "user_123abc",
    "updatedAt": "2026-06-29T10:30:00Z"
  }
}
```

**Status Codes:**
- `200` — Success
- `401` — Unauthorized
- `500` — Internal server error

**Behavior:**
- **Create (no id):** Inserts new speaker with `parentId = user.userId`, adds runtime fields
- **Update (with id):** Updates existing speaker, preserves `parentId`, updates runtime fields
- Adds `lastUpdatedBy` and `updatedAt` fields

**Known Bug:** On create, `insertOne` is **not awaited** (fire-and-forget). Response returns before insert completes.

---

### DELETE /api/speaker?id=<id>

**Soft or hard delete a speaker**

**Auth:** Required

**Query Params:**
- `id` (required): Speaker ObjectId

**Response:**

```json
{
  "success": true,
  "deletedCount": 1
}
```

**Status Codes:**
- `200` — Success
- `400` — Missing ID
- `401` — Unauthorized
- `404` — Speaker not found
- `500` — Internal server error

**Behavior:**
- Currently hard-deletes via `deleteOne()`
- No auth check on speaker ownership (checks only that speaker exists)

---

### POST /api/speaker/activate

**Add user to speaker's villagerIds (read-only collaborator)**

**Auth:** Required

**Request Body:**

```json
{
  "speakerId": "507f1f77bcf86cd799439011"
}
```

**Response:**

```json
{
  "acknowledged": true,
  "modifiedCount": 1,
  "upsertedId": null,
  "upsertedCount": 0,
  "matchedCount": 1
}
```

**Status Codes:**
- `200` — Success
- `401` — Unauthorized
- `404` — Speaker not found
- `500` — Internal server error

**Behavior:**
- Uses `$addToSet` to add `user.userId` to speaker's `villagerIds` array
- Prevents duplicates (idempotent)

---

### GET /api/foods?speakerId=<id>

**List all foods for a speaker**

**Auth:** Required

**Query Params:**
- `speakerId` (required): Speaker ObjectId

**Response:** `Food[]`

**Status Codes:**
- `200` — Success
- `401` — Unauthorized
- `500` — Internal server error

**Behavior:**
- Filters foods by `speakerId`
- Runs `speakerAuthCheck()` but response not propagated (non-blocking)

**Example Response:**

```json
[
  {
    "_id": "507f191e810c19729de860ea",
    "name": "Apple",
    "speakerId": "507f1f77bcf86cd799439011",
    "imageUrl": "https://example.com/apple.jpg",
    "description": "Red apple",
    "dictationUrl": "https://example.com/apple.mp3",
    "userId": "user_123abc",
    "lastUpdatedBy": "user_123abc",
    "updatedAt": "2026-06-29T10:30:00Z"
  }
]
```

---

### GET|POST|DELETE /api/food?id=<id>

**Get, create, or delete a food item**

**Auth:** Required

**Query Params:**
- `id` (required for GET/DELETE): Food ObjectId
- `id` (optional for POST): If provided, updates; if omitted, creates

**GET Response:** `Food`

**POST Request Body:**

```json
{
  "name": "Apple",
  "speakerId": "507f1f77bcf86cd799439011",
  "imageUrl": "https://example.com/apple.jpg",
  "description": "Red apple",
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**POST Response:**

```json
{
  "success": true,
  "updatedItem": {
    "_id": "507f191e810c19729de860ea",
    "name": "Apple",
    "speakerId": "507f1f77bcf86cd799439011",
    "imageUrl": "https://example.com/apple.jpg",
    "userId": "user_123abc",
    "lastUpdatedBy": "user_123abc",
    "updatedAt": "2026-06-29T10:30:00Z"
  }
}
```

**DELETE Response:**

```json
{
  "success": true,
  "deletedCount": 1
}
```

**Status Codes:**
- `200` — Success
- `400` — Missing ID (GET/DELETE)
- `401` — Unauthorized
- `404` — Item not found (GET only)
- `500` — Internal server error

**Known Bug (POST create):** `insertOne` is **not awaited** (fire-and-forget). Response returns before insert completes.

---

### GET /api/places?speakerId=<id>

**List all places for a speaker**

**Auth:** Required

**Query Params:**
- `speakerId` (required): Speaker ObjectId

**Response:** `Place[]`

**Behavior:** Identical to `/api/foods?speakerId=<id>`, filters by `speakerId`

---

### GET|POST|DELETE /api/place?id=<id>

**Get, create, or delete a place**

**Auth:** Required

**Query Params:** Same as `/api/food`

**GET Response:** `Place`

**POST Request Body:**

```json
{
  "name": "Park",
  "speakerId": "507f1f77bcf86cd799439011",
  "address": "123 Main St",
  "description": "Local park",
  "imageUrl": "https://example.com/park.jpg",
  "imageBase64": "data:image/jpeg;base64,..."
}
```

**POST Response:**

```json
{
  "success": true,
  "updatedCount": 1,
  "updatedPlace": {
    "_id": "507f191e810c19729de860ea",
    "name": "Park",
    "speakerId": "507f1f77bcf86cd799439011",
    "address": "123 Main St",
    "userId": "user_123abc",
    "lastUpdatedBy": "user_123abc",
    "updatedAt": "2026-06-29T10:30:00Z"
  }
}
```

**Known Bug (POST create):** `insertOne` is **not awaited** (fire-and-forget).

**Response Field Naming Quirk:** Uses `updatedPlace` instead of `updatedItem` (inconsistent with generic handler).

---

### GET /api/activities?speakerId=<id>

**List all activities for a speaker**

**Auth:** Required

**Response:** `Activity[]` (generic structure with name, speakerId, etc.)

**Behavior:** Identical to foods/places

---

### GET|POST|DELETE /api/activity?id=<id>

**Get, create, or delete an activity**

**Auth:** Required

**Request Body Example:**

```json
{
  "name": "Reading",
  "speakerId": "507f1f77bcf86cd799439011",
  "description": "Reading activity"
}
```

**Response Example (POST):**

```json
{
  "success": true,
  "updatedItem": {
    "_id": "507f191e810c19729de860ea",
    "name": "Reading",
    "speakerId": "507f1f77bcf86cd799439011",
    "userId": "user_123abc",
    "lastUpdatedBy": "user_123abc",
    "updatedAt": "2026-06-29T10:30:00Z"
  }
}
```

---

### GET /api/villagers?speakerId=<id>

**List all villagers for a speaker**

**Auth:** Required

**Response:** `Villager[]`

**Behavior:** Identical to activities

---

### GET|POST|DELETE /api/villager?id=<id>

**Get, create, or delete a villager**

**Auth:** Required

**Request Body Example:**

```json
{
  "name": "Teacher",
  "speakerId": "507f1f77bcf86cd799439011",
  "description": "School teacher"
}
```

**Response:** Uses generic `updatedItem` field

---

### GET /api/vocabWords?speakerId=<id>

**List all vocabulary words for a speaker**

**Auth:** Required

**Response:** `VocabWord[]`

**Behavior:** Identical to other plurals

---

### GET|POST|DELETE /api/vocabWord?id=<id>

**Get, create, or delete a vocabulary word**

**Auth:** Required

**Request Body Example:**

```json
{
  "name": "Hello",
  "speakerId": "507f1f77bcf86cd799439011",
  "description": "Greeting word"
}
```

**Response:** Uses generic `updatedItem` field

---

## Response Field Naming Inconsistencies

| Endpoint | Operation | Success Response Field |
|----------|-----------|------------------------|
| `/api/speaker` | POST (create) | `updatedSpeaker` |
| `/api/speaker` | POST (update) | `updatedSpeaker` |
| `/api/place` | POST | `updatedPlace` |
| `/api/food` | POST | `updatedItem` (via generic handler) |
| `/api/activity` | POST | `updatedItem` |
| `/api/villager` | POST | `updatedItem` |
| `/api/vocabWord` | POST | `updatedItem` |

DELETE responses consistently use `deletedCount`. POST update responses sometimes use `updatedCount`, sometimes `modifiedCount`.

---

## Known Bugs & Quirks Summary

1. **POST create fire-and-forget:** `/api/speaker`, `/api/place` don't await `insertOne()`
2. **Auth check non-blocking:** `speakerAuthCheck()` response not propagated in generic routes
3. **Auth logic error in GET /api/speaker:** Line 36 uses `||` instead of `&&`, allowing unauthorized access
4. **Response field naming:** Inconsistent use of `updatedItem`, `updatedPlace`, `updatedSpeaker`, `updatedCount`, `modifiedCount`
5. **Default speaker auto-create:** GET `/api/speakers` creates default speaker in DB even for simple list requests
