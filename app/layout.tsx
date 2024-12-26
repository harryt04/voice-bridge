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
    'VoiceBridge is a purpose-built barbershop and salon booking and payment collection app. Built by barbers for barbers.',
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
