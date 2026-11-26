'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export function BodyPortal({
  children,
  container,
}: {
  children: ReactNode
  container?: Element
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted ? createPortal(children, container ?? document.body) : null
}
