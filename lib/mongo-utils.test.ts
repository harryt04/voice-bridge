import { describe, it, expect, vi, beforeEach } from 'vitest'

// Set env vars BEFORE any imports
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
import {
  handleDatabaseOperation,
  fetchDataFromCollection,
  speakerAuthCheck,
} from './mongo-utils'
import { getMongoClient, mongoDBConfig } from './mongo-client'
import { auth } from './auth'

const TEST_COLLECTION = 'foods'

describe('lib/mongo-utils', () => {
  let mockGetSession: any

  beforeEach(async () => {
    mockGetSession = vi.mocked(auth.api.getSession)
    mockGetSession.mockReset()

    const client = await getMongoClient()
    const db = client.db(mongoDBConfig.dbName)
    await db.collection(TEST_COLLECTION).deleteMany({})
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

  async function insertItem(speakerId: ObjectId | string, overrides = {}) {
    const client = await getMongoClient()
    const db = client.db(mongoDBConfig.dbName)
    const result = await db.collection(TEST_COLLECTION).insertOne({
      name: 'Apple',
      speakerId: speakerId.toString(),
      ...overrides,
    })
    return result.insertedId
  }

  describe('speakerAuthCheck', () => {
    it('returns a 404 response when the speaker does not exist', async () => {
      mockGetSession.mockResolvedValue({ user: { id: 'owner-user' } })
      const req = new NextRequest('http://localhost/api/test')

      const result = await speakerAuthCheck(req, new ObjectId().toString())

      expect(result).toBeDefined()
      expect(result).toHaveProperty('status', 404)
    })

    it('returns a 404 response when there is no session', async () => {
      mockGetSession.mockResolvedValue(null)
      const speakerId = await insertSpeaker()
      const req = new NextRequest('http://localhost/api/test')

      const result = await speakerAuthCheck(req, speakerId.toString())

      expect(result).toHaveProperty('status', 404)
    })

    it('returns a 404 response when the user is neither parent nor villager', async () => {
      mockGetSession.mockResolvedValue({ user: { id: 'someone-else' } })
      const speakerId = await insertSpeaker({ parentId: 'owner-user' })
      const req = new NextRequest('http://localhost/api/test')

      const result = await speakerAuthCheck(req, speakerId.toString())

      expect(result).toHaveProperty('status', 404)
    })

    it('returns undefined (authorized) when the user is the parent', async () => {
      mockGetSession.mockResolvedValue({ user: { id: 'owner-user' } })
      const speakerId = await insertSpeaker({ parentId: 'owner-user' })
      const req = new NextRequest('http://localhost/api/test')

      const result = await speakerAuthCheck(req, speakerId.toString())

      expect(result).toBeUndefined()
    })

    it('returns undefined (authorized) when the user is a villager', async () => {
      mockGetSession.mockResolvedValue({ user: { id: 'villager-user' } })
      const speakerId = await insertSpeaker({
        parentId: 'owner-user',
        villagerIds: ['villager-user'],
      })
      const req = new NextRequest('http://localhost/api/test')

      const result = await speakerAuthCheck(req, speakerId.toString())

      expect(result).toBeUndefined()
    })
  })

  describe('fetchDataFromCollection', () => {
    it('returns 401 when there is no session', async () => {
      mockGetSession.mockResolvedValue(null)
      const req = new NextRequest(
        'http://localhost/api/test?speakerId=anything',
      )

      const res = await fetchDataFromCollection(req, TEST_COLLECTION)

      expect(res.status).toBe(401)
    })

    it("blocks access to a speaker the user doesn't own", async () => {
      mockGetSession.mockResolvedValue({ user: { id: 'attacker' } })
      const speakerId = await insertSpeaker({ parentId: 'owner-user' })
      await insertItem(speakerId)
      const req = new NextRequest(
        `http://localhost/api/test?speakerId=${speakerId.toString()}`,
      )

      const res = await fetchDataFromCollection(req, TEST_COLLECTION)

      expect(res.status).toBe(404)
    })

    it('returns items scoped to the authorized speaker', async () => {
      mockGetSession.mockResolvedValue({ user: { id: 'owner-user' } })
      const speakerId = await insertSpeaker({ parentId: 'owner-user' })
      await insertItem(speakerId, { name: 'Apple' })
      const otherSpeakerId = await insertSpeaker({ parentId: 'other-user' })
      await insertItem(otherSpeakerId, { name: 'Banana' })

      const req = new NextRequest(
        `http://localhost/api/test?speakerId=${speakerId.toString()}`,
      )
      const res = await fetchDataFromCollection(req, TEST_COLLECTION)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data).toHaveLength(1)
      expect(data[0].name).toBe('Apple')
    })
  })

  describe('handleDatabaseOperation', () => {
    describe('GET', () => {
      it('returns 401 when there is no session', async () => {
        mockGetSession.mockResolvedValue(null)
        const req = new NextRequest(
          `http://localhost/api/test?id=${new ObjectId().toString()}`,
        )

        const res = await handleDatabaseOperation(req, TEST_COLLECTION, 'GET')

        expect(res.status).toBe(401)
      })

      it('returns 400 when id is missing', async () => {
        mockGetSession.mockResolvedValue({ user: { id: 'owner-user' } })
        const req = new NextRequest('http://localhost/api/test')

        const res = await handleDatabaseOperation(req, TEST_COLLECTION, 'GET')

        expect(res.status).toBe(400)
      })

      it('returns 404 when the item does not exist', async () => {
        mockGetSession.mockResolvedValue({ user: { id: 'owner-user' } })
        const req = new NextRequest(
          `http://localhost/api/test?id=${new ObjectId().toString()}`,
        )

        const res = await handleDatabaseOperation(req, TEST_COLLECTION, 'GET')

        expect(res.status).toBe(404)
      })

      it("blocks reading an item that belongs to a speaker the user doesn't own", async () => {
        mockGetSession.mockResolvedValue({ user: { id: 'attacker' } })
        const speakerId = await insertSpeaker({ parentId: 'owner-user' })
        const itemId = await insertItem(speakerId)
        const req = new NextRequest(
          `http://localhost/api/test?id=${itemId.toString()}`,
        )

        const res = await handleDatabaseOperation(req, TEST_COLLECTION, 'GET')

        expect(res.status).toBe(404)
      })

      it('returns the item when the user owns the speaker', async () => {
        mockGetSession.mockResolvedValue({ user: { id: 'owner-user' } })
        const speakerId = await insertSpeaker({ parentId: 'owner-user' })
        const itemId = await insertItem(speakerId, { name: 'Apple' })
        const req = new NextRequest(
          `http://localhost/api/test?id=${itemId.toString()}`,
        )

        const res = await handleDatabaseOperation(req, TEST_COLLECTION, 'GET')
        const data = await res.json()

        expect(res.status).toBe(200)
        expect(data.name).toBe('Apple')
      })
    })

    describe('POST', () => {
      it('creates a new item scoped to the given speakerId', async () => {
        mockGetSession.mockResolvedValue({ user: { id: 'owner-user' } })
        const speakerId = await insertSpeaker({ parentId: 'owner-user' })
        const req = new NextRequest('http://localhost/api/test', {
          method: 'POST',
          body: JSON.stringify({
            name: 'Apple',
            speakerId: speakerId.toString(),
          }),
        })

        const res = await handleDatabaseOperation(req, TEST_COLLECTION, 'POST')
        const data = await res.json()

        expect(res.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.updatedItem.lastUpdatedBy).toBe('owner-user')
      })

      it("blocks creating an item under a speaker the user doesn't own", async () => {
        mockGetSession.mockResolvedValue({ user: { id: 'attacker' } })
        const speakerId = await insertSpeaker({ parentId: 'owner-user' })
        const req = new NextRequest('http://localhost/api/test', {
          method: 'POST',
          body: JSON.stringify({
            name: 'Apple',
            speakerId: speakerId.toString(),
          }),
        })

        const res = await handleDatabaseOperation(req, TEST_COLLECTION, 'POST')

        expect(res.status).toBe(404)
      })

      it('updates an existing item when id is provided', async () => {
        mockGetSession.mockResolvedValue({ user: { id: 'owner-user' } })
        const speakerId = await insertSpeaker({ parentId: 'owner-user' })
        const itemId = await insertItem(speakerId, { name: 'Apple' })
        const req = new NextRequest(
          `http://localhost/api/test?id=${itemId.toString()}`,
          {
            method: 'POST',
            body: JSON.stringify({
              name: 'Green Apple',
              speakerId: speakerId.toString(),
            }),
          },
        )

        const res = await handleDatabaseOperation(req, TEST_COLLECTION, 'POST')
        const data = await res.json()

        expect(res.status).toBe(200)
        expect(data.updatedItem.name).toBe('Green Apple')
      })

      it("blocks updating an item that belongs to a speaker the user doesn't own", async () => {
        mockGetSession.mockResolvedValue({ user: { id: 'attacker' } })
        const speakerId = await insertSpeaker({ parentId: 'owner-user' })
        const itemId = await insertItem(speakerId, { name: 'Apple' })
        const req = new NextRequest(
          `http://localhost/api/test?id=${itemId.toString()}`,
          {
            method: 'POST',
            body: JSON.stringify({
              name: 'Hijacked',
              speakerId: speakerId.toString(),
            }),
          },
        )

        const res = await handleDatabaseOperation(req, TEST_COLLECTION, 'POST')

        expect(res.status).toBe(404)

        const client = await getMongoClient()
        const db = client.db(mongoDBConfig.dbName)
        const item = await db
          .collection(TEST_COLLECTION)
          .findOne({ _id: itemId })
        expect(item?.name).toBe('Apple')
      })
    })

    describe('DELETE', () => {
      it('returns 400 when id is missing', async () => {
        mockGetSession.mockResolvedValue({ user: { id: 'owner-user' } })
        const req = new NextRequest('http://localhost/api/test', {
          method: 'DELETE',
        })

        const res = await handleDatabaseOperation(
          req,
          TEST_COLLECTION,
          'DELETE',
        )

        expect(res.status).toBe(400)
      })

      it('returns 404 when the item does not exist', async () => {
        mockGetSession.mockResolvedValue({ user: { id: 'owner-user' } })
        const req = new NextRequest(
          `http://localhost/api/test?id=${new ObjectId().toString()}`,
          { method: 'DELETE' },
        )

        const res = await handleDatabaseOperation(
          req,
          TEST_COLLECTION,
          'DELETE',
        )

        expect(res.status).toBe(404)
      })

      it("blocks deleting an item that belongs to a speaker the user doesn't own", async () => {
        mockGetSession.mockResolvedValue({ user: { id: 'attacker' } })
        const speakerId = await insertSpeaker({ parentId: 'owner-user' })
        const itemId = await insertItem(speakerId)
        const req = new NextRequest(
          `http://localhost/api/test?id=${itemId.toString()}`,
          { method: 'DELETE' },
        )

        const res = await handleDatabaseOperation(
          req,
          TEST_COLLECTION,
          'DELETE',
        )

        expect(res.status).toBe(404)

        const client = await getMongoClient()
        const db = client.db(mongoDBConfig.dbName)
        const item = await db
          .collection(TEST_COLLECTION)
          .findOne({ _id: itemId })
        expect(item).not.toBeNull()
      })

      it('deletes the item when the user owns the speaker', async () => {
        mockGetSession.mockResolvedValue({ user: { id: 'owner-user' } })
        const speakerId = await insertSpeaker({ parentId: 'owner-user' })
        const itemId = await insertItem(speakerId)
        const req = new NextRequest(
          `http://localhost/api/test?id=${itemId.toString()}`,
          { method: 'DELETE' },
        )

        const res = await handleDatabaseOperation(
          req,
          TEST_COLLECTION,
          'DELETE',
        )
        const data = await res.json()

        expect(res.status).toBe(200)
        expect(data.deletedCount).toBe(1)

        const client = await getMongoClient()
        const db = client.db(mongoDBConfig.dbName)
        const item = await db
          .collection(TEST_COLLECTION)
          .findOne({ _id: itemId })
        expect(item).toBeNull()
      })
    })
  })
})
