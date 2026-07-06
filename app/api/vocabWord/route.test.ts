import { describe, it, expect, vi, beforeEach } from 'vitest'

process.env.MONGO_CONNECTION_STRING =
  process.env.MONGO_CONNECTION_STRING || 'mongodb://localhost:27017/test'
process.env.BETTER_AUTH_SECRET =
  process.env.BETTER_AUTH_SECRET || 'test-secret-at-least-32-characters-long!'
process.env.BETTER_AUTH_URL =
  process.env.BETTER_AUTH_URL || 'http://localhost:3000/api/auth'

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}))

import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { GET, POST, DELETE } from './route'
import { getMongoClient, mongoDBConfig } from '@/lib/mongo-client'
import { auth } from '@/lib/auth'

describe('/api/vocabWord', () => {
  let mockGetSession: any

  beforeEach(async () => {
    mockGetSession = vi.mocked(auth.api.getSession)
    mockGetSession.mockReset()

    const client = await getMongoClient()
    const db = client.db(mongoDBConfig.dbName)
    await db.collection(mongoDBConfig.collections.vocabWords).deleteMany({})
    await db.collection(mongoDBConfig.collections.speakers).deleteMany({})
  })

  async function insertSpeaker() {
    const client = await getMongoClient()
    const db = client.db(mongoDBConfig.dbName)
    const speakerId = new ObjectId()
    await db.collection(mongoDBConfig.collections.speakers).insertOne({
      _id: speakerId,
      name: 'Test Speaker',
      parentId: 'owner-user',
      villagerIds: [] as string[],
    })
    return speakerId
  }

  it('GET returns 401 when unauthenticated', async () => {
    mockGetSession.mockResolvedValue(null)
    const req = new NextRequest(
      `http://localhost/api/vocabWord?id=${new ObjectId().toString()}`,
    )

    const res = await GET(req)

    expect(res.status).toBe(401)
  })

  it('creates, reads, and deletes a vocab word scoped to the collection', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'owner-user' } })
    const speakerId = await insertSpeaker()

    const createReq = new NextRequest('http://localhost/api/vocabWord', {
      method: 'POST',
      body: JSON.stringify({
        word: 'hello',
        speakerId: speakerId.toString(),
      }),
    })
    const createRes = await POST(createReq)
    expect(createRes.status).toBe(200)

    const client = await getMongoClient()
    const db = client.db(mongoDBConfig.dbName)
    const inserted = await db
      .collection(mongoDBConfig.collections.vocabWords)
      .findOne({ speakerId: speakerId.toString() })
    expect(inserted).not.toBeNull()

    const getReq = new NextRequest(
      `http://localhost/api/vocabWord?id=${inserted!._id.toString()}`,
    )
    const getRes = await GET(getReq)
    expect(getRes.status).toBe(200)
    const fetched = await getRes.json()
    expect(fetched.word).toBe('hello')

    const deleteReq = new NextRequest(
      `http://localhost/api/vocabWord?id=${inserted!._id.toString()}`,
      { method: 'DELETE' },
    )
    const deleteRes = await DELETE(deleteReq)
    expect(deleteRes.status).toBe(200)

    const afterDelete = await db
      .collection(mongoDBConfig.collections.vocabWords)
      .findOne({ _id: inserted!._id })
    expect(afterDelete).toBeNull()
  })
})
