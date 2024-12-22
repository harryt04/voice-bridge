import { getAuth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient, mongoDBConfig } from '@/lib/mongoClient'
import { ObjectId } from 'mongodb'

// Helper to extract `id` from the query
function extractIdFromQuery(req: NextRequest): string | null {
  const url = new URL(req.url)
  return url.searchParams.get('id')
}

// GET, PATCH, DELETE for a specific place
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
    const placesCollection = db.collection(mongoDBConfig.collections.places)

    const place = await placesCollection.findOne({
      _id: new ObjectId(id),
      userId: user.userId,
    })

    if (!place) {
      return NextResponse.json(
        { error: 'Place not found or unauthorized' },
        { status: 404 },
      )
    }

    return NextResponse.json(place, { status: 200 })
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
    const placesCollection = db.collection(mongoDBConfig.collections.places)

    const existingPlace = id
      ? await placesCollection.findOne({
          _id: new ObjectId(id),
          userId: user.userId,
        })
      : false

    const updatedPlace = {
      ...body,
      userId: user.userId,
      updatedAt: new Date(),
    }

    if (!existingPlace) {
      placesCollection.insertOne(updatedPlace)
      return NextResponse.json(
        { success: true, updatedCount: 1, updatedPlace },
        { status: 200 },
      )
    } else {
      const result = await placesCollection.updateOne(
        { _id: new ObjectId(id as string) },
        { $set: updatedPlace },
      )

      return NextResponse.json(
        { success: true, updatedCount: result.modifiedCount, updatedPlace },
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
    const placesCollection = db.collection(mongoDBConfig.collections.places)

    const existingPlace = await placesCollection.findOne({
      _id: new ObjectId(id),
      userId: user.userId,
    })

    if (!existingPlace) {
      return NextResponse.json(
        { error: 'Place not found or unauthorized' },
        { status: 404 },
      )
    }

    const result = await placesCollection.deleteOne({ _id: new ObjectId(id) })

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
