'use client'

import { useSession } from '@/lib/auth-client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Activate() {
  const { data: session } = useSession()
  const { id } = useParams()
  const router = useRouter()

  useEffect(() => {
    if (!session?.user) {
      router.push(`/login?redirect=/activate/${id}`)
      return
    }

    const activateMutation = async () => {
      await fetch(`/api/speaker/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speakerId: id }),
      }).then(() => {
        window.location.assign(`/places`)
      })
    }

    if (id) {
      activateMutation()
    }
  }, [session?.user, id, router])

  return (
    <div>
      <h1 className="font-display">Activating Speaker...</h1>
    </div>
  )
}
