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
import { GET } from './route'
import { getMongoClient, mongoDBConfig } from '@/lib/mongo-client'
import { auth } from '@/lib/auth'

describe('/api/villagers', () => {
  let mockGetSession: any

  beforeEach(async () => {
    mockGetSession = vi.mocked(auth.api.getSession)
    mockGetSession.mockReset()

    const client = await getMongoClient()
    const db = client.db(mongoDBConfig.dbName)
    await db.collection(mongoDBConfig.collections.villagers).deleteMany({})
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
    const req = new NextRequest('http://localhost/api/villagers?speakerId=x')

    const res = await GET(req)

    expect(res.status).toBe(401)
  })

  it('returns only villagers belonging to the requested speaker', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'owner-user' } })
    const speakerId = await insertSpeaker()
    const otherSpeakerId = await insertSpeaker({ parentId: 'other-user' })

    const client = await getMongoClient()
    const db = client.db(mongoDBConfig.dbName)
    await db.collection(mongoDBConfig.collections.villagers).insertMany([
      { name: 'Grandma', speakerId: speakerId.toString() },
      { name: 'Uncle Bob', speakerId: otherSpeakerId.toString() },
    ])

    const req = new NextRequest(
      `http://localhost/api/villagers?speakerId=${speakerId.toString()}`,
    )
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data).toHaveLength(1)
    expect(data[0].name).toBe('Grandma')
  })

  it("blocks listing villagers for a speaker the user doesn't own", async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'attacker' } })
    const speakerId = await insertSpeaker()

    const req = new NextRequest(
      `http://localhost/api/villagers?speakerId=${speakerId.toString()}`,
    )
    const res = await GET(req)

    expect(res.status).toBe(404)
  })
})
