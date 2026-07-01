import { describe, it, expect, vi, beforeEach } from 'vitest'

// Set env vars BEFORE any imports
process.env.MONGO_CONNECTION_STRING =
  process.env.MONGO_CONNECTION_STRING || 'mongodb://localhost:27017/test'
process.env.BETTER_AUTH_SECRET =
  process.env.BETTER_AUTH_SECRET || 'test-secret-at-least-32-characters-long!'
process.env.BETTER_AUTH_URL =
  process.env.BETTER_AUTH_URL || 'http://localhost:3000/api/auth'
// NODE_ENV is set to 'test' by Vitest automatically; it's also readonly
// per Next.js's type declarations, so it can't be assigned here.

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}))

import { NextRequest } from 'next/server'
import { isValidObjectId, aacMutationAuthCheck } from './aac-auth'
import { getMongoClient, mongoDBConfig } from '@/lib/mongo-client'
import { ObjectId } from 'mongodb'

import { auth } from '@/lib/auth'

describe('isValidObjectId', () => {
  it('validates a valid ObjectId', () => {
    const validId = new ObjectId().toString()
    expect(isValidObjectId(validId)).toBe(true)
  })

  it('rejects an invalid ObjectId', () => {
    expect(isValidObjectId('not-an-id')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isValidObjectId('')).toBe(false)
  })

  it('rejects null', () => {
    expect(isValidObjectId(null as any)).toBe(false)
  })
})

describe('aacMutationAuthCheck', () => {
  let mockGetSession: any

  beforeEach(() => {
    mockGetSession = vi.mocked(auth.api.getSession)
    mockGetSession.mockClear()
  })

  it('returns 401 when no session exists', async () => {
    mockGetSession.mockResolvedValue(null)

    const req = new NextRequest('http://localhost/api/test')
    const result = await aacMutationAuthCheck(req, 'speaker123')

    expect(result).toHaveProperty('status', 401)
    expect(mockGetSession).toHaveBeenCalled()
  })

  it('returns 400 when speakerId format is invalid', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user123' } })

    const req = new NextRequest('http://localhost/api/test')
    const result = await aacMutationAuthCheck(req, 'invalid-id')

    expect(result).toHaveProperty('status', 400)
  })

  it('returns 404 when speaker not found', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user123' } })
    const client = await getMongoClient()
    const db = client.db(mongoDBConfig.dbName)
    const speakersCollection = db.collection(mongoDBConfig.collections.speakers)
    await speakersCollection.deleteMany({})

    const validId = new ObjectId().toString()
    const req = new NextRequest('http://localhost/api/test')
    const result = await aacMutationAuthCheck(req, validId)

    expect(result).toHaveProperty('status', 404)
  })

  it('returns 403 when user is not parent of speaker', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user123' } })
    const client = await getMongoClient()
    const db = client.db(mongoDBConfig.dbName)
    const speakersCollection = db.collection(mongoDBConfig.collections.speakers)
    await speakersCollection.deleteMany({})

    const speakerId = new ObjectId()
    await speakersCollection.insertOne({
      _id: speakerId,
      name: 'Test Speaker',
      parentId: 'different-user',
    })

    const req = new NextRequest('http://localhost/api/test')
    const result = await aacMutationAuthCheck(req, speakerId.toString())

    expect(result).toHaveProperty('status', 403)
  })

  it('returns {userId} when authorization succeeds', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user123' } })
    const client = await getMongoClient()
    const db = client.db(mongoDBConfig.dbName)
    const speakersCollection = db.collection(mongoDBConfig.collections.speakers)
    await speakersCollection.deleteMany({})

    const speakerId = new ObjectId()
    await speakersCollection.insertOne({
      _id: speakerId,
      name: 'Test Speaker',
      parentId: 'user123',
    })

    const req = new NextRequest('http://localhost/api/test')
    const result = await aacMutationAuthCheck(req, speakerId.toString())

    expect(result).toEqual({ userId: 'user123' })
  })

  it('checks format before querying database', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user123' } })

    const req = new NextRequest('http://localhost/api/test')
    const result = await aacMutationAuthCheck(req, 'bad-format')

    expect(result).toHaveProperty('status', 400)
  })
})
