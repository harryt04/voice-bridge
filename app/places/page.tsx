'use client'

import { useEffect, useState } from 'react'
import { PlaceComponent } from '@/components/custom/place-component'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { Place } from '@/models'
import { PlaceForm } from '@/components/custom/place-form'
import { Pencil1Icon } from '@radix-ui/react-icons'
import { Switch } from '@/components/ui/switch'

export default function Places() {
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/places')
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

  const handleAddPlace = async (newPlace: Partial<Place>) => {
    try {
      const response = await fetch('/api/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlace),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`)
      }

      const responseBody = await response.json()
      setPlaces((prev) => [...prev, responseBody.updatedPlace])
    } catch (err) {
      console.error('Error adding place:', err)
    }
  }

  const handleDeletePlace = async (place: Place) => {
    setPlaces(places.filter((p) => p._id !== place._id))
  }

  return (
    <>
      <div className="flex flex-col">
        <div className="ml-8 mt-8">
          <Button variant="default" onClick={() => setIsFormOpen(true)}>
            <PlusIcon /> Add place
          </Button>
          {places.length > 0 && (
            <div className="float-right flex items-center gap-2 px-8 py-2">
              <Switch
                onCheckedChange={(newState) => setEditMode(newState)}
              ></Switch>
              Edit mode
            </div>
          )}
        </div>
        <div className={'flex flex-wrap justify-center gap-8 p-8'}>
          {loading ? (
            <p>Loading places...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            places.map((place) => (
              <div
                key={place._id}
                className={`flex-grow basis-full sm:basis-1/2 lg:basis-1/3`}
              >
                <PlaceComponent
                  place={place}
                  editMode={editMode}
                  onDelete={handleDeletePlace}
                ></PlaceComponent>
              </div>
            ))
          )}
        </div>
      </div>
      {isFormOpen && (
        <PlaceForm
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleAddPlace}
        />
      )}
    </>
  )
}
