'use client'
import { LandingPage } from '@/components/custom/landing-page'
import { useSession } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session?.user) {
      router.push('/places')
    }
  }, [session?.user, router])

  if (!session) {
    return <LandingPage />
  }

  return null
}
