import type { Metadata } from 'next'
import { Inter as FontSans, Outfit as FontDisplay } from 'next/font/google'

import './globals.css'

import { cn } from '@/lib/utils'
import { SessionProvider } from '@/lib/auth-client'
import { PostHogProvider } from '@/providers/posthogProvider'
import { ThemeProvider } from '@/providers/themeProvider'
import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import { AuthGatedSidebar } from '@/components/custom/auth-gated-sidebar'
import { VBQueryClient } from '@/hooks/use-query-client'
import { Toaster } from 'sonner'

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
})

const fontDisplay = FontDisplay({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '600', '700'],
})

export const metadata: Metadata = {
  title: 'VoiceBridge',
  description:
    'VoiceBridge is a web app that helps children or adults with autism communicate by offering visual tools for daily activities, including navigating places, choosing food, and accessing calming music playlists.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <SessionProvider>
        <PostHogProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SidebarProvider>
              <body
                suppressHydrationWarning={true}
                className={cn(
                  'min-h-screen bg-background font-sans antialiased',
                  fontSans.variable,
                  fontDisplay.variable,
                )}
              >
                <VBQueryClient>
                  <AuthGatedSidebar />
                  {children}
                  <Toaster />
                </VBQueryClient>
              </body>
            </SidebarProvider>
          </ThemeProvider>
        </PostHogProvider>
      </SessionProvider>
    </html>
  )
}
