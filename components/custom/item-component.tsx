'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { cn } from '@/lib/utils'
import { speakText } from '@/utils/speech'
import { AudioLines, TrashIcon } from 'lucide-react'
import { Button } from '../ui/button'
import { Pencil1Icon } from '@radix-ui/react-icons'
import { ItemForm } from './item-form'

export const ItemComponent = ({
  item,
  editMode,
  onDelete,
  modelName,
}: {
  item: any
  editMode: boolean
  onDelete: (item: any) => void
  modelName: string
}) => {
  const [imageError, setImageError] = useState(false)
  const [isEditing, setIsEditing] = useState(false) // Track if the form is open for editing
  const [updatedItem, setUpdatedItem] = useState<any>(item) // Local state to hold the updated item
  const fallbackImage = 'https://i.sstatic.net/fUChS.png'

  // Check if imageUrl is valid
  const isValidUrl = (url: string) => {
    if (!url) return false
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const imageUrl = (
    isValidUrl(updatedItem?.imageUrl as string)
      ? updatedItem.imageUrl
      : fallbackImage
  ) as string

  const key = `${modelName}-${updatedItem._id}`

  const handleEditClick = () => {
    setIsEditing(true)
  }

  const handleCloseEdit = () => {
    setIsEditing(false)
  }

  const handleSubmit = async (updatedItemData: any) => {
    setUpdatedItem(updatedItemData)
    setIsEditing(false)
    fetch(`/api/${modelName}?id=${updatedItemData._id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedItemData),
    })
  }

  const handleDeleteClick = async () => {
    onDelete(updatedItem)
    fetch(`/api/${modelName}?id=${updatedItem._id}`, {
      method: 'DELETE',
    })
  }

  return (
    <Card
      className={cn('min-h-full cursor-pointer')}
      onClick={() => {
        if (!editMode) {
          speakText(updatedItem.name)
        }
      }}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-4">
          {updatedItem.name}
          {!editMode && <AudioLines />}
        </CardTitle>
        <CardDescription>{updatedItem.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {imageError ? (
          <div className="flex h-[300px] w-[300px] items-center justify-center bg-gray-200 text-gray-500">
            Image not available
          </div>
        ) : (
          <Image
            height={300}
            width={300}
            src={imageUrl}
            alt={key}
            onError={() => setImageError(true)} // Trigger error state if image fails
          />
        )}
        {editMode && !isEditing && (
          <div className="flex flex-row gap-4 p-4">
            <Button variant="outline" onClick={handleEditClick}>
              <Pencil1Icon /> Edit
            </Button>
            <Button variant="destructive" onClick={handleDeleteClick}>
              <TrashIcon /> Delete
            </Button>
          </div>
        )}
        {isEditing && (
          <ItemForm
            onClose={handleCloseEdit}
            onSubmit={handleSubmit}
            item={updatedItem}
            modelName={modelName}
          />
        )}
      </CardContent>
    </Card>
  )
}
