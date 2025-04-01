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
import ItemsList from './items-list'

export type GenericPageInfo = {
  listModelName: string
  editModelName: string
  singularLabel: string
  pluralLabel: string
  noResultsComponent: JSX.Element
}

/**
 * @deprecated Use server-side data fetching with ItemsList component instead
 */
export default function GenericItemsPage({
  pageInfo,
  initialItems = [],
}: {
  pageInfo: GenericPageInfo
  initialItems?: any[]
}) {
  const [items, setItems] = useState<any[]>(initialItems)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { selectedSpeaker } = useSpeakerContext()

  // Only fetch data from client-side if initialItems wasn't provided
  useEffect(() => {
    if (initialItems.length > 0) return

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
  }, [pageInfo, selectedSpeaker, initialItems])

  // If we have a speaker ID and items have been loaded or provided,
  // use the new component
  if (selectedSpeaker?._id) {
    return (
      <ItemsList
        initialItems={items}
        pageInfo={{
          editModelName: pageInfo.editModelName,
          singularLabel: pageInfo.singularLabel,
          pluralLabel: pageInfo.pluralLabel,
          noResultsComponent: pageInfo.noResultsComponent,
        }}
        speakerId={selectedSpeaker._id}
      />
    )
  }

  // Fallback to show loading state
  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      <SignedIn>
        <div className="flex flex-col">
          <div className="flex flex-wrap justify-center gap-8 p-8">
            {loading ? (
              <p>Loading {pageInfo.pluralLabel}...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <p>Select a speaker to view {pageInfo.pluralLabel}</p>
            )}
          </div>
        </div>
      </SignedIn>
    </>
  )
}
