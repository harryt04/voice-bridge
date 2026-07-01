import { NextResponse } from 'next/server'

// Using Option B (fallback): nextJsMiddleware not available in better-auth@1.6.23; using pass-through middleware (verified 2026-07-01)
// Session handling is delegated to per-route auth checks and the API catch-all handler
export function middleware() {
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
