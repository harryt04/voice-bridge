import { type ClassValue, clsx } from 'clsx'
import { NextRequest } from 'next/server'
import { twMerge } from 'tailwind-merge'

/**
 * Combines multiple class names into a single string, merging Tailwind CSS classes
 * intelligently to avoid conflicts.
 *
 * @param inputs - An array of class values that can include strings, arrays, or objects.
 * @returns A single string of combined class names with Tailwind CSS classes merged.
 *
 * @remarks
 * This function uses `clsx` to conditionally join class names and `twMerge` to handle
 * Tailwind CSS class merging.
 *
 * @example
 * ```typescript
 * const className = cn('bg-red-500', 'text-white', { 'p-4': true, 'm-2': false });
 * // Result: 'bg-red-500 text-white p-4'
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts the value of a specified query parameter from a given URL in a Next.js request.
 *
 * @param req - The Next.js request object containing the URL.
 * @param paramName - The name of the query parameter to extract.
 * @returns The value of the query parameter as a string, or `null` if the parameter is not present.
 */
export function extractParamFromUrl(
  req: NextRequest,
  paramName: string,
): string | null {
  const url = new URL(req.url)
  return url.searchParams.get(paramName)
}

/**
 * Capitalizes the first letter of the given string.
 *
 * @param input - The string to be processed. If the input is empty or undefined, it is returned as is.
 * @returns A new string with the first letter capitalized, or the original input if it is empty or undefined.
 */
export function capitalizeFirstLetter(input: string): string {
  if (!input) return input
  return input.charAt(0).toUpperCase() + input.slice(1)
}
