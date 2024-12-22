'use client'

import { Food } from '@/models'
import Image from 'next/image'
import React, { useState } from 'react'
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
import { FoodForm } from './food-form'

export const FoodComponent = ({
  food,
  editMode,
  onDelete,
}: {
  food: Food
  editMode: boolean
  onDelete: (food: Food) => void
}) => {
  const [imageError, setImageError] = useState(false)
  const [isEditing, setIsEditing] = useState(false) // Track if the form is open for editing
  const [updatedFood, setUpdatedFood] = useState<Food>(food) // Local state to hold the updated food
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
    isValidUrl(updatedFood?.imageUrl as string)
      ? updatedFood.imageUrl
      : fallbackImage
  ) as string

  const key = `food-${updatedFood._id}`

  const handleEditClick = () => {
    setIsEditing(true)
  }

  const handleCloseEdit = () => {
    setIsEditing(false)
  }

  const handleSubmit = async (updatedFoodData: Food) => {
    setUpdatedFood(updatedFoodData)
    setIsEditing(false)
    fetch(`/api/food?id=${updatedFoodData._id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedFoodData),
    })
  }

  const handleDeleteClick = async () => {
    onDelete(updatedFood)
    fetch(`/api/food?id=${updatedFood._id}`, {
      method: 'DELETE',
    })
  }

  return (
    <Card
      className={cn('min-h-full cursor-pointer')}
      onClick={() => {
        if (!editMode) {
          speakText(updatedFood.name)
        }
      }}
    >
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-4">
            {updatedFood.name}
            {!editMode && <AudioLines />}
          </div>
        </CardTitle>
        <CardDescription>{updatedFood.description}</CardDescription>
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
            <Button
              variant="outline"
              onClick={handleEditClick} // Open the edit form
            >
              <Pencil1Icon /> Edit
            </Button>
            <Button variant="destructive" onClick={handleDeleteClick}>
              <TrashIcon /> Delete
            </Button>
          </div>
        )}
        {isEditing && (
          <FoodForm
            onClose={handleCloseEdit} // Close the form
            onSubmit={handleSubmit} // Submit the form with updated data
            food={updatedFood} // Pass the current updated food to pre-populate the form
          />
        )}
      </CardContent>
    </Card>
  )
}
