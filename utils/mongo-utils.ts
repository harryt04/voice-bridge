import { getAuth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient, mongoDBConfig } from '@/lib/mongoClient'
import { ObjectId } from 'mongodb'
import { speakerAuthCheck } from '@/lib/speakerAuthCheck'

export async function handleDatabaseOperation(
  req: NextRequest,
  collectionName: string,
  operation: 'GET' | 'POST' | 'DELETE',
) {
  const user = getAuth(req)
  const id = new URL(req.url).searchParams.get('id')

  if (!user?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (operation !== 'POST' && !id) {
    return NextResponse.json({ error: 'Missing ID' }, { status: 400 })
  }

  speakerAuthCheck(req, id as string)

  try {
    const client = await getMongoClient()
    const db = client.db(mongoDBConfig.dbName)
    const collection = db.collection(collectionName)

    switch (operation) {
      case 'GET': {
        const item = await collection.findOne({ _id: new ObjectId(id!) })
        if (!item) {
          return NextResponse.json({ error: 'Item not found' }, { status: 404 })
        }
        return NextResponse.json(item, { status: 200 })
      }
      case 'POST': {
        const body = await req.json()
        const existingItem = id
          ? await collection.findOne({ _id: new ObjectId(id) })
          : null
        const updatedItem = {
          ...body,
          lastUpdatedBy: user.userId,
          updatedAt: new Date(),
        }

        if (existingItem) {
          delete updatedItem._id
          const result = await collection.updateOne(
            { _id: new ObjectId(id as string) },
            { $set: updatedItem },
          )
          return NextResponse.json({
            success: true,
            modifiedCount: result.modifiedCount,
            updatedItem,
          })
        } else {
          await collection.insertOne(updatedItem)
          return NextResponse.json({ success: true, updatedItem })
        }
      }
      case 'DELETE': {
        const result = await collection.deleteOne({ _id: new ObjectId(id!) })
        return NextResponse.json({
          success: true,
          deletedCount: result.deletedCount,
        })
      }
      default:
        return NextResponse.json(
          { error: 'Invalid operation' },
          { status: 400 },
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
