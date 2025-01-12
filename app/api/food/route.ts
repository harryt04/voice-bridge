import { getAuth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient, mongoDBConfig } from '@/lib/mongoClient'
import { ObjectId } from 'mongodb'

// Helper to extract `id` from the query
function extractIdFromQuery(req: NextRequest): string | null {
  const url = new URL(req.url)
  return url.searchParams.get('id')
}

// GET, PATCH, DELETE for a specific food
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
    const foodsCollection = db.collection(mongoDBConfig.collections.foods)

    const food = await foodsCollection.findOne({
      _id: new ObjectId(id),
    })

    if (!food) {
      return NextResponse.json(
        { error: 'Food not found or unauthorized' },
        { status: 404 },
      )
    }

    return NextResponse.json(food, { status: 200 })
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
    const foodsCollection = db.collection(mongoDBConfig.collections.foods)

    const existingFood = id
      ? await foodsCollection.findOne({
          _id: new ObjectId(id),
        })
      : false

    const updatedFood = {
      ...body,
      lastUpdatedBy: user.userId,
      updatedAt: new Date(),
    }

    if (!existingFood) {
      foodsCollection.insertOne(updatedFood)
      return NextResponse.json(
        { success: true, updatedCount: 1, updatedItem: updatedFood },
        { status: 200 },
      )
    } else {
      delete updatedFood._id
      const result = await foodsCollection.updateOne(
        { _id: new ObjectId(id as string) },
        { $set: updatedFood },
      )

      return NextResponse.json(
        {
          success: true,
          updatedCount: result.modifiedCount,
          updatedItem: updatedFood,
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
    const foodsCollection = db.collection(mongoDBConfig.collections.foods)

    const existingFood = await foodsCollection.findOne({
      _id: new ObjectId(id),
    })

    if (!existingFood) {
      return NextResponse.json(
        { error: 'Food not found or unauthorized' },
        { status: 404 },
      )
    }

    const result = await foodsCollection.deleteOne({ _id: new ObjectId(id) })

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
