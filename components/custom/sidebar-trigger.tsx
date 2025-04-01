'use client'
import React from 'react'
import { SidebarTrigger, useSidebar } from '../ui/sidebar'

function MySidebarTrigger() {
  const { open, isMobile } = useSidebar()
  return (
    <>{(!open || isMobile) && <SidebarTrigger className="ml-2 mt-5 p-5" />}</>
  )
}

export default MySidebarTrigger
