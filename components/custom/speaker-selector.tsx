'use client'

import { useState } from 'react'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger } from '../ui/select'
import { useSpeakerContext } from '@/hooks/use-speakers'
import { PencilIcon, PlusIcon, ShareIcon } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'
import { SpeakerForm } from './speaker-form'

export const SpeakerSelector = () => {
  const {
    isLoading: isLoadingSpeakers,
    speakers,
    selectedSpeaker,
    setSelectedSpeaker,
  } = useSpeakerContext()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSpeaker, setEditingSpeaker] = useState<any>(null) // Store the speaker being edited

  const handleChildSwitch = (speakerId: string) => {
    setSelectedSpeaker(
      speakers.find((speaker) => speaker._id === speakerId) as any,
    )
  }

  const handleAddSpeaker = () => {
    setEditingSpeaker(null) // Clear any speaker being edited
    setIsFormOpen(true)
  }

  const handleEditSpeaker = () => {
    setEditingSpeaker(selectedSpeaker) // Set the speaker to be edited
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
  }

  const handleFormSubmit = async (speaker: any) => {
    // Handle adding or updating the speaker
    const addOrUpdateUrl = speaker._id
      ? `/api/speaker?id=${speaker._id}`
      : '/api/speaker'
    const addOrUpdateResponse = await fetch(addOrUpdateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(speaker),
    })
    const addOrUpdateResponseBody = await addOrUpdateResponse.json()
    setSelectedSpeaker(addOrUpdateResponseBody.updatedSpeaker as any)
    setIsFormOpen(false)
  }

  if (isLoadingSpeakers) return <div>Loading speakers...</div>

  return (
    <div className="px-4 py-6">
      {/* Speaker Selector */}
      <Select
        onValueChange={handleChildSwitch}
        value={selectedSpeaker?._id || ''}
      >
        <SelectTrigger className="w-full">
          {selectedSpeaker?.name || 'Select a Speaker'}
        </SelectTrigger>
        <SelectContent>
          {speakers.map((speaker) => (
            <SelectItem key={speaker._id} value={speaker._id}>
              {speaker.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Add and Share Buttons */}
      <div className="mt-4 flex flex-row justify-center gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" onClick={handleEditSpeaker}>
                <PencilIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit Speaker</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" onClick={handleAddSpeaker}>
                <PlusIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add Speaker</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {isFormOpen && (
        <SpeakerForm
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
          speaker={editingSpeaker}
        />
      )}
    </div>
  )
}
