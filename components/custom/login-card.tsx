'use client'

import { useEffect } from 'react'
import { RedirectToSignIn, Show, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

function LoginCard() {
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
        <RedirectToSignIn />
      </Show>
    </>
  )
}

export { LoginCard }
