'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ItemForm } from '@/components/custom/item-form'
import { ItemComponent } from '@/components/custom/item-component'
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { PlusIcon } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

export type ItemsListProps = {
  initialItems: any[]
  pageInfo: {
    editModelName: string
    singularLabel: string
    pluralLabel: string
    noResultsComponent: JSX.Element
  }
  speakerId: string
}

export default function ItemsList({
  initialItems = [],
  pageInfo,
  speakerId,
}: ItemsListProps) {
  console.log('initialItems: ', initialItems)
  const [items, setItems] = useState<any[]>(initialItems)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const { open, isMobile } = useSidebar()

  const handleUpsertItem = async (newItem: any) => {
    if (!pageInfo.editModelName || !speakerId) return

    try {
      setLoading(true)
      const response = await fetch(`/api/${pageInfo.editModelName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newItem, speakerId }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`)
      }

      const responseBody = await response.json()
      setItems((prev) => [...prev, responseBody.updatedItem])
    } catch (err: any) {
      setError(err.message || 'Error adding item')
      console.error('Error adding item:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteItem = async (item: any) => {
    if (!pageInfo.editModelName) return

    try {
      await fetch(`/api/${pageInfo.editModelName}?id=${item._id}`, {
        method: 'DELETE',
      })
      setItems(items.filter((i) => i._id !== item._id))
    } catch (err) {
      console.error('Error deleting item:', err)
    }
  }

  const renderContent = () => {
    if (loading) {
      return <p>Loading {pageInfo.pluralLabel}...</p>
    }

    if (error) {
      return <p className="text-red-500">{error}</p>
    }

    if (items.length === 0) {
      return pageInfo.noResultsComponent
    }

    return items.map((item) => (
      <div
        key={item._id}
        className="flex-grow basis-full sm:basis-1/4 lg:basis-1/5"
      >
        <ItemComponent
          item={item}
          editMode={editMode}
          onDelete={handleDeleteItem}
          modelName={pageInfo.editModelName as string}
        />
      </div>
    ))
  }

  return (
    <>
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
          {renderContent()}
        </div>
      </div>

      {isFormOpen && (
        <ItemForm
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleUpsertItem}
          modelName={pageInfo.singularLabel as string}
        />
      )}
    </>
  )
}
