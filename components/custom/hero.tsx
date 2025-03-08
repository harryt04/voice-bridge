import { GitHubLogoIcon } from '@radix-ui/react-icons'
import { Button } from '../ui/button'
import Link from 'next/link'
import { CirclePlayIcon } from 'lucide-react'

export const Hero = () => {
  return (
    <section className="container grid h-screen w-screen place-items-center items-center overflow-hidden p-4 md:h-screen">
      <div className="space-y-6 text-center">
        <main className="text-5xl font-bold md:text-6xl">
          <h1 className="inline">
            <span className="inline bg-gradient-to-r from-[#aa00ff] to-[#00cc99] bg-clip-text text-transparent">
              VoiceBridge
            </span>
          </h1>
        </main>

        <p className="mx-auto w-11/12 text-sm text-muted-foreground md:w-8/12 md:text-xl">
          VoiceBridge is a
          <span className="border-gradient inline border-b-2 bg-gradient-to-r from-[#aa00ff] to-[#00cc99] bg-clip-text text-transparent">
            &nbsp;free and open source&nbsp;
          </span>
          web app that helps children with autism communicate by offering visual
          tools for daily activities, including navigating places, choosing
          food, and accessing calming music playlists.
        </p>

        <div className="flex w-full flex-col items-center justify-center gap-4 md:flex-row">
          <div className="center grid max-w-screen-sm grid-cols-1 items-center justify-center gap-4 self-center md:grid-cols-2">
            <Link href="/login">
              <Button className="border-gradient w-full bg-gradient-to-r from-[#aa00ff] to-[#00cc99] md:max-w-none">
                <CirclePlayIcon />
                Get Started
              </Button>
            </Link>

            <Link
              target="_blank"
              href="https://github.com/harryt04/VoiceBridge"
            >
              <Button variant="outline" className="w-full md:max-w-none">
                <GitHubLogoIcon />
                View source code
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
