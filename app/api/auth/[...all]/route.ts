import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'

// better-auth API catch-all handler for authentication endpoints
// Handles all routes under /api/auth/* (sign-in, sign-up, sign-out, OAuth callbacks, etc.)
const handler = toNextJsHandler(auth)

export const GET = handler.GET
export const POST = handler.POST
export const PATCH = handler.PATCH
export const PUT = handler.PUT
export const DELETE = handler.DELETE
