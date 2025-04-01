'use client'

import { useEffect, useState } from 'react'
import { PlaceComponent } from '@/components/custom/place-component'
import { Button } from '@/components/ui/button'
import { LandPlot, PlusIcon, SearchIcon } from 'lucide-react'
import { Place } from '@/models'
import { PlaceForm } from '@/components/custom/place-form'
import { Switch } from '@/components/ui/switch'
import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/nextjs'
import { useSpeakerContext } from '@/hooks/use-speakers'
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { NoResultsComponent } from '@/components/custom/no-results-component'
import { Input } from '@/components/ui/input'

export default function Places() {
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const { selectedSpeaker } = useSpeakerContext()
  const { open, isMobile } = useSidebar()

  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/places?speakerId=${selectedSpeaker?._id}`,
        )
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

    if (selectedSpeaker) {
      fetchPlaces()
    }
  }, [selectedSpeaker])

  const handleAddPlace = async (newPlace: Partial<Place>) => {
    try {
      const response = await fetch('/api/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newPlace, speakerId: selectedSpeaker?._id }),
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

  const filterPlaces = (places: Place[]) => {
    if (!searchQuery.trim()) return places

    return places.filter((place) => {
      return Object.values(place).some(
        (value) =>
          value &&
          typeof value === 'string' &&
          value.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    })
  }

  const filteredPlaces = filterPlaces(places)

  const placesList =
    filteredPlaces?.length > 0 ? (
      filteredPlaces.map((place) => (
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
    ) : (
      <NoResultsComponent
        icon={<LandPlot />}
        title="No places added yet"
        body={['Add a place that your speaker likes to go to!']}
      />
    )

  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        {(!open || isMobile) && <SidebarTrigger className="ml-2 mt-5 p-5" />}
        <div className="flex flex-col">
          <div className="flex w-full flex-col items-center justify-center gap-4 px-4 pt-8 md:flex-row md:gap-6">
            {places.length > 0 && (
              <div className="flex w-full max-w-md items-center space-x-2 md:w-1/3">
                <SearchIcon className="h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search places..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9"
                />
              </div>
            )}

            <Button
              variant="default"
              onClick={() => setIsFormOpen(true)}
              className="w-full md:w-auto"
            >
              <PlusIcon className="mr-1" /> Add place
            </Button>

            {places.length > 0 && (
              <div
                className="flex w-full cursor-pointer items-center justify-center gap-2 py-2 md:w-auto"
                onClick={() => setEditMode(!editMode)}
              >
                <Switch checked={editMode} />
                <span>Edit mode</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-8 p-8">
            {loading ? (
              <p>Loading places...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              placesList
            )}
          </div>
        </div>
        {isFormOpen && (
          <PlaceForm
            onClose={() => setIsFormOpen(false)}
            onSubmit={handleAddPlace}
          />
        )}
      </SignedIn>
    </>
  )
}
