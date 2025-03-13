import { getAuth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient, mongoDBConfig } from './mongo-client'
import { ObjectId } from 'mongodb'
import { extractParamFromUrl } from './utils'
import { Speaker } from '../models'

/**
 * Handles database operations for a specified collection.
 *
 * @param req - The incoming request object.
 * @param collectionName - The name of the MongoDB collection to operate on.
 * @param operation - The type of operation to perform ('GET', 'POST', 'DELETE').
 * @returns A promise that resolves to a NextResponse object containing the result of the operation.
 *
 * @throws Will return a 401 response if the user is not authenticated.
 * @throws Will return a 400 response if the ID is missing for non-POST operations.
 * @throws Will return a 404 response if the item is not found for GET operations.
 * @throws Will return a 500 response if there is an internal server error.
 */
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

/**
 * Fetches data from a specified MongoDB collection based on the speakerId extracted from the request URL.
 *
 * @param req - The incoming Next.js request object.
 * @param collectionName - The name of the MongoDB collection to fetch data from.
 * @returns A JSON response containing the fetched data or an error message.
 *
 * @throws Will return a 401 status code if the user is not authenticated.
 * @throws Will return a 500 status code if there is an error fetching data from the collection.
 */
export async function fetchDataFromCollection(
  req: NextRequest,
  collectionName: string,
) {
  const user = getAuth(req)
  const speakerId = extractParamFromUrl(req, 'speakerId')

  if (!user?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Connect to MongoDB
    const client = await getMongoClient()
    const db = client.db(mongoDBConfig.dbName)
    const collection = db.collection(collectionName)

    speakerAuthCheck(req, speakerId as string)

    // Fetch data from the specified collection
    const data = await collection.find({ speakerId: speakerId }).toArray()

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error(
      `Error fetching data from collection ${collectionName}:`,
      error,
    )
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

/**
 * Checks if the authenticated user has access to the specified speaker.
 *
 * @param req - The incoming request object.
 * @param speakerId - The ID of the speaker to check authorization for.
 * @returns A JSON response indicating whether the speaker was found and if the user is authorized.
 *
 * The function performs the following steps:
 * 1. Retrieves the authenticated user from the request.
 * 2. Connects to the MongoDB client and accesses the speakers collection.
 * 3. Finds the speaker by the provided speaker ID.
 * 4. Checks if the speaker exists and if the authenticated user is either the parent of the speaker or a villager associated with the speaker.
 * 5. Returns a JSON response with an error message and a 404 status if the speaker is not found or the user is not authorized.
 */
export const speakerAuthCheck = async (req: NextRequest, speakerId: string) => {
  const user = getAuth(req)

  const client = await getMongoClient()
  const db = client.db(mongoDBConfig.dbName)
  const speakersCollection = db.collection(mongoDBConfig.collections.speakers)

  const speaker = (await speakersCollection.findOne({
    _id: new ObjectId(speakerId as string),
  })) as any as Speaker

  if (
    !speaker ||
    !user?.userId ||
    (speaker.parentId !== user.userId &&
      !speaker.villagerIds?.includes(user.userId))
  ) {
    return NextResponse.json(
      { error: 'Speaker not found or unauthorized' },
      { status: 404 },
    )
  }
}

/**
 * Creates necessary indexes for the MongoDB collections.
 */
export async function createMongoDbIndexes(dbName: string) {
  console.log(`Ensuring indexes for db: ${dbName} ...`)
  const client = await getMongoClient()
  const db = client.db(dbName)

  const coll = mongoDBConfig.collections

  const collectionNames = (await db.listCollections().toArray()).map(
    (c) => c.name,
  )

  async function ensureIndex(collectionName: string, indexes: any[]) {
    if (!collectionNames.includes(collectionName)) {
      console.log(
        `Collection "${collectionName}" does not exist. Creating it...`,
      )
      await db.createCollection(collectionName)
    }
    await db.collection(collectionName).createIndexes(indexes)
  }

  await ensureIndex(coll.activities, [{ key: { speakerId: 1 } }])
  await ensureIndex(coll.foods, [{ key: { speakerId: 1 } }])
  await ensureIndex(coll.places, [{ key: { speakerId: 1 } }])
  await ensureIndex(coll.speakers, [
    { key: { isArchived: 1 } },
    { key: { parentId: 1 } },
    { key: { villagerIds: 1 } },
  ])
  await ensureIndex(coll.villagers, [
    { key: { villagerId: 1 } },
    { key: { speakerId: 1 } },
  ])
  await ensureIndex(coll.vocabWords, [{ key: { speakerId: 1 } }])

  console.log('Indexes ensured successfully for db: ', dbName)
}
