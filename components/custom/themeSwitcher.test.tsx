import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, it, vi } from 'vitest'
import { ThemeSwitcher } from './themeSwitcher'

const setTheme = vi.fn()
vi.mock('next-themes', () => ({ useTheme: () => ({ setTheme }) }))

beforeEach(() => {
  setTheme.mockClear()
  // jsdom lacks the layout and animation APIs the SDK menu calls.
  Element.prototype.scrollIntoView ??= () => {}
  Element.prototype.getAnimations ??= () => []
})

it('chooses a theme with the keyboard and returns focus to the trigger', async () => {
  const user = userEvent.setup()
  render(<ThemeSwitcher />)

  const trigger = screen.getByRole('button', { name: 'Toggle theme' })
  trigger.focus()
  await user.keyboard('{Enter}')
  const light = await screen.findByRole('menuitem', { name: 'Light' })
  expect(light).toHaveFocus()

  await user.keyboard('{ArrowDown}')
  expect(screen.getByRole('menuitem', { name: 'Dark' })).toHaveFocus()
  await user.keyboard('{Enter}')

  expect(setTheme).toHaveBeenCalledWith('dark')
  expect(trigger).toHaveFocus()
})

it('chooses a theme with the pointer', async () => {
  const user = userEvent.setup()
  render(<ThemeSwitcher />)

  await user.click(screen.getByRole('button', { name: 'Toggle theme' }))
  await user.click(await screen.findByRole('menuitem', { name: 'Automatic' }))

  expect(setTheme).toHaveBeenCalledWith('system')
})

it('closes on Escape without choosing and returns focus to the trigger', async () => {
  const user = userEvent.setup()
  render(<ThemeSwitcher />)

  const trigger = screen.getByRole('button', { name: 'Toggle theme' })
  await user.click(trigger)
  await screen.findByRole('menuitem', { name: 'Light' })
  await act(async () => {
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' })
  })

  expect(screen.queryByRole('menuitem', { name: 'Light' })).toBeNull()
  expect(setTheme).not.toHaveBeenCalled()
  expect(trigger).toHaveFocus()
})
