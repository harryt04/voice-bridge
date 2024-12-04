import Link from 'next/link'
import { ThemeSwitcher } from './themeSwitcher'
import { Button } from '../ui/button'

function LandingPage() {
  return (
    <div>
      <div className="flex h-screen flex-col items-center justify-center">
        <div className="flex max-w-2xl flex-col items-center justify-center">
          <h1 className="text-4xl font-bold"> VoiceBridge </h1>
          <br />
          <ThemeSwitcher />
          <br />
          <p className="text-l text-center">
            VoiceBridge is a free and open-source app that helps children with
            autism communicate by offering visual tools for daily activities,
            including navigating places, choosing food, and accessing calming
            music playlists.
          </p>
          <br />
          <p className="text-l"></p>
          Under construction, coming soon.
          <br />
          <br />
          {/* <Button variant={'default'}>
            <Link href="https://forms.gle/grPSfC6ZdT7c2UNi8">
              Join the waitlist here
            </Link>
          </Button>
          <br />
          <br /> */}
          <Button variant={'secondary'}>
            <Link href="/login">Sign in to the free and open beta</Link>
          </Button>
          <br />
          <Button variant={'outline'}>
            <Link href="https://github.com/harryt04/VoiceBridge">
              View source code
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export { LandingPage }
