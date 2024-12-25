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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Place, PlaceInput } from '@/models'
import { BanIcon, SaveIcon } from 'lucide-react'

export function PlaceForm({
  onClose,
  onSubmit,
  place,
}: {
  onClose: () => void
  onSubmit: (place: Place) => void
  place?: Place // Optional, for editing an existing place
}) {
  const [formState, setFormState] = useState<PlaceInput>({
    name: place?.name || '',
    imageUrl: place?.imageUrl || '',
    description: place?.description || '',
    address: place?.address || '',
    speakerId: place?.speakerId || '',
  })

  useEffect(() => {
    if (place) {
      setFormState({
        name: place.name,
        imageUrl: place.imageUrl,
        description: place.description,
        address: place.address,
        speakerId: place.speakerId,
      })
    }
  }, [place])

  const handleChange =
    (field: keyof typeof formState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormState({
        ...formState,
        [field]: e.target.value,
      })
    }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault() // Prevent default browser form submission
    onSubmit({
      ...place,
      ...formState,
    } as Place)
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="mx-auto max-w-xs rounded-lg p-6 sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">
            {place ? 'Edit Place' : 'Add Place'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formState.name}
              onChange={handleChange('name')}
              placeholder="Enter place name"
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              value={formState.imageUrl}
              onChange={handleChange('imageUrl')}
              placeholder="Enter image URL"
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formState.description}
              onChange={handleChange('description')}
              placeholder="Enter a description"
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formState.address}
              onChange={handleChange('address')}
              placeholder="Enter address"
              className="w-full"
            />
          </div>
          <DialogFooter className="mt-6 flex justify-end gap-4">
            <Button type="button" onClick={onClose} variant="outline">
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
