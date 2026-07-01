import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient, mongoDBConfig } from '@/lib/mongo-client'

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  try {
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get email directly from session
    const email = session.user.email

    if (email) {
      fetch('https://harryt.dev/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, usesApps: ['voicebridge'] }),
      }).catch(() => {
        // Ignore errors from this call
      })
    }

    // Connect to MongoDB
    const client = await getMongoClient()
    const db = client.db(mongoDBConfig.dbName)
    const speakersCollection = db.collection(mongoDBConfig.collections.speakers)

    // Query the "speakers" collection for documents created by the user
    const speakers = await speakersCollection
      .find({
        $and: [
          {
            $or: [
              { parentId: session.user.id }, // Condition to match parentId
              { villagerIds: session.user.id }, // Condition to match user.id in villagerIds array
            ],
          },
          { isArchived: { $ne: true } }, // Ensure isArchived is not true
        ],
      })
      .toArray()

    if (speakers.length === 0) {
      const newSpeaker = {
        name: 'Default',
        parentId: session.user.id,
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
