# Components Documentation

This document provides comprehensive details on all custom components in the VoiceBridge application. These components are built with React 18, TypeScript, and shadcn/ui, following the App Router pattern.

---

## Table of Contents

1. [GenericItemsPage](#genericitems-page)
2. [ItemComponent](#itemcomponent)
3. [ItemForm](#itemform)
4. [ItemsList](#itemslist)
5. [PlaceComponent](#placecomponent)
6. [PlaceForm](#placeform)
7. [SpeakerSelector](#speakerselector)
8. [SpeakerForm](#speakerform)
9. [AppSidebar](#appsidebar)
10. [VBSidebarTrigger](#vbsidebartrigger)
11. [NoResultsComponent](#noresultscomponent)
12. [LandingPage](#landingpage)
13. [LoginForm](#loginform)
14. [RegisterForm](#registerform)
15. [UserMenu](#usermenu)
16. [ThemeSwitcher](#themeswitcher)

---

## GenericItemsPage

**File:** `components/custom/generic-items-page.tsx`  
**Status:** `'use client'` (Client Component)

### Props Interface

```typescript
type GenericPageInfo = {
  listModelName: string          // API endpoint name (plural) for fetching: e.g., 'foods'
  editModelName: string          // API endpoint name (singular) for CRUD: e.g., 'food'
  singularLabel: string          // Singular label for UI: 'Food'
  pluralLabel: string            // Plural label for UI: 'Foods'
  noResultsComponent: JSX.Element // Custom component shown when list is empty
}

export default function GenericItemsPage({
  pageInfo: GenericPageInfo
}): JSX.Element
```

### State & Hooks

- **State:**
  - `items: any[]` — Current list of items
  - `loading: boolean` — Fetch loading state
  - `error: string | null` — Error message or null
  - `isFormOpen: boolean` — Form dialog visibility
  - `editMode: boolean` — Global edit toggle for items
  - `searchQuery: string` — Client-side search text

- **Hooks:**
  - `useSpeakerContext()` — Accesses `selectedSpeaker` to filter items by speaker
  - `useSidebar()` — Checks sidebar open state and mobile viewport

### Behavior

1. **Fetch on Mount & Speaker Change:** Triggers `useEffect` when `selectedSpeaker` or `pageInfo` changes
   - Calls `GET /api/${listModelName}?speakerId=${selectedSpeaker._id}`
   - Sets `loading` state, then populates `items`
   - Catches and displays errors

2. **Add Item:** Button triggers form dialog
   - `handleUpsertItem()` POSTs to `/api/${editModelName}`
   - Response item appended to local `items` state
   - Dialog closes automatically

3. **Delete Item:** Fire-and-forget pattern
   - Calls `DELETE /api/${editModelName}?id=${item._id}` (not awaited)
   - Immediately filters item from local state
   - No error handling in UI

4. **Client-Side Search:** 
   - Filters items by searching all string properties
   - Case-insensitive comparison
   - Shows "No search results" message if query matches nothing

5. **Edit Mode Toggle:** Switch enables inline edit/delete buttons on item cards

### Key Rendering Patterns

- **Auth:** Checks session via better-auth and conditionally renders content
- **Header:** `VBSidebarTrigger` with plural label
- **Controls:** Search bar (if items exist), Add button, Edit mode switch
- **Grid:** Flex wrap with responsive basis classes: `basis-full sm:basis-1/4 lg:basis-1/5`
- **Item Cards:** Rendered via `ItemComponent` with edit/delete callbacks

### Known Quirks

- No server-side pagination (entire list fetched at once)
- Search is client-only (does not persist to URL)
- Fire-and-forget mutations: add/edit/delete operations don't await responses
- No TanStack Query invalidation; mutations use raw `fetch()`
- Edit mode is global; affects all items simultaneously

---

## ItemComponent

**File:** `components/custom/item-component.tsx`  
**Status:** `'use client'` (Client Component)

### Props Interface

```typescript
export const ItemComponent = ({
  item: any                                    // Item object (any type)
  editMode: boolean                            // Controls visibility of edit/delete buttons
  onDelete: (item: any) => void               // Callback fired when delete clicked
  modelName: string                            // API endpoint name (singular): 'food'
}): JSX.Element
```

### State & Hooks

- **State:**
  - `imageError: boolean` — Image failed to load
  - `isEditing: boolean` — Inline form open state
  - `updatedItem: any` — Local copy of item being edited

- **Hooks:** None (pure render component with local state)

### Behavior

1. **Image Prioritization:**
   - Prefers `imageBase64` (uploaded/compressed image)
   - Falls back to `imageUrl` if valid URL
   - Shows "Image not available" placeholder if neither exists
   - Error boundary: displays gray box if image fails to load

2. **Text-to-Speech (Normal Mode):**
   - On card click: calls `speakText(item.name)` unless in edit mode
   - Icon: `<AudioLines />` shown in non-edit mode
   - Stops propagation in edit mode

3. **Edit Mode:**
   - Shows Edit (pencil) and Delete buttons
   - Clicking Edit opens `ItemForm` dialog inline
   - Submit merges changes into `updatedItem` state

4. **Delete Action (Fire-and-Forget):**
   - `onDelete()` callback fires immediately
   - `fetch()` POST sent to `/api/${modelName}?id=${item._id}` (not awaited)
   - Component relies on parent to remove from list

5. **Edit Action (Fire-and-Forget):**
   - `handleSubmit()` updates local `updatedItem` state
   - `fetch()` POST sent to `/api/${modelName}?id=${item._id}` (not awaited)
   - Closes form and re-renders with new data
   - Parent component (GenericItemsPage) also receives callback but doesn't await

### Rendering

- **Card Container:** Min height full, cursor pointer
- **Header:** Title (with AudioLines icon if not editing) + Description
- **Content:** Image with error boundary, or text message
- **Actions (if editMode & not isEditing):** Edit and Delete buttons
- **Nested Form (if isEditing):** Inline ItemForm

### Known Quirks

- Uses `any` type for items (not strongly typed)
- Local state (`updatedItem`) not synced back to parent
- Double mutation: both component and parent call API
- No error handling for failed POST/DELETE requests
- Image validation only checks URL structure, not HTTP status

---

## ItemForm

**File:** `components/custom/item-form.tsx`  
**Status:** `'use client'` (Client Component)

### Props Interface

```typescript
export function ItemForm({
  onClose: () => void                  // Close dialog callback
  onSubmit: (item: any) => void       // Submit callback with updated item
  item?: any                           // Item to edit (if undefined, creates new)
  modelName: string                    // Model name for form title: 'Food', 'Activity'
}): JSX.Element
```

### State & Hooks

- **State:**
  - `formState: { name, imageUrl, description, imageBase64 }` — Form field values
  - `isUploading: boolean` — File processing state
  - `previewImage: string | null` — Base64 or URL for image preview
  - `fileInputRef` — Hidden file input ref

- **Hooks:** None

### Form Fields

| Field | Type | Notes |
|-------|------|-------|
| `name` | Text Input | Required for item identification |
| `imageBase64` | File Upload | Compressed via `compressAndConvertToBase64(file, 800, 800, 0.7)` |
| `imageUrl` | Text Input | URL fallback for web images |
| `description` | Textarea | Optional item description |

### Image Upload Logic

1. User clicks "Upload Image" button → triggers hidden file input
2. `handleImageUpload()` receives file
3. `compressAndConvertToBase64()` processes:
   - Resizes to 800×800px
   - Compresses to 0.7 quality
   - Converts to base64 data URI string
4. Sets `formState.imageBase64` and preview
5. Button state changes to "Processing..." during upload

### Behavior

1. **Form Initialization:** `useEffect` syncs form state when `item` prop changes
2. **Field Changes:** Each field update merges into `formState`
3. **Submit:** 
   - Prevents default form submission
   - Calls `onSubmit({ ...item, ...formState })`
   - Calls `onClose()` to hide dialog
4. **Cancel:** Calls `onClose()` without submitting

### Rendering

- **Dialog:** Always open (controlled by `open={true}`, managed by parent via `onOpenChange`)
- **Responsive:** Max widths scale: `xs` → `lg` → `2xl`
- **Layout:** Vertical form with labeled fields
- **Image Preview:** Shows current/uploaded image (fill, object-fit: cover)
- **Buttons:** Upload Image, Cancel, Save

### Known Quirks

- Dialog uses `open={true}` and `onOpenChange={onClose}` (unusual pattern for controlled components)
- Image compression happens client-side (may be slow on large files)
- No validation; form accepts empty `name` field
- Preview shows base64 or URL; no fallback if both missing

---

## ItemsList

**File:** `components/custom/items-list.tsx`  
**Status:** `'use client'` (Client Component)

### Status: UNUSED

**Note:** This component exists but is **not imported by any page**. It was likely replaced by `GenericItemsPage` and left behind. Use `GenericItemsPage` instead.

### Props Interface

```typescript
export type ItemsListProps = {
  initialItems: any[]
  pageInfo: {
    editModelName: string
    singularLabel: string
    pluralLabel: string
    noResultsComponent: JSX.Element
  }
  speakerId: string
}

export default function ItemsList({
  initialItems,
  pageInfo,
  speakerId
}): JSX.Element
```

### Behavior

Similar to `GenericItemsPage` but:
- Receives items as prop (`initialItems`) instead of fetching via API
- Has server-side responsibility delegated to caller
- Includes `console.log('initialItems: ', initialItems)` debug artifact

### Known Quirks

- Debug `console.log` left in production code (line 29)
- No longer integrated into routing; prefer `GenericItemsPage`

---

## PlaceComponent

**File:** `components/custom/place-component.tsx`  
**Status:** `'use client'` (Client Component)

### Props Interface

```typescript
export const PlaceComponent = ({
  place: Place                                 // Typed Place object (not any)
  editMode: boolean                            // Controls visibility of Directions/edit buttons
  onDelete: (place: Place) => void            // Delete callback
}): JSX.Element
```

### State & Hooks

- **State:**
  - `imageError: boolean` — Image failed to load
  - `isEditing: boolean` — Inline form open
  - `updatedPlace: Place` — Local place copy

- **Hooks:** None

### Behavior

1. **Card Click (Normal Mode):**
   - Calls `speakText(place.name)` if not in edit mode
   - Icon: `<AudioLines />` shown in non-edit

2. **Directions Button (Normal Mode):**
   - `stopPropagation()` to prevent card's speak action
   - Calls `openGoogleMapsDirections(place.address || place.name)`
   - Opens Google Maps in new window with location

3. **Edit Mode:**
   - Shows Edit and Delete buttons
   - Edit opens `PlaceForm` inline
   - Form submit updates local `updatedPlace`

4. **Delete Action (Fire-and-Forget):**
   - Calls `onDelete()` callback immediately
   - `fetch()` POST to `/api/place?id=${place._id}` with `DELETE` method (not awaited)
   - Parent removes from list

5. **Edit Action (Fire-and-Forget):**
   - Updates local `updatedPlace`
   - `fetch()` POST to `/api/place?id=${place._id}` (not awaited)

### Image Handling

- Prioritizes `imageBase64` over `imageUrl`
- Validates URLs before rendering
- Shows gray placeholder on error

### Rendering

- Similar to `ItemComponent` but:
  - Uses `<LandPlotIcon />` for Directions button (not Edit/Delete in normal mode)
  - Larger image: 500×500px (vs 300×300px for ItemComponent)
  - Inline `PlaceForm` when editing

### Differences from ItemComponent

- **Typed:** Uses `Place` type (not `any`)
- **Directions Button:** Unique to places; uses address data
- **Form Integration:** Uses `PlaceForm` (has address field)

---

## PlaceForm

**File:** `components/custom/place-form.tsx`  
**Status:** `'use client'` (Client Component)

### Props Interface

```typescript
export function PlaceForm({
  onClose: () => void                     // Close callback
  onSubmit: (place: Place) => void       // Submit callback
  place?: Place                           // Place to edit (optional)
}): JSX.Element
```

### State & Hooks

- **State:**
  - `formState: PlaceInput` — Form fields
  - `isUploading: boolean` — Image processing state
  - `previewImage: string | null` — Image preview (base64 or URL)

### Form Fields

| Field | Type | Notes |
|-------|------|-------|
| `name` | Text Input | Place name (required) |
| `imageBase64` | File Upload | Compressed 800×800, quality 0.7 |
| `imageUrl` | Text Input | URL fallback |
| `description` | Textarea | Optional description |
| `address` | Text Input | **Extra vs ItemForm:** location for directions |
| `speakerId` | Hidden | From prop; passed to API |

### Behavior

Identical to `ItemForm` with:
- Extra `address` field for location data
- Field types merge into `PlaceInput` (typed form state)
- Image compression same: `compressAndConvertToBase64(file, 800, 800, 0.7)`

### Rendering

- Dialog with form layout
- Image preview section
- All fields except `speakerId` visible to user
- Cancel (with `BanIcon`) and Save (with `SaveIcon`) buttons

---

## SpeakerSelector

**File:** `components/custom/speaker-selector.tsx`  
**Status:** `'use client'` (Client Component)

### Props

No props. Controlled via context.

### State & Hooks

- **State:**
  - `isFormOpen: boolean` — SpeakerForm dialog visibility
  - `editingSpeaker: any | null` — Speaker being edited (null for add mode)

- **Hooks:**
  - `useSpeakerContext()` — Returns speakers array, selectedSpeaker, setSelectedSpeaker, isLoading

### Behavior

1. **Speaker Selection Dropdown:**
   - Displays all speakers by name
   - `handleChildSwitch()` finds speaker by ID and calls `setSelectedSpeaker()`
   - Auto-selects first speaker on load (handled by context)

2. **Edit Speaker (Pencil Icon):**
   - Sets `editingSpeaker` to current speaker
   - Opens form in edit mode

3. **Add Speaker (Plus Icon):**
   - Sets `editingSpeaker` to `null`
   - Opens form in add mode

4. **Share Speaker (Share Icon) (Fire-and-Forget):**
   - Generates URL: `${baseURL}/activate/${selectedSpeaker._id}`
   - Base URL: `http://localhost:3000` (dev) or `https://vb.harryt.dev` (prod)
   - Copies URL to clipboard via `navigator.clipboard.writeText()`
   - Shows toast notification: "Share link copied to clipboard"

5. **Form Submit:**
   - Determines endpoint: `/api/speaker?id=${speaker._id}` (edit) or `/api/speaker` (add)
   - POSTs speaker data
   - Updates selected speaker via `setSelectedSpeaker()`
   - Closes form

6. **Delete Speaker:**
   - POSTs to `/api/speaker?id=${speaker._id}` with `isArchived: true` (soft delete)
   - **Hard redirect:** `window.location.assign('/places')` (reloads page)

### Loading State

- Shows `Skeleton` component while speakers load
- Min height 144px, full padding

### Rendering

- Select dropdown with speaker names
- Three tooltip buttons: Edit, Add, Share
- Inline `SpeakerForm` when `isFormOpen` is true

### Known Quirks

- Share link hardcoded for development/production (env-based)
- Delete triggers hard redirect via `window.location.assign()` (not graceful)
- `console.trace()` left in delete handler (line 75)
- `editingSpeaker` typed as `any` instead of `Speaker`

---

## SpeakerForm

**File:** `components/custom/speaker-form.tsx`  
**Status:** `'use client'` (Client Component)

### Props Interface

```typescript
export function SpeakerForm({
  onClose: () => void                    // Close callback
  onDelete: (speaker: Speaker) => void  // Delete callback
  onSubmit: (speaker: Speaker) => void  // Submit callback
  speaker?: Speaker                      // Speaker to edit (optional)
}): JSX.Element
```

### State & Hooks

- **State:**
  - `formState: SpeakerInput` — Contains `{ name }`
  - `villagerIds: string` — Comma-separated villager IDs (managed separately)

- **Hooks:** None

### Form Fields

| Field | Type | Notes |
|-------|------|-------|
| `name` | Text Input | Speaker name (required) |
| `villagerIds` | Text Input | Comma-separated emails/IDs of users with access |

### Behavior

1. **Field Changes:** Update `formState` or `villagerIds` independently
2. **villagerIds Processing:**
   - Input: comma-separated string
   - On submit: split by comma, trim whitespace, filter empty strings
   - Output: string[] array passed to API

3. **Keyboard Shortcuts:**
   - **Enter:** Triggers form submission
   - **Escape:** Closes dialog without submitting

4. **Delete Button:**
   - Only visible in edit mode (`!!speaker`)
   - Calls `onDelete(speaker)` on click
   - No confirmation dialog

5. **Submit:**
   - Merges form state and villager IDs
   - Calls `onSubmit({ ...speaker, ...formState, villagerIds })`
   - Closes dialog

### CSS & Layout

- Uses custom CSS file: `components/custom/styles/speaker-form.css`
- `.speaker-form-footer` class provides custom grid layout for buttons
- Destructive (Delete) button on left, Cancel/Save on right

### Rendering

- Dialog with form layout
- Responsive: `max-w-xs` → `max-w-2xl`
- Footer with Delete (left), spacer, Cancel, Save buttons

### Known Quirks

- Custom CSS file required for footer layout (`.spacer` div)
- Villager IDs stored as separate state (not in `formState`)
- No validation for email format or duplicate IDs

---

## AppSidebar

**File:** `components/app-sidebar.tsx`  
**Status:** `'use client'` (Client Component)

### Props

No props. Renders full app sidebar.

### State & Hooks

- **Hooks:**
  - `useSidebar()` — Access `setOpenMobile` to close sidebar on navigation
  - `usePathname()` — Get current route for active link highlighting

### Navigation Items

Rendered in alphabetical order (sorted by title):

| Title | URL | Icon |
|-------|-----|------|
| Activities | `/activities` | Drum |
| Food | `/food` | Apple |
| People | `/people` | UsersRound |
| Places | `/places` | LandPlot |
| Vocabulary Words | `/vocabulary` | ListChecks |

### Behavior

1. **Active Link Highlighting:**
   - Compares `pathname === item.url`
   - Active: `variant="outline"`
   - Inactive: `variant="default"`

2. **Mobile Navigation:**
   - Clicking nav link calls `setOpenMobile(false)` → closes sidebar
   - Smooth mobile UX

3. **Header:**
   - `SidebarTrigger` (hamburger button)
   - Title: "VoiceBridge"
   - `UserButton` (Clerk auth dropdown)
   - `ThemeSwitcher` (light/dark/auto)

4. **Footer:**
   - "Report a bug" link → GitHub issues
   - "View source code" link → GitHub repo

### Rendering

- **Header:** Flex row with trigger, title, user/theme buttons
- **Body:** Speaker selector + navigation menu (sorted alphabetically)
- **Footer:** Two external links
- **Responsive:** Mobile-aware via `setOpenMobile`

### Known Quirks

- Navigation items hardcoded in array (not data-driven)
- Sorting done client-side on each render (minor perf)
- Active state based on exact pathname match (no wildcards)

---

## VBSidebarTrigger

**File:** `components/custom/sidebar-trigger.tsx`  
**Status:** `'use client'` (Client Component)

### Props Interface

```typescript
function VBSidebarTrigger({ 
  title?: string  // Optional page title to display next to trigger
}): JSX.Element
```

### State & Hooks

- **Hooks:**
  - `useSidebar()` — Access `open` (sidebar open state) and `isMobile` (mobile viewport)

### Behavior

1. **Conditional Rendering:**
   - Renders ONLY when sidebar is closed (`!open`) OR viewport is mobile (`isMobile`)
   - If sidebar open AND not mobile → returns `null`

2. **Fixed Positioning:**
   - Fixed at top, full width
   - Height: 80px (5rem / h-20)
   - Rounded corners: `rounded-none` (no rounding)
   - Z-index: (implicit, stacks above content)

3. **Content:**
   - `SidebarTrigger` (hamburger button)
   - Optional title text (defaults to "VoiceBridge" if not provided)

### Styling

- **CSS Class:** `.translucent-bg` — Glass-morphism effect (translucent background)
- **Component:** `Card` wrapper for styling consistency
- **Tailwind:** Fixed positioning, full width, 80px height, no border radius

### Usage Pattern

Used at the top of every page (Activities, Food, Places, etc.) to show menu button when:
- Sidebar is collapsed by user
- Viewport is mobile (< 768px)

### Rendering

```jsx
<Card className="background-translucent translucent-bg fixed h-20 w-full rounded-none">
  <SidebarTrigger className="mx-2 my-5 p-5" />
  {title ?? 'VoiceBridge'}
</Card>
```

### Known Quirks

- CSS class `.background-translucent` not found in codebase (likely typo or unused)
- Only `.translucent-bg` class is actually styled
- Title defaults via `??` operator (not `||`), handles empty strings correctly

---

## NoResultsComponent

**File:** `components/custom/no-results-component.tsx`  
**Status:** Server Component (no `'use client'` directive)

### Props Interface

```typescript
export interface NoResultsProps {
  icon: JSX.Element                      // Icon to display (e.g., XCircleIcon)
  title: string                          // Main message (e.g., "No items found")
  body: string[]                         // Array of body text lines
  showImageUrlInstructions?: boolean    // If true, shows hardcoded image URL tip (default: true)
}

export const NoResultsComponent: FC<NoResultsProps> = ({
  icon,
  title,
  body,
  showImageUrlInstructions = true,
})
```

### Behavior

1. **Centered Card Layout:**
   - Displays icon (large, 4xl)
   - Displays title (bold, XL)
   - Displays body paragraphs (SM text)

2. **Image URL Instructions (Optional):**
   - If `showImageUrlInstructions === true`, appends hardcoded text:
     > "Images are included as a URL (right-click on an image in google images and select 'Copy Image Address', then paste it in the form)."
   - Useful for empty list pages (Food, Activities, etc.)

### Rendering

- **Card:** Centered flex layout, text-center
- **Header:** Icon + Title
- **Body:** Map over body array, render each line as `<p>` with padding
- **Footer:** Conditional image instruction paragraph

### Usage Example

```jsx
<NoResultsComponent
  icon={<PlusCircleIcon />}
  title="No foods yet"
  body={["Add your first food to get started!"]}
  showImageUrlInstructions={true}
/>
```

### Known Quirks

- Hardcoded image instruction only useful for item/food/place pages
- Icon rendered as JSX element (not icon component name), forcing prop drilling
- Body text always renders with `py-2` padding (can't customize spacing)

---

## LandingPage

**File:** `components/custom/landing-page.tsx`  
**Status:** Server Component

### Props

No props. Static marketing page.

### Behavior

1. **Sticky Header:**
   - VoiceBridge gradient logo (purple to teal)
   - Theme switcher
   - "Get Started" button

2. **Hero Section:**
   - Large heading with gradient text
   - Description: free & open-source app for autism communication
   - Two CTA buttons: "Get Started" (gradient) and "View source code" (outline)

3. **Features Section:**
   - 3 feature cards in responsive grid (1→2→3 columns)
   - Card 1: Communication Aid
   - Card 2: Visual Tools
   - Card 3: Free & Open Source

4. **Call-to-Action Section:**
   - "Ready to Bridge Communication?" heading
   - Signup prompt
   - "Get Started" button (gradient)

5. **Footer:**
   - Credit: "Built by Harry Thomas"
   - GitHub repo link

### Gradient Colors

- **Purple to Teal:** `from-[#aa00ff] to-[#00cc99]`
- Used for: logo, hero heading, CTA buttons, gradient text

### Links

- `/login` — Get Started
- `https://github.com/harryt04/voice-bridge` — GitHub repo
- Buttons use `asChild` pattern with `<Link>` components

### Rendering

- Flex column layout (min-h-screen, full width)
- Responsive: scales headings, padding, grid columns
- Light background section for features (dark mode transparent)

---

## LoginCard

**File:** `components/custom/login-card.tsx`  
**Status:** `'use client'` (Client Component)

### Props

No props.

### Behavior

1. **Auth Check:**
   - If user is logged in: redirects to `/places` via `router.push()`
   - If user is logged out: displays Clerk's `<RedirectToSignIn />` component

2. **Routing:**
   - Uses `useRouter()` from `next/navigation` (App Router)
   - Redirect happens on component render (not in useEffect)

### Rendering

```jsx
<SignedOut>
  <RedirectToSignIn />
</SignedOut>
```

- Only `<SignedOut>` content rendered (Clerk auth wrapper)
- Delegates to Clerk's built-in sign-in flow

### Known Quirks

- Redirect logic in component body (not useEffect) → may trigger multiple times
- No loading state while checking auth
- No fallback UI if redirect fails

---

## ThemeSwitcher

**File:** `components/custom/themeSwitcher.tsx`  
**Status:** `'use client'` (Client Component)

### Props

No props.

### State & Hooks

- **Hooks:**
  - `useTheme()` from `next-themes` — Returns `setTheme` function

### Behavior

1. **Dropdown Menu:**
   - Button shows Sun icon (light mode) or Moon icon (dark mode)
   - Icons rotate/scale on transition (CSS: `transition-all`)
   - Icons swap on dark/light theme change

2. **Menu Items:**
   - Light: `setTheme('light')`
   - Dark: `setTheme('dark')`
   - Automatic: `setTheme('system')` (OS preference)

3. **Icon Transitions:**
   - Light mode: Sun visible (rotate 0°, scale 100%), Moon hidden (rotate 90°, scale 0%)
   - Dark mode: Sun hidden (rotate -90°, scale 0%), Moon visible (rotate 0°, scale 100%)
   - Smooth CSS transitions for theme switching

### Rendering

- Dropdown trigger button (icon, outline variant)
- Three menu items for theme selection

### Known Quirks

- Icons use absolute positioning for smooth transition effect
- `sr-only` span for accessibility: "Toggle theme"

---

## Summary Table

| Component | File | Status | Key Responsibility |
|-----------|------|--------|-------------------|
| GenericItemsPage | `generic-items-page.tsx` | Client | Main page template for all item lists |
| ItemComponent | `item-component.tsx` | Client | Individual item card with edit/delete |
| ItemForm | `item-form.tsx` | Client | Form dialog for adding/editing items |
| ItemsList | `items-list.tsx` | Client | **UNUSED** — replaced by GenericItemsPage |
| PlaceComponent | `place-component.tsx` | Client | Place card with directions button |
| PlaceForm | `place-form.tsx` | Client | Form dialog for places (with address) |
| SpeakerSelector | `speaker-selector.tsx` | Client | Speaker dropdown + add/edit/share buttons |
| SpeakerForm | `speaker-form.tsx` | Client | Speaker management form |
| AppSidebar | `app-sidebar.tsx` | Client | Main navigation sidebar |
| VBSidebarTrigger | `sidebar-trigger.tsx` | Client | Mobile/collapsed sidebar trigger bar |
| NoResultsComponent | `no-results-component.tsx` | Server | Empty state template |
| LandingPage | `landing-page.tsx` | Server | Marketing homepage |
| LoginCard | `login-card.tsx` | Client | Login redirect wrapper |
| ThemeSwitcher | `themeSwitcher.tsx` | Client | Light/dark/auto theme toggle |

---

## Fire-and-Forget Pattern Notes

Many components use a **fire-and-forget** mutation pattern:

```typescript
// Example from ItemComponent
const handleDeleteClick = async () => {
  onDelete(updatedItem)  // Callback fires immediately
  fetch(`/api/${modelName}?id=${updatedItem._id}`, {
    method: 'DELETE',
  })  // NOT awaited
}
```

**Implications:**
- UI updates immediately (optimistic)
- No error handling if request fails
- No loading state during request
- Network errors silently ignored
- Potential for data inconsistency if server rejects

This pattern is used consistently across item/place/speaker components. Consider adding error handling or switching to TanStack Query mutations if reliability is needed.
