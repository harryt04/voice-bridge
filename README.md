# VoiceBridge

VoiceBridge is a free and open source web app that helps children or adults with autism communicate by offering visual tools for daily activities, including navigating places, choosing food, and accessing calming music playlists.

## Tech Stack

- **Frontend**: [React 18](https://react.dev), TypeScript, [Tailwind CSS 3.4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com)
- **Backend**: [Next.js 16](https://nextjs.org) (App Router), [better-auth](https://www.better-auth.com)
- **Database**: [MongoDB](https://www.mongodb.com) (direct driver, no ORM)
- **State Management**: [TanStack React Query](https://tanstack.com/query), React Context
- **Forms**: [react-hook-form](https://react-hook-form.com), [Zod](https://zod.dev)
- **Analytics**: [PostHog](https://posthog.com)
- **UI Kit**: [shadcn/ui](https://ui.shadcn.com), [Lucide Icons](https://lucide.dev)
- **Hosting**: [Coolify](https://coolify.io/docs) (self-hosted)

## Documentation

For comprehensive codebase documentation, refer to:
- **[`/docs/index.md`](docs/index.md)** — Main documentation hub (start here)
- **[`CODEBASE_MAP.md`](CODEBASE_MAP.md)** — Quick navigation and overview
- **[`AGENTS.md`](AGENTS.md)** — Detailed coding guidelines, conventions, and patterns

The `/docs/` directory contains 11 comprehensive markdown files covering architecture, API endpoints, components, hooks, database patterns, authentication, styling, and conventions.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB instance (local or cloud)
- Google OAuth credentials (for authentication)

### Clone and Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/harryt04/voice-bridge.git
   cd voice-bridge
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.sample .env.local
   ```
   Then edit `.env.local` with your actual values:
   - `NEXT_PUBLIC_POSTHOG_KEY` — PostHog analytics key
   - `NEXT_PUBLIC_POSTHOG_HOST` — PostHog host URL
   - `BETTER_AUTH_SECRET` — Random string (min 32 chars) for better-auth
   - `BETTER_AUTH_URL` — Server-side auth base URL (e.g., `http://localhost:3000`)
   - `NEXT_PUBLIC_BETTER_AUTH_URL` — Client-side auth base URL (same as above)
   - `GOOGLE_CLIENT_ID` — Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET` — Google OAuth client secret
   - `NEXT_PUBLIC_APP_URL` — Public app URL (e.g., `http://localhost:3000`)
   - `MONGO_CONNECTION_STRING` — MongoDB connection URI

4. **Create MongoDB indexes** (optional but recommended):
   ```bash
   npx gulp create-indexes
   ```
   Note: If gulp is not found, install it globally first: `npm install -g gulp`

5. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development Commands

```bash
npm run dev          # Start development server (next dev)
npm run build        # Production build (also serves as type checker)
npm run start        # Start production server
npm run lint         # Run ESLint
npm run prettify     # Format all files with Prettier
npx gulp create-indexes  # Create MongoDB indexes
```

## Contributing

We welcome contributions! Whether you're fixing bugs, adding features, or improving documentation, please follow these steps:

### 1. Create a Feature Branch

```bash
# Update main branch
git checkout master
git pull origin master

# Create a new branch for your work
git checkout -b feature/your-feature-name
# or for bug fixes:
git checkout -b fix/bug-description
```

Use descriptive branch names (e.g., `feature/add-dark-mode`, `fix/speaker-deletion-bug`).

### 2. Make Your Changes

- Follow the coding conventions in [AGENTS.md](AGENTS.md):
  - Use `kebab-case` for file names
  - Use `PascalCase` for React components
  - Use `use-` prefix for custom hooks
  - Follow the naming conventions table in [AGENTS.md](AGENTS.md#naming-conventions)
- Ensure code is properly formatted with `npm run prettify`
- Check for linting errors with `npm run lint`
- Update documentation in `/docs/` if your changes affect existing functionality

### 3. Test Your Changes

```bash
npm run build        # Catches TypeScript errors
npm run lint         # Checks for ESLint violations
npm run dev          # Test locally in browser
```

**Before opening a PR**, format your changes and run the complete validation suite:

```bash
npm run prep          # Formats your changes with Prettier (prettier --write .)
npm run ci             # Runs all checks: format check, lint, build, and test
```

`npm run ci` is non-mutating and is the same command GitHub Actions runs on every
pull request into `master`, so a clean local run means the PR check will pass too.

### 4. Commit Your Work

We loosely follow conventional commits:
```bash
git add .
git commit -m "fix: resolve speaker deletion crash"
# or
git commit -m "feat: add dark mode toggle"
# or
git commit -m "docs: update API route specifications"
```

Common prefixes:
- `fix:` — Bug fixes
- `feat:` — New features
- `docs:` — Documentation updates
- `refactor:` — Code restructuring (no behavior change)
- `chore:` — Dependency updates, tooling changes

### 5. Push and Open a Pull Request

```bash
git push origin feature/your-feature-name
```

Then:
1. Visit the repository on GitHub
2. You'll see a prompt to create a Pull Request for your branch
3. Fill in the PR title and description:
   - **Title**: Keep it concise (under 70 characters)
   - **Description**: Explain what changed and why. Reference any related issues.
4. Click "Create Pull Request"

### PR Checklist

Before submitting your PR, ensure:
- [ ] Code is formatted (`npm run prettify`)
- [ ] No linting errors (`npm run lint`)
- [ ] TypeScript compiles (`npm run build`)
- [ ] Changes follow coding conventions in [AGENTS.md](AGENTS.md)
- [ ] Documentation is updated if needed
- [ ] Related issues are referenced in the PR description

## Self-Hosting

### Basic Setup

1. Supply values for the environment variables (see `.env.sample`)
2. Deploy to your hosting provider:
   - **Recommended**: [Coolify](https://coolify.io/docs) (self-hosted Vercel alternative)
   - **Alternative**: [Vercel](https://vercel.com/new) (easiest if new to Next.js)

### MongoDB Setup

1. Set your `MONGO_CONNECTION_STRING` in `.env.local`
2. Create indexes in your MongoDB instance:
   ```bash
   npx gulp create-indexes
   ```

## Code Style

- **No semicolons**, single quotes, trailing commas enforced via Prettier
- **80-character line width** for readability
- **Path aliases**: Use `@/*` for all internal imports (maps to project root)
- **TypeScript strict mode enabled** with optional implicit `any` allowed
- **Server Components** by default, `'use client'` for client components

See [AGENTS.md](AGENTS.md) for comprehensive style and naming guidelines.

## License

VoiceBridge is free and open source. Check the LICENSE file for details.
