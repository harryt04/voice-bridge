import { betterAuth } from 'better-auth'
import { mongodbAdapter } from 'better-auth/adapters/mongodb'
import { MongoClient } from 'mongodb'

// better-auth@1.6.23 installed on 2026-07-01
// MongoDB adapter creates the following collections:
// - users: User accounts with email/password or OAuth profiles
// - sessions: Active session tokens with expiration
// - accounts: OAuth provider account links
// - verificationTokens: Email verification and password reset tokens

const MONGO_CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING

if (!MONGO_CONNECTION_STRING) {
  throw new Error('MONGO_CONNECTION_STRING environment variable is not set.')
}

// Create a MongoDB client connection (non-async, will connect on first use)
const mongoClient = new MongoClient(MONGO_CONNECTION_STRING)
const db = mongoClient.db(`voicebridge-${process.env.NODE_ENV}`)

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    // Enable transactions when client is available for better consistency
    client: mongoClient,
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
})
