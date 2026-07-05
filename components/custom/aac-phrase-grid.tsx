'use client'

import React, { useContext, useCallback, useState } from 'react'
import { AacPreferencesContext, AacSentenceContext } from '@/app/aac/layout'
import { speak } from '@/utils/aac-speech'
import { getPhraseTailwindClass } from '@/utils/aac-phrase-text-size'
import { DEFAULT_PHRASES } from '@/lib/aac/default-phrases'
import { AAC_CATEGORIES } from '@/lib/aac/symbol-provider'
import { getReadableTextColor } from '@/lib/aac/color-utils'
import type { AacPhrase } from '@/models'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type AacPhraseGridProps = {
  customPhrases?: AacPhrase[]
  isOwner?: boolean
  onEditPhrase?: (phrase: AacPhrase) => Promise<void>
  onDeletePhrase?: (phraseId: string) => Promise<void>
}

/**
 * AacPhraseGrid: Grid of phrases grouped by category
 *
 * - Default phrases always shown (non-editable)
 * - Custom phrases with edit/delete overlays if user is owner
 * - Phrase tiles with dynamic font size (G12 utility)
 * - Tap behavior: speak or append per preferences
 * - Addresses: G9 dark mode (verify backgrounds and overlays)
 */
export function AacPhraseGrid({
  customPhrases = [],
  isOwner = false,
  onEditPhrase,
  onDeletePhrase,
}: AacPhraseGridProps) {
  const preferencesContext = useContext(AacPreferencesContext)
  const sentenceContext = useContext(AacSentenceContext)

  if (!preferencesContext || !sentenceContext) return null

  const { preferences } = preferencesContext
  const { addWord } = sentenceContext

  // Merge default and custom phrases, group by category
  const allPhrases = [
    ...DEFAULT_PHRASES.map(
      (p) =>
        ({
          _id: `default-${p.text}`,
          speakerId: '',
          text: p.text,
          icon: p.icon,
          category: p.category,
          backgroundColor: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastUpdatedBy: '',
        }) as AacPhrase,
    ),
    ...customPhrases,
  ]

  const groupedByCategory = allPhrases.reduce(
    (acc, phrase) => {
      const cat = phrase.category || 'Uncategorized'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(phrase)
      return acc
    },
    {} as Record<string, AacPhrase[]>,
  )

  return (
    <div className="grid gap-6 p-4">
      {Object.entries(groupedByCategory).map(([category, phrases]) => (
        <div key={category} className="flex flex-col gap-3">
          {/* Category header */}
          <div className="col-span-full pt-2">
            <p className="font-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {AAC_CATEGORIES.find((c) => c.slug === category)?.label ??
                category}
            </p>
          </div>

          {/* Phrase grid for this category */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {phrases.map((phrase) => (
              <AacPhraseTile
                key={phrase._id}
                phrase={phrase}
                isCustom={!phrase._id.startsWith('default-')}
                isOwner={isOwner}
                preferences={preferences}
                addWord={addWord}
                onEdit={onEditPhrase}
                onDelete={onDeletePhrase}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

type AacPhraseTileProps = {
  phrase: AacPhrase
  isCustom: boolean
  isOwner: boolean
  preferences: any
  addWord: (word: Omit<any, 'id'>) => void
  onEdit?: (phrase: AacPhrase) => Promise<void>
  onDelete?: (phraseId: string) => Promise<void>
}

function AacPhraseTile({
  phrase,
  isCustom,
  isOwner,
  preferences,
  addWord,
  onEdit,
  onDelete,
}: AacPhraseTileProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editText, setEditText] = useState(phrase.text)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleTap = useCallback(() => {
    if (preferences?.phraseTapBehavior === 'append') {
      // Append to sentence
      addWord({
        label: phrase.text,
        imageUrl: phrase.icon
          ? `data:image/svg+xml,${phrase.icon}`
          : '/placeholder.svg',
      })
    } else {
      // Speak immediately
      speak(phrase.text, {
        voiceName: preferences?.voiceName,
        speechRate: preferences?.speechRate ?? 1,
        speechPitch: preferences?.speechPitch ?? 1,
      })
    }
  }, [phrase, preferences, addWord])

  const handleEditSave = useCallback(async () => {
    if (!onEdit) return
    try {
      await onEdit({ ...phrase, text: editText })
      setShowEditDialog(false)
    } catch (error) {
      console.error('Edit failed:', error)
    }
  }, [phrase, editText, onEdit])

  const handleDelete = useCallback(async () => {
    if (!onDelete) return
    setIsDeleting(true)
    try {
      await onDelete(phrase._id)
    } catch (error) {
      console.error('Delete failed:', error)
    } finally {
      setIsDeleting(false)
    }
  }, [phrase._id, onDelete])

  const fontSizeClass = getPhraseTailwindClass(phrase.text)
  const bgColor = phrase.backgroundColor || 'hsl(var(--secondary))'
  const customTextColor = phrase.backgroundColor
    ? getReadableTextColor(phrase.backgroundColor)
    : undefined

  return (
    <>
      <button
        onClick={handleTap}
        className="group relative flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl p-3 transition-all duration-100 active:scale-[0.97] active:brightness-95"
        style={{ backgroundColor: bgColor }}
        aria-label={phrase.text}
      >
        {/* Icon if present */}
        {phrase.icon && (
          <span className="text-2xl" aria-hidden="true">
            {phrase.icon}
          </span>
        )}

        {/* Text with dynamic font size */}
        <span
          className={cn(
            'text-center font-display font-semibold leading-snug',
            fontSizeClass,
          )}
          style={customTextColor ? { color: customTextColor } : undefined}
        >
          {phrase.text}
        </span>

        {/* Edit/Delete overlay - only for custom phrases and owner */}
        {isCustom && isOwner && (
          <div className="absolute inset-0 flex items-start justify-end gap-1 rounded-2xl bg-black/30 p-2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowEditDialog(true)
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-background/90 shadow-sm hover:bg-background"
              aria-label="Edit phrase"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDelete()
              }}
              disabled={isDeleting}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-background/90 shadow-sm hover:bg-background disabled:opacity-50"
              aria-label="Delete phrase"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </button>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Phrase</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-text">Phrase Text</Label>
              <Input
                id="edit-text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                placeholder="Enter phrase text"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
