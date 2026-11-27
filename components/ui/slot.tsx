import * as React from 'react'
import { renderElement } from '@ui-sdk/react/primitive'

type SlotProps = React.HTMLAttributes<HTMLElement> & {
  children?: React.ReactNode
  ref?: React.Ref<HTMLElement>
}

/**
 * Renders its only child with the slot's props merged in, for `asChild`
 * wrappers that have no UI SDK part behind them (Sidebar, Form).
 *
 * Built on UI SDK's `renderElement`, so merging matches the SDK parts' own
 * `render` prop: the child's props win, `className` and `style` combine,
 * refs are merged, and both event handlers run (the child's first; it can
 * call `preventDefault()` to skip the slot's). Lazy children are resolved.
 */
function Slot({ children, ...props }: SlotProps) {
  const child = React.Children.only(children)
  if (!React.isValidElement(child)) {
    return null
  }
  return renderElement('span', props, child)
}

export { Slot }
export type { SlotProps }
