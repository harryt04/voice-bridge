import { NextRequest } from 'next/server'
import { mongoDBConfig } from '@/lib/mongoClient'
import { fetchDataFromCollection } from '@/utils/mongo-utils'

export async function GET(req: NextRequest) {
  return fetchDataFromCollection(req, mongoDBConfig.collections.places)
}
