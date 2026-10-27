import * as LucideIcons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type AacIconProps = {
  icon?: string
  fallback?: string
  size?: number
}

export function AacIcon({
  icon,
  fallback = 'MessageCircle',
  size = 32,
}: AacIconProps) {
  const findIcon = (name?: string) => {
    const candidate = name
      ? (LucideIcons as unknown as Record<string, LucideIcon>)[name]
      : undefined
    return candidate && typeof candidate === 'object' && '$$typeof' in candidate
      ? candidate
      : undefined
  }
  const Icon = findIcon(icon) ?? findIcon(fallback) ?? LucideIcons.MessageCircle

  if (
    icon &&
    /\p{Extended_Pictographic}|\p{Regional_Indicator}|\u20e3/u.test(icon)
  ) {
    return (
      <span
        aria-hidden="true"
        className="leading-none"
        style={{ fontSize: size }}
      >
        {icon}
      </span>
    )
  }

  return <Icon size={size} strokeWidth={1.5} aria-hidden="true" />
}
