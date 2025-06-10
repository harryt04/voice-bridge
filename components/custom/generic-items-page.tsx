'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ItemForm } from '@/components/custom/item-form'
import { ItemComponent } from '@/components/custom/item-component'
import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/nextjs'
import { PlusIcon, SearchIcon, XCircleIcon } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useSpeakerContext } from '@/hooks/use-speakers'
import { Input } from '@/components/ui/input'
import { NoResultsComponent } from '@/components/custom/no-results-component'
import VBSidebarTrigger from './sidebar-trigger'
import { capitalizeFirstLetter } from '@/lib/utils'
import { useSidebar } from '../ui/sidebar'

export type GenericPageInfo = {
  listModelName: string
  editModelName: string
  singularLabel: string
  pluralLabel: string
  noResultsComponent: JSX.Element
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
  const [searchQuery, setSearchQuery] = useState('')
  const { selectedSpeaker } = useSpeakerContext()
  const { open, isMobile } = useSidebar()

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

  const filterItems = (items: any[]) => {
    if (!searchQuery.trim()) return items

    return items.filter((item) => {
      return Object.values(item).some(
        (value) =>
          value &&
          typeof value === 'string' &&
          value.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    })
  }

  const filteredItems = filterItems(items)

  const itemsContent = () => {
    if (loading) {
      return <p>Loading {pageInfo.pluralLabel}...</p>
    }

    if (error) {
      return <p className="text-red-500">{error}</p>
    }

    if (items.length === 0) {
      return pageInfo.noResultsComponent
    }

    if (searchQuery.trim() && filteredItems.length === 0) {
      return (
        <NoResultsComponent
          icon={<XCircleIcon />}
          title="No search results"
          body={[
            `No ${pageInfo.pluralLabel} match your search "${searchQuery}"`,
            `Try a different search term or clear your search`,
          ]}
          showImageUrlInstructions={false}
        />
      )
    }

    return filteredItems.map((item) => (
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
  }

  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      <SignedIn>
        <VBSidebarTrigger title={capitalizeFirstLetter(pageInfo.pluralLabel)} />

        <div
          className={`flex w-full flex-col ${!open || isMobile ? 'mt-20' : ''}`}
        >
          <div className="flex w-full flex-col items-center justify-center gap-4 px-4 pt-8 md:flex-row md:gap-6">
            {items.length > 0 && (
              <div className="flex w-full max-w-md items-center space-x-2 md:w-1/3">
                <SearchIcon className="h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder={`Search ${pageInfo.pluralLabel}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    onClick={() => setSearchQuery('')}
                    size="icon"
                    className="w-12"
                  >
                    <XCircleIcon />
                  </Button>
                )}
              </div>
            )}

            <Button
              variant="default"
              onClick={() => setIsFormOpen(true)}
              className="w-full md:w-auto"
            >
              <PlusIcon className="mr-1" /> Add {pageInfo.singularLabel}
            </Button>

            {items.length > 0 && (
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
            {itemsContent()}
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
