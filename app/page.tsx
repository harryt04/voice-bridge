'use client'
import { LandingPage } from '@/components/custom/landing-page'
import { SignedIn, SignedOut } from '@clerk/nextjs'

export default function Home() {
  return (
    <>
      <SignedOut>
        <LandingPage />
      </SignedOut>

      {/* <SignedIn> */}
      <p>Welcome to voicebridge </p>
      {/* </SignedIn> */}
    </>
  )
}
