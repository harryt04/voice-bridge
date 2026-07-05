'use client'

import { useCallback, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Validate redirect is same-origin (starts with /)
  const getRedirectPath = useCallback(() => {
    if (redirect && typeof redirect === 'string' && redirect.startsWith('/')) {
      return redirect
    }
    return '/places'
  }, [redirect])

  const handleGoogleSignIn = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await signIn.social({
        provider: 'google',
        callbackURL: getRedirectPath(),
      })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Google sign-in failed. Please try again.',
      )
      setLoading(false)
    }
  }, [getRedirectPath])

  const handleEmailSignIn = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setLoading(true)
      setError(null)

      if (!email || !password) {
        setError('Please enter both email and password')
        setLoading(false)
        return
      }

      try {
        const { error: signInError } = await signIn.email({
          email,
          password,
        })

        if (signInError) {
          setError(signInError.message ?? 'Sign in failed. Please try again.')
          setLoading(false)
          return
        }

        router.push(getRedirectPath())
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Sign in failed. Please try again.',
        )
        setLoading(false)
      }
    },
    [email, password, router, getRedirectPath],
  )

  return (
    <div className="flex w-full max-w-sm flex-col gap-6 rounded-2xl border border-border bg-card p-8 shadow-md">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-bold text-primary">
          VoiceBridge
        </h1>
        <p className="font-sans text-sm text-muted-foreground">
          Sign in to continue
        </p>
      </div>

      {/* Error display */}
      {error && (
        <div className="flex gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
          <p className="font-sans text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Google button */}
      <Button
        variant="outline"
        className="h-11 w-full gap-2"
        onClick={handleGoogleSignIn}
        disabled={loading}
      >
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="currentColor"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="currentColor"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="currentColor"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="currentColor"
          />
        </svg>
        Continue with Google
      </Button>

      {/* Divider */}
      <div className="relative flex items-center">
        <Separator className="flex-1" />
        <span className="bg-card px-2 font-sans text-xs text-muted-foreground">
          or
        </span>
        <Separator className="flex-1" />
      </div>

      {/* Email + password form */}
      <form className="flex flex-col gap-4" onSubmit={handleEmailSignIn}>
        <Input
          type="email"
          placeholder="Email"
          className="h-11"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          className="h-11"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
        />
        <Button
          type="submit"
          className="h-11 w-full font-display font-semibold"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      {/* Footer link */}
      <p className="text-center font-sans text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}
