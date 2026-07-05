'use client'
import React from 'react'
import { useSession } from '@/lib/auth-client'
import { SidebarTrigger, useSidebar } from '../ui/sidebar'
import { Card } from '../ui/card'

function VBSidebarTrigger({ title }: { title?: string }) {
  const { data: session } = useSession()
  const { open, isMobile } = useSidebar()

  if (!session?.user) {
    return null
  }

  return (
    <>
      {(!open || isMobile) && (
        <Card className="sticky top-0 z-20 h-20 w-full rounded-none bg-sidebar">
          <SidebarTrigger className="mx-2 my-5 p-5" />
          {title ?? 'VoiceBridge'}
        </Card>
      )}
    </>
  )
}

export default VBSidebarTrigger
