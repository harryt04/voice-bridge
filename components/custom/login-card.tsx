import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  RedirectToSignIn,
  SignedIn,
  SignedOut,
  SignOutButton,
  UserButton,
} from '@clerk/nextjs'
import { currentUser, User } from '@clerk/nextjs/server'
import { Button } from '../ui/button'
import { ExitIcon } from '@radix-ui/react-icons'

async function LoginCard() {
  const user: User | null = await currentUser()

  return (
    <div>
      <Card
        className={cn(
          'flex flex-col items-center justify-center gap-4 p-8 text-center',
        )}
      >
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>

        <SignedIn>
          <h1 className="text-2xl font-bold">
            Signed in as: <UserButton /> {user?.firstName} {user?.lastName}
          </h1>
          <SignOutButton>
            <Button>
              <ExitIcon className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </SignOutButton>
        </SignedIn>
      </Card>
    </div>
  )
}

export { LoginCard }
