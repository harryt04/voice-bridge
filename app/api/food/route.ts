import { mongoDBConfig } from '@/lib/mongo-client'
import { handleDatabaseOperation } from '@/lib/mongo-utils'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  return handleDatabaseOperation(req, mongoDBConfig.collections.foods, 'GET')
}

export async function POST(req: NextRequest) {
  return handleDatabaseOperation(req, mongoDBConfig.collections.foods, 'POST')
}

export async function DELETE(req: NextRequest) {
  return handleDatabaseOperation(req, mongoDBConfig.collections.foods, 'DELETE')
}
