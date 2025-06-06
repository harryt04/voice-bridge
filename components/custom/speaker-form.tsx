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
import { BanIcon, SaveIcon, TrashIcon } from 'lucide-react'
import './styles/speaker-form.css'

export function SpeakerForm({
  onClose,
  onDelete,
  onSubmit,
  speaker,
}: {
  onClose: () => void
  onDelete: (speaker: Speaker) => void
  onSubmit: (speaker: Speaker) => void
  speaker?: Speaker // Optional, for editing an existing speaker
}) {
  const [formState, setFormState] = useState<SpeakerInput>({
    name: speaker?.name || '',
  })

  const [villagerIds, setVillagerIds] = useState<string>(
    speaker?.villagerIds?.join(', ') || '',
  )

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const villagerIdsArray = villagerIds
      .split(',')
      .map((email) => email.trim())
      .filter((email) => email)
    onSubmit({
      ...speaker,
      ...formState,
      villagerIds: villagerIdsArray,
    } as Speaker)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit(e)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="mx-auto max-w-xs rounded-lg p-6 sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">
            {speaker ? 'Edit Speaker' : 'Add Speaker'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
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
          <DialogFooter className="speaker-form-footer">
            <div>
              {!!speaker && (
                <Button
                  onClick={() => {
                    if (speaker) {
                      onDelete(speaker)
                    }
                  }}
                  variant="destructive"
                  type="button"
                >
                  <TrashIcon />
                  Delete
                </Button>
              )}
            </div>
            <div className="spacer"></div>
            <Button onClick={onClose} variant="outline" type="button">
              <BanIcon />
              Cancel
            </Button>
            <Button type="submit">
              <SaveIcon />
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
