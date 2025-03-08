import { useTheme } from 'next-themes'
import { Hero } from './hero'

function LandingPage() {
  const { setTheme } = useTheme()
  setTheme('light')
  return <Hero />
}

export { LandingPage }
