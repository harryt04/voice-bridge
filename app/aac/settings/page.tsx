'use client'

import { useContext } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AacSettingsForm } from '@/components/custom/aac-settings-form'
import { useSession } from '@/lib/auth-client'
import { useSpeakerContext } from '@/hooks/use-speakers'
import {
  AacPreferencesContext,
  type AacPreferencesContextValue,
} from '@/app/aac/layout'

/**
 * AAC Settings Page
 *
 * Client component for managing AAC preferences.
 * - Gets speakerId from useSpeakerContext()
 * - Reads preferences from AacPreferencesContext
 * - Renders AacSettingsForm component
 * - If user is not parent: form is read-only with inline notice
 *
 * Per TRD §7.8, exact JSX for header.
 * Authorization: only parent can edit settings (read-only for villagers)
 */
export default function AacSettingsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { selectedSpeaker } = useSpeakerContext()
  const preferencesContext = useContext(AacPreferencesContext)

  const preferencesContextValue =
    preferencesContext as AacPreferencesContextValue

  const speakerId = selectedSpeaker?._id

  // Check if user is parent (caregiver with edit rights)
  const isParent = session?.user?.id === selectedSpeaker?.parentId

  if (!selectedSpeaker || !speakerId) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4">
        <p className="text-muted-foreground">No speaker selected</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header with back button and title - exact JSX per TRD §7.8 */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/aac')}>
          <ChevronLeft size={20} />
        </Button>
        <h1 className="font-display text-2xl font-semibold">AAC Settings</h1>
      </div>

      {/* Settings form with optional read-only notice */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {!isParent && (
          <div className="mb-4 flex gap-3 rounded-lg border border-muted-foreground/20 bg-muted p-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Only the caregiver can change these settings.
            </p>
          </div>
        )}

        {/* Settings form - component from WU-3-F */}
        <AacSettingsForm speakerId={speakerId} isOwner={isParent} />
      </div>
    </div>
  )
}
