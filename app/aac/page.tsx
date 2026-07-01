'use client'

import { useRouter } from 'next/navigation'
import { MessageSquare, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AacCategoryGrid } from '@/components/custom/aac-category-grid'

/**
 * AAC Category Home Page
 *
 * Client component for the AAC board category selection.
 * - Header with title, Quick Phrases button, Settings button
 * - Category grid below (via AacCategoryGrid component)
 * - All navigation via router.push()
 *
 * Per TRD §7.5, exact JSX structure for header.
 */
export default function AacPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col h-full">
      {/* Header with title and action buttons - exact JSX per TRD §7.5 */}
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="font-display text-2xl font-semibold">AAC Board</h1>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push('/aac/phrases')}
            className="gap-1.5"
          >
            <MessageSquare size={16} />
            Quick Phrases
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/aac/settings')}
            aria-label="Settings"
          >
            <Settings size={20} />
          </Button>
        </div>
      </div>

      {/* Category grid - component from WU-3-F */}
      <div className="flex-1 overflow-y-auto">
        <AacCategoryGrid />
      </div>
    </div>
  )
}
