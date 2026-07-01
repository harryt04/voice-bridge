import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// Set env vars before any modules load
process.env.MONGO_CONNECTION_STRING =
  process.env.MONGO_CONNECTION_STRING || 'mongodb://localhost:27017/test'
process.env.BETTER_AUTH_SECRET =
  process.env.BETTER_AUTH_SECRET || 'test-secret-at-least-32-characters-long!'
process.env.BETTER_AUTH_URL =
  process.env.BETTER_AUTH_URL || 'http://localhost:3000/api/auth'
// NODE_ENV is set to 'test' by Vitest automatically; it's also readonly
// per Next.js's type declarations, so it can't be assigned here.

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    globals: true,
    environment: 'node',
    // Route/auth tests share one MongoMemoryServer + db; parallel test files
    // racing deleteMany()/insert against the same collections causes
    // cross-file flakiness (404s from data wiped mid-test by another file).
    // fileParallelism is a root-only option, not overridable per project.
    fileParallelism: false,
    projects: [
      {
        extends: true,
        test: {
          name: 'node',
          environment: 'node',
          include: [
            'app/api/**/*.test.ts',
            'lib/**/*.test.ts',
            'utils/**/*.test.ts',
          ],
          setupFiles: ['./vitest.setup.node.ts'],
          testTimeout: 30000,
          globalSetup: ['./vitest.global-setup.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'jsdom',
          environment: 'jsdom',
          include: ['components/**/*.test.tsx', 'hooks/**/*.test.tsx'],
          setupFiles: ['./vitest.setup.dom.ts'],
        },
      },
    ],
  },
})
