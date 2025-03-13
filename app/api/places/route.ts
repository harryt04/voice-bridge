import { NextRequest } from 'next/server'
import { mongoDBConfig } from '@/lib/mongo-client'
import { fetchDataFromCollection } from '@/lib/mongo-utils'

export async function GET(req: NextRequest) {
  return fetchDataFromCollection(req, mongoDBConfig.collections.places)
}
