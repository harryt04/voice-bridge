'use client'

import React, { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SpeakerProvider } from './use-speakers'

// Create a client
const queryClient = new QueryClient()

export const VBQueryClient = ({ children }: { children: any }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <SpeakerProvider>{children}</SpeakerProvider>
    </QueryClientProvider>
  )
}
