import type { AgentAction } from '@ui-sdk/react/agent'

const filterLabels: ReadonlyMap<string, string> = new Map([
  ['/activities', 'Search activities'],
  ['/food', 'Search foods'],
  ['/people', 'Search people'],
  ['/places', 'Search places'],
  ['/vocabulary', 'Search vocab words'],
])

const navigationLabels = new Set([
  'Go to Activities',
  'Go to Food',
  'Go to People',
  'Go to Places',
  'Go to Vocabulary Words',
  'Go to Symbol Board',
  'Go to Quick Phrases',
])

export function allowAgentAction(pathname: string, step: AgentAction): boolean {
  if (step.confirm !== undefined) return false
  const { component, label, action, args } = step
  if (component === 'button' && action === 'press' && args.length === 0) {
    if (pathname === '/') return label === 'Get Started'
    const boardPage =
      filterLabels.has(pathname) ||
      pathname === '/aac' ||
      pathname.startsWith('/aac/')
    return boardPage && label !== undefined && navigationLabels.has(label)
  }
  return (
    component === 'input' &&
    label !== undefined &&
    filterLabels.get(pathname) === label &&
    action === 'setValue' &&
    args.length === 1 &&
    typeof args[0] === 'string'
  )
}
