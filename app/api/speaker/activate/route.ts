import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient, mongoDBConfig } from '@/lib/mongo-client'
import { ObjectId } from 'mongodb'

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  const { speakerId } = await req.json()
  try {
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Connect to MongoDB
    const client = await getMongoClient()
    const db = client.db(mongoDBConfig.dbName)
    const speakersCollection = db.collection(mongoDBConfig.collections.speakers)

    const existingSpeaker = await speakersCollection.findOne({
      _id: new ObjectId(speakerId),
    })

    if (!existingSpeaker) {
      return NextResponse.json(
        { error: 'Speaker not found or unauthorized' },
        { status: 404 },
      )
    }

    const result = await speakersCollection.updateOne(
      { _id: new ObjectId(speakerId) },
      {
        $addToSet: { villagerIds: session.user.id },
      },
    )

    // Return the places as JSON
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
