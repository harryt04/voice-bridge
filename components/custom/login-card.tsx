'use client'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  RedirectToSignIn,
  SignedIn,
  SignedOut,
  SignOutButton,
  useClerk,
  UserButton,
} from '@clerk/nextjs'
import { Button } from '../ui/button'
import { ExitIcon } from '@radix-ui/react-icons'
import { useRouter } from 'next/navigation'

function LoginCard() {
  const { user } = useClerk()
  const router = useRouter()

  if (!!user) {
    router.push('/')
  }

  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}

export { LoginCard }
