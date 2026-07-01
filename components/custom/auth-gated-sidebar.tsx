'use client'

import { useSession } from '@/lib/auth-client'
import { AppSidebar } from '@/components/app-sidebar'

export function AuthGatedSidebar() {
  const { data: session } = useSession()

  if (!session?.user) {
    return null
  }

  return <AppSidebar />
}
