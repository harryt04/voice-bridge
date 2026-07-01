import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

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
import { GET } from './route'
import { getMongoClient, mongoDBConfig } from '@/lib/mongo-client'
import { ObjectId } from 'mongodb'

import { auth } from '@/lib/auth'

describe('GET /api/aac/phrases', () => {
  let mockGetSession: any
  let client: any

  beforeEach(async () => {
    mockGetSession = vi.mocked(auth.api.getSession)
    mockGetSession.mockResolvedValue({ user: { id: 'user123' } })
    client = await getMongoClient()
    const db = client.db(mongoDBConfig.dbName)
    await db.collection(mongoDBConfig.collections.speakers).deleteMany({})
    await db.collection('aacPhrases').deleteMany({})
  })

  afterEach(() => {
    mockGetSession.mockClear()
  })

  it('returns empty array when no phrases exist', async () => {
    const speakerId = new ObjectId()
    const db = client.db(mongoDBConfig.dbName)
    await db.collection(mongoDBConfig.collections.speakers).insertOne({
      _id: speakerId,
      name: 'Speaker',
      parentId: 'user123',
    })

    const url = `http://localhost/api/aac/phrases?speakerId=${speakerId.toString()}`
    const req = new NextRequest(url, { method: 'GET' })

    const res = await GET(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toEqual([])
  })

  it('returns phrases sorted by sortOrder then createdAt', async () => {
    const speakerId = new ObjectId()
    const db = client.db(mongoDBConfig.dbName)
    await db.collection(mongoDBConfig.collections.speakers).insertOne({
      _id: speakerId,
      name: 'Speaker',
      parentId: 'user123',
    })

    const now = new Date()
    const phrasesCollection = db.collection('aacPhrases')
    await phrasesCollection.insertMany([
      {
        speakerId: speakerId.toString(),
        text: 'Second',
        sortOrder: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        speakerId: speakerId.toString(),
        text: 'First',
        sortOrder: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        speakerId: speakerId.toString(),
        text: 'Third',
        sortOrder: 3,
        createdAt: now,
        updatedAt: now,
      },
    ])

    const url = `http://localhost/api/aac/phrases?speakerId=${speakerId.toString()}`
    const req = new NextRequest(url, { method: 'GET' })

    const res = await GET(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveLength(3)
    expect(data[0].text).toBe('First')
    expect(data[1].text).toBe('Second')
    expect(data[2].text).toBe('Third')
  })

  it('returns 400 when speakerId parameter missing', async () => {
    const req = new NextRequest('http://localhost/api/aac/phrases', {
      method: 'GET',
    })

    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when speakerId format invalid', async () => {
    const url = 'http://localhost/api/aac/phrases?speakerId=bad-format'
    const req = new NextRequest(url, { method: 'GET' })

    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  it('returns 401 when not authenticated', async () => {
    mockGetSession.mockResolvedValue(null)
    const speakerId = new ObjectId().toString()
    const url = `http://localhost/api/aac/phrases?speakerId=${speakerId}`
    const req = new NextRequest(url, { method: 'GET' })

    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('returns 404 when speaker not found', async () => {
    const speakerId = new ObjectId().toString()
    const url = `http://localhost/api/aac/phrases?speakerId=${speakerId}`
    const req = new NextRequest(url, { method: 'GET' })

    const res = await GET(req)
    expect(res.status).toBe(404)
  })

  it('allows villager to read phrases (not just parent)', async () => {
    const speakerId = new ObjectId()
    const db = client.db(mongoDBConfig.dbName)

    mockGetSession.mockResolvedValue({ user: { id: 'villager123' } })

    await db.collection(mongoDBConfig.collections.speakers).insertOne({
      _id: speakerId,
      name: 'Speaker',
      parentId: 'parent-user',
      villagerIds: ['villager123'],
    })

    const url = `http://localhost/api/aac/phrases?speakerId=${speakerId.toString()}`
    const req = new NextRequest(url, { method: 'GET' })

    const res = await GET(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data)).toBe(true)
  })

  it('returns 404 when user is neither parent nor villager', async () => {
    const speakerId = new ObjectId()
    const db = client.db(mongoDBConfig.dbName)

    mockGetSession.mockResolvedValue({ user: { id: 'unauthorized-user' } })

    await db.collection(mongoDBConfig.collections.speakers).insertOne({
      _id: speakerId,
      name: 'Speaker',
      parentId: 'parent-user',
      villagerIds: [],
    })

    const url = `http://localhost/api/aac/phrases?speakerId=${speakerId.toString()}`
    const req = new NextRequest(url, { method: 'GET' })

    const res = await GET(req)
    expect(res.status).toBe(404)
  })
})
