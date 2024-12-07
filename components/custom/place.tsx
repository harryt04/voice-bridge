import { Place } from '@/models'
import Image from 'next/image'
import React from 'react'

export const PlaceComponent = ({ place }: { place: Place }) => {
  const key = `place-${place.id}`
  return (
    <>
      <Image height={100} width={100} src={place.imageUrl} alt={key}></Image>
      <p>{place.id}</p>
      <p>{place.name}</p>
      <p>{place.description}</p>
    </>
  )
}
