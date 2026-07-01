'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signUp } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

export function RegisterForm() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setLoading(true)
      setError(null)

      if (!name || !email || !password) {
        setError('Please fill in all fields')
        setLoading(false)
        return
      }

      try {
        await signUp.email({
          name,
          email,
          password,
        })

        router.push('/places')
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Sign up failed. Please try again.',
        )
        setLoading(false)
      }
    },
    [name, email, password, router],
  )

  return (
    <div className="flex w-full max-w-sm flex-col gap-6 rounded-2xl border border-border bg-card p-8 shadow-md">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-bold text-primary">VoiceBridge</h1>
        <p className="font-sans text-sm text-muted-foreground">Create your account</p>
      </div>

      {/* Error display */}
      {error && (
        <div className="flex gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="font-sans text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Registration form */}
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Full name"
          className="h-11"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          required
        />
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
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      {/* Footer link */}
      <p className="text-center font-sans text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
