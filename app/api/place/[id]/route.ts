import { getAuth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient, mongoDBConfig } from '@/lib/mongoClient'
import { ObjectId } from 'mongodb'

// GET, PATCH, DELETE for a specific place
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = getAuth(req)
  const { id } = params

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = getAuth(req)
  const { id } = params

  try {
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
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

    const updatedPlace = {
      ...(body.name && { name: body.name }),
      ...(body.location && { location: body.location }),
      updatedAt: new Date(),
    }

    const result = await placesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedPlace },
    )

    return NextResponse.json(
      { success: true, updatedCount: result.modifiedCount },
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = getAuth(req)
  const { id } = params

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
