'use client'

import { createAuthClient } from 'better-auth/react'
import React, { ReactNode } from 'react'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? '',
})

// Named exports for convenience — these are all properties of authClient
export const { useSession, signIn, signOut, signUp } = authClient

// SessionProvider: a simple wrapper context for better-auth@1.6.23
// (better-auth does not provide SessionProvider in this version; the useSession hook
// manages session state directly via React Query under the hood)
export function SessionProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}
