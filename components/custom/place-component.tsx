'use client'
import { Place } from '@/models'
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
import { AudioLines, LandPlotIcon, TrashIcon } from 'lucide-react'
import { Button } from '../ui/button'
import { Pencil1Icon } from '@radix-ui/react-icons'
import { PlaceForm } from './place-form'
import { openGoogleMapsDirections } from '@/utils/directions'

export const PlaceComponent = ({
  place,
  editMode,
  onDelete,
}: {
  place: Place
  editMode: boolean
  onDelete: (place: Place) => void
}) => {
  const [imageError, setImageError] = useState(false)
  const [isEditing, setIsEditing] = useState(false) // Track if the form is open for editing
  const [updatedPlace, setUpdatedPlace] = useState<Place>(place) // Local state to hold the updated place
  const fallbackImage = 'https://i.sstatic.net/fUChS.png'

  // Check if imageUrl is valid
  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const imageUrl = isValidUrl(updatedPlace.imageUrl)
    ? updatedPlace.imageUrl
    : fallbackImage

  const key = `place-${updatedPlace._id}`

  const handleEditClick = () => {
    setIsEditing(true)
  }

  const handleCloseEdit = () => {
    setIsEditing(false)
  }

  const handleSubmit = async (updatedPlaceData: Place) => {
    setUpdatedPlace(updatedPlaceData)
    setIsEditing(false)
    fetch(`/api/place?id=${updatedPlaceData._id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPlaceData),
    })
  }

  const handleDeleteClick = async () => {
    onDelete(updatedPlace)
    fetch(`/api/place?id=${updatedPlace._id}`, {
      method: 'DELETE',
    })
  }

  return (
    <Card
      className={cn('min-h-full cursor-pointer')}
      onClick={() => {
        if (!editMode) {
          speakText(updatedPlace.name)
        }
      }}
    >
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-4">
            {updatedPlace.name}
            {!editMode && <AudioLines />}
          </div>
        </CardTitle>
        <CardDescription>{updatedPlace.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {imageError ? (
          <div className="flex h-[300px] w-[300px] items-center justify-center bg-gray-200 text-gray-500">
            Image not available
          </div>
        ) : (
          <Image
            height={500}
            width={500}
            src={imageUrl}
            alt={key}
            onError={() => setImageError(true)} // Trigger error state if image fails
          />
        )}
        {!editMode && (
          <div className="flex flex-row gap-4 py-4">
            <Button
              variant="outline"
              onClick={(event) => {
                event.stopPropagation()
                openGoogleMapsDirections(
                  (updatedPlace.address ?? updatedPlace.name) as string,
                )
              }}
            >
              <LandPlotIcon /> Directions
            </Button>
          </div>
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
          <PlaceForm
            onClose={handleCloseEdit} // Close the form
            onSubmit={handleSubmit} // Submit the form with updated data
            place={updatedPlace} // Pass the current updated place to pre-populate the form
          />
        )}
      </CardContent>
    </Card>
  )
}
