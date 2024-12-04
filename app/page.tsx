import { LandingPage } from '@/components/custom/landing-page'
import { SideNav } from '@/components/custom/side-nav'
import { SignedIn, SignedOut } from '@clerk/nextjs'

export default function Home() {
  // Remove 'use server' since Home should be a client component
  return (
    <>
      <SignedOut>
        <LandingPage />
      </SignedOut>

      <SignedIn>
        <SideNav />
        <p>Welcome to scaffolding bitches</p>
        {/* <div
          className={cn(
            'flex min-h-screen flex-col items-center justify-center gap-4 px-10 py-20',
          )}
        >
          <DateTimePickerForm />
        </div> */}
      </SignedIn>
    </>
  )
}
