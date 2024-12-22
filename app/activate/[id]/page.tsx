'use client'

import { RedirectToSignIn, SignedIn, SignedOut, useClerk } from '@clerk/nextjs'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'

export default function Activate() {
  const { user } = useClerk()
  const { id } = useParams()
  console.log('id: ', id)
  useEffect(() => {
    const activateMutation = async () => {
      await fetch(`/api/speaker/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speakerId: id }),
      }).then(() => {
        window.open(`/places`)
      })
    }

    if (user && id) {
      activateMutation()
    }
  }, [user, id])

  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <div>
          <h1>Activating Speaker...</h1>
        </div>
      </SignedIn>
    </>
  )
}
