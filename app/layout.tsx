import { ClerkProvider, SignedIn, SignedOut } from '@clerk/nextjs'
import type { Metadata } from 'next'
import { Inter as FontSans } from 'next/font/google'

import './globals.css'

import { cn } from '@/lib/utils'
import { PostHogProvider } from '@/providers/posthogProvider'
import { ThemeProvider } from '@/providers/themeProvider'
import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { VBQueryClient } from '@/hooks/use-query-client'
import { Toaster } from 'sonner'

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
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
      <ClerkProvider>
        <PostHogProvider>
          <body
            suppressHydrationWarning={true}
            className={cn(
              'min-h-screen bg-background font-sans antialiased',
              fontSans.variable,
            )}
          >
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <SidebarProvider>
                <VBQueryClient>
                  <SignedIn>
                    <AppSidebar />
                  </SignedIn>
                  {children}
                  <Toaster />
                </VBQueryClient>
              </SidebarProvider>
            </ThemeProvider>
          </body>
        </PostHogProvider>
      </ClerkProvider>
    </html>
  )
}
