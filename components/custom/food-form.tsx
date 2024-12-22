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
import { Food, FoodInput } from '@/models'

export function FoodForm({
  onClose,
  onSubmit,
  food,
}: {
  onClose: () => void
  onSubmit: (food: Food) => void
  food?: Food // Optional, for editing an existing food item
}) {
  // Consolidate all state into a single object
  const [formState, setFormState] = useState<FoodInput>({
    name: food?.name || '',
    imageUrl: food?.imageUrl || '',
    description: food?.description || '',
  })

  // Update the state when `food` changes
  useEffect(() => {
    if (food) {
      setFormState({
        name: food.name,
        imageUrl: food.imageUrl,
        description: food.description,
      })
    }
  }, [food])

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
      ...food,
      ...formState,
    } as Food)
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="mx-auto max-w-xs rounded-lg p-6 sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">
            {food ? 'Edit Food' : 'Add Food'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formState.name}
              onChange={handleChange('name')}
              placeholder="Enter food name"
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
