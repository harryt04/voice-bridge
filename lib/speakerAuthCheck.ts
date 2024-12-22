import { ObjectId } from 'mongodb'
import { getMongoClient, mongoDBConfig } from './mongoClient'
import { Speaker } from '@/models'
import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'

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
