import { PostHog } from 'posthog-node'

export default function PostHogClient() {
  const runningInProduction = process.env.NODE_ENV === 'production'
  if (!runningInProduction) {
    return {
      capture: () => {},
    } as any as PostHog
  }

  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    throw new Error('NEXT_PUBLIC_POSTHOG_KEY is not set')
  }
  const posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  })
  return posthogClient
}
