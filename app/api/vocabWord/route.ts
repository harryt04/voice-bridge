import { mongoDBConfig } from '@/lib/mongoClient'
import { handleDatabaseOperation } from '@/utils/mongo-utils'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  return handleDatabaseOperation(
    req,
    mongoDBConfig.collections.vocabWords,
    'GET',
  )
}

export async function POST(req: NextRequest) {
  return handleDatabaseOperation(
    req,
    mongoDBConfig.collections.vocabWords,
    'POST',
  )
}

export async function DELETE(req: NextRequest) {
  return handleDatabaseOperation(
    req,
    mongoDBConfig.collections.vocabWords,
    'DELETE',
  )
}
