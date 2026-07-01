import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient, mongoDBConfig } from '@/lib/mongo-client'
import { ObjectId } from 'mongodb'
import { Speaker } from '@/models'

/**
 * Validates whether a string is a valid MongoDB ObjectId format.
 *
 * @param id - The string to validate
 * @returns true if the string is a valid ObjectId format, false otherwise
 */
export function isValidObjectId(id: string): boolean {
  return ObjectId.isValid(id)
}

/**
 * Authorization check for AAC mutation operations (POST, PUT, DELETE).
 * Verifies that the authenticated user is the parent of the speaker being modified.
 *
 * @param req - The incoming request object
 * @param speakerId - The ID of the speaker being modified
 * @returns Object with userId if authorized, or NextResponse error if not authorized
 *
 * Checks:
 * - Session exists (401 if missing)
 * - Speaker exists (404 if not found)
 * - User is the parent of the speaker (403 if not authorized)
 *
 * Addresses G22 IDOR prevention: Always verify speaker ownership before allowing mutations.
 */
export async function aacMutationAuthCheck(
  req: NextRequest,
  speakerId: string,
): Promise<{ userId: string } | NextResponse> {
  // Check session exists
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Validate ObjectId format before querying
  if (!isValidObjectId(speakerId)) {
    return NextResponse.json(
      { error: 'Invalid speaker ID format' },
      { status: 400 },
    )
  }

  // Check speaker exists
  const client = await getMongoClient()
  const db = client.db(mongoDBConfig.dbName)
  const speakersCollection = db.collection(mongoDBConfig.collections.speakers)

  const speaker = (await speakersCollection.findOne({
    _id: new ObjectId(speakerId),
  })) as any as Speaker

  if (!speaker) {
    return NextResponse.json(
      { error: 'Speaker not found' },
      { status: 404 },
    )
  }

  // Check user is parent (caregiver) of the speaker
  if (speaker.parentId !== session.user.id) {
    return NextResponse.json(
      { error: 'Not authorized' },
      { status: 403 },
    )
  }

  return { userId: session.user.id }
}
