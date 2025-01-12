'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ItemForm } from '@/components/custom/item-form'
import { ItemComponent } from '@/components/custom/item-component'
import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/nextjs'
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { PlusIcon } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useSpeakerContext } from '@/hooks/use-speakers'

export type GenericPageInfo = {
  listModelName: string
  editModelName: string
  singularLabel: string
  pluralLabel: string
}

export default function GenericItemsPage({
  pageInfo,
}: {
  pageInfo: GenericPageInfo
}) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const { open, isMobile } = useSidebar()
  const { selectedSpeaker } = useSpeakerContext()

  useEffect(() => {
    const fetchItems = async () => {
      if (!pageInfo.listModelName || !selectedSpeaker?._id) return

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/${pageInfo.listModelName}?speakerId=${selectedSpeaker?._id}`,
        )
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        setItems(data)
      } catch (err: any) {
        setError(err.message || 'Failed to fetch items')
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [pageInfo, selectedSpeaker])

  const handleUpsertItem = async (newItem: any) => {
    if (!pageInfo.editModelName || !selectedSpeaker?._id) return

    try {
      const response = await fetch(`/api/${pageInfo.editModelName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newItem, speakerId: selectedSpeaker._id }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`)
      }

      const responseBody = await response.json()
      setItems((prev) => [...prev, responseBody.updatedItem])
    } catch (err) {
      console.error('Error adding item:', err)
    }
  }

  const handleDeleteItem = async (item: any) => {
    if (!pageInfo.editModelName || !selectedSpeaker?._id) return

    try {
      await fetch(`/api/${pageInfo.editModelName}?id=${item._id}`, {
        method: 'DELETE',
      })
      setItems(items.filter((i) => i._id !== item._id))
    } catch (err) {
      console.error('Error deleting item:', err)
    }
  }

  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      <SignedIn>
        {(!open || isMobile) && <SidebarTrigger className="ml-2 mt-5 p-5" />}

        <div className="flex flex-col">
          <div className="ml-0 mt-8 flex w-10/12 flex-col items-center gap-4 md:ml-8 md:flex-row">
            <Button variant="default" onClick={() => setIsFormOpen(true)}>
              <PlusIcon /> Add {pageInfo.singularLabel}
            </Button>
            {items.length > 0 && (
              <div
                className="float-right flex items-center gap-2 px-8 py-2 md:absolute md:right-0"
                onClick={() => setEditMode(!editMode)}
              >
                <Switch checked={editMode}></Switch>
                Edit mode
              </div>
            )}
          </div>
          <div className="-ml-12 flex flex-wrap justify-center gap-8 p-8 md:ml-auto">
            {loading ? (
              <p>Loading {pageInfo.pluralLabel}...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              items.map((item) => (
                <div
                  key={item._id}
                  className={`flex-grow basis-full sm:basis-1/4 lg:basis-1/5`}
                >
                  <ItemComponent
                    item={item}
                    editMode={editMode}
                    onDelete={handleDeleteItem}
                    modelName={pageInfo.editModelName as string}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {isFormOpen && (
          <ItemForm
            onClose={() => setIsFormOpen(false)}
            onSubmit={handleUpsertItem}
            modelName={pageInfo.singularLabel as string}
          />
        )}
      </SignedIn>
    </>
  )
}
