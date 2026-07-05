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

## AAC (Augmentative and Alternative Communication) Types

### AacPhrase Type

Represents a custom quick phrase created by a speaker's caregiver.

**Location:** `models/aac-phrase.ts`

#### AacPhraseInput

```ts
type AacPhraseInput = {
  speakerId: string              // Required: speaker this phrase belongs to
  text: string                   // Required: phrase text (1-200 chars)
  icon?: string                  // Optional: lucide icon name or emoji
  backgroundColor?: string       // Optional: hex color string (e.g., '#ffd700')
  category?: string              // Optional: display grouping (e.g., 'Social')
  sortOrder?: number             // Optional: sort priority (non-negative int)
}
```

#### AacPhrase

```ts
type AacPhrase = AacPhraseInput & {
  _id: string                    // MongoDB ObjectId as string
  createdAt: Date                // Creation timestamp (server-set)
  updatedAt: Date                // Last update timestamp (server-set)
  lastUpdatedBy: string          // better-auth user ID of last updater (server-set)
}
```

**Notes:**
- `createdAt`, `updatedAt`, `lastUpdatedBy` are always set by the server; client values ignored
- Scoped to a speaker via `speakerId` — every phrase must belong to exactly one speaker
- Caregiver-only mutations: POST (create), PUT (update), DELETE (delete)
- Parent or Villager can read via GET

**Collection:** `aacPhrases`
**Routes:** `/api/aac/phrase`, `/api/aac/phrases`

---

### AacUserPreferences Type

Represents AAC settings for a speaker (voice, speech rate, grid layout, etc.).

**Location:** `models/aac-preferences.ts`

#### SymbolSource

```ts
type SymbolSource = 'mulberry' | 'arasaac' | 'custom' | 'opensymbols'
```

`'mulberry'` and `'opensymbols'` are implemented (see
[OpenSymbols API Integration](12-opensymbols-api.md)). `'arasaac'` and
`'custom'` are not yet implemented and currently fall back to Mulberry via
`getSymbolProvider()` in `lib/aac/symbol-provider-factory.ts`.

#### AacUserPreferencesInput

```ts
type AacUserPreferencesInput = {
  speakerId: string              // Required
  voiceName?: string             // Optional: voice to use for TTS (e.g., "Google US English")
  speechRate: number             // Required: 0.5–2.0 (default 1)
  speechPitch: number            // Required: 0.5–2.0 (default 1)
  speakOnSymbolTap: boolean      // Required: whether symbols auto-speak on tap (default true)
  phraseTapBehavior: 'speak' | 'append'  // Required: 'speak' to speak phrase, 'append' to add to sentence bar
  symbolSource: SymbolSource     // Required: 'mulberry', 'arasaac', 'custom', or 'opensymbols'
  symbolLabelPosition: 'below' | 'above' | 'hidden'  // Required: where to show symbol text
  mobileGridColumns: 2 | 3 | 4   // Required: grid columns on mobile (2, 3, or 4)
}
```

#### AacUserPreferences

```ts
type AacUserPreferences = AacUserPreferencesInput & {
  _id: string                    // MongoDB ObjectId as string
  updatedAt: Date                // Last update timestamp (server-set)
}
```

**Notes:**
- One preferences doc per speaker (unique index on `speakerId`)
- Caregiver-only mutations: POST (upsert)
- Parent or Villager can read via GET
- GET returns default object if no doc exists (not 404)
- `updatedAt` is server-set; client value ignored

**Collection:** `aacUserPreferences`
**Routes:** `/api/aac/preferences`

---

### AacSymbol Type

Represents a symbol from the symbol provider (metadata only, no database).

**Location:** `lib/aac/symbol-provider.ts`

```ts
type AacSymbol = {
  id: string                     // Unique symbol ID
  label: string                  // Display text (e.g., 'want', 'happy')
  imageUrl: string               // Absolute URL or /public path to SVG
  category: string               // Category slug (e.g., 'core', 'feelings')
  source: SymbolSource           // 'mulberry', 'arasaac', 'custom', 'opensymbols'
  tags?: string[]                // Optional: search tags
}
```

**Notes:**
- Not stored in MongoDB; Mulberry symbols are loaded from static JSON
  (`lib/aac/mulberry-symbols.json`), OpenSymbols results come from a live
  API call (see [12: OpenSymbols API Integration](12-opensymbols-api.md))
- Used by symbol grids and search utilities
- 23 categories defined in `AAC_CATEGORIES` constant (12 original symbol
  categories + 11 scenario categories shared with phrase categories)

---

### AacCategory Type

Represents an AAC symbol category.

**Location:** `lib/aac/symbol-provider.ts`

```ts
type AacCategory = {
  slug: string                   // URL-friendly ID (e.g., 'core')
  label: string                  // Display name (e.g., 'Core Words')
  icon: string                   // lucide icon name (e.g., 'Star')
}
```

**12 Categories:**
1. `core` — Core Words (icon: Star)
2. `feelings` — Feelings (icon: Heart)
3. `people` — People (icon: User)
4. `actions` — Actions (icon: Zap)
5. `food-drink` — Food & Drink (icon: UtensilsCrossed)
6. `places` — Places (icon: MapPin)
7. `objects` — Objects (icon: Box)
8. `describing` — Describing (icon: Palette)
9. `social` — Social (icon: MessageCircle)
10. `body` — Body (icon: PersonStanding)
11. `time` — Time (icon: Clock)
12. `questions` — Questions (icon: HelpCircle)

---

## Type System Notes

- All types use `type` keyword (not `interface`)
- Input types receive `*Input` suffix: `SpeakerInput`, `AacPhraseInput`, `AacUserPreferencesInput`
- Main types extend `*Input` with `_id` and runtime fields
- MongoDB `_id` is stored as string in TypeScript; converted to `ObjectId` by API layer
- Runtime fields (`lastUpdatedBy`, `updatedAt`, `createdAt`) are optional at type level but consistently added by API handlers
- AAC types are validated at runtime using Zod schemas in `lib/aac/aac-validators.ts`
- Optional fields use `?:` syntax (e.g., `voiceName?: string`)
