# Styling & Configuration Guide

This document covers all styling configuration and conventions for VoiceBridge, including Tailwind CSS, CSS color systems, Prettier formatting, ESLint rules, and responsive design patterns.

## Tailwind CSS Configuration

**File:** `tailwind.config.ts`

### Dark Mode Setup

- **Mode:** Class-based dark mode (`darkMode: ['class']`)
- **Trigger:** Add `.dark` class to the document root (typically `<html>` element)
- **Theme switching:** Handled by Next.js `next-themes` provider in `providers/`

### Content Paths

Tailwind scans these directories for class names:

```typescript
content: [
  './pages/**/*.{ts,tsx}',
  './components/**/*.{ts,tsx}',
  './app/**/*.{ts,tsx}',
  './src/**/*.{ts,tsx}',
]
```

### Extended Colors

All colors use CSS HSL variables for dynamic theming. Colors are referenced via `hsl(var(--variable-name))`:

| Color System    | Variables                                                                           |
| --------------- | ----------------------------------------------------------------------------------- |
| **Primary**     | `--primary`, `--primary-foreground`                                                 |
| **Secondary**   | `--secondary`, `--secondary-foreground`                                             |
| **Destructive** | `--destructive`, `--destructive-foreground` (red for delete/error actions)           |
| **Muted**       | `--muted`, `--muted-foreground` (grayed-out, disabled states)                       |
| **Accent**      | `--accent`, `--accent-foreground` (highlights, interactive elements)                |
| **Popover**     | `--popover`, `--popover-foreground` (dropdown/tooltip backgrounds)                  |
| **Card**        | `--card`, `--card-foreground` (container backgrounds)                               |
| **Sidebar**     | `--sidebar-background`, `--sidebar-foreground`, `--sidebar-primary`, etc. (nav bar) |

### Border Radius

Border radius is controlled via a single CSS variable:

```typescript
borderRadius: {
  lg: 'var(--radius)',           // Default: 1rem
  md: 'calc(var(--radius) - 2px)',
  sm: 'calc(var(--radius) - 4px)',
}
```

**Usage:** Apply `rounded-lg`, `rounded-md`, or `rounded-sm` to components. Adjust the base `--radius` value in `globals.css` to change all border radii globally.

### Animations

Provided by `tailwindcss-animate` plugin:

```typescript
animation: {
  'accordion-down': 'accordion-down 0.2s ease-out',
  'accordion-up': 'accordion-up 0.2s ease-out',
}
```

**Usage:** `animate-accordion-down` and `animate-accordion-up` for collapsible UI elements.

---

## CSS Color System

**File:** `app/globals.css`

Colors are defined using **HSL (Hue, Saturation, Lightness)** CSS variables. This allows theme switching without changing component code.

### Light Theme Variables (Default)

```css
:root {
  --background: 60 30% 96%;          /* Warm cream background */
  --foreground: 0 0% 20%;             /* Dark text */
  --primary: 280 100% 50%;            /* Purple */
  --primary-foreground: 60 10% 98%;   /* Light text on primary */
  --secondary: 60 30% 90%;            /* Light warm gray */
  --secondary-foreground: 280 100% 50%;
  --accent: 160 100% 40%;             /* Teal/cyan */
  --accent-foreground: 60 10% 98%;
  --muted: 60 20% 92%;                /* Muted backgrounds */
  --muted-foreground: 0 0% 40%;
  --destructive: 0 100% 60%;          /* Red */
  --destructive-foreground: 60 10% 98%;
  --popover: 60 30% 98%;              /* Light popover background */
  --card: 60 30% 98%;                 /* Card backgrounds */
  --border: 60 30% 85%;               /* Border color */
  --input: 60 30% 85%;                /* Input field background */
  --ring: 280 100% 50%;               /* Focus ring (primary) */
  --radius: 1rem;                     /* Base border radius */
}
```

### Dark Theme Variables

Activated when `.dark` class is present on document root:

```css
.dark {
  --background: 70 8% 15%;            /* Dark olive background */
  --foreground: 60 30% 96%;           /* Light text */
  --primary: 280 100% 70%;            /* Lighter purple */
  --primary-foreground: 60 10% 10%;
  --secondary: 60 5% 25%;             /* Dark backgrounds */
  --secondary-foreground: 280 100% 70%;
  --accent: 160 100% 50%;             /* Brighter teal */
  --accent-foreground: 60 10% 10%;
  --muted: 70 5% 22%;                 /* Dark muted backgrounds */
  --muted-foreground: 60 20% 70%;
  --destructive: 0 100% 60%;          /* Red (same as light) */
  --destructive-foreground: 60 10% 98%;
  --border: 70 5% 25%;
  --input: 70 5% 25%;
  --ring: 280 100% 70%;
  /* ... sidebar variants also updated ... */
}
```

### Sidebar-Specific Color System

The sidebar has its own color system for independent theming:

```
--sidebar-background
--sidebar-foreground
--sidebar-primary
--sidebar-primary-foreground
--sidebar-accent
--sidebar-accent-foreground
--sidebar-border
--sidebar-ring
```

**File:** `app/globals.css` (lines 32-39, and dark variants 68-75)

---

## Prettier Configuration

**File:** `prettier.config.js`

Prettier enforces consistent code formatting across the project.

### Configuration

```javascript
module.exports = {
  semi: false,                          // No semicolons
  singleQuote: true,                    // Use single quotes
  trailingComma: 'all',                 // Trailing commas in arrays/objects
  printWidth: 80,                       // Line length (enforce readability)
  plugins: ['prettier-plugin-tailwindcss'], // Auto-sort Tailwind classes
}
```

### Key Rules

| Rule            | Value     | Example                               |
| --------------- | --------- | ------------------------------------- |
| **Semicolons**  | Off       | `const x = 5` (not `const x = 5;`)    |
| **Quotes**      | Single    | `'hello'` (not `"hello"`)             |
| **Trailing**    | All       | `[1, 2, 3,]` (not `[1, 2, 3]`)       |
| **Print Width** | 80 chars  | Long lines are wrapped                |

### Usage

**Format all files:**

```bash
npm run prettify
```

Or integrate with your editor (VS Code: `prettier-vscode` extension).

### Tailwind Class Sorting

The `prettier-plugin-tailwindcss` plugin automatically sorts Tailwind classes in a canonical order:

```tsx
// Before (unsorted)
className="text-white bg-blue-500 p-4 rounded"

// After (sorted by Prettier)
className="rounded bg-blue-500 p-4 text-white"
```

**Important:** Do NOT manually adjust Tailwind class order — let Prettier handle it. This ensures consistency across the entire codebase.

---

## ESLint Configuration

**File:** `.eslintrc.js`

ESLint enforces code quality and consistency.

### Extended Configs

```javascript
extends: [
  'next/core-web-vitals',                  // Next.js best practices
  'eslint:recommended',                    // ESLint recommended rules
  'plugin:react/recommended',              // React best practices
  'plugin:@typescript-eslint/recommended', // TypeScript best practices
]
```

### Intentionally Disabled Rules

The following rules are turned **off** to allow flexibility:

```javascript
rules: {
  'no-undef': 'off',                         // Allow undefined variables
  'react/react-in-jsx-scope': 'off',         // JSX doesn't need React imported (Next.js)
  'react/prop-types': 'off',                 // TypeScript handles type checking
  '@typescript-eslint/no-unused-vars': 'off', // Unused vars allowed (dev-friendly)
  '@typescript-eslint/no-explicit-any': 'off', // Explicit `any` types are OK
}
```

### Usage

**Run linter:**

```bash
npm run lint
```

**Fix auto-fixable issues:**

```bash
npm run lint --fix
```

---

## Global Styles

**File:** `app/globals.css`

### Tailwind Directives

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

These inject Tailwind's base styles, component layer, and utility classes.

### CSS Variables Layer

All theme colors are defined in the `@layer base` section (lines 5-40 and 42-76):

```css
@layer base {
  :root {
    /* Light theme colors */
  }
  
  .dark {
    /* Dark theme colors */
  }
}
```

### Global Base Styles

Applied to all elements:

```css
@layer base {
  * {
    @apply border-border;  /* Default border color from --border */
  }
  
  body {
    @apply bg-background text-foreground;  /* Page background & text color */
  }
}
```

### Custom CSS Classes

#### `.translucent-bg` (Glass-Morphism Effect)

Used in components like `VBSidebarTrigger`:

```css
.translucent-bg {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0)
  );
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);        /* Safari support */
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}
```

**Usage:** `className="translucent-bg"`

**Effect:** Frosted glass appearance with background blur and subtle border.

### Alternative Theme File

**File:** `globals-hex.css` (if needed)

Alternate version using hex color codes instead of HSL. Not currently active but available for reference.

---

## shadcn/ui Component Styling

### File Location & Generation

- **Location:** `components/ui/`
- **Generated by:** shadcn CLI (`npx shadcn-ui@latest add <component>`)
- **Do NOT hand-edit** these files directly

### Customization Strategy

Customize shadcn/ui components via:

1. **CSS Variables** (preferred): Modify colors in `app/globals.css`
   - Example: Change `--primary` to update all button primary states

2. **Tailwind Config** (preferred): Adjust `tailwind.config.ts`
   - Example: Modify `borderRadius.lg` to change all component radii

3. **Component Props** (when needed): Override via component instances
   - Example: `<Button className="custom-class">Label</Button>`

**Avoid:** Modifying the shadcn component files directly. Instead, recreate the component via `npx shadcn-ui@latest add <component>` to pull the latest version.

---

## Mobile Responsive Pattern

### Mobile Breakpoint

VoiceBridge uses the **Tailwind `sm:` breakpoint** (640px):

- **Mobile:** < 640px
- **Desktop:** ≥ 640px

### useIsMobile Hook

Detect viewport at runtime (works with SSR):

```typescript
import { useIsMobile } from '@/hooks/use-mobile'

function MyComponent() {
  const isMobile = useIsMobile() // true if < 768px

  return (
    <div>
      {isMobile ? <MobileNav /> : <DesktopNav />}
    </div>
  )
}
```

### Sidebar Responsive Behavior

- **Desktop:** Sidebar visible by default (full width or collapsed)
- **Mobile:** Sidebar hidden by default; user can toggle via `VBSidebarTrigger`

### VBSidebarTrigger Component

`VBSidebarTrigger` is a trigger button visible in two conditions:

1. When the sidebar is **explicitly closed** on desktop
2. On **all mobile viewports** (< 768px)

**Usage:**

```tsx
import { VBSidebarTrigger } from '@/components/custom/vb-sidebar-trigger'

<header>
  <VBSidebarTrigger />
  <h1>Page Title</h1>
</header>
```

### Responsive Tailwind Classes

Use Tailwind breakpoint prefixes for responsive design:

```tsx
// Hide on mobile, show on desktop (sm: = 640px and up)
<div className="hidden sm:block">Desktop content</div>

// Show on mobile, hide on desktop
<div className="sm:hidden">Mobile content</div>

// Responsive padding
<div className="p-4 sm:p-8">Content</div>
```

**Common breakpoints:**
- `sm:` — 640px
- `md:` — 768px
- `lg:` — 1024px
- `xl:` — 1280px

---

## PostCSS Configuration

**File:** `postcss.config.mjs`

PostCSS processes CSS before delivery to the browser.

```javascript
const config = {
  plugins: {
    tailwindcss: {},    // Enable Tailwind CSS processing
    autoprefixer: {},   // Auto-add vendor prefixes (-webkit-, -moz-, etc.)
  },
}

export default config
```

### Role

- Tailwind CSS compilation
- Vendor prefix injection for cross-browser compatibility

### No Manual Configuration Needed

This is automatically handled; no changes required for typical development.

---

## Summary for Agents

When working with VoiceBridge styling:

1. **For colors:** Use Tailwind classes referencing CSS variables (e.g., `bg-primary`, `text-foreground`)
2. **For formatting:** Run `npm run prettify` before committing
3. **For linting:** Run `npm run lint` to catch issues
4. **For new colors:** Add to `globals.css` CSS variables (both light and dark)
5. **For responsive:** Use `useIsMobile()` hook or Tailwind breakpoint prefixes
6. **For shadcn/ui:** Never hand-edit; customize via config or component props
7. **For glass effects:** Use the `.translucent-bg` class for frosted glass UI
8. **For dark mode:** Theme automatically switches when `.dark` class is on `<html>`
