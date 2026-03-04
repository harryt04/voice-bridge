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
import { Muted } from '../ui/typography'
import { DynamicLucideIcon } from './dynamic-lucide-icon'

export const ItemComponent = ({
  item,
  editMode,
  onDelete,
  modelName,
  compact = false,
}: {
  item: any
  editMode: boolean
  onDelete: (item: any) => void
  modelName: string
  compact?: boolean
}) => {
  const [imageError, setImageError] = useState(false)
  const [isEditing, setIsEditing] = useState(false) // Track if the form is open for editing
  const [updatedItem, setUpdatedItem] = useState<any>(item) // Local state to hold the updated item

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

  // Prioritize base64 image if available, otherwise use the URL
  const imageSource =
    updatedItem.imageBase64 ||
    (isValidUrl(updatedItem?.imageUrl as string) ? updatedItem.imageUrl : null)

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
      className={cn('cursor-pointer', compact ? 'p-2' : 'min-h-full')}
      onClick={() => {
        if (!editMode) {
          speakText(updatedItem.name)
        }
      }}
    >
      <CardHeader className={compact ? 'p-2' : ''}>
        <CardTitle
          className={cn(
            'flex items-center gap-2',
            compact ? 'text-sm font-medium' : 'gap-4',
          )}
        >
          {compact && updatedItem.icon && (
            <DynamicLucideIcon
              name={updatedItem.icon}
              className="h-5 w-5 shrink-0 text-muted-foreground"
            />
          )}
          {updatedItem.name}
          {!editMode && !compact && <AudioLines />}
        </CardTitle>
        {!compact && (
          <CardDescription>{updatedItem.description}</CardDescription>
        )}
      </CardHeader>
      {!compact && (
        <CardContent>
          {imageError && (
            <div className="flex h-[300px] w-[300px] items-center justify-center bg-gray-200 text-gray-500">
              Image not available
            </div>
          )}

          {!!imageSource && (
            <Image
              height={300}
              width={300}
              src={imageSource}
              alt={key}
              onError={() => setImageError(true)} // Trigger error state if image fails
            />
          )}

          {!imageSource && updatedItem.icon && (
            <div className="flex h-[300px] w-[300px] items-center justify-center rounded-md bg-muted">
              <DynamicLucideIcon
                name={updatedItem.icon}
                className="h-24 w-24 text-muted-foreground"
              />
            </div>
          )}

          {!imageSource && !updatedItem.icon && (
            <Muted>Image not provided. Edit this item to add one.</Muted>
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
      )}
    </Card>
  )
}
