import { useTheme } from 'next-themes'
import { Hero } from './hero'

function LandingPage() {
  const { setTheme } = useTheme()
  setTheme('light')
  return (
    <div>
      <Hero />
    </div>
  )
}

export { LandingPage }
