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
import { GET, POST, PUT, DELETE } from './route'
import { getMongoClient, mongoDBConfig } from '@/lib/mongo-client'
import { ObjectId } from 'mongodb'

import { auth } from '@/lib/auth'

describe('POST /api/aac/phrase', () => {
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

  it('creates phrase with 201 status', async () => {
    const speakerId = new ObjectId()
    const db = client.db(mongoDBConfig.dbName)
    await db.collection(mongoDBConfig.collections.speakers).insertOne({
      _id: speakerId,
      name: 'Speaker',
      parentId: 'user123',
    })

    const req = new NextRequest('http://localhost/api/aac/phrase', {
      method: 'POST',
      body: JSON.stringify({
        speakerId: speakerId.toString(),
        text: 'Hello',
        category: 'greetings',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data).toHaveProperty('insertedId')
  })

  it('sets createdAt, updatedAt, lastUpdatedBy server-side', async () => {
    const speakerId = new ObjectId()
    const db = client.db(mongoDBConfig.dbName)
    await db.collection(mongoDBConfig.collections.speakers).insertOne({
      _id: speakerId,
      name: 'Speaker',
      parentId: 'user123',
    })

    const req = new NextRequest('http://localhost/api/aac/phrase', {
      method: 'POST',
      body: JSON.stringify({
        speakerId: speakerId.toString(),
        text: 'Test',
      }),
    })

    const res = await POST(req)
    const data = await res.json()
    const phrasesCollection = db.collection('aacPhrases')
    const inserted = await phrasesCollection.findOne({
      _id: new ObjectId(data.insertedId),
    })

    expect(inserted).toHaveProperty('createdAt')
    expect(inserted).toHaveProperty('updatedAt')
    expect(inserted.lastUpdatedBy).toBe('user123')
  })

  it('returns 400 on validation error', async () => {
    const speakerId = new ObjectId()
    const db = client.db(mongoDBConfig.dbName)
    await db.collection(mongoDBConfig.collections.speakers).insertOne({
      _id: speakerId,
      name: 'Speaker',
      parentId: 'user123',
    })

    const req = new NextRequest('http://localhost/api/aac/phrase', {
      method: 'POST',
      body: JSON.stringify({
        speakerId: speakerId.toString(),
        text: '',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 401 when not authenticated', async () => {
    mockGetSession.mockResolvedValue(null)
    const speakerId = new ObjectId().toString()

    const req = new NextRequest('http://localhost/api/aac/phrase', {
      method: 'POST',
      body: JSON.stringify({
        speakerId,
        text: 'Hello',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 403 when user is not parent of speaker', async () => {
    const speakerId = new ObjectId()
    const db = client.db(mongoDBConfig.dbName)
    await db.collection(mongoDBConfig.collections.speakers).insertOne({
      _id: speakerId,
      name: 'Speaker',
      parentId: 'different-user',
    })

    const req = new NextRequest('http://localhost/api/aac/phrase', {
      method: 'POST',
      body: JSON.stringify({
        speakerId: speakerId.toString(),
        text: 'Hello',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(403)
  })

  it('returns 404 when speaker not found', async () => {
    const speakerId = new ObjectId().toString()

    const req = new NextRequest('http://localhost/api/aac/phrase', {
      method: 'POST',
      body: JSON.stringify({
        speakerId,
        text: 'Hello',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(404)
  })
})

describe('PUT /api/aac/phrase', () => {
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

  it('updates phrase with 200 status', async () => {
    const speakerId = new ObjectId()
    const db = client.db(mongoDBConfig.dbName)
    await db.collection(mongoDBConfig.collections.speakers).insertOne({
      _id: speakerId,
      name: 'Speaker',
      parentId: 'user123',
    })

    const phraseId = new ObjectId()
    await db.collection('aacPhrases').insertOne({
      _id: phraseId,
      speakerId: speakerId.toString(),
      text: 'Original',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const url = `http://localhost/api/aac/phrase?id=${phraseId.toString()}`
    const req = new NextRequest(url, {
      method: 'PUT',
      body: JSON.stringify({
        speakerId: speakerId.toString(),
        text: 'Updated',
      }),
    })

    const res = await PUT(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.updated).toBe(true)
  })

  it('IDOR prevention: returns 403 when phrase belongs to different speaker', async () => {
    const speaker1 = new ObjectId()
    const speaker2 = new ObjectId()
    const db = client.db(mongoDBConfig.dbName)

    await db.collection(mongoDBConfig.collections.speakers).insertMany([
      { _id: speaker1, name: 'Speaker1', parentId: 'user123' },
      { _id: speaker2, name: 'Speaker2', parentId: 'user456' },
    ])

    const phraseId = new ObjectId()
    await db.collection('aacPhrases').insertOne({
      _id: phraseId,
      speakerId: speaker1.toString(),
      text: 'Speaker1 phrase',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockGetSession.mockResolvedValue({ user: { id: 'user123' } })

    const url = `http://localhost/api/aac/phrase?id=${phraseId.toString()}`
    const req = new NextRequest(url, {
      method: 'PUT',
      body: JSON.stringify({
        speakerId: speaker2.toString(),
        text: 'Updated',
      }),
    })

    const res = await PUT(req)
    expect(res.status).toBe(403)
  })

  it('returns 404 when phrase not found', async () => {
    const speakerId = new ObjectId()
    const db = client.db(mongoDBConfig.dbName)
    await db.collection(mongoDBConfig.collections.speakers).insertOne({
      _id: speakerId,
      name: 'Speaker',
      parentId: 'user123',
    })

    const phraseId = new ObjectId().toString()
    const url = `http://localhost/api/aac/phrase?id=${phraseId}`
    const req = new NextRequest(url, {
      method: 'PUT',
      body: JSON.stringify({
        speakerId: speakerId.toString(),
        text: 'Hello',
      }),
    })

    const res = await PUT(req)
    expect(res.status).toBe(404)
  })

  it('returns 400 when missing phrase ID', async () => {
    const req = new NextRequest('http://localhost/api/aac/phrase', {
      method: 'PUT',
      body: JSON.stringify({
        speakerId: new ObjectId().toString(),
        text: 'Hello',
      }),
    })

    const res = await PUT(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when phrase ID format invalid', async () => {
    const url = 'http://localhost/api/aac/phrase?id=bad-id'
    const req = new NextRequest(url, {
      method: 'PUT',
      body: JSON.stringify({
        speakerId: new ObjectId().toString(),
        text: 'Hello',
      }),
    })

    const res = await PUT(req)
    expect(res.status).toBe(400)
  })
})

describe('DELETE /api/aac/phrase', () => {
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

  it('deletes phrase with 200 status', async () => {
    const speakerId = new ObjectId()
    const db = client.db(mongoDBConfig.dbName)
    await db.collection(mongoDBConfig.collections.speakers).insertOne({
      _id: speakerId,
      name: 'Speaker',
      parentId: 'user123',
    })

    const phraseId = new ObjectId()
    await db.collection('aacPhrases').insertOne({
      _id: phraseId,
      speakerId: speakerId.toString(),
      text: 'To delete',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const url = `http://localhost/api/aac/phrase?id=${phraseId.toString()}`
    const req = new NextRequest(url, {
      method: 'DELETE',
    })

    const res = await DELETE(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.deleted).toBe(true)
    expect(data.deletedCount).toBe(1)
  })

  it('returns 404 when phrase not found (before auth check)', async () => {
    const phraseId = new ObjectId().toString()
    const url = `http://localhost/api/aac/phrase?id=${phraseId}`
    const req = new NextRequest(url, {
      method: 'DELETE',
    })

    const res = await DELETE(req)
    expect(res.status).toBe(404)
  })

  it('returns 403 when user not authorized', async () => {
    const speakerId = new ObjectId()
    const db = client.db(mongoDBConfig.dbName)
    await db.collection(mongoDBConfig.collections.speakers).insertOne({
      _id: speakerId,
      name: 'Speaker',
      parentId: 'different-user',
    })

    const phraseId = new ObjectId()
    await db.collection('aacPhrases').insertOne({
      _id: phraseId,
      speakerId: speakerId.toString(),
      text: 'To delete',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const url = `http://localhost/api/aac/phrase?id=${phraseId.toString()}`
    const req = new NextRequest(url, {
      method: 'DELETE',
    })

    const res = await DELETE(req)
    expect(res.status).toBe(403)
  })
})

describe('GET /api/aac/phrase', () => {
  let mockGetSession: any
  let client: any

  beforeEach(async () => {
    mockGetSession = vi.mocked(auth.api.getSession)
    mockGetSession.mockResolvedValue({ user: { id: 'user123' } })
    client = await getMongoClient()
    const db = client.db(mongoDBConfig.dbName)
    await db.collection('aacPhrases').deleteMany({})
  })

  afterEach(() => {
    mockGetSession.mockClear()
  })

  it('retrieves phrase by ID', async () => {
    const db = client.db(mongoDBConfig.dbName)
    const phraseId = new ObjectId()
    await db.collection('aacPhrases').insertOne({
      _id: phraseId,
      speakerId: 'speaker123',
      text: 'Hello',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const url = `http://localhost/api/aac/phrase?id=${phraseId.toString()}`
    const req = new NextRequest(url, { method: 'GET' })

    const res = await GET(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.text).toBe('Hello')
  })

  it('returns 404 when phrase not found', async () => {
    const phraseId = new ObjectId().toString()
    const url = `http://localhost/api/aac/phrase?id=${phraseId}`
    const req = new NextRequest(url, { method: 'GET' })

    const res = await GET(req)
    expect(res.status).toBe(404)
  })

  it('returns 400 when missing phrase ID', async () => {
    const req = new NextRequest('http://localhost/api/aac/phrase', {
      method: 'GET',
    })

    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when phrase ID format invalid', async () => {
    const url = 'http://localhost/api/aac/phrase?id=bad-format'
    const req = new NextRequest(url, { method: 'GET' })

    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  it('returns 401 when not authenticated', async () => {
    mockGetSession.mockResolvedValue(null)
    const phraseId = new ObjectId().toString()
    const url = `http://localhost/api/aac/phrase?id=${phraseId}`
    const req = new NextRequest(url, { method: 'GET' })

    const res = await GET(req)
    expect(res.status).toBe(401)
  })
})
