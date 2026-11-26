import { useState } from 'react'
import { act, render, screen } from '@testing-library/react'
import { createAgent } from '@ui-sdk/react/agent'
import { expect, it, vi } from 'vitest'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AgentBridge } from './agent-bridge'
import { allowAgentAction } from '@/lib/agent-policy'

function Filter() {
  const [query, setQuery] = useState('')
  return (
    <>
      <Input
        aria-label="Search places"
        data-agent-secret
        value={query}
        onValueChange={setQuery}
      />
      <output>{query}</output>
    </>
  )
}

it('applies an allowed SDK edit to React state and redacts the field from snapshots', async () => {
  render(<Filter />)
  const agent = createAgent({
    allow: (step) => allowAgentAction('/places', step),
  })
  const field = agent
    .snapshot()
    .find((entry) => entry.label === 'Search places')
  expect(field).toBeDefined()
  await act(async () => {
    const result = await agent.act({
      steps: [{ ref: field!.ref, action: 'setValue', args: ['test park'] }],
    })
    expect(result.error).toBeUndefined()
  })
  expect(
    screen.getByText('test park', { selector: 'output' }),
  ).toBeInTheDocument()
  expect(JSON.stringify(agent.snapshot())).not.toContain('test park')
})

it('permits public navigation through the resolved link and denies a second button', async () => {
  const onNavigate = vi.fn((event: React.MouseEvent) => event.preventDefault())
  const onDelete = vi.fn()
  render(
    <>
      <Button asChild>
        <a href="/login" onClick={onNavigate}>
          Get Started
        </a>
      </Button>
      <Button onClick={onDelete}>Delete</Button>
    </>,
  )
  const agent = createAgent({ allow: (step) => allowAgentAction('/', step) })
  const ref = (label: string) =>
    agent.snapshot().find((entry) => entry.label === label)!.ref
  await act(async () => {
    expect(
      (
        await agent.act({
          steps: [{ ref: ref('Get Started'), action: 'press' }],
        })
      ).error,
    ).toBeUndefined()
    expect(
      (await agent.act({ steps: [{ ref: ref('Delete'), action: 'press' }] }))
        .error,
    ).toBeDefined()
  })
  expect(onNavigate).toHaveBeenCalledOnce()
  expect(onDelete).not.toHaveBeenCalled()
})

it('registers WebMCP tools once and releases their registrations on unmount', () => {
  const registrations = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(document, 'modelContext', {
    configurable: true,
    value: { registerTool: registrations },
  })
  try {
    const view = render(<AgentBridge />)
    view.rerender(<AgentBridge />)
    expect(registrations.mock.calls.map(([tool]) => tool.name).sort()).toEqual([
      'act',
      'query',
      'snapshot',
    ])
    view.unmount()
    for (const [, options] of registrations.mock.calls)
      expect(options.signal.aborted).toBe(true)
  } finally {
    Reflect.deleteProperty(document, 'modelContext')
  }
})
