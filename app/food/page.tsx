'use client'

import { useEffect, useState } from 'react'
import { PlusIcon } from 'lucide-react'
import { Pencil1Icon } from '@radix-ui/react-icons'
import { Switch } from '@/components/ui/switch'
import { Food } from '@/models/food'
import { Button } from '@/components/ui/button'
import { FoodForm } from '@/components/custom/food-form'
import { FoodComponent } from '@/components/custom/food-component'
import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/nextjs'

export default function Foods() {
  const [foods, setFoods] = useState<Food[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    const fetchFoods = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/foods') // Update API endpoint
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        setFoods(data)
      } catch (err: any) {
        setError(err.message || 'Failed to fetch foods')
      } finally {
        setLoading(false)
      }
    }

    fetchFoods()
  }, [])

  const handleAddFood = async (newFood: Partial<Food>) => {
    try {
      const response = await fetch('/api/food', {
        // Update API endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFood),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`)
      }

      const responseBody = await response.json()
      setFoods((prev) => [...prev, responseBody.updatedFood])
    } catch (err) {
      console.error('Error adding food:', err)
    }
  }

  const handleDeleteFood = async (food: Food) => {
    setFoods(foods.filter((f) => f._id !== food._id))
  }

  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <div className="flex flex-col">
          <div className="ml-8 mt-8">
            <Button variant="default" onClick={() => setIsFormOpen(true)}>
              <PlusIcon /> Add food
            </Button>
            {foods.length > 0 && (
              <div
                className="float-right flex items-center gap-2 px-8 py-2"
                onClick={() => setEditMode(!editMode)}
              >
                <Switch checked={editMode}></Switch>
                Edit mode
              </div>
            )}
          </div>
          <div className={'flex flex-wrap justify-center gap-8 p-8'}>
            {loading ? (
              <p>Loading foods...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              foods.map((food) => (
                <div
                  key={food._id}
                  className={`flex-grow basis-full sm:basis-1/2 lg:basis-1/3`}
                >
                  <FoodComponent
                    food={food}
                    editMode={editMode}
                    onDelete={handleDeleteFood}
                  ></FoodComponent>
                </div>
              ))
            )}
          </div>
        </div>
        {isFormOpen && (
          <FoodForm
            onClose={() => setIsFormOpen(false)}
            onSubmit={handleAddFood}
          />
        )}
      </SignedIn>
    </>
  )
}
