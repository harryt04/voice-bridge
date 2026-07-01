'use client'

import { SessionProvider } from '@/lib/auth-client'
import { PostHogProvider } from '@/providers/posthogProvider'
import { ThemeProvider } from '@/providers/themeProvider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AuthGatedSidebar } from '@/components/custom/auth-gated-sidebar'
import { VBQueryClient } from '@/hooks/use-query-client'
import { Toaster } from 'sonner'

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PostHogProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="theme"
        >
          <SidebarProvider>
            <VBQueryClient>
              <AuthGatedSidebar />
              <SidebarInset>{children}</SidebarInset>
              <Toaster />
            </VBQueryClient>
          </SidebarProvider>
        </ThemeProvider>
      </PostHogProvider>
    </SessionProvider>
  )
}
