import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getMongoClient, mongoDBConfig } from '@/lib/mongo-client'
import { ObjectId } from 'mongodb'
import { AacPhrase } from '@/models'
import { AacPhraseInputSchema } from '@/lib/aac/aac-validators'
import { isValidObjectId, aacMutationAuthCheck } from '@/lib/aac/aac-auth'

/**
 * GET /api/aac/phrase?id=<phraseId>
 * Fetch a single phrase by ID.
 * Auth: speakerAuthCheck (read access for parent and villagers)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const phraseId = new URL(req.url).searchParams.get('id')
    if (!phraseId) {
      return NextResponse.json({ error: 'Missing phrase ID' }, { status: 400 })
    }

    if (!isValidObjectId(phraseId)) {
      return NextResponse.json(
        { error: 'Invalid phrase ID format' },
        { status: 400 },
      )
    }

    const client = await getMongoClient()
    const db = client.db(mongoDBConfig.dbName)
    const phrasesCollection = db.collection('aacPhrases')

    const phrase = (await phrasesCollection.findOne({
      _id: new ObjectId(phraseId),
    })) as any as AacPhrase

    if (!phrase) {
      return NextResponse.json({ error: 'Phrase not found' }, { status: 404 })
    }

    return NextResponse.json(phrase, { status: 200 })
  } catch (error) {
    console.error('GET /api/aac/phrase error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

/**
 * POST /api/aac/phrase
 * Create a new phrase.
 * Auth: aacMutationAuthCheck (caregiver only)
 * Body: AacPhraseInput (speakerId required)
 * Server-side: sets createdAt, updatedAt, lastUpdatedBy
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate input against schema
    const validationResult = AacPhraseInputSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
        { status: 400 },
      )
    }

    const input = validationResult.data
    const speakerId = input.speakerId

    // Authorization check (caregiver only)
    const authResult = await aacMutationAuthCheck(req, speakerId)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const client = await getMongoClient()
    const db = client.db(mongoDBConfig.dbName)
    const phrasesCollection = db.collection('aacPhrases')

    const now = new Date()
    const phrase: Omit<AacPhrase, '_id'> = {
      ...input,
      createdAt: now,
      updatedAt: now,
      lastUpdatedBy: authResult.userId,
    }

    const result = await phrasesCollection.insertOne(phrase as any)

    return NextResponse.json({ insertedId: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error('POST /api/aac/phrase error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

/**
 * PUT /api/aac/phrase?id=<phraseId>
 * Update an existing phrase.
 * Auth: aacMutationAuthCheck (caregiver only)
 * IDOR prevention: Verify phrase.speakerId matches authorized speaker before updating
 */
export async function PUT(req: NextRequest) {
  try {
    const phraseId = new URL(req.url).searchParams.get('id')
    if (!phraseId) {
      return NextResponse.json({ error: 'Missing phrase ID' }, { status: 400 })
    }

    if (!isValidObjectId(phraseId)) {
      return NextResponse.json(
        { error: 'Invalid phrase ID format' },
        { status: 400 },
      )
    }

    const body = await req.json()

    // Validate input against schema
    const validationResult = AacPhraseInputSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
        { status: 400 },
      )
    }

    const input = validationResult.data
    const speakerId = input.speakerId

    // Authorization check (caregiver only)
    const authResult = await aacMutationAuthCheck(req, speakerId)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const client = await getMongoClient()
    const db = client.db(mongoDBConfig.dbName)
    const phrasesCollection = db.collection('aacPhrases')

    // IDOR prevention: Verify phrase exists and belongs to authorized speaker
    const phrase = (await phrasesCollection.findOne({
      _id: new ObjectId(phraseId),
    })) as any as AacPhrase

    if (!phrase) {
      return NextResponse.json({ error: 'Phrase not found' }, { status: 404 })
    }

    if (phrase.speakerId !== speakerId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const now = new Date()
    const updates = {
      ...input,
      updatedAt: now,
      lastUpdatedBy: authResult.userId,
    }

    await phrasesCollection.updateOne(
      { _id: new ObjectId(phraseId) },
      { $set: updates },
    )

    return NextResponse.json({ updated: true }, { status: 200 })
  } catch (error) {
    console.error('PUT /api/aac/phrase error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

/**
 * DELETE /api/aac/phrase?id=<phraseId>
 * Delete a phrase.
 * Auth: aacMutationAuthCheck (caregiver only)
 */
export async function DELETE(req: NextRequest) {
  try {
    const phraseId = new URL(req.url).searchParams.get('id')
    if (!phraseId) {
      return NextResponse.json({ error: 'Missing phrase ID' }, { status: 400 })
    }

    if (!isValidObjectId(phraseId)) {
      return NextResponse.json(
        { error: 'Invalid phrase ID format' },
        { status: 400 },
      )
    }

    const client = await getMongoClient()
    const db = client.db(mongoDBConfig.dbName)
    const phrasesCollection = db.collection('aacPhrases')

    // Get phrase to check speaker ownership
    const phrase = (await phrasesCollection.findOne({
      _id: new ObjectId(phraseId),
    })) as any as AacPhrase

    if (!phrase) {
      return NextResponse.json({ error: 'Phrase not found' }, { status: 404 })
    }

    // Authorization check (caregiver only) for the speaker who owns this phrase
    const authResult = await aacMutationAuthCheck(req, phrase.speakerId)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const result = await phrasesCollection.deleteOne({
      _id: new ObjectId(phraseId),
    })

    return NextResponse.json(
      { deleted: true, deletedCount: result.deletedCount },
      { status: 200 },
    )
  } catch (error) {
    console.error('DELETE /api/aac/phrase error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
