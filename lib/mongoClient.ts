import { MongoClient } from 'mongodb'

const MONGO_CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING as string

if (!MONGO_CONNECTION_STRING) {
  throw new Error('MONGO_CONNECTION_STRING environment variable is not set.')
}

let client: MongoClient | null = null
let clientPromise: Promise<MongoClient> | null = null

// Singleton pattern to reuse MongoDB client across requests
export async function getMongoClient(): Promise<MongoClient> {
  if (!client) {
    client = new MongoClient(MONGO_CONNECTION_STRING)
    clientPromise = client.connect()
  }
  if (clientPromise) {
    await clientPromise
  }
  return client
}

export const mongoDBConfig = {
  dbName: 'voicebridge',
  collections: {
    activities: 'activities',
    places: 'places',
    speakers: 'speakers',
    foods: 'foods',
    vocabWords: 'vocabWords',
  },
}
