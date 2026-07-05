/**
 * AAC Category Color Map
 *
 * HSL color pairs (background and foreground) for each of the 23 AAC categories.
 * Applied via inline styles on category tiles and other category-specific UI elements.
 * Light mode: `bg` and `fg` pair. Dark mode: `darkBg` and `darkFg` pair.
 * All dark mode pairs verified for WCAG AA contrast (≥4.5:1).
 */

export const CATEGORY_COLORS: Record<
  string,
  { bg: string; fg: string; darkBg: string; darkFg: string }
> = {
  core: {
    bg: 'hsl(245 50% 78%)',
    fg: 'hsl(245 50% 20%)',
    darkBg: 'hsl(245 40% 26%)',
    darkFg: 'hsl(245 35% 92%)',
  },
  feelings: {
    bg: 'hsl(270 45% 78%)',
    fg: 'hsl(270 45% 20%)',
    darkBg: 'hsl(270 40% 26%)',
    darkFg: 'hsl(270 35% 92%)',
  },
  people: {
    bg: 'hsl(210 55% 75%)',
    fg: 'hsl(210 55% 18%)',
    darkBg: 'hsl(210 40% 26%)',
    darkFg: 'hsl(210 35% 92%)',
  },
  actions: {
    bg: 'hsl(38 75% 72%)',
    fg: 'hsl(38 75% 18%)',
    darkBg: 'hsl(38 40% 26%)',
    darkFg: 'hsl(38 35% 92%)',
  },
  'food-drink': {
    bg: 'hsl(25 70% 76%)',
    fg: 'hsl(25 70% 18%)',
    darkBg: 'hsl(25 40% 26%)',
    darkFg: 'hsl(25 35% 92%)',
  },
  places: {
    bg: 'hsl(195 55% 73%)',
    fg: 'hsl(195 55% 18%)',
    darkBg: 'hsl(195 40% 26%)',
    darkFg: 'hsl(195 35% 92%)',
  },
  objects: {
    bg: 'hsl(230 35% 80%)',
    fg: 'hsl(230 35% 18%)',
    darkBg: 'hsl(230 40% 26%)',
    darkFg: 'hsl(230 35% 92%)',
  },
  describing: {
    bg: 'hsl(260 45% 78%)',
    fg: 'hsl(260 45% 20%)',
    darkBg: 'hsl(260 40% 26%)',
    darkFg: 'hsl(260 35% 92%)',
  },
  social: {
    bg: 'hsl(215 65% 72%)',
    fg: 'hsl(215 65% 16%)',
    darkBg: 'hsl(215 40% 26%)',
    darkFg: 'hsl(215 35% 92%)',
  },
  body: {
    bg: 'hsl(185 45% 74%)',
    fg: 'hsl(185 45% 18%)',
    darkBg: 'hsl(185 40% 26%)',
    darkFg: 'hsl(185 35% 92%)',
  },
  time: {
    bg: 'hsl(245 35% 82%)',
    fg: 'hsl(245 35% 22%)',
    darkBg: 'hsl(245 40% 26%)',
    darkFg: 'hsl(245 35% 92%)',
  },
  questions: {
    bg: 'hsl(50 65% 76%)',
    fg: 'hsl(50 65% 18%)',
    darkBg: 'hsl(50 40% 26%)',
    darkFg: 'hsl(50 35% 92%)',
  },
  needs: {
    bg: 'hsl(100 45% 74%)',
    fg: 'hsl(100 45% 18%)',
    darkBg: 'hsl(100 40% 26%)',
    darkFg: 'hsl(100 35% 92%)',
  },
  emergency: {
    bg: 'hsl(0 70% 76%)',
    fg: 'hsl(0 70% 20%)',
    darkBg: 'hsl(0 40% 26%)',
    darkFg: 'hsl(0 35% 92%)',
  },
  rejecting: {
    bg: 'hsl(15 65% 75%)',
    fg: 'hsl(15 65% 18%)',
    darkBg: 'hsl(15 40% 26%)',
    darkFg: 'hsl(15 35% 92%)',
  },
  directing: {
    bg: 'hsl(340 55% 78%)',
    fg: 'hsl(340 55% 20%)',
    darkBg: 'hsl(340 40% 26%)',
    darkFg: 'hsl(340 35% 92%)',
  },
  mealtime: {
    bg: 'hsl(30 70% 74%)',
    fg: 'hsl(30 70% 18%)',
    darkBg: 'hsl(30 40% 26%)',
    darkFg: 'hsl(30 35% 92%)',
  },
  school: {
    bg: 'hsl(200 55% 74%)',
    fg: 'hsl(200 55% 18%)',
    darkBg: 'hsl(200 40% 26%)',
    darkFg: 'hsl(200 35% 92%)',
  },
  community: {
    bg: 'hsl(160 45% 72%)',
    fg: 'hsl(160 45% 16%)',
    darkBg: 'hsl(160 40% 26%)',
    darkFg: 'hsl(160 35% 92%)',
  },
  play: {
    bg: 'hsl(320 55% 78%)',
    fg: 'hsl(320 55% 20%)',
    darkBg: 'hsl(320 40% 26%)',
    darkFg: 'hsl(320 35% 92%)',
  },
  home: {
    bg: 'hsl(90 40% 74%)',
    fg: 'hsl(90 40% 18%)',
    darkBg: 'hsl(90 40% 26%)',
    darkFg: 'hsl(90 35% 92%)',
  },
  choices: {
    bg: 'hsl(280 45% 78%)',
    fg: 'hsl(280 45% 20%)',
    darkBg: 'hsl(280 40% 26%)',
    darkFg: 'hsl(280 35% 92%)',
  },
  conversation: {
    bg: 'hsl(170 45% 72%)',
    fg: 'hsl(170 45% 16%)',
    darkBg: 'hsl(170 40% 26%)',
    darkFg: 'hsl(170 35% 92%)',
  },
}
