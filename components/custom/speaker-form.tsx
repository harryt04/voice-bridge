'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Speaker, SpeakerInput } from '@/models'

export function SpeakerForm({
  onClose,
  onSubmit,
  speaker,
}: {
  onClose: () => void
  onSubmit: (speaker: Speaker) => void
  speaker?: Speaker // Optional, for editing an existing speaker
}) {
  // Consolidate all state into a single object
  const [formState, setFormState] = useState<SpeakerInput>({
    name: speaker?.name || '',
  })

  // Parse comma-separated list of email addresses into an array
  const [villagerIds, setVillagerIds] = useState<string>(
    speaker?.villagerIds?.join(', ') || '',
  )

  // Update the state when `speaker` changes
  useEffect(() => {
    if (speaker) {
      setFormState({
        name: speaker.name,
      })
      setVillagerIds(speaker.villagerIds?.join(', ') || '')
    }
  }, [speaker])

  const handleChange =
    (field: keyof typeof formState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormState({
        ...formState,
        [field]: e.target.value,
      })
    }

  const handleVillagerIdsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVillagerIds(e.target.value)
  }

  const handleSubmit = () => {
    const villagerIdsArray = villagerIds
      .split(',')
      .map((email) => email.trim())
      .filter((email) => email) // Filter out empty values
    onSubmit({
      ...speaker,
      ...formState,
      villagerIds: villagerIdsArray,
    } as Speaker)
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="mx-auto max-w-xs rounded-lg p-6 sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">
            {speaker ? 'Edit Speaker' : 'Add Speaker'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formState.name}
              onChange={handleChange('name')}
              placeholder="Enter speaker name"
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="villagerIds">
              Users you&apos;ve shared access with
            </Label>
            <Input
              id="villagerIds"
              value={villagerIds}
              onChange={handleVillagerIdsChange}
              placeholder="Enter comma-separated User IDs"
              className="w-full"
            />
          </div>
        </div>
        <DialogFooter className="mt-6 flex justify-end gap-4">
          <Button onClick={onClose} variant="ghost">
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
