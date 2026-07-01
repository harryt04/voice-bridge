'use client'

import React, { useContext, useCallback } from 'react'
import { AacPreferencesContext } from '@/app/aac/layout'
import { useAvailableVoices } from '@/hooks/use-available-voices'
import type { AacUserPreferences } from '@/models'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { AlertCircle } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'

type AacSettingsFormProps = {
  speakerId: string
  isOwner: boolean
}

/**
 * AacSettingsForm: 8-control settings form
 *
 * Addresses:
 * - G7 useAvailableVoices: loads voices asynchronously
 * - G9 dark mode testing: verify form control colors and disabled states
 * - G21 caregiver-only: read-only if not owner
 * - Touch targets: sliders min-h-44px, controls 44px+
 * - Auto-save: 300ms debounce via useMutation
 */
export function AacSettingsForm({ speakerId, isOwner }: AacSettingsFormProps) {
  const preferencesContext = useContext(AacPreferencesContext)
  const { voices, loading: voicesLoading } = useAvailableVoices()
  const debouncedSaveRef = React.useRef<NodeJS.Timeout | null>(null)

  // Mutation for saving preferences
  const saveMutation = useMutation({
    mutationFn: async (prefs: Partial<AacUserPreferences>) => {
      const res = await fetch(`/api/aac/preferences?speakerId=${speakerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          speakerId,
          ...prefs,
        }),
      })
      if (!res.ok) throw new Error(`Save failed: ${res.status}`)
      return res.json()
    },
  })

  // Debounced save function using useCallback
  const debouncedSave = useCallback(
    (prefs: Partial<AacUserPreferences>) => {
      if (debouncedSaveRef.current) {
        clearTimeout(debouncedSaveRef.current)
      }
      debouncedSaveRef.current = setTimeout(() => {
        saveMutation.mutate(prefs)
      }, 300)
    },
    [saveMutation],
  )

  const handleChange = useCallback(
    (updates: Partial<AacUserPreferences>) => {
      if (!isOwner) return
      debouncedSave(updates)
    },
    [isOwner, debouncedSave],
  )

  if (!preferencesContext) return null

  const { preferences, loading } = preferencesContext

  if (loading || !preferences) {
    return (
      <div className="flex items-center justify-center p-8">
        Loading settings...
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-4">
      <h1 className="font-display text-2xl font-semibold">AAC Settings</h1>

      {/* Read-only notice */}
      {!isOwner && (
        <div className="flex gap-3 rounded-lg border border-destructive/50 bg-destructive/5 p-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-destructive" />
          <p className="font-sans text-sm text-destructive">
            Only the caregiver can change these settings.
          </p>
        </div>
      )}

      {/* Voice Section */}
      <div className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-semibold">Voice</h2>
        <Separator />

        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-sm font-medium">Voice</label>
          <p className="font-sans text-sm text-muted-foreground">
            Choose the voice for speech synthesis
          </p>
          <Select
            value={preferences.voiceName || ''}
            onValueChange={(v) => handleChange({ voiceName: v })}
            disabled={!isOwner || voicesLoading}
          >
            <SelectTrigger className="h-11">
              <SelectValue
                placeholder={
                  voicesLoading
                    ? 'Loading voices...'
                    : voices.length === 0
                      ? 'No voices available'
                      : 'Select a voice'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {voices.map((voice) => (
                <SelectItem key={voice.name} value={voice.name}>
                  {voice.name} {voice.lang && `(${voice.lang})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Speech Rate Section */}
      <div className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-semibold">Speech Rate</h2>
        <Separator />

        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-sm font-medium">Speed</label>
          <p className="font-sans text-sm text-muted-foreground">
            {preferences.speechRate.toFixed(1)}× normal speed
          </p>
          <div className="flex items-center gap-3">
            <Slider
              min={0.5}
              max={2}
              step={0.1}
              value={[preferences.speechRate]}
              onValueChange={(v) => handleChange({ speechRate: v[0] })}
              disabled={!isOwner}
              className="min-h-11 flex-1"
            />
          </div>
        </div>
      </div>

      {/* Speech Pitch Section */}
      <div className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-semibold">Speech Pitch</h2>
        <Separator />

        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-sm font-medium">Pitch</label>
          <p className="font-sans text-sm text-muted-foreground">
            {preferences.speechPitch.toFixed(1)}× normal pitch
          </p>
          <div className="flex items-center gap-3">
            <Slider
              min={0.5}
              max={2}
              step={0.1}
              value={[preferences.speechPitch]}
              onValueChange={(v) => handleChange({ speechPitch: v[0] })}
              disabled={!isOwner}
              className="min-h-11 flex-1"
            />
          </div>
        </div>
      </div>

      {/* Behavior Section */}
      <div className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-semibold">Behavior</h2>
        <Separator />

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div className="flex flex-col gap-0.5">
            <label className="font-sans text-sm font-medium">
              Speak on Tap
            </label>
            <p className="font-sans text-xs text-muted-foreground">
              Speak symbol immediately when tapped
            </p>
          </div>
          <Switch
            checked={preferences.speakOnSymbolTap}
            onCheckedChange={(v) => handleChange({ speakOnSymbolTap: v })}
            disabled={!isOwner}
          />
        </div>
      </div>

      {/* Phrase Tap Section */}
      <div className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-semibold">Phrase Tap</h2>
        <Separator />

        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-sm font-medium">
            When tapping a phrase:
          </label>
          <RadioGroup
            value={preferences.phraseTapBehavior}
            onValueChange={(v) =>
              handleChange({ phraseTapBehavior: v as 'speak' | 'append' })
            }
            disabled={!isOwner}
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem
                value="speak"
                id="phrase-speak"
                disabled={!isOwner}
              />
              <Label htmlFor="phrase-speak" className="font-sans text-sm">
                Speak immediately
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem
                value="append"
                id="phrase-append"
                disabled={!isOwner}
              />
              <Label htmlFor="phrase-append" className="font-sans text-sm">
                Add to sentence first
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Symbol Source Section */}
      <div className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-semibold">Symbols</h2>
        <Separator />

        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-sm font-medium">Symbol Set</label>
          <p className="font-sans text-sm text-muted-foreground">
            Choose which symbol library to display
          </p>
          <Select
            value={preferences.symbolSource}
            onValueChange={(v) => handleChange({ symbolSource: v as any })}
            disabled={!isOwner}
          >
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mulberry">Mulberry Symbols</SelectItem>
              <SelectItem value="arasaac">ARASAAC Symbols</SelectItem>
              <SelectItem value="custom">Custom Symbols</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Label Position Section */}
      <div className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-semibold">Display</h2>
        <Separator />

        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-sm font-medium">Symbol Labels</label>
          <RadioGroup
            value={preferences.symbolLabelPosition}
            onValueChange={(v) =>
              handleChange({ symbolLabelPosition: v as any })
            }
            disabled={!isOwner}
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem
                value="below"
                id="label-below"
                disabled={!isOwner}
              />
              <Label htmlFor="label-below" className="font-sans text-sm">
                Below symbol
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem
                value="above"
                id="label-above"
                disabled={!isOwner}
              />
              <Label htmlFor="label-above" className="font-sans text-sm">
                Above symbol
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem
                value="hidden"
                id="label-hidden"
                disabled={!isOwner}
              />
              <Label htmlFor="label-hidden" className="font-sans text-sm">
                Hidden
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-sm font-medium">
            Grid Columns (Mobile)
          </label>
          <p className="font-sans text-sm text-muted-foreground">
            How many symbol columns on small screens
          </p>
          <Select
            value={String(preferences.mobileGridColumns)}
            onValueChange={(v) =>
              handleChange({ mobileGridColumns: parseInt(v) as 2 | 3 | 4 })
            }
            disabled={!isOwner}
          >
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 columns</SelectItem>
              <SelectItem value="3">3 columns</SelectItem>
              <SelectItem value="4">4 columns</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Saving status */}
      {saveMutation.isPending && (
        <p className="text-center font-sans text-sm text-muted-foreground">
          Saving...
        </p>
      )}
      {saveMutation.isError && (
        <p className="text-center font-sans text-sm text-destructive">
          Failed to save. Please try again.
        </p>
      )}
    </div>
  )
}
