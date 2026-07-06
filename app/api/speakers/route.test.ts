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
import { GET } from './route'
import { getMongoClient, mongoDBConfig } from '@/lib/mongo-client'
import { auth } from '@/lib/auth'

describe('/api/speakers', () => {
  let mockGetSession: any

  beforeEach(async () => {
    mockGetSession = vi.mocked(auth.api.getSession)
    mockGetSession.mockReset()

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }),
    )

    const client = await getMongoClient()
    const db = client.db(mongoDBConfig.dbName)
    await db.collection(mongoDBConfig.collections.speakers).deleteMany({})
  })

  it('returns 401 when unauthenticated', async () => {
    mockGetSession.mockResolvedValue(null)
    const req = new NextRequest('http://localhost/api/speakers')

    const res = await GET(req)

    expect(res.status).toBe(401)
  })

  it('creates a default speaker when the user has none', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: 'owner-user', email: 'owner@example.com' },
    })
    const req = new NextRequest('http://localhost/api/speakers')

    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data).toHaveLength(1)
    expect(data[0].name).toBe('Default')

    const client = await getMongoClient()
    const db = client.db(mongoDBConfig.dbName)
    const stored = await db
      .collection(mongoDBConfig.collections.speakers)
      .findOne({ parentId: 'owner-user' })
    expect(stored).not.toBeNull()
  })

  it('returns existing, non-archived speakers the user owns or is a villager of', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: 'owner-user', email: 'owner@example.com' },
    })

    const client = await getMongoClient()
    const db = client.db(mongoDBConfig.dbName)
    await db.collection(mongoDBConfig.collections.speakers).insertMany([
      { name: 'Active Speaker', parentId: 'owner-user', isArchived: false },
      { name: 'Archived Speaker', parentId: 'owner-user', isArchived: true },
      { name: 'Someone Elses', parentId: 'other-user' },
      { name: 'Villager Speaker', villagerIds: ['owner-user'] },
    ])

    const req = new NextRequest('http://localhost/api/speakers')
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    const names = data.map((s: any) => s.name).sort()
    expect(names).toEqual(['Active Speaker', 'Villager Speaker'])
  })
})
