import * as React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { Slot } from './slot'
import { SidebarMenuButton, SidebarProvider } from './sidebar'

it('renders the child in place of a wrapper and merges the slot props into it', () => {
  const slotClick = vi.fn()
  const childClick = vi.fn()
  const ref = React.createRef<HTMLElement>()
  render(
    <Slot
      ref={ref}
      className="from-slot"
      data-sidebar="menu-button"
      onClick={slotClick}
    >
      <a href="#places" className="from-child" onClick={childClick}>
        Places
      </a>
    </Slot>,
  )

  const link = screen.getByRole('link', { name: 'Places' })
  expect(link.tagName).toBe('A')
  expect(link).toHaveClass('from-slot', 'from-child')
  expect(link).toHaveAttribute('data-sidebar', 'menu-button')
  expect(ref.current).toBe(link)

  fireEvent.click(link)
  expect(childClick).toHaveBeenCalledTimes(1)
  expect(slotClick).toHaveBeenCalledTimes(1)
})

it("lets the child's handler skip the slot's by preventing default", () => {
  const slotClick = vi.fn()
  render(
    <Slot onClick={slotClick}>
      <button type="button" onClick={(event) => event.preventDefault()}>
        Stop
      </button>
    </Slot>,
  )

  fireEvent.click(screen.getByRole('button', { name: 'Stop' }))
  expect(slotClick).not.toHaveBeenCalled()
})

it('keeps sidebar asChild links as links with the sidebar styling', () => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  )
  render(
    <SidebarProvider>
      <SidebarMenuButton asChild>
        <a href="/food">Go to Food</a>
      </SidebarMenuButton>
    </SidebarProvider>,
  )

  const link = screen.getByRole('link', { name: 'Go to Food' })
  expect(link).toHaveAttribute('href', '/food')
  expect(link).toHaveAttribute('data-sidebar', 'menu-button')
  expect(link).not.toHaveAttribute('type')
  expect(screen.queryByRole('button', { name: 'Go to Food' })).toBeNull()
  vi.unstubAllGlobals()
})
