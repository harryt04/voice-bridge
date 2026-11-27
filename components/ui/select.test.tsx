import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { Select, SelectContent, SelectItem, SelectTrigger } from './select'

const items = Array.from({ length: 30 }, (_, i) => `Item ${i + 1}`)

function LongSelect() {
  return (
    <Select defaultValue="Item 1">
      <SelectTrigger aria-label="Long list">Item 1</SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item} value={item}>
            {item}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

const restores: Array<() => void> = []
function stubGetter(name: 'scrollHeight' | 'clientHeight', value: number) {
  const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, name)
  Object.defineProperty(HTMLElement.prototype, name, {
    configurable: true,
    get() {
      return this.hasAttribute('data-vb-select-list') ? value : 0
    },
  })
  restores.push(() =>
    original
      ? Object.defineProperty(HTMLElement.prototype, name, original)
      : delete (HTMLElement.prototype as unknown as Record<string, unknown>)[
          name
        ],
  )
}

beforeEach(() => {
  // jsdom lacks the layout and animation APIs the SDK popup calls.
  Element.prototype.scrollIntoView ??= () => {}
  Element.prototype.getAnimations ??= () => []
  Element.prototype.scrollBy ??= function (this: Element, options) {
    const top = typeof options === 'object' ? (options?.top ?? 0) : 0
    this.scrollTop += top
    this.dispatchEvent(new Event('scroll'))
  }
  stubGetter('scrollHeight', 1000)
  stubGetter('clientHeight', 300)
})

afterEach(() => {
  restores.splice(0).forEach((restore) => restore())
  vi.useRealTimers()
})

const arrow = (direction: 'up' | 'down') =>
  document.querySelector(`[data-vb-select-scroll="${direction}"]`)

it('shows a scroll arrow only in the direction the list can scroll', async () => {
  const user = userEvent.setup()
  render(<LongSelect />)

  await user.click(screen.getByRole('combobox', { name: 'Long list' }))
  await screen.findByRole('option', { name: 'Item 1' })
  const list = document.querySelector<HTMLElement>('[data-vb-select-list]')!

  expect(arrow('up')).toBeNull()
  expect(arrow('down')).toHaveAttribute('aria-hidden', 'true')

  await act(async () => {
    list.scrollTop = 350
    fireEvent.scroll(list)
  })
  expect(arrow('up')).not.toBeNull()
  expect(arrow('down')).not.toBeNull()

  await act(async () => {
    list.scrollTop = 698
    fireEvent.scroll(list)
  })
  expect(arrow('up')).not.toBeNull()
  expect(arrow('down')).toBeNull()
})

it('scrolls the list while the pointer rests on an arrow', async () => {
  const user = userEvent.setup()
  render(<LongSelect />)
  await user.click(screen.getByRole('combobox', { name: 'Long list' }))
  await screen.findByRole('option', { name: 'Item 1' })
  const list = document.querySelector<HTMLElement>('[data-vb-select-list]')!

  vi.useFakeTimers()
  await act(async () => {
    fireEvent.pointerEnter(arrow('down')!)
  })
  expect(list.scrollTop).toBe(32)
  await act(async () => {
    vi.advanceTimersByTime(100)
  })
  expect(list.scrollTop).toBe(96)

  await act(async () => {
    fireEvent.pointerLeave(arrow('down')!)
    vi.advanceTimersByTime(200)
  })
  expect(list.scrollTop).toBe(96)
})
