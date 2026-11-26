import { describe, expect, it } from 'vitest'
import type { AgentAction } from '@ui-sdk/react/agent'
import { allowAgentAction } from './agent-policy'

const navigation: AgentAction = {
  ref: 'c1',
  component: 'button',
  label: 'Get Started',
  action: 'press',
  args: [],
}
const edit: AgentAction = {
  ref: 'c2',
  component: 'input',
  label: 'Search places',
  action: 'setValue',
  args: ['park'],
}

describe('VoiceBridge agent permissions', () => {
  it('allows the public login link and the local places filter', () => {
    expect(allowAgentAction('/', navigation)).toBe(true)
    expect(allowAgentAction('/places', edit)).toBe(true)
    expect(
      allowAgentAction('/places', { ...navigation, label: 'Go to Activities' }),
    ).toBe(true)
  })

  it.each([
    'Record',
    'Start call',
    'Delete',
    'Sign in',
    'Save settings',
    'Pay',
    'New button',
  ])('denies %s', (label) => {
    expect(allowAgentAction('/', { ...navigation, label })).toBe(false)
  })

  it('checks the route, target, action, arguments and confirmation', () => {
    expect(allowAgentAction('/login', navigation)).toBe(false)
    expect(allowAgentAction('/', { ...navigation, args: ['Delete'] })).toBe(
      false,
    )
    expect(allowAgentAction('/places', { ...edit, component: 'select' })).toBe(
      false,
    )
    expect(allowAgentAction('/places', { ...edit, action: 'submit' })).toBe(
      false,
    )
    expect(allowAgentAction('/places', { ...edit, args: [] })).toBe(false)
    expect(
      allowAgentAction('/places', { ...edit, confirm: 'Change account' }),
    ).toBe(false)
    expect(allowAgentAction('/aac/settings', edit)).toBe(false)
    expect(allowAgentAction('/unreviewed', { ...edit, label: undefined })).toBe(
      false,
    )
  })
})
