import { MongoMemoryServer } from 'mongodb-memory-server'

let mongoServer: MongoMemoryServer

export async function setup() {
  // Set env vars first before any module loads
  process.env.BETTER_AUTH_SECRET =
    process.env.BETTER_AUTH_SECRET || 'test-secret-at-least-32-characters-long!'
  process.env.BETTER_AUTH_URL =
    process.env.BETTER_AUTH_URL || 'http://localhost:3000/api/auth'
  // NODE_ENV is set to 'test' by Vitest automatically; it's also readonly
  // per Next.js's type declarations, so it can't be assigned here.

  mongoServer = await MongoMemoryServer.create()
  const mongoUri = mongoServer.getUri()
  process.env.MONGO_CONNECTION_STRING = mongoUri
  console.log(`MongoDB Memory Server started: ${mongoUri}`)
}

export async function teardown() {
  if (mongoServer) {
    await mongoServer.stop()
    console.log('MongoDB Memory Server stopped')
  }
}
