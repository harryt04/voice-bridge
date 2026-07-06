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

describe('/api/place', () => {
  let mockGetSession: any

  beforeEach(async () => {
    mockGetSession = vi.mocked(auth.api.getSession)
    mockGetSession.mockReset()

    const client = await getMongoClient()
    const db = client.db(mongoDBConfig.dbName)
    await db.collection(mongoDBConfig.collections.places).deleteMany({})
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

  async function insertPlace(speakerId: ObjectId | string, overrides = {}) {
    const client = await getMongoClient()
    const db = client.db(mongoDBConfig.dbName)
    const result = await db
      .collection(mongoDBConfig.collections.places)
      .insertOne({
        name: 'Park',
        speakerId: speakerId.toString(),
        ...overrides,
      })
    return result.insertedId
  }

  describe('GET', () => {
    it('returns 401 when unauthenticated', async () => {
      mockGetSession.mockResolvedValue(null)
      const req = new NextRequest(
        `http://localhost/api/place?id=${new ObjectId().toString()}`,
      )

      const res = await GET(req)

      expect(res.status).toBe(401)
    })

    it('returns 404 when the place does not exist', async () => {
      mockGetSession.mockResolvedValue({ user: { id: 'owner-user' } })
      const req = new NextRequest(
        `http://localhost/api/place?id=${new ObjectId().toString()}`,
      )

      const res = await GET(req)

      expect(res.status).toBe(404)
    })

    it("blocks reading a place that belongs to a speaker the user doesn't own", async () => {
      mockGetSession.mockResolvedValue({ user: { id: 'attacker' } })
      const speakerId = await insertSpeaker()
      const placeId = await insertPlace(speakerId)
      const req = new NextRequest(
        `http://localhost/api/place?id=${placeId.toString()}`,
      )

      const res = await GET(req)

      expect(res.status).toBe(404)
    })

    it('returns the place when the user owns the speaker', async () => {
      mockGetSession.mockResolvedValue({ user: { id: 'owner-user' } })
      const speakerId = await insertSpeaker()
      const placeId = await insertPlace(speakerId, { name: 'Park' })
      const req = new NextRequest(
        `http://localhost/api/place?id=${placeId.toString()}`,
      )

      const res = await GET(req)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.name).toBe('Park')
    })
  })

  describe('POST', () => {
    it('creates a new place scoped to the given speakerId', async () => {
      mockGetSession.mockResolvedValue({ user: { id: 'owner-user' } })
      const speakerId = await insertSpeaker()
      const req = new NextRequest('http://localhost/api/place', {
        method: 'POST',
        body: JSON.stringify({ name: 'Zoo', speakerId: speakerId.toString() }),
      })

      const res = await POST(req)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.updatedPlace.name).toBe('Zoo')
    })

    it("blocks creating a place under a speaker the user doesn't own", async () => {
      mockGetSession.mockResolvedValue({ user: { id: 'attacker' } })
      const speakerId = await insertSpeaker()
      const req = new NextRequest('http://localhost/api/place', {
        method: 'POST',
        body: JSON.stringify({ name: 'Zoo', speakerId: speakerId.toString() }),
      })

      const res = await POST(req)

      expect(res.status).toBe(404)
    })

    it('allows updating an existing place the user owns', async () => {
      mockGetSession.mockResolvedValue({ user: { id: 'owner-user' } })
      const speakerId = await insertSpeaker()
      const placeId = await insertPlace(speakerId, { name: 'Park' })
      const req = new NextRequest(
        `http://localhost/api/place?id=${placeId.toString()}`,
        {
          method: 'POST',
          body: JSON.stringify({
            name: 'Big Park',
            speakerId: speakerId.toString(),
          }),
        },
      )

      const res = await POST(req)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.updatedPlace.name).toBe('Big Park')
    })

    it("blocks updating a place that belongs to a speaker the user doesn't own", async () => {
      mockGetSession.mockResolvedValue({ user: { id: 'attacker' } })
      const speakerId = await insertSpeaker()
      const placeId = await insertPlace(speakerId, { name: 'Park' })
      const req = new NextRequest(
        `http://localhost/api/place?id=${placeId.toString()}`,
        {
          method: 'POST',
          body: JSON.stringify({
            name: 'Hijacked',
            speakerId: speakerId.toString(),
          }),
        },
      )

      const res = await POST(req)

      expect(res.status).toBe(404)

      const client = await getMongoClient()
      const db = client.db(mongoDBConfig.dbName)
      const place = await db
        .collection(mongoDBConfig.collections.places)
        .findOne({ _id: placeId })
      expect(place?.name).toBe('Park')
    })
  })

  describe('DELETE', () => {
    it('returns 404 when the place does not exist', async () => {
      mockGetSession.mockResolvedValue({ user: { id: 'owner-user' } })
      const req = new NextRequest(
        `http://localhost/api/place?id=${new ObjectId().toString()}`,
        { method: 'DELETE' },
      )

      const res = await DELETE(req)

      expect(res.status).toBe(404)
    })

    it("blocks deleting a place that belongs to a speaker the user doesn't own", async () => {
      mockGetSession.mockResolvedValue({ user: { id: 'attacker' } })
      const speakerId = await insertSpeaker()
      const placeId = await insertPlace(speakerId)
      const req = new NextRequest(
        `http://localhost/api/place?id=${placeId.toString()}`,
        { method: 'DELETE' },
      )

      const res = await DELETE(req)

      expect(res.status).toBe(404)

      const client = await getMongoClient()
      const db = client.db(mongoDBConfig.dbName)
      const place = await db
        .collection(mongoDBConfig.collections.places)
        .findOne({ _id: placeId })
      expect(place).not.toBeNull()
    })

    it('deletes the place when the user owns the speaker', async () => {
      mockGetSession.mockResolvedValue({ user: { id: 'owner-user' } })
      const speakerId = await insertSpeaker()
      const placeId = await insertPlace(speakerId)
      const req = new NextRequest(
        `http://localhost/api/place?id=${placeId.toString()}`,
        { method: 'DELETE' },
      )

      const res = await DELETE(req)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.deletedCount).toBe(1)
    })
  })
})
