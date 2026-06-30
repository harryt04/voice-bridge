# Data Models

All type definitions live in `models/` and are centrally re-exported from `models/index.ts`.

## Import Pattern

Always import from `@/models` using named imports. Never use relative paths.

```ts
import { Speaker, SpeakerInput, Food, FoodInput, Place, PlaceInput } from '@/models'
import { HST_APP_User, HST_Apps, MarketingSource } from '@/models'
```

Reference: `models/index.ts` exports all types via barrel export.

---

## Speaker Type

Represents a user with communication needs and optional villager collaborators.

### SpeakerInput

```ts
type SpeakerInput = {
  name: string
}
```

### Speaker

```ts
type Speaker = SpeakerInput & {
  _id: string                    // MongoDB ObjectId as string
  parentId: string               // Clerk userId of owner
  villagerIds: string[]          // Array of Clerk userIds with read access
  lastUpdatedBy?: string         // Clerk userId of last updater (runtime field)
  updatedAt?: Date | string      // Last update timestamp (runtime field)
  isArchived?: boolean           // Soft-delete flag; archived speakers excluded from GET /api/speakers list
}
```

**Notes:**
- `parentId` is the primary owner (Clerk userId)
- `villagerIds` contains read-only collaborators (Clerk userIds)
- Runtime fields (`lastUpdatedBy`, `updatedAt`, `isArchived`) added by API layer
- GET `/api/speakers` filters out speakers where `isArchived === true`

---

## Food Type

Represents a food item associated with a speaker.

### FoodInput

```ts
type FoodInput = {
  name: string
  speakerId: string
  imageUrl?: string
  description?: string
  dictationUrl?: string
}
```

### Food

```ts
type Food = FoodInput & {
  _id: string                    // MongoDB ObjectId as string
  userId: string                 // Clerk userId of creator
  imageBase64?: string           // Base64-encoded JPEG stored directly in MongoDB
  lastUpdatedBy?: string         // Clerk userId of last updater (runtime field)
  updatedAt?: Date | string      // Last update timestamp (runtime field)
}
```

**Notes:**
- `imageBase64` is a JPEG image encoded as base64 string, stored directly in MongoDB
- Either `imageUrl` or `imageBase64` may be present
- Runtime fields added by API layer

---

## Place Type

Represents a location associated with a speaker.

### PlaceInput

```ts
type PlaceInput = {
  name: string
  speakerId: string
  description?: string
  dictationUrl?: string
  address?: string
  imageUrl?: string
  imageBase64?: string
}
```

### Place

```ts
type Place = PlaceInput & {
  _id: string                    // MongoDB ObjectId as string
  userId: string                 // Clerk userId of creator
  lastUpdatedBy?: string         // Clerk userId of last updater (runtime field)
  updatedAt?: Date | string      // Last update timestamp (runtime field)
}
```

**Notes:**
- Similar structure to Food
- Includes optional `address` field for geographic information
- Either `imageUrl` or `imageBase64` may be present

---

## HST_APP_User Type

Cross-app marketing/analytics type. Never stored in VoiceBridge MongoDB. Used only for external analytics registration via external API.

### HST_Apps

```ts
type HST_Apps = 'voicebridge' | 'tokei' | 'sky-survey'
```

### MarketingSource

```ts
type MarketingSource =
  | 'content'
  | 'direct'
  | 'email_campaign'
  | 'organic_search'
  | 'paid_ad'
  | 'referral'
  | 'social_media'
  | 'other'
```

### HST_APP_User

```ts
type HST_APP_User = {
  _id: string                    // Unique identifier
  email: string
  joined: Date | string
  status: 'emailOnly' | 'activeCustomer' | 'formerCustomer' | 'doNotContact'
  usesApps?: HST_Apps[]
  firstName?: string
  lastName?: string
  source?: MarketingSource
  marketingNotes?: string
  allowsMarketingEmails?: boolean
}
```

**Notes:**
- Sent to external analytics service via POST to `https://harryt.dev/api/user`
- Triggered on GET `/api/speakers` request
- Used for cross-app user tracking and marketing analytics

---

## Undocumented/Missing Types

The following collections have no explicit TypeScript types. They are handled as generic items using `handleDatabaseOperation` and generic UI components.

### Activities

**Inferred shape from API handlers:**

```ts
type Activity = {
  name: string
  speakerId: string
  description?: string
  imageUrl?: string
  imageBase64?: string
  _id: string
  userId: string
  lastUpdatedBy?: string
  updatedAt?: Date | string
}
```

**Collection:** `activities`
**Routes:** `/api/activity`, `/api/activities`

### Villagers

**Inferred shape from API handlers:**

```ts
type Villager = {
  name: string
  speakerId: string
  description?: string
  imageUrl?: string
  imageBase64?: string
  _id: string
  userId: string
  lastUpdatedBy?: string
  updatedAt?: Date | string
}
```

**Collection:** `villagers`
**Routes:** `/api/villager`, `/api/villagers`

### VocabWords

**Inferred shape from API handlers:**

```ts
type VocabWord = {
  name: string
  speakerId: string
  description?: string
  imageUrl?: string
  imageBase64?: string
  _id: string
  userId: string
  lastUpdatedBy?: string
  updatedAt?: Date | string
}
```

**Collection:** `vocabWords`
**Routes:** `/api/vocabWord`, `/api/vocabWords`

**Note:** If strongly-typed behavior becomes necessary, follow the Food/Place pattern: create `models/activity.ts`, `models/villager.ts`, `models/vocabWord.ts` with explicit `*Input` and main types, then export from `models/index.ts`.

---

## Type System Notes

- All types use `type` keyword (not `interface`)
- Input types receive `*Input` suffix: `SpeakerInput`, `FoodInput`, `PlaceInput`
- Main types extend `*Input` with `_id` and `userId` fields
- MongoDB `_id` is stored as string in TypeScript; converted to `ObjectId` by API layer
- Runtime fields (`lastUpdatedBy`, `updatedAt`, `isArchived`) are optional at type level but consistently added by API handlers
- Optional fields use `?:` syntax (e.g., `imageBase64?: string`)
