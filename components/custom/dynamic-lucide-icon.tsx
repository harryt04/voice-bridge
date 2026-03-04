'use client'

import { icons, LucideProps } from 'lucide-react'

type DynamicLucideIconProps = LucideProps & {
  name: string
}

/**
 * Renders a lucide-react icon by its PascalCase name (e.g. "Pizza", "IceCream").
 * Falls back to a placeholder square if the name is not found.
 */
export function DynamicLucideIcon({ name, ...props }: DynamicLucideIconProps) {
  const IconComponent = icons[name as keyof typeof icons]
  if (!IconComponent) {
    return null
  }
  return <IconComponent {...props} />
}
