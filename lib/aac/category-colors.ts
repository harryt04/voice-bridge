/**
 * AAC Category Color Map
 *
 * HSL color pairs (background and foreground) for each of the 12 AAC categories.
 * Applied via inline styles on category tiles and other category-specific UI elements.
 * Dark mode: handled via Tailwind filter `dark:[filter:brightness(0.72)_saturate(1.1)]`
 */

export const CATEGORY_COLORS: Record<string, { bg: string; fg: string }> = {
  core: { bg: 'hsl(245 50% 78%)', fg: 'hsl(245 50% 20%)' },
  feelings: { bg: 'hsl(270 45% 78%)', fg: 'hsl(270 45% 20%)' },
  people: { bg: 'hsl(210 55% 75%)', fg: 'hsl(210 55% 18%)' },
  actions: { bg: 'hsl(38 75% 72%)', fg: 'hsl(38 75% 18%)' },
  'food-drink': { bg: 'hsl(25 70% 76%)', fg: 'hsl(25 70% 18%)' },
  places: { bg: 'hsl(195 55% 73%)', fg: 'hsl(195 55% 18%)' },
  objects: { bg: 'hsl(230 35% 80%)', fg: 'hsl(230 35% 18%)' },
  describing: { bg: 'hsl(260 45% 78%)', fg: 'hsl(260 45% 20%)' },
  social: { bg: 'hsl(215 65% 72%)', fg: 'hsl(215 65% 16%)' },
  body: { bg: 'hsl(185 45% 74%)', fg: 'hsl(185 45% 18%)' },
  time: { bg: 'hsl(245 35% 82%)', fg: 'hsl(245 35% 22%)' },
  questions: { bg: 'hsl(50 65% 76%)', fg: 'hsl(50 65% 18%)' },
}
