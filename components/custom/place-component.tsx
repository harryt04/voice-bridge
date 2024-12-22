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
import { AudioLines, TrashIcon } from 'lucide-react'
import { Button } from '../ui/button'
import { Pencil1Icon } from '@radix-ui/react-icons'

export const PlaceComponent = ({
  place,
  editMode,
}: {
  place: Place
  editMode: boolean
}) => {
  const [imageError, setImageError] = useState(false)
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

  const imageUrl = isValidUrl(place.imageUrl) ? place.imageUrl : fallbackImage

  const key = `place-${place._id}`

  return (
    <Card
      className={cn('min-h-full cursor-pointer')}
      onClick={() => {
        if (!editMode) {
          speakText(place.name)
        }
      }}
    >
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-4">
            {place.name}
            <AudioLines />
          </div>
        </CardTitle>
        <CardDescription className={cn('visible:false')}>
          {place.description}
        </CardDescription>
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
        {editMode && (
          <div className="flex flex-row gap-4 p-4">
            <Button
              variant="outline"
              onClick={() => {
                console.log('edit')
              }}
            >
              <Pencil1Icon /> Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                console.log('delete')
              }}
            >
              <TrashIcon /> Delete
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
