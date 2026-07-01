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
import { GET, POST } from './route'
import { getMongoClient, mongoDBConfig } from '@/lib/mongo-client'
import { ObjectId } from 'mongodb'
import { getDefaultPreferences } from '@/lib/aac/default-preferences'

import { auth } from '@/lib/auth'

describe('GET /api/aac/preferences', () => {
  let mockGetSession: any
  let client: any

  beforeEach(async () => {
    mockGetSession = vi.mocked(auth.api.getSession)
    mockGetSession.mockResolvedValue({ user: { id: 'user123' } })
    client = await getMongoClient()
    const db = client.db(mongoDBConfig.dbName)
    await db.collection(mongoDBConfig.collections.speakers).deleteMany({})
    await db.collection('aacUserPreferences').deleteMany({})
  })

  afterEach(() => {
    mockGetSession.mockClear()
  })

  it('returns default preferences when no custom prefs exist', async () => {
    const speakerId = new ObjectId()
    const db = client.db(mongoDBConfig.dbName)
    await db.collection(mongoDBConfig.collections.speakers).insertOne({
      _id: speakerId,
      name: 'Speaker',
      parentId: 'user123',
    })

    const url = `http://localhost/api/aac/preferences?speakerId=${speakerId.toString()}`
    const req = new NextRequest(url, { method: 'GET' })

    const res = await GET(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    const defaults = getDefaultPreferences(speakerId.toString())
    expect(data.speakerId).toBe(defaults.speakerId)
    expect(data.speechRate).toBe(1)
    expect(data.speechPitch).toBe(1)
    expect(data.mobileGridColumns).toBe(3)
  })

  it('returns stored preferences when custom prefs exist', async () => {
    const speakerId = new ObjectId()
    const db = client.db(mongoDBConfig.dbName)
    await db.collection(mongoDBConfig.collections.speakers).insertOne({
      _id: speakerId,
      name: 'Speaker',
      parentId: 'user123',
    })

    const customPrefs = {
      speakerId: speakerId.toString(),
      speechRate: 1.5,
      speechPitch: 0.8,
      mobileGridColumns: 4,
      updatedAt: new Date(),
    }

    await db
      .collection('aacUserPreferences')
      .insertOne(customPrefs)

    const url = `http://localhost/api/aac/preferences?speakerId=${speakerId.toString()}`
    const req = new NextRequest(url, { method: 'GET' })

    const res = await GET(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.speechRate).toBe(1.5)
    expect(data.speechPitch).toBe(0.8)
    expect(data.mobileGridColumns).toBe(4)
  })

  it('returns 400 when speakerId parameter missing', async () => {
    const req = new NextRequest('http://localhost/api/aac/preferences', {
      method: 'GET',
    })

    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when speakerId format invalid', async () => {
    const url = 'http://localhost/api/aac/preferences?speakerId=bad-format'
    const req = new NextRequest(url, { method: 'GET' })

    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  it('returns 401 when not authenticated', async () => {
    mockGetSession.mockResolvedValue(null)
    const speakerId = new ObjectId().toString()
    const url = `http://localhost/api/aac/preferences?speakerId=${speakerId}`
    const req = new NextRequest(url, { method: 'GET' })

    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('returns 404 when speaker not found', async () => {
    const speakerId = new ObjectId().toString()
    const url = `http://localhost/api/aac/preferences?speakerId=${speakerId}`
    const req = new NextRequest(url, { method: 'GET' })

    const res = await GET(req)
    expect(res.status).toBe(404)
  })
})

describe('POST /api/aac/preferences', () => {
  let mockGetSession: any
  let client: any

  beforeEach(async () => {
    mockGetSession = vi.mocked(auth.api.getSession)
    mockGetSession.mockResolvedValue({ user: { id: 'user123' } })
    client = await getMongoClient()
    const db = client.db(mongoDBConfig.dbName)
    await db.collection(mongoDBConfig.collections.speakers).deleteMany({})
    await db.collection('aacUserPreferences').deleteMany({})
  })

  afterEach(() => {
    mockGetSession.mockClear()
  })

  it('creates preferences with 200 status', async () => {
    const speakerId = new ObjectId()
    const db = client.db(mongoDBConfig.dbName)
    await db.collection(mongoDBConfig.collections.speakers).insertOne({
      _id: speakerId,
      name: 'Speaker',
      parentId: 'user123',
    })

    const req = new NextRequest('http://localhost/api/aac/preferences', {
      method: 'POST',
      body: JSON.stringify({
        speakerId: speakerId.toString(),
        speechRate: 1.2,
        speechPitch: 0.9,
        speakOnSymbolTap: true,
        phraseTapBehavior: 'speak',
        symbolSource: 'mulberry',
        symbolLabelPosition: 'below',
        mobileGridColumns: '3',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.speechRate).toBe(1.2)
    expect(data.speechPitch).toBe(0.9)
  })

  it('updates existing preferences', async () => {
    const speakerId = new ObjectId()
    const db = client.db(mongoDBConfig.dbName)
    await db.collection(mongoDBConfig.collections.speakers).insertOne({
      _id: speakerId,
      name: 'Speaker',
      parentId: 'user123',
    })

    await db.collection('aacUserPreferences').insertOne({
      speakerId: speakerId.toString(),
      speechRate: 1,
      speechPitch: 1,
      updatedAt: new Date(),
    })

    const req = new NextRequest('http://localhost/api/aac/preferences', {
      method: 'POST',
      body: JSON.stringify({
        speakerId: speakerId.toString(),
        speechRate: 1.5,
        speechPitch: 0.8,
        speakOnSymbolTap: false,
        phraseTapBehavior: 'append',
        symbolSource: 'arasaac',
        symbolLabelPosition: 'above',
        mobileGridColumns: '4',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.speechRate).toBe(1.5)
    expect(data.speechPitch).toBe(0.8)
    expect(data.phraseTapBehavior).toBe('append')
  })

  it('sets updatedAt server-side', async () => {
    const speakerId = new ObjectId()
    const db = client.db(mongoDBConfig.dbName)
    await db.collection(mongoDBConfig.collections.speakers).insertOne({
      _id: speakerId,
      name: 'Speaker',
      parentId: 'user123',
    })

    const beforeTime = new Date()

    const req = new NextRequest('http://localhost/api/aac/preferences', {
      method: 'POST',
      body: JSON.stringify({
        speakerId: speakerId.toString(),
        speechRate: 1,
        speechPitch: 1,
        speakOnSymbolTap: true,
        phraseTapBehavior: 'speak',
        symbolSource: 'mulberry',
        symbolLabelPosition: 'below',
        mobileGridColumns: '3',
      }),
    })

    const res = await POST(req)
    const afterTime = new Date()

    expect(res.status).toBe(200)
    const data = await res.json()
    const updatedAtTime = new Date(data.updatedAt)
    expect(updatedAtTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime())
    expect(updatedAtTime.getTime()).toBeLessThanOrEqual(afterTime.getTime())
  })

  it('returns 400 on validation error', async () => {
    const speakerId = new ObjectId()
    const db = client.db(mongoDBConfig.dbName)
    await db.collection(mongoDBConfig.collections.speakers).insertOne({
      _id: speakerId,
      name: 'Speaker',
      parentId: 'user123',
    })

    const req = new NextRequest('http://localhost/api/aac/preferences', {
      method: 'POST',
      body: JSON.stringify({
        speakerId: speakerId.toString(),
        speechRate: 3,
        speechPitch: 1,
        speakOnSymbolTap: true,
        phraseTapBehavior: 'speak',
        symbolSource: 'mulberry',
        symbolLabelPosition: 'below',
        mobileGridColumns: '3',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 401 when not authenticated', async () => {
    mockGetSession.mockResolvedValue(null)
    const speakerId = new ObjectId().toString()

    const req = new NextRequest('http://localhost/api/aac/preferences', {
      method: 'POST',
      body: JSON.stringify({
        speakerId,
        speechRate: 1,
        speechPitch: 1,
        speakOnSymbolTap: true,
        phraseTapBehavior: 'speak',
        symbolSource: 'mulberry',
        symbolLabelPosition: 'below',
        mobileGridColumns: '3',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 403 when user not authorized', async () => {
    const speakerId = new ObjectId()
    const db = client.db(mongoDBConfig.dbName)
    await db.collection(mongoDBConfig.collections.speakers).insertOne({
      _id: speakerId,
      name: 'Speaker',
      parentId: 'different-user',
    })

    const req = new NextRequest('http://localhost/api/aac/preferences', {
      method: 'POST',
      body: JSON.stringify({
        speakerId: speakerId.toString(),
        speechRate: 1,
        speechPitch: 1,
        speakOnSymbolTap: true,
        phraseTapBehavior: 'speak',
        symbolSource: 'mulberry',
        symbolLabelPosition: 'below',
        mobileGridColumns: '3',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(403)
  })

  it('returns 404 when speaker not found', async () => {
    const speakerId = new ObjectId().toString()

    const req = new NextRequest('http://localhost/api/aac/preferences', {
      method: 'POST',
      body: JSON.stringify({
        speakerId,
        speechRate: 1,
        speechPitch: 1,
        speakOnSymbolTap: true,
        phraseTapBehavior: 'speak',
        symbolSource: 'mulberry',
        symbolLabelPosition: 'below',
        mobileGridColumns: '3',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(404)
  })
})
