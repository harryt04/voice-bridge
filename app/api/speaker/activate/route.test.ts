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
import { POST } from './route'
import { getMongoClient, mongoDBConfig } from '@/lib/mongo-client'
import { auth } from '@/lib/auth'

describe('/api/speaker/activate', () => {
  let mockGetSession: any

  beforeEach(async () => {
    mockGetSession = vi.mocked(auth.api.getSession)
    mockGetSession.mockReset()

    const client = await getMongoClient()
    const db = client.db(mongoDBConfig.dbName)
    await db.collection(mongoDBConfig.collections.speakers).deleteMany({})
  })

  async function insertSpeaker(overrides: Record<string, any> = {}) {
    const client = await getMongoClient()
    const db = client.db(mongoDBConfig.dbName)
    const speakerId = new ObjectId()
    await db.collection(mongoDBConfig.collections.speakers).insertOne({
      _id: speakerId,
      name: 'Test Speaker',
      parentId: 'owner-user',
      villagerIds: [] as string[],
      ...overrides,
    })
    return speakerId
  }

  it('returns 401 when unauthenticated', async () => {
    mockGetSession.mockResolvedValue(null)
    const req = new NextRequest('http://localhost/api/speaker/activate', {
      method: 'POST',
      body: JSON.stringify({ speakerId: new ObjectId().toString() }),
    })

    const res = await POST(req)

    expect(res.status).toBe(401)
  })

  it('returns 404 when the speaker does not exist', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'villager-user' } })
    const req = new NextRequest('http://localhost/api/speaker/activate', {
      method: 'POST',
      body: JSON.stringify({ speakerId: new ObjectId().toString() }),
    })

    const res = await POST(req)

    expect(res.status).toBe(404)
  })

  it('adds the requesting user to villagerIds', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'villager-user' } })
    const speakerId = await insertSpeaker()
    const req = new NextRequest('http://localhost/api/speaker/activate', {
      method: 'POST',
      body: JSON.stringify({ speakerId: speakerId.toString() }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)

    const client = await getMongoClient()
    const db = client.db(mongoDBConfig.dbName)
    const speaker = await db
      .collection(mongoDBConfig.collections.speakers)
      .findOne({ _id: speakerId })
    expect(speaker?.villagerIds).toContain('villager-user')
  })

  it('does not duplicate the user if they activate twice', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'villager-user' } })
    const speakerId = await insertSpeaker({ villagerIds: ['villager-user'] })
    const req = new NextRequest('http://localhost/api/speaker/activate', {
      method: 'POST',
      body: JSON.stringify({ speakerId: speakerId.toString() }),
    })

    await POST(req)

    const client = await getMongoClient()
    const db = client.db(mongoDBConfig.dbName)
    const speaker = await db
      .collection(mongoDBConfig.collections.speakers)
      .findOne({ _id: speakerId })
    expect(
      speaker?.villagerIds.filter((v: string) => v === 'villager-user'),
    ).toHaveLength(1)
  })
})
