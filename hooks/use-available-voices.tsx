'use client'

import React from 'react'

/**
 * Hook to load available system voices from Web Speech API.
 *
 * Waits for onvoiceschanged event or 3-second timeout, whichever comes first.
 * Addresses G7: Client-side voice availability detection.
 *
 * @returns Object with voices (SpeechSynthesisVoice[]) and loading state
 */
export function useAvailableVoices() {
  const [voices, setVoices] = React.useState<SpeechSynthesisVoice[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const synth = window.speechSynthesis
    let timeoutHandle: NodeJS.Timeout | null = null
    let isMounted = true

    // Set a 3-second timeout fallback to fetch voices
    timeoutHandle = setTimeout(() => {
      if (isMounted) {
        const voiceList = synth.getVoices()
        setVoices(voiceList)
        setLoading(false)
      }
    }, 3000)

    // Listen for onvoiceschanged event, which fires when voices load (may be instant)
    const handleVoicesChanged = () => {
      if (isMounted) {
        const voiceList = synth.getVoices()
        setVoices(voiceList)
        setLoading(false)
        if (timeoutHandle) {
          clearTimeout(timeoutHandle)
          timeoutHandle = null
        }
      }
    }

    synth.onvoiceschanged = handleVoicesChanged

    // Also try immediately in case voices are already loaded
    const initialVoices = synth.getVoices()
    if (initialVoices.length > 0) {
      setVoices(initialVoices)
      setLoading(false)
      if (timeoutHandle) {
        clearTimeout(timeoutHandle)
        timeoutHandle = null
      }
    }

    return () => {
      isMounted = false
      if (timeoutHandle) {
        clearTimeout(timeoutHandle)
      }
    }
  }, [])

  return { voices, loading }
}
