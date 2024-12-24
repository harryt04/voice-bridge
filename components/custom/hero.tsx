import { GitHubLogoIcon } from '@radix-ui/react-icons'
import { Button } from '../ui/button'
import Link from 'next/link'

export const Hero = () => {
  return (
    <section className="container grid h-full w-full place-items-center items-center">
      <div className="space-y-6 text-center">
        <main className="text-5xl font-bold md:text-6xl">
          <h1 className="inline">
            <span className="inline bg-gradient-to-r from-[#aa00ff] to-[#00cc99] bg-clip-text text-transparent">
              VoiceBridge
            </span>
          </h1>
        </main>

        <p className="mx-auto text-xl text-muted-foreground md:w-6/12">
          VoiceBridge is a
          <span className="border-gradient inline border-b-2 bg-gradient-to-r from-[#aa00ff] to-[#00cc99] bg-clip-text text-transparent">
            &nbsp;free and open source&nbsp;
          </span>
          web app that helps children with autism communicate by offering visual
          tools for daily activities, including navigating places, choosing
          food, and accessing calming music playlists.
        </p>

        <div className="space-y-4 md:space-x-4">
          <Link href="/login">
            <Button className="w-full md:w-1/5">Get Started</Button>
          </Link>

          <Link target="_blank" href="https://github.com/harryt04/VoiceBridge">
            <Button variant="outline" className="w-full md:w-1/5">
              Github Repository
              <GitHubLogoIcon className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
