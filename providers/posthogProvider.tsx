'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { sampleByEvent } from 'posthog-js/lib/src/customizations/before-send.js'

if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  throw new Error('NEXT_PUBLIC_POSTHOG_KEY is not set')
}
const runningInProduction =
  process.env.NODE_ENV === 'production' && typeof window !== 'undefined'
if (runningInProduction) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: '/ingest',
    ui_host: 'https://us.posthog.com',
    before_send: sampleByEvent(['$web_vitals'], 0.5),
  })
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathName = usePathname()

  useEffect(() => {
    if (!runningInProduction) {
      return
    }
    posthog.capture('$pageview', { pathName })
  }, [pathName])

  if (!runningInProduction) {
    return <>{children}</> // Don't send events in dev mode
  }

  return <PHProvider client={posthog}>{children}</PHProvider>
}
