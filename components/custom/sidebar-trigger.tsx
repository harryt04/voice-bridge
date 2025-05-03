'use client'
import React from 'react'
import { SidebarTrigger, useSidebar } from '../ui/sidebar'
import { Card } from '../ui/card'

function VBSidebarTrigger({ title }: { title?: string }) {
  const { open, isMobile } = useSidebar()
  const mobileClasses = isMobile
    ? 'background-translucent translucent-bg fixed h-20'
    : ''
  return (
    <>
      {(!open || isMobile) && (
        <Card className={`${mobileClasses} w-full rounded-none`}>
          <SidebarTrigger className="mx-2 my-5 p-5" />
          {title ?? 'VoiceBridge'}
        </Card>
      )}
    </>
  )
}

export default VBSidebarTrigger
