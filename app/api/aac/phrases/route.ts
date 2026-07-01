import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getMongoClient, mongoDBConfig } from '@/lib/mongo-client'
import { AacPhrase } from '@/models'
import { isValidObjectId } from '@/lib/aac/aac-auth'
import { speakerAuthCheck } from '@/lib/mongo-utils'

/**
 * GET /api/aac/phrases?speakerId=<speakerId>
 * List all phrases for a speaker, sorted by sortOrder then createdAt.
 * Auth: speakerAuthCheck (parent and villagers can read)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const speakerId = new URL(req.url).searchParams.get('speakerId')
    if (!speakerId) {
      return NextResponse.json(
        { error: 'Missing speakerId parameter' },
        { status: 400 },
      )
    }

    if (!isValidObjectId(speakerId)) {
      return NextResponse.json(
        { error: 'Invalid speakerId format' },
        { status: 400 },
      )
    }

    // Authorization check using speakerAuthCheck
    const authCheckResult = await speakerAuthCheck(req, speakerId)
    if (authCheckResult instanceof NextResponse) {
      return authCheckResult
    }

    const client = await getMongoClient()
    const db = client.db(mongoDBConfig.dbName)
    const phrasesCollection = db.collection('aacPhrases')

    const phrases = (await phrasesCollection
      .find({ speakerId })
      .sort({ sortOrder: 1, createdAt: 1 })
      .toArray()) as any[] as AacPhrase[]

    return NextResponse.json(phrases, { status: 200 })
  } catch (error) {
    console.error('GET /api/aac/phrases error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
