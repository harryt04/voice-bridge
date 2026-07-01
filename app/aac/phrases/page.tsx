'use client'

import { useContext, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Edit, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AacPhraseGrid } from '@/components/custom/aac-phrase-grid'
import { useSession } from '@/lib/auth-client'
import { useSpeakerContext } from '@/hooks/use-speakers'
import { useAacPhrases } from '@/hooks/use-aac-phrases'
import {
  AacPreferencesContext,
  type AacPreferencesContextValue,
} from '@/app/aac/layout'

/**
 * AAC Quick Phrases Page
 *
 * Client component for displaying and managing quick phrases.
 * - Gets speakerId from useSpeakerContext()
 * - Fetches custom phrases via useAacPhrases()
 * - Displays DEFAULT_PHRASES + custom phrases
 * - Edit mode toggle for caregivers (isParent check)
 * - Header with back button, title, edit toggle, and add button
 *
 * Per TRD §7.7, exact JSX for header.
 * Authorization: only parent can edit/add/delete (read-only for villagers)
 */
export default function AacPhrasesPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { selectedSpeaker } = useSpeakerContext()
  const speakerId = selectedSpeaker?._id
  const preferencesContext = useContext(AacPreferencesContext)

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false)

  // Fetch custom phrases
  const { data: customPhrases } = useAacPhrases(speakerId ?? '')

  // Check if user is parent (caregiver with edit rights)
  const isParent = session?.user?.id === selectedSpeaker?.parentId

  const handleEditModeToggle = useCallback(() => {
    setIsEditMode((prev) => !prev)
  }, [])

  // Placeholder for opening add dialog (actual implementation in component)
  const openAddDialog = useCallback(() => {
    // This is handled by the AacPhraseGrid component via a ref or callback
    // For now, the component will expose this functionality
  }, [])

  if (!selectedSpeaker) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4">
        <p className="text-muted-foreground">No speaker selected</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header with back button, title, edit toggle, and add button - exact JSX per TRD §7.7 */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/aac')}
          >
            <ChevronLeft size={20} />
          </Button>
          <h1 className="font-display text-2xl font-semibold">Quick Phrases</h1>
        </div>
        <div className="flex gap-2">
          {isParent && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEditModeToggle}
                aria-label="Edit phrases"
              >
                <Edit size={20} />
              </Button>
              {isEditMode && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={openAddDialog}
                  aria-label="Add phrase"
                >
                  <Plus size={20} />
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Phrase grid - component from WU-3-F */}
      <div className="flex-1 overflow-y-auto">
        <AacPhraseGrid customPhrases={customPhrases ?? []} isOwner={isParent} />
      </div>
    </div>
  )
}
