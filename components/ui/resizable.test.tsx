import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from './resizable'

// jsdom has no layout, so the SDK's measured state (aria-valuenow, tabindex,
// keyboard resizing) is verified in a real browser, not here.
it('renders SDK panels and a named separator carrying the app markers', () => {
  render(
    <ResizablePanelGroup direction="horizontal" style={{ width: 400 }}>
      <ResizablePanel defaultSize={40} minSize={20}>
        Cards
      </ResizablePanel>
      <ResizableHandle withHandle aria-label="Resize cards" />
      <ResizablePanel defaultSize={60}>Details</ResizablePanel>
    </ResizablePanelGroup>,
  )

  const handle = screen.getByRole('separator', { name: 'Resize cards' })
  expect(handle).toHaveAttribute('data-vb-resizable-handle')
  expect(handle).toHaveAttribute('data-slot', 'resizable-handle')
  expect(handle).toHaveAttribute('aria-orientation', 'vertical')
  expect(handle.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')

  const group = handle.closest('[data-vb-resizable-group]') as HTMLElement
  expect(group).toHaveAttribute('data-orientation', 'horizontal')
  const panels = group.querySelectorAll('[data-slot="resizable-panel"]')
  expect(panels).toHaveLength(2)
  expect((panels[0] as HTMLElement).style.flex).toContain('40%')
  expect((panels[1] as HTMLElement).style.flex).toContain('60%')
})

it('maps the shadcn direction prop to the SDK orientation', () => {
  render(
    <ResizablePanelGroup direction="vertical" style={{ height: 300 }}>
      <ResizablePanel>Top</ResizablePanel>
      <ResizableHandle aria-label="Resize top" />
      <ResizablePanel>Bottom</ResizablePanel>
    </ResizablePanelGroup>,
  )

  const handle = screen.getByRole('separator', { name: 'Resize top' })
  expect(handle).toHaveAttribute('data-orientation', 'vertical')
  expect(handle.closest('[data-vb-resizable-group]')).toHaveAttribute(
    'data-orientation',
    'vertical',
  )
})
