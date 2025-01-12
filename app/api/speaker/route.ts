import { getAuth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient, mongoDBConfig } from '@/lib/mongoClient'
import { ObjectId } from 'mongodb'

// Helper to extract `id` from the query
function extractIdFromQuery(req: NextRequest): string | null {
  const url = new URL(req.url)
  return url.searchParams.get('id')
}

// GET, PATCH, DELETE for a specific speaker
export async function GET(req: NextRequest) {
  const user = getAuth(req)
  const id = extractIdFromQuery(req)

  if (!id) {
    return NextResponse.json({ error: 'Missing ID' }, { status: 400 })
  }

  try {
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await getMongoClient()
    const db = client.db(mongoDBConfig.dbName)
    const speakersCollection = db.collection(mongoDBConfig.collections.speakers)

    const speaker = await speakersCollection.findOne({
      _id: new ObjectId(id),
    })

    if (
      !speaker ||
      !speaker.villagerIds.includes(user.userId) ||
      speaker.parentId !== user.userId
    ) {
      return NextResponse.json(
        { error: 'Speaker not found or unauthorized' },
        { status: 404 },
      )
    }

    return NextResponse.json(speaker, { status: 200 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  const user = getAuth(req)
  const id = extractIdFromQuery(req)

  try {
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const client = await getMongoClient()
    const db = client.db(mongoDBConfig.dbName)
    const speakersCollection = db.collection(mongoDBConfig.collections.speakers)

    const existingSpeaker = id
      ? await speakersCollection.findOne({
          _id: new ObjectId(id),
        })
      : undefined

    const updatedSpeaker = {
      parentId: existingSpeaker?.parentId ?? user.userId,
      ...body,
      lastUpdatedBy: user.userId,
      updatedAt: new Date(),
    }
    console.log('updatedSpeaker: ', updatedSpeaker)
    console.log('existingSpeaker: ', existingSpeaker)

    if (!existingSpeaker) {
      speakersCollection.insertOne(updatedSpeaker)
      return NextResponse.json(
        { success: true, updatedCount: 1, updatedSpeaker },
        { status: 200 },
      )
    } else {
      delete updatedSpeaker._id
      const result = await speakersCollection.updateOne(
        { _id: existingSpeaker._id },
        { $set: updatedSpeaker },
      )

      return NextResponse.json(
        {
          success: true,
          updatedCount: result.modifiedCount,
          updatedSpeaker: { ...updatedSpeaker, _id: existingSpeaker._id },
        },
        { status: 200 },
      )
    }
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

export async function DELETE(req: NextRequest) {
  const user = getAuth(req)
  const id = extractIdFromQuery(req)

  if (!id) {
    return NextResponse.json({ error: 'Missing ID' }, { status: 400 })
  }

  try {
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await getMongoClient()
    const db = client.db(mongoDBConfig.dbName)
    const speakersCollection = db.collection(mongoDBConfig.collections.speakers)

    const existingSpeaker = await speakersCollection.findOne({
      _id: new ObjectId(id),
    })

    if (!existingSpeaker) {
      return NextResponse.json(
        { error: 'Speaker not found or unauthorized' },
        { status: 404 },
      )
    }

    const result = await speakersCollection.deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json(
      { success: true, deletedCount: result.deletedCount },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
