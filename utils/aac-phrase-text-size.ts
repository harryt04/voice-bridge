/**
 * AAC Phrase Text Size Utility (addresses G12)
 *
 * Returns Tailwind text class based on phrase length
 * to prevent overflow and maintain readability on phrase tiles
 *
 * - ≤15 chars: text-base (16px)
 * - 16+ chars: text-sm (14px)
 */
export function getPhraseTailwindClass(text: string): string {
  return text.length <= 15 ? 'text-base' : 'text-sm'
}
