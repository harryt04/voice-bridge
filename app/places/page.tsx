'use client'
import { PlaceComponent } from '@/components/custom/place-component'
import { Button } from '@/components/ui/button'
import { Place } from '@/models'
import { PlusIcon } from 'lucide-react'

export default function Places() {
  const places: Place[] = []
  // const response = await fetch(`${window.location.origin}/api/places`)
  // console.log('response: ', response)

  return (
    <>
      <div className="flex flex-col">
        <div className="ml-8 mt-8">
          <Button>
            <PlusIcon /> Add place
          </Button>
        </div>
        <div className={'flex flex-wrap justify-center gap-8 p-8'}>
          {places.map((place) => {
            return (
              <div
                key={place.id}
                className={`flex-grow basis-full sm:basis-1/2 lg:basis-1/3`}
              >
                <PlaceComponent place={place}></PlaceComponent>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
