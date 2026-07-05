'use client'

import React from 'react'
import Link from 'next/link'
import { AAC_CATEGORIES, type AacCategory } from '@/lib/aac/symbol-provider'
import { CATEGORY_COLORS } from '@/lib/aac/category-colors'
import { useTheme } from 'next-themes'
import * as LucideIcons from 'lucide-react'

/**
 * AacCategoryGrid: category tiles in a centered, wrapping flex row
 *
 * Fixed-size tiles (not aspect-ratio-on-a-grid-track) so every tile is
 * identically sized regardless of label length or viewport width.
 * Dark mode: brightness filter via Tailwind dark: variant
 */
export function AacCategoryGrid() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <div className="flex flex-wrap justify-center gap-4 p-4">
      {AAC_CATEGORIES.map((category) => (
        <AacCategoryTile
          key={category.slug}
          category={category}
          isDark={isDark}
        />
      ))}
    </div>
  )
}

type AacCategoryTileProps = {
  category: AacCategory
  isDark?: boolean
}

function AacCategoryTile({ category, isDark = false }: AacCategoryTileProps) {
  const colors = CATEGORY_COLORS[category.slug]
  const LucideIcon = (LucideIcons as any)[category.icon] || LucideIcons.Star

  if (!colors) return null

  return (
    <Link href={`/aac/${category.slug}`} className="shrink-0">
      <button
        className="flex h-32 w-32 shrink-0 flex-col items-center justify-center gap-2 rounded-2xl p-3 shadow-sm transition-all duration-150 hover:shadow-md active:scale-[0.97] sm:h-36 sm:w-36 lg:h-40 lg:w-40"
        style={{
          backgroundColor: isDark ? colors.darkBg : colors.bg,
          color: isDark ? colors.darkFg : colors.fg,
        }}
        aria-label={`${category.label} category`}
      >
        <LucideIcon size={32} strokeWidth={1.5} />
        <span className="line-clamp-2 text-center font-display text-base font-semibold leading-tight">
          {category.label}
        </span>
      </button>
    </Link>
  )
}
