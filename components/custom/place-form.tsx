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

export function PlaceForm({
  onClose,
  onSubmit,
  place,
}: {
  onClose: () => void
  onSubmit: (place: Place) => void
  place?: Place // Optional, for editing an existing place
}) {
  // Consolidate all state into a single object
  const [formState, setFormState] = useState<PlaceInput>({
    name: place?.name || '',
    imageUrl: place?.imageUrl || '',
    description: place?.description || '',
    address: place?.address || '',
  })

  // Update the state when `place` changes
  useEffect(() => {
    if (place) {
      setFormState({
        name: place.name,
        imageUrl: place.imageUrl,
        description: place.description,
        address: place.address,
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

  const handleSubmit = () => {
    onSubmit({
      ...place,
      ...formState,
    } as Place)
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{place ? 'Edit Place' : 'Add Place'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formState.name}
              onChange={handleChange('name')}
              placeholder="Enter place name"
            />
          </div>
          <div>
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              value={formState.imageUrl}
              onChange={handleChange('imageUrl')}
              placeholder="Enter image URL"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formState.description}
              onChange={handleChange('description')}
              placeholder="Enter a description"
            />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formState.address}
              onChange={handleChange('address')}
              placeholder="Enter address"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="ghost">
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
