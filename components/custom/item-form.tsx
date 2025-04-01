'use client'

import { useState, useEffect, useRef } from 'react'
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
import { UploadIcon } from 'lucide-react'
import { compressAndConvertToBase64 } from '@/utils/imageUtils'
import Image from 'next/image'

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
    imageBase64: item?.imageBase64 || '',
  })
  const [isUploading, setIsUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(
    item?.imageBase64 || item?.imageUrl || null,
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (item) {
      setFormState({
        name: item.name,
        imageUrl: item.imageUrl || '',
        description: item.description || '',
        imageBase64: item.imageBase64 || '',
      })
      setPreviewImage(item.imageBase64 || item.imageUrl || null)
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)

      // Compress and convert the image to base64
      const base64String = await compressAndConvertToBase64(file)

      // Update form state with the base64 image
      setFormState({
        ...formState,
        imageBase64: base64String,
      })

      // Set preview image
      setPreviewImage(base64String)
    } catch (error) {
      console.error('Error processing image:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
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

          {/* Image upload section */}
          <div className="space-y-2">
            <Label>Image</Label>
            <div className="flex flex-col gap-4">
              {/* Image preview */}
              {previewImage && (
                <div className="relative h-60 w-full overflow-hidden rounded-md border border-gray-300">
                  <Image
                    src={previewImage}
                    alt="Item preview"
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={triggerFileInput}
                  variant="outline"
                  disabled={isUploading}
                  className="flex-1"
                >
                  {isUploading ? (
                    'Processing...'
                  ) : (
                    <>
                      <UploadIcon className="mr-2 h-4 w-4" />
                      Upload Image
                    </>
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {/* Keep the URL input for images from the web */}
                <div className="flex-1">
                  <Input
                    id="imageUrl"
                    value={formState.imageUrl}
                    onChange={handleChange('imageUrl')}
                    placeholder="Or enter image URL"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
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
