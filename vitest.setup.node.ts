// Env vars (including MONGO_CONNECTION_STRING) are set by vitest.global-setup.ts
// before this file loads. Set fallbacks here only for safety in case globalSetup
// didn't run (e.g. this file imported outside the configured test run).
process.env.BETTER_AUTH_SECRET =
  process.env.BETTER_AUTH_SECRET || 'test-secret-at-least-32-characters-long!'
process.env.BETTER_AUTH_URL =
  process.env.BETTER_AUTH_URL || 'http://localhost:3000/api/auth'
// NODE_ENV is set to 'test' by Vitest automatically; it's also readonly
// per Next.js's type declarations, so it can't be assigned here.
