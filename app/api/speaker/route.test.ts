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

describe('/api/speaker', () => {
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

  describe('GET', () => {
    it('returns 401 when unauthenticated', async () => {
      mockGetSession.mockResolvedValue(null)
      const req = new NextRequest(
        `http://localhost/api/speaker?id=${new ObjectId().toString()}`,
      )

      const res = await GET(req)

      expect(res.status).toBe(401)
    })

    it('returns 400 when id is missing', async () => {
      mockGetSession.mockResolvedValue({ user: { id: 'owner-user' } })
      const req = new NextRequest('http://localhost/api/speaker')

      const res = await GET(req)

      expect(res.status).toBe(400)
    })

    it('allows the parent to read their own speaker, even when not a villager', async () => {
      mockGetSession.mockResolvedValue({ user: { id: 'owner-user' } })
      const speakerId = await insertSpeaker({
        parentId: 'owner-user',
        villagerIds: [],
      })
      const req = new NextRequest(
        `http://localhost/api/speaker?id=${speakerId.toString()}`,
      )

      const res = await GET(req)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.name).toBe('Test Speaker')
    })

    it('allows a villager to read the speaker', async () => {
      mockGetSession.mockResolvedValue({ user: { id: 'villager-user' } })
      const speakerId = await insertSpeaker({
        parentId: 'owner-user',
        villagerIds: ['villager-user'],
      })
      const req = new NextRequest(
        `http://localhost/api/speaker?id=${speakerId.toString()}`,
      )

      const res = await GET(req)

      expect(res.status).toBe(200)
    })

    it('blocks a user who is neither parent nor villager', async () => {
      mockGetSession.mockResolvedValue({ user: { id: 'attacker' } })
      const speakerId = await insertSpeaker({ parentId: 'owner-user' })
      const req = new NextRequest(
        `http://localhost/api/speaker?id=${speakerId.toString()}`,
      )

      const res = await GET(req)

      expect(res.status).toBe(404)
    })
  })

  describe('POST', () => {
    it('creates a new speaker owned by the requesting user when no id is given', async () => {
      mockGetSession.mockResolvedValue({ user: { id: 'owner-user' } })
      const req = new NextRequest('http://localhost/api/speaker', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Speaker' }),
      })

      const res = await POST(req)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.updatedSpeaker.parentId).toBe('owner-user')
    })

    it('allows the parent to update their own speaker', async () => {
      mockGetSession.mockResolvedValue({ user: { id: 'owner-user' } })
      const speakerId = await insertSpeaker({ parentId: 'owner-user' })
      const req = new NextRequest(
        `http://localhost/api/speaker?id=${speakerId.toString()}`,
        {
          method: 'POST',
          body: JSON.stringify({ name: 'Renamed Speaker' }),
        },
      )

      const res = await POST(req)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.updatedSpeaker.name).toBe('Renamed Speaker')
    })

    it("blocks updating a speaker the user doesn't own", async () => {
      mockGetSession.mockResolvedValue({ user: { id: 'attacker' } })
      const speakerId = await insertSpeaker({ parentId: 'owner-user' })
      const req = new NextRequest(
        `http://localhost/api/speaker?id=${speakerId.toString()}`,
        {
          method: 'POST',
          body: JSON.stringify({ name: 'Hijacked Speaker' }),
        },
      )

      const res = await POST(req)
      expect(res.status).toBe(404)

      const client = await getMongoClient()
      const db = client.db(mongoDBConfig.dbName)
      const speaker = await db
        .collection(mongoDBConfig.collections.speakers)
        .findOne({ _id: speakerId })
      expect(speaker?.name).toBe('Test Speaker')
    })
  })

  describe('DELETE', () => {
    it('returns 404 when the speaker does not exist', async () => {
      mockGetSession.mockResolvedValue({ user: { id: 'owner-user' } })
      const req = new NextRequest(
        `http://localhost/api/speaker?id=${new ObjectId().toString()}`,
        { method: 'DELETE' },
      )

      const res = await DELETE(req)

      expect(res.status).toBe(404)
    })

    it("blocks deleting a speaker the user doesn't own", async () => {
      mockGetSession.mockResolvedValue({ user: { id: 'attacker' } })
      const speakerId = await insertSpeaker({ parentId: 'owner-user' })
      const req = new NextRequest(
        `http://localhost/api/speaker?id=${speakerId.toString()}`,
        { method: 'DELETE' },
      )

      const res = await DELETE(req)

      expect(res.status).toBe(404)

      const client = await getMongoClient()
      const db = client.db(mongoDBConfig.dbName)
      const speaker = await db
        .collection(mongoDBConfig.collections.speakers)
        .findOne({ _id: speakerId })
      expect(speaker).not.toBeNull()
    })

    it('allows the parent to delete their own speaker', async () => {
      mockGetSession.mockResolvedValue({ user: { id: 'owner-user' } })
      const speakerId = await insertSpeaker({ parentId: 'owner-user' })
      const req = new NextRequest(
        `http://localhost/api/speaker?id=${speakerId.toString()}`,
        { method: 'DELETE' },
      )

      const res = await DELETE(req)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.deletedCount).toBe(1)
    })
  })
})
