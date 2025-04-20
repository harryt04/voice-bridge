import Link from 'next/link'
import { ThemeSwitcher } from './themeSwitcher'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CirclePlayIcon, Github } from 'lucide-react' // Use CirclePlayIcon
import { GitHubLogoIcon } from '@radix-ui/react-icons' // Keep for source code button if preferred

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header/Nav Placeholder */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            {/* Updated App Name */}
            <span className="inline bg-gradient-to-r from-[#aa00ff] to-[#00cc99] bg-clip-text font-bold text-transparent">
              VoiceBridge
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <Button asChild>
              <Link href="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 lg:py-32">
          <div className="container grid place-items-center gap-6 text-center">
            {/* Updated Heading with Gradient */}
            <h1 className="inline text-4xl font-extrabold tracking-tight lg:text-5xl">
              <span className="inline bg-gradient-to-r from-[#aa00ff] to-[#00cc99] bg-clip-text text-transparent">
                VoiceBridge
              </span>
            </h1>
            {/* Updated Description */}
            <p className="mx-auto max-w-[700px] text-lg text-muted-foreground">
              VoiceBridge is a
              <span className="border-gradient inline border-b-2 bg-gradient-to-r from-[#aa00ff] to-[#00cc99] bg-clip-text text-transparent">
                &nbsp;free and open source&nbsp;
              </span>
              web app that helps children or adults with autism communicate by
              offering visual tools for daily activities, including navigating
              places, choosing food, and accessing calming music playlists.
            </p>
            {/* Updated Buttons */}
            <div className="flex flex-col gap-4 md:flex-row">
              <Button
                asChild
                size="lg"
                className="border-gradient bg-gradient-to-r from-[#aa00ff] to-[#00cc99]"
              >
                <Link href="/login">
                  <CirclePlayIcon className="mr-2 h-5 w-5" />
                  Get Started
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a
                  href="https://github.com/harryt04/voice-bridge" // Updated GitHub link
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GitHubLogoIcon className="mr-2 h-5 w-5" />
                  View source code
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="w-full bg-slate-50/50 py-12 dark:bg-transparent lg:py-24"
        >
          <div className="container space-y-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
                Features
              </h2>
              {/* Updated Feature Description */}
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Designed to aid communication and daily activities for
                individuals with autism.
              </p>
            </div>
            <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
              {/* Feature Card 1 - Updated */}
              <Card>
                <CardHeader>
                  <CardTitle>Communication Aid</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Helps users express needs and choices through visual aids
                    and structured options.
                  </p>
                </CardContent>
              </Card>
              {/* Feature Card 2 - Updated */}
              <Card>
                <CardHeader>
                  <CardTitle>Visual Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Offers visual support for daily tasks like navigating,
                    choosing food, and managing routines.
                  </p>
                </CardContent>
              </Card>
              {/* Feature Card 3 - Updated */}
              <Card>
                <CardHeader>
                  <CardTitle>Free & Open Source</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Completely free to use with the source code available on
                    GitHub. Contribute or adapt it as needed.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Optional: Call to Action Section */}
        <section id="open-source" className="w-full py-12 lg:py-24">
          <div className="container">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
              {/* Updated CTA Heading */}
              <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
                Ready to Bridge Communication?
              </h2>
              {/* Updated CTA Text */}
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Sign up or log in to start using VoiceBridge&apos;s visual
                tools. It&apos;s free forever.
              </p>
              {/* Updated CTA Button */}
              <Button
                asChild
                size="lg"
                className="border-gradient bg-gradient-to-r from-[#aa00ff] to-[#00cc99]"
              >
                <Link href="/login">
                  <CirclePlayIcon className="mr-2 h-5 w-5" />
                  Get Started
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t py-6 md:px-8 md:py-0">
        <div className="grid w-full grid-cols-1 place-items-center justify-between gap-4 text-center md:h-24 md:flex-row">
          <p className="w-full text-center text-sm leading-loose text-muted-foreground">
            Built by{' '}
            <a
              href="https://github.com/harryt04"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Harry Thomas
            </a>
            . The source code is available on {/* Updated Footer GitHub Link */}
            <a
              href="https://github.com/harryt04/voice-bridge"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              GitHub
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  )
}

export { LandingPage }
