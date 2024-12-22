import { getAuth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient, mongoDBConfig } from '@/lib/mongoClient'
import { Speaker } from '@/models/speaker'

export async function GET(req: NextRequest) {
  const user = getAuth(req)
  try {
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Connect to MongoDB
    const client = await getMongoClient()
    const db = client.db(mongoDBConfig.dbName)
    const speakersCollection = db.collection(mongoDBConfig.collections.speakers)

    // Query the "speakers" collection for documents created by the user
    const speakers = await speakersCollection
      .find({ parentId: user.userId })
      .toArray()

    if (speakers.length === 0) {
      const newSpeaker = {
        name: 'Default',
        parentId: user.userId,
      }
      speakers.push(newSpeaker as any)
      speakersCollection.insertOne(newSpeaker)
    }

    // Return the speakers as JSON
    return NextResponse.json(speakers, { status: 200 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
