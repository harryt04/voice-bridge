import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { RegisterForm } from '@/components/custom/register-form'

export default async function RegisterPage() {
  // Check if user is already authenticated
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (session?.user) {
    redirect('/places')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <RegisterForm />
    </main>
  )
}
