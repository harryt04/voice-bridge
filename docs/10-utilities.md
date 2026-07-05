# Utility Functions Reference

This document provides comprehensive documentation of all utility functions in VoiceBridge, organized by category (server-side `lib/` and client-side `utils/`).

---

# lib/ — Server-Side Utilities

Server-side utilities run on the Next.js backend and can be used in API routes, server components, and server actions.

## cn() — Class Name Merging

**File:** `lib/utils.ts:22-24`

### Purpose

Merge multiple Tailwind CSS class names without conflicts. Uses `clsx` for conditional class joining and `tailwind-merge` to intelligently merge Tailwind utility classes.

### Signature

```typescript
cn(...inputs: ClassValue[]): string
```

### Parameters

- `inputs` — Variable number of class values:
  - Strings: `'px-2'`
  - Conditional objects: `{ 'opacity-50': disabled }`
  - Arrays: `['bg-blue-500', 'text-white']`

### Returns

Single merged class string with Tailwind utilities deduplicated.

### Examples

```typescript
import { cn } from '@/lib/utils'

// Basic merging
cn('px-2', 'py-4')
// → 'px-2 py-4'

// Conditional classes
const disabled = true
cn('px-2', disabled && 'opacity-50')
// → 'px-2 opacity-50'

// Object syntax (only includes keys with truthy values)
cn('px-2', { 'opacity-50': disabled, 'cursor-not-allowed': disabled })
// → 'px-2 opacity-50 cursor-not-allowed'

// Tailwind merge — later classes override earlier ones
cn('bg-red-500', 'bg-blue-500')
// → 'bg-blue-500' (not 'bg-red-500 bg-blue-500')

// Component prop usage
function Button({ disabled, className }) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded bg-primary text-white',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      Click me
    </button>
  )
}
```

### Use Cases

- **Component styling:** Merge base classes with conditional overrides
- **Prop-based customization:** Allow consumers to pass `className` prop without conflicts
- **Responsive variants:** Combine mobile and desktop classes
- **Theme switching:** Apply theme-specific overrides

---

## extractParamFromUrl() — Query Parameter Extraction

**File:** `lib/utils.ts:33-39`

### Purpose

Extract a named query parameter from a Next.js `NextRequest` object. Safely parses the request URL without manual string manipulation.

### Signature

```typescript
extractParamFromUrl(req: NextRequest, paramName: string): string | null
```

### Parameters

- `req: NextRequest` — The Next.js request object containing the URL
- `paramName: string` — The name of the query parameter to extract

### Returns

- `string` — The parameter value if present
- `null` — If the parameter is not present in the URL

### Examples

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { extractParamFromUrl } from '@/lib/utils'

// URL: /api/speaker?id=507f1f77bcf86cd799439011&name=Alice
export async function GET(req: NextRequest) {
  const speakerId = extractParamFromUrl(req, 'id')
  const name = extractParamFromUrl(req, 'name')

  if (!speakerId) {
    return NextResponse.json(
      { error: 'id parameter required' },
      { status: 400 },
    )
  }

  // speakerId = '507f1f77bcf86cd799439011'
  // name = 'Alice'

  // ... fetch speaker from database ...

  return NextResponse.json({ speaker: { id: speakerId, name } })
}

// If parameter not in URL:
const missing = extractParamFromUrl(req, 'nonexistent')
// → null
```

### Use Cases

- **API route handlers:** Extract path parameters from query strings
- **Filtering:** Get search filters from URL (`?category=food&type=fruit`)
- **Pagination:** Extract page number (`?page=2`)
- **Validation:** Check if required parameters are present

---

## capitalizeFirstLetter() — String Capitalization

**File:** `lib/utils.ts:47-50`

### Purpose

Capitalize the first letter of a string. Safe handling of empty or undefined inputs.

### Signature

```typescript
capitalizeFirstLetter(input: string): string
```

### Parameters

- `input: string` — The string to capitalize

### Returns

String with first letter uppercase, or original string if empty/undefined.

### Examples

```typescript
import { capitalizeFirstLetter } from '@/lib/utils'

capitalizeFirstLetter('hello')
// → 'Hello'

capitalizeFirstLetter('HELLO')
// → 'HELLO' (only first letter is changed)

capitalizeFirstLetter('a')
// → 'A'

capitalizeFirstLetter('')
// → '' (empty string returned as-is)

capitalizeFirstLetter(undefined)
// → undefined (falsy input returned as-is)

// Use in display logic
const category = 'food'
const label = capitalizeFirstLetter(category)
// → 'Food' (for UI labels)
```

### Use Cases

- **Display formatting:** Convert database values to user-friendly labels
- **Form validation messages:** Capitalize error messages
- **Category/type display:** Show proper nouns with first letter capitalized

---

## PostHogClient() — Analytics Client

**File:** `lib/posthog-server.ts:3-20`

### Purpose

Returns a PostHog analytics client for server-side event tracking. Provides different behavior based on environment (production vs. development).

### Signature

```typescript
PostHogClient(): PostHog
```

### Parameters

None.

### Returns

- **Production:** Real PostHog client with immediate flush settings
  - `flushAt: 1` — Send events immediately (no batching)
  - `flushInterval: 0` — No delay before sending
- **Development/Test:** No-op stub object (prevents unnecessary events in dev)

### Examples

```typescript
import PostHogClient from '@/lib/posthog-server'

export async function POST(req: NextRequest) {
  try {
    const posthog = PostHogClient()

    // Event will only be sent in production
    posthog.capture({
      distinctId: userId,
      event: 'speaker_created',
      properties: {
        speakerId: id,
        category: 'food',
      },
    })

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

### Environment-Based Behavior

```typescript
// Development (NODE_ENV !== 'production')
const posthog = PostHogClient()
posthog.capture(...)  // No-op (does nothing)

// Production
const posthog = PostHogClient()
posthog.capture(...)  // Event sent to PostHog
```

### Configuration

PostHog settings from environment variables:

```
NEXT_PUBLIC_POSTHOG_KEY  — API key
NEXT_PUBLIC_POSTHOG_HOST — PostHog server URL
```

**If not set in production:** Throws `Error('NEXT_PUBLIC_POSTHOG_KEY is not set')`

### Use Cases

- **Event tracking:** Log user actions (speaker creation, item added, etc.)
- **Metrics:** Track engagement and feature usage
- **A/B testing:** Cohort analysis and experiment tracking

### Note

⚠️ **Currently unused in codebase** — While `PostHogClient()` is exported and implemented, no API routes currently call it. Use this pattern when implementing analytics tracking.

---

# utils/ — Client-Side Utilities

Client-side utilities run in the browser and are used in React components and client-side scripts.

## speakText() — Text-to-Speech

**File:** `utils/speech.ts:1-6`

### Purpose

Convert text to speech using the browser's native Web Speech API. Useful for accessibility features (read items aloud, announce place directions, etc.).

### Signature

```typescript
speakText(text: string): void
```

### Parameters

- `text: string` — The text content to speak

### Returns

`void` — No return value.

### Behavior

1. **Cancel active speech:** Calls `speechSynthesis.cancel()` to stop any ongoing utterance
2. **Create utterance:** Creates new `SpeechSynthesisUtterance(text)`
3. **Speak:** Plays audio via `speechSynthesis.speak(utterance)`

### Examples

```typescript
import { speakText } from '@/utils/speech'

// Simple usage
<button onClick={() => speakText('Apple')}>
  🔊 Speak
</button>

// Used in components
function ItemComponent({ item }) {
  return (
    <div>
      <h3>{item.name}</h3>
      <button onClick={() => speakText(item.name)}>
        Pronounce
      </button>
    </div>
  )
}

// Multiple items
function PlaceList({ places }) {
  return (
    <ul>
      {places.map((place) => (
        <li key={place.id}>
          <span onClick={() => speakText(place.name)}>
            {place.name}
          </span>
        </li>
      ))}
    </ul>
  )
}
```

### Browser Compatibility

Supported on all modern browsers (Chrome, Firefox, Safari, Edge).

**Requirements:**
- Browser with Web Speech API support
- Audio output device (speakers, headphones, etc.)
- User permission (usually granted automatically)

### API Details

Uses browser `speechSynthesis` object:

```typescript
// Cancel any ongoing speech
speechSynthesis.cancel()

// Create and speak
const utterance = new SpeechSynthesisUtterance('text to speak')
speechSynthesis.speak(utterance)
```

### Use Cases

- **Accessibility:** Readers for items and places (autism communication tools)
- **Pronunciation:** Help users pronounce words correctly
- **Engagement:** Multi-sensory learning and feedback

### Customization (Advanced)

To customize voice, rate, pitch:

```typescript
export const speakText = (
  text: string,
  rate: number = 1,
  pitch: number = 1,
): void => {
  speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = rate  // 0.1 to 10 (default 1)
  utterance.pitch = pitch  // 0 to 2 (default 1)

  // Optional: select voice
  const voices = speechSynthesis.getVoices()
  if (voices.length > 0) {
    utterance.voice = voices[0]
  }

  speechSynthesis.speak(utterance)
}
```

---

## compressAndConvertToBase64() — Image Compression

**File:** `utils/imageUtils.ts:9-63`

### Purpose

Resize and compress an image file, then convert to base64 for storage or transmission. Maintains aspect ratio and reduces file size for efficient database storage.

### Signature

```typescript
compressAndConvertToBase64(
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 800,
  quality: number = 0.7,
): Promise<string>
```

### Parameters

- `file: File` — The image file to process (from `<input type="file">`)
- `maxWidth: number` — Maximum width (default: 800px)
- `maxHeight: number` — Maximum height (default: 800px)
- `quality: number` — JPEG compression quality 0–1 (default: 0.7 = 70%)

### Returns

`Promise<string>` — Resolves to full base64 data URL string.

**Format:** `'data:image/jpeg;base64,...'`

### Examples

```typescript
import { compressAndConvertToBase64 } from '@/utils/imageUtils'

// File input handler
async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
  const file = event.target.files?.[0]
  if (!file) return

  try {
    const base64 = await compressAndConvertToBase64(file)
    console.log(base64)
    // → 'data:image/jpeg;base64,/9j/4AAQSkZJRg...'

    // Send to API
    await fetch('/api/item', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Apple',
        image: base64,  // Full data URL
      }),
    })
  } catch (error) {
    console.error('Image compression failed:', error)
  }
}

// In ItemForm component
function ItemForm() {
  const [image, setImage] = useState<string | null>(null)

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const compressed = await compressAndConvertToBase64(file, 600, 600, 0.8)
      setImage(compressed)
    }
  }

  return (
    <form>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      {image && <img src={image} alt="preview" style={{ maxWidth: '200px' }} />}
    </form>
  )
}
```

### Processing Flow

1. **FileReader:** Reads file as data URL
2. **Image Element:** Loads data URL into `<img>`
3. **Canvas:** Resizes image while maintaining aspect ratio
4. **Compression:** Draws image to canvas with specified quality
5. **Base64:** Converts canvas to data URL string

### Size Reduction

Example compression results:

| Original Size | Compressed Size | Reduction |
| ------------- | --------------- | --------- |
| 5 MB          | ~200 KB         | 96%       |
| 2 MB          | ~80 KB          | 96%       |
| 500 KB        | ~20 KB          | 96%       |

**Note:** Actual reduction depends on image content and quality setting.

### Quality Parameter

- `0.1` — Heavily compressed, visible artifacts
- `0.5` — Moderate compression, some loss
- `0.7` — Balanced (default), good quality
- `0.9` — Minimal compression, large file
- `1.0` — No compression, maximum file size

### Use Cases

- **Item images:** Store food/place photos efficiently
- **Form uploads:** Preview and compress before submission
- **Database storage:** Reduce MongoDB document size
- **API transmission:** Smaller payload for faster uploads

### Error Handling

```typescript
try {
  const base64 = await compressAndConvertToBase64(file)
  // ... use base64 ...
} catch (error) {
  console.error('Failed to compress image:', error)
  // Show error toast to user
}
```

Errors may occur if:
- File is not an image
- Canvas context creation fails
- FileReader encounters issues

---

## openGoogleMapsDirections() — Google Maps Integration

**File:** `utils/directions.ts:1-15`

### Purpose

Open Google Maps in a new browser tab with directions to a specified address. Used to help users navigate to places in the VoiceBridge app.

### Signature

```typescript
openGoogleMapsDirections(address: string): void
```

### Parameters

- `address: string` — The destination address (e.g., `'123 Main St, San Francisco, CA'`)

### Returns

`void` — No return value.

### Behavior

1. **Validation:** Checks if address is empty; logs error if missing
2. **Encoding:** URL-encodes address for safe transmission
3. **URL construction:** Builds Google Maps directions URL
4. **Open tab:** Opens URL in new browser tab via `window.open()`

### Examples

```typescript
import { openGoogleMapsDirections } from '@/utils/directions'

// Simple usage
<button onClick={() => openGoogleMapsDirections('123 Main St, San Francisco, CA')}>
  📍 Get Directions
</button>

// In PlaceComponent
function PlaceComponent({ place }) {
  return (
    <div>
      <h3>{place.name}</h3>
      <p>{place.address}</p>
      <button onClick={() => openGoogleMapsDirections(place.address)}>
        Open in Google Maps
      </button>
    </div>
  )
}

// With error handling
function DirectionsButton({ address }) {
  const handleClick = () => {
    if (!address) {
      console.error('Address is required')
      return
    }
    openGoogleMapsDirections(address)
  }

  return <button onClick={handleClick}>Directions</button>
}
```

### URL Format

Generated Google Maps URL:

```
https://www.google.com/maps/dir/?api=1&destination=<encoded-address>
```

**Example:**

```
address: '123 Main St, San Francisco, CA'
encoded: '123%20Main%20St%2C%20San%20Francisco%2C%20CA'
url: 'https://www.google.com/maps/dir/?api=1&destination=123%20Main%20St%2C%20San%20Francisco%2C%20CA'
```

### Error Handling

**If address is empty:**

```typescript
openGoogleMapsDirections('')
// Logs: 'Address is required to open Google Maps directions.'
// Does not open a URL
```

**Always validate:**

```typescript
function SafeDirections({ place }) {
  const handleClick = () => {
    if (place?.address) {
      openGoogleMapsDirections(place.address)
    } else {
      showError('Address not available')
    }
  }

  return (
    <button onClick={handleClick} disabled={!place?.address}>
      Directions
    </button>
  )
}
```

### Browser Behavior

- Opens URL in **new tab** (`_blank`)
- Does not navigate away from current page
- Respects popup blocking settings (user must have popups enabled)

### Use Cases

- **Place navigation:** Help users find locations
- **Accessibility:** Alternative to in-app maps
- **Simplified UX:** Delegates mapping to native Google Maps app/website

---

# AAC Utilities

AAC-specific utilities for text-to-speech, symbol handling, and data validation.

## speak() — Text-to-Speech

**File:** `utils/aac-speech.ts`

**Availability:** Client-side only (`window.speechSynthesis`)

### Purpose

Centralized TTS utility for all AAC speech output (symbols, phrases, sentences). Applies user preferences and handles errors gracefully.

### Signature

```typescript
export type SpeechPrefs = {
  voiceName?: string
  speechRate?: number
  speechPitch?: number
}

export function speak(text: string, prefs: SpeechPrefs = {}): void
```

### Parameters

- `text` — String to speak (empty/whitespace is ignored)
- `prefs` — Optional preferences object:
  - `voiceName` — Exact voice name from `window.speechSynthesis.getVoices()`
  - `speechRate` — 0.5–2.0 (default 1.0)
  - `speechPitch` — 0.5–2.0 (default 1.0)

### Returns

`void` — No return value. Sets up speech utterance and starts playback.

### Behavior

1. Validates text (returns silently if empty/whitespace)
2. Cancels any currently-playing speech
3. Creates `SpeechSynthesisUtterance` with provided text
4. Sets rate and pitch from preferences
5. Finds matching voice from `getVoices()` if `voiceName` provided
6. Starts playback via `synth.speak(utterance)`

### Error Handling

Try-catch wraps all operations. On error: logs to console, **never throws**. Speech gracefully degrades if unavailable.

```typescript
try {
  const synth = window.speechSynthesis
  synth.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  // ... set voice, rate, pitch
  synth.speak(utterance)
} catch (error) {
  console.error('Speech synthesis failed:', error)
  // Silently degrade
}
```

### Usage Examples

```typescript
// Simple speak
speak('Hello world')

// With preferences
const prefs = {
  voiceName: 'Google US English Female',
  speechRate: 1.2,
  speechPitch: 0.9,
}
speak('I am happy', prefs)

// In symbol grid (tap handler)
function handleSymbolTap(symbol, preferences) {
  if (preferences.speakOnSymbolTap) {
    speak(symbol.label, preferences)
  }
}

// In sentence bar (speak full sentence)
function handleSpeakSentence(words, preferences) {
  const text = words.map(w => w.label).join(' ')
  speak(text, preferences)
}
```

### Use Cases

- **Symbol tap:** Announce symbol label
- **Phrase tap:** Speak quick phrase
- **Sentence:** Speak full sentence from bar
- **All sites:** Centralized voice settings application

---

## isValidObjectId() — ObjectId Validation

**File:** `lib/aac/aac-auth.ts` (exported helper)

**Availability:** Server-side (uses MongoDB ObjectId)

### Purpose

Validate ObjectId format before constructing `new ObjectId()` to avoid runtime errors.

### Signature

```typescript
import { ObjectId } from 'mongodb'

function isValidObjectId(id: string): boolean
```

### Parameters

- `id` — String to validate

### Returns

`boolean` — `true` if valid ObjectId format, `false` otherwise

### Implementation

```typescript
function isValidObjectId(id: string): boolean {
  return ObjectId.isValid(id) && new ObjectId(id).toString() === id
}
```

### Usage

```typescript
// In API route handler
const { id } = req.query

if (!isValidObjectId(id as string)) {
  return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
}

const objectId = new ObjectId(id as string)
const result = await collection.findOne({ _id: objectId })
```

### Use Cases

- **Query parameter validation:** Validate `?id=` before use
- **Prevent errors:** Avoid `new ObjectId()` exceptions
- **AAC routes:** All phrase/preference endpoints use this check

---

## aacMutationAuthCheck() — AAC Authorization

**File:** `lib/aac/aac-auth.ts` (exported helper)

**Availability:** Server-side (uses better-auth + MongoDB)

### Purpose

Check authorization for AAC phrase/preference mutations. Verifies session exists, speaker exists, and user is parent (caregiver).

### Signature

```typescript
export async function aacMutationAuthCheck(
  req: NextRequest,
  speakerId: string,
): Promise<{ userId: string } | NextResponse>
```

### Parameters

- `req` — Next.js request object (for headers)
- `speakerId` — Target speaker's ObjectId

### Returns

**Success:** `{ userId: string }` — User is authorized

**Failure:** `NextResponse.json()` with error:
- `401` — No session (unauthorized)
- `404` — Speaker not found
- `403` — User is not parent of speaker (forbidden)

### Implementation Pattern

```typescript
const session = await auth.api.getSession({ headers: req.headers })
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

const db = await getDb()
const speaker = await db.collection('speakers').findOne({
  _id: new ObjectId(speakerId),
})

if (!speaker) {
  return NextResponse.json({ error: 'Speaker not found' }, { status: 404 })
}

// Only parent (caregiver) can mutate
if (speaker.parentId !== session.user.id) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

return { userId: session.user.id }
```

### Usage in Route Handlers

```typescript
// POST /api/aac/phrase
export async function POST(req: NextRequest) {
  const { speakerId, text, ...phraseData } = await req.json()

  // Check authorization
  const authResult = await aacMutationAuthCheck(req, speakerId)
  if (authResult instanceof NextResponse) return authResult  // Early return on error

  const { userId } = authResult  // Now safely destructure

  // Proceed with mutation...
  const db = await getDb()
  const result = await db.collection('aacPhrases').insertOne({
    speakerId: new ObjectId(speakerId),
    text,
    ...phraseData,
    lastUpdatedBy: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  return NextResponse.json({ insertedId: result.insertedId }, { status: 200 })
}
```

### IDOR Prevention

This check prevents **Insecure Direct Object Reference** attacks:
- Ensures user is parent before allowing mutation on speaker
- Cannot modify another speaker's phrases by guessing their ObjectId
- Client-provided `speakerId` is validated against auth

---

## getPhraseFontSize() — Dynamic Font Sizing

**File:** `utils/aac-phrase-text-size.ts` (export for components)

**Availability:** Client-side (utility for rendering)

### Purpose

Return Tailwind font-size class based on phrase text length. Keeps readability on phrase tiles with limited space.

### Signature

```typescript
export function getPhraseTailwindClass(text: string): string
```

### Parameters

- `text` — Phrase text string

### Returns

`'text-base'` or `'text-sm'` Tailwind class string

### Logic

- **≤ 15 characters:** `'text-base'` (larger, for short phrases)
- **> 15 characters:** `'text-sm'` (smaller, for longer phrases)

### Usage

```typescript
import { getPhraseTailwindClass } from '@/utils/aac-phrase-text-size'

function AacPhraseTile({ phrase }) {
  const fontClass = getPhraseTailwindClass(phrase.text)

  return (
    <button className={cn('p-3 rounded-2xl', fontClass)}>
      {phrase.text}
    </button>
  )
}

// Example outputs:
// getPhraseTailwindClass('Yes')              → 'text-base'
// getPhraseTailwindClass('I am happy')       → 'text-base'
// getPhraseTailwindClass('I need a break')   → 'text-sm'
// getPhraseTailwindClass('I am in pain')     → 'text-sm'
```

---

## Symbol Provider Methods

**File:** `lib/aac/mulberry-provider.ts`

**Availability:** Server and client (static data)

### Purpose

Fetch symbols from static JSON by category or search query.

### Signature

```typescript
class MulberrySymbolProvider implements SymbolProvider {
  getCategories(): AacCategory[]
  getSymbolsByCategory(categorySlug: string): AacSymbol[]
  searchSymbols(query: string): AacSymbol[]
}

export const mulberryProvider = new MulberrySymbolProvider()
```

### Methods

**getCategories():**
- Returns all AAC categories (23, defined in `AAC_CATEGORIES`)
- No parameters
- Returns `AacCategory[]` with slug, label, icon name

**getSymbolsByCategory(categorySlug):**
- Returns symbols for specific category
- Parameter: `categorySlug` (e.g., 'core', 'feelings')
- Returns `AacSymbol[]` filtered to category
- Empty array if category not found

**searchSymbols(query):**
- Returns symbols matching query (case-insensitive)
- Parameter: `query` (search term)
- Searches label + tags fields
- Returns `AacSymbol[]` matching results
- Empty array if no matches

### Usage

```typescript
import { mulberryProvider } from '@/lib/aac/mulberry-provider'

// In symbol grid page
const coreSymbols = mulberryProvider.getSymbolsByCategory('core')
// → [{ id: 'mulberry-want', label: 'want', ... }, ...]

// In search component
const results = mulberryProvider.searchSymbols('happy')
// → [{ id: 'mulberry-happy', label: 'happy', category: 'feelings', ... }]

// In category selector
const categories = mulberryProvider.getCategories()
// → [{ slug: 'core', label: 'Core Words', icon: 'Star' }, ...]
```

---

## OpenSymbols Provider & Provider Factory

**Files:** `lib/aac/opensymbols-provider.ts`, `lib/aac/symbol-provider-factory.ts`

**Availability:** `OpenSymbolsProvider.searchSymbols()` is client-side but
calls a server-side proxy route (`/api/aac/symbols/search`) — it never talks
to the OpenSymbols API directly, since that requires a shared secret. See
[12: OpenSymbols API Integration](12-opensymbols-api.md) for the full
contract.

### Signature

```typescript
class OpenSymbolsProvider implements SymbolProvider {
  getCategories(): AacCategory[] // reuses AAC_CATEGORIES
  getSymbolsByCategory(categorySlug: string): AacSymbol[] // always []
  searchSymbols(query: string): Promise<AacSymbol[]>
}

export const openSymbolsProvider = new OpenSymbolsProvider()

function getSymbolProvider(source: SymbolSource): SymbolProvider
```

### Methods

**getSymbolsByCategory(categorySlug):**
- Always returns `[]` — OpenSymbols has no slug-based category filter
  equivalent to `AAC_CATEGORIES`, and this method must stay synchronous per
  the shared `SymbolProvider` interface. Use `searchSymbols()` for real
  results.

**searchSymbols(query):**
- Fetches `/api/aac/symbols/search?q=<query>` (same-origin, no secret
  exposed to the client)
- Returns `Promise<AacSymbol[]>` — note `SymbolProvider.searchSymbols()`'s
  return type is `AacSymbol[] | Promise<AacSymbol[]>` precisely to
  accommodate this; callers should always `await` it
- Returns `[]` if the proxy route errors

**getSymbolProvider(source):**
- Resolves the right `SymbolProvider` for an `AacUserPreferences.symbolSource`
  value: `'opensymbols'` → `openSymbolsProvider`, everything else
  (`'mulberry'`, `'arasaac'`, `'custom'`) → `mulberryProvider` (`'arasaac'`
  and `'custom'` have no dedicated implementation yet)
- Used by `app/aac/[categorySlug]/page.tsx` to make the Settings page's
  "Symbol Set" selector actually take effect

### Usage

```typescript
import { getSymbolProvider } from '@/lib/aac/symbol-provider-factory'

const provider = getSymbolProvider(preferences.symbolSource)
const categorySymbols = provider.getSymbolsByCategory('core')
const searchResults = await provider.searchSymbols('happy')
```

---

# Summary Table

## Server-Side Utilities (lib/)

| Function                  | File                  | Purpose                              | Returns       |
| ------------------------- | --------------------- | ------------------------------------ | ------------- |
| `cn()`                    | `lib/utils.ts:22-24`  | Merge Tailwind classes               | `string`      |
| `extractParamFromUrl()`   | `lib/utils.ts:33-39`  | Extract query parameter              | `string\|null` |
| `capitalizeFirstLetter()` | `lib/utils.ts:47-50`  | Capitalize first letter              | `string`      |
| `PostHogClient()`         | `lib/posthog-server.ts` | Get analytics client                 | `PostHog`     |

## Client-Side Utilities (utils/)

| Function                       | File                           | Purpose                  | Returns          |
| ------------------------------ | ------------------------------ | ------------------------ | ---------------- |
| `speakText()`                  | `utils/speech.ts`              | Text-to-speech           | `void`           |
| `compressAndConvertToBase64()` | `utils/imageUtils.ts`          | Compress & encode image  | `Promise<string>` |
| `openGoogleMapsDirections()`   | `utils/directions.ts`          | Open Google Maps         | `void`           |
| `speak()`                      | `utils/aac-speech.ts`          | AAC text-to-speech (TTS) | `void`           |
| `getPhraseTailwindClass()`     | `utils/aac-phrase-text-size.ts` | Dynamic font sizing      | `string`         |

## Server-Side AAC Utilities (lib/aac/)

| Function                   | File                      | Purpose                           | Returns                          |
| -------------------------- | ------------------------- | --------------------------------- | -------------------------------- |
| `isValidObjectId()`        | `lib/aac/aac-auth.ts`     | Validate ObjectId format          | `boolean`                        |
| `aacMutationAuthCheck()`   | `lib/aac/aac-auth.ts`     | Check AAC mutation authorization  | `{ userId: string } \| NextResponse` |
| `mulberryProvider.getCategories()` | `lib/aac/mulberry-provider.ts` | Get all symbol categories | `AacCategory[]`  |
| `mulberryProvider.getSymbolsByCategory()` | `lib/aac/mulberry-provider.ts` | Get symbols by category | `AacSymbol[]` |
| `mulberryProvider.searchSymbols()` | `lib/aac/mulberry-provider.ts` | Search symbols | `AacSymbol[]` |
| `openSymbolsProvider.searchSymbols()` | `lib/aac/opensymbols-provider.ts` | Search OpenSymbols via server proxy | `Promise<AacSymbol[]>` |
| `getSymbolProvider()` | `lib/aac/symbol-provider-factory.ts` | Resolve provider for a `symbolSource` | `SymbolProvider` |

---

# Import Patterns

### Importing from lib/

```typescript
// Server component or API route
import { cn, extractParamFromUrl, capitalizeFirstLetter } from '@/lib/utils'
import PostHogClient from '@/lib/posthog-server'
```

### Importing from utils/

```typescript
// Client component ('use client' directive required)
'use client'

import { speakText } from '@/utils/speech'
import { compressAndConvertToBase64 } from '@/utils/imageUtils'
import { openGoogleMapsDirections } from '@/utils/directions'
```

---

# Best Practices for Agents

1. **Use `cn()` for all component class merging** — Never concatenate Tailwind classes manually
2. **Validate parameters** — Check `null` returns from `extractParamFromUrl()`
3. **Handle promises** — `compressAndConvertToBase64()` is async; use `await` or `.then()`
4. **Check for empty strings** — `openGoogleMapsDirections()` requires non-empty address
5. **Run `npm run lint`** — Ensure proper usage and no ESLint violations
6. **Test accessibility** — `speakText()` should work across devices and browsers
