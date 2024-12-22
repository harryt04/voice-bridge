'use client'
import { useEffect, useState } from 'react'
import { PlaceComponent } from '@/components/custom/place-component'
import { Button } from '@/components/ui/button'
import { Place } from '@/models'
import { PlusIcon } from 'lucide-react'

export default function Places() {
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/places') // Fetches places for the logged-in user
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        setPlaces(data)
      } catch (err: any) {
        setError(err.message || 'Failed to fetch places')
      } finally {
        setLoading(false)
      }
    }

    fetchPlaces()
  }, [])

  return (
    <>
      <div className="flex flex-col">
        <div className="ml-8 mt-8">
          <Button>
            <PlusIcon /> Add place
          </Button>
        </div>
        <div className={'flex flex-wrap justify-center gap-8 p-8'}>
          {loading ? (
            <p>Loading places...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            places.map((place) => (
              <div
                key={place.id}
                className={`flex-grow basis-full sm:basis-1/2 lg:basis-1/3`}
              >
                <PlaceComponent place={place}></PlaceComponent>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
