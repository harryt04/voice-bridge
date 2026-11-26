'use client'

import { useEffect } from 'react'
import {
  createAgent,
  registerTools,
  type AgentAction,
} from '@ui-sdk/react/agent'
import { allowAgentAction } from '@/lib/agent-policy'

export function AgentBridge() {
  useEffect(() => {
    const allow = (step: AgentAction) =>
      allowAgentAction(window.location.pathname, step)
    const agent = createAgent({ allow })
    return registerTools(agent, { allow })
  }, [])
  return null
}
