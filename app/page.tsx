'use client'
import { useEffect } from 'react'
import { LandingPage } from '@/components/custom/landing-page'
import { Show, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { user } = useClerk()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/places')
    }
  }, [user, router])

  return (
    <>
      <Show when="signed-out">
        <LandingPage />
      </Show>
    </>
  )
}
