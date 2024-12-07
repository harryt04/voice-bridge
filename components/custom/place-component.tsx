'use client'
import { Place } from '@/models'
import Image from 'next/image'
import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { cn } from '@/lib/utils'
import { speakText } from '@/utils/speech'
import { AudioLines } from 'lucide-react'

export const PlaceComponent = ({ place }: { place: Place }) => {
  const key = `place-${place.id}`
  return (
    <div className={cn('p-8')}>
      <Card
        className={cn('cursor-pointer')}
        onClick={() => speakText(place.name)}
      >
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-4">
              {place.name}
              <AudioLines />
            </div>

            {/* <Button className={cn('mx-2')} size="icon">
              <AudioLines />
            </Button> */}
          </CardTitle>
          <CardDescription>{place.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Image
            height={300}
            width={300}
            src={place.imageUrl}
            alt={key}
          ></Image>
        </CardContent>
      </Card>
    </div>
  )
}
