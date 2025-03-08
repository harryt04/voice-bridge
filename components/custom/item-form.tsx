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

export function ItemForm({
  onClose,
  onSubmit,
  item,
  modelName,
}: {
  onClose: () => void
  onSubmit: (item: any) => void
  item?: any
  modelName: string
}) {
  const [formState, setFormState] = useState<any>({
    name: item?.name || '',
    imageUrl: item?.imageUrl || '',
    description: item?.description || '',
  })

  useEffect(() => {
    if (item) {
      setFormState({
        name: item.name,
        imageUrl: item.imageUrl,
        description: item.description,
      })
    }
  }, [item])

  const handleChange =
    (field: keyof typeof formState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormState({
        ...formState,
        [field]: e.target.value,
      })
    }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit({ ...item, ...formState })
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="mx-auto max-w-xs rounded-lg p-6 sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">
            {item ? `Edit ${modelName}` : `Add ${modelName}`}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formState.name}
              onChange={handleChange('name')}
              placeholder={`Enter ${modelName} name`}
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
              placeholder={`Enter ${modelName} description`}
              className="w-full"
            />
          </div>
          <DialogFooter className="mt-6 flex justify-end gap-4">
            <Button onClick={onClose} type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
