'use client'

import React from 'react'
import Link from 'next/link'
import { AAC_CATEGORIES, type AacCategory } from '@/lib/aac/symbol-provider'
import { CATEGORY_COLORS } from '@/lib/aac/category-colors'
import { useTheme } from 'next-themes'
import * as LucideIcons from 'lucide-react'

/**
 * AacCategoryGrid: 12-tile category grid with responsive columns
 *
 * Grid: 2 mobile, 3 sm, 4 lg
 * Each tile: aspect-square, min-h-80px, inline style colors from CATEGORY_COLORS
 * Dark mode: brightness filter via Tailwind dark: variant
 */
export function AacCategoryGrid() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 lg:grid-cols-4">
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
    <Link href={`/aac/${category.slug}`}>
      <button
        className={`flex aspect-square min-h-20 flex-col items-center justify-center gap-2 rounded-2xl p-3 shadow-sm transition-all duration-150 hover:shadow-md active:scale-[0.97] ${
          isDark ? 'dark:[filter:brightness(0.72)_saturate(1.1)]' : ''
        }`}
        style={{
          backgroundColor: colors.bg,
          color: colors.fg,
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
