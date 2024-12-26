'use client'

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react'
import { useQuery } from '@tanstack/react-query'
import { Speaker } from '@/models/speaker'

// Define the context type
type SpeakerContextType = {
  speakers: Speaker[]
  selectedSpeaker: Speaker | null
  setSelectedSpeaker: (speaker: Speaker | null) => void
  isLoading: boolean
  progress: number
}

const SpeakerContext = createContext<SpeakerContextType | undefined>(undefined)

// Fetch function for speakers
const fetchSpeakers = async (): Promise<Speaker[]> => {
  const response = await fetch('/api/speakers')
  if (!response.ok) {
    throw new Error('Error fetching speakers')
  }
  return response.json()
}

// Provider component
export const SpeakerProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const {
    data: speakers = [] as Speaker[],
    isLoading,
    isError,
  } = useQuery({ queryKey: ['speakers'], queryFn: fetchSpeakers })

  const [selectedSpeaker, setSelectedSpeakerState] = useState<Speaker | null>(
    null,
  )

  const [progress, setProgress] = useState(20)

  // Simulate progress
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setProgress((prev) => (prev < 100 ? prev + 20 : 100))
      }, 5) // Increments every 5ms. This request is ususally extremely fast.

      return () => clearInterval(interval)
    } else {
      setProgress(100) // Set progress to 100% when loading is complete
    }
  }, [isLoading])

  const setSelectedSpeaker = (speaker: Speaker | null) => {
    if (!speakers.find((s) => s._id === speaker?._id)) {
      speakers.push(speaker as any)
    }
    setSelectedSpeakerState(speaker)
  }

  useEffect(() => {
    if (speakers?.length > 0 && !selectedSpeaker) {
      setSelectedSpeakerState(speakers[0])
    }
  }, [selectedSpeaker, speakers])

  return (
    <SpeakerContext.Provider
      value={{
        speakers,
        selectedSpeaker,
        setSelectedSpeaker,
        isLoading,
        progress,
      }}
    >
      {children}
    </SpeakerContext.Provider>
  )
}

// Hook for consuming the SpeakerContext
export const useSpeakerContext = (): SpeakerContextType => {
  const context = useContext(SpeakerContext)
  if (!context) {
    throw new Error('useSpeakerContext must be used within a SpeakerProvider')
  }
  return context
}
