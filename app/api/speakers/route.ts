import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient, mongoDBConfig } from '@/lib/mongo-client'

export async function GET(req: NextRequest) {
  const authData = await auth()
  try {
    if (!authData?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user details from Clerk
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(authData.userId)
    const email = user.emailAddresses?.[0]?.emailAddress

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
              { parentId: authData.userId }, // Condition to match parentId
              { villagerIds: authData.userId }, // Condition to match user.id in villagerIds array
            ],
          },
          { isArchived: { $ne: true } }, // Ensure isArchived is not true
        ],
      })
      .toArray()

    if (speakers.length === 0) {
      const newSpeaker = {
        name: 'Default',
        parentId: authData.userId,
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
