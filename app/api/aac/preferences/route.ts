import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getMongoClient, mongoDBConfig } from '@/lib/mongo-client'
import { AacUserPreferences } from '@/models'
import { AacPreferencesInputSchema } from '@/lib/aac/aac-validators'
import { isValidObjectId, aacMutationAuthCheck } from '@/lib/aac/aac-auth'
import { speakerAuthCheck } from '@/lib/mongo-utils'
import { getDefaultPreferences } from '@/lib/aac/default-preferences'

/**
 * GET /api/aac/preferences?speakerId=<speakerId>
 * Fetch preferences for a speaker.
 * Auth: speakerAuthCheck (parent and villagers can read)
 * Returns: AacUserPreferences or DEFAULT_PREFERENCES if no custom prefs exist (not 404)
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
    const preferencesCollection = db.collection('aacUserPreferences')

    const prefs = (await preferencesCollection.findOne({
      speakerId,
    })) as any as AacUserPreferences | null

    // Return default preferences if no custom prefs exist (not 404)
    if (!prefs) {
      return NextResponse.json(getDefaultPreferences(speakerId), {
        status: 200,
      })
    }

    return NextResponse.json(prefs, { status: 200 })
  } catch (error) {
    console.error('GET /api/aac/preferences error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

/**
 * POST /api/aac/preferences
 * Upsert preferences for a speaker.
 * Auth: aacMutationAuthCheck (caregiver only)
 * Body: AacUserPreferencesInput
 * Uses findOneAndUpdate with {upsert: true}
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate input against schema
    const validationResult = AacPreferencesInputSchema.safeParse(body)
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
    const preferencesCollection = db.collection('aacUserPreferences')

    const now = new Date()
    const updates = {
      ...input,
      updatedAt: now,
    }

    const result = await preferencesCollection.findOneAndUpdate(
      { speakerId },
      { $set: updates },
      { upsert: true, returnDocument: 'after' },
    )

    if (!result) {
      return NextResponse.json(updates, { status: 200 })
    }

    return NextResponse.json(result.value || updates, { status: 200 })
  } catch (error) {
    console.error('POST /api/aac/preferences error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
