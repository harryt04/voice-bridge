import type { Metadata, Viewport } from 'next'
import { Inter as FontSans, Outfit as FontDisplay } from 'next/font/google'
import Script from 'next/script'

import './globals.css'

import { cn } from '@/lib/utils'
import { RootLayoutClient } from './layout-client'

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
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { url: '/favicon.ico?v=2', sizes: '16x16 32x32 48x48' },
      { url: '/favicon-16x16.png?v=2', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png?v=2', sizes: '32x32', type: 'image/png' },
      {
        url: '/android-chrome-192x192.png?v=2',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/android-chrome-512x512.png?v=2',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    apple: [
      { url: '/apple-touch-icon.png?v=2', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    title: 'VoiceBridge',
    statusBarStyle: 'default',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f6f3' },
    { media: '(prefers-color-scheme: dark)', color: '#1b1d27' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function() {
  try {
    const theme = localStorage.getItem('theme') || 'system';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
})()`,
          }}
        />
      </head>
      <body
        suppressHydrationWarning={true}
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable,
          fontDisplay.variable,
        )}
      >
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  )
}
