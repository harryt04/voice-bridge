'use client'
import { LandingPage } from '@/components/custom/landing-page'
import { SignedOut, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { user } = useClerk()
  const router = useRouter()

  if (user) {
    router.push('/places')
  }
  return (
    <>
      <SignedOut>
        <LandingPage />
      </SignedOut>
    </>
  )
}
