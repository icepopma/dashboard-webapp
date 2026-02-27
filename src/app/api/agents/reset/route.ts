// ─────────────────────────────────────────────────────────────────
// Agent Reset API - 重置智能体状态
// ─────────────────────────────────────────────────────────────────

import { apiHandler } from '@/lib/api-handler'
import { agentStateStore, AGENT_CONFIGS } from '@/lib/agent-state'
import type { AgentType } from '@/orchestrator/types'

/**
 * POST /api/agents/reset - 重置智能体状态
 */
export const POST = apiHandler(async (request) => {
  const url = new URL(request.url)
  const agent = url.searchParams.get('agent')

  if (agent && agent !== 'all') {
    // 重置单个智能体
    const agentType = agent as AgentType
    if (!AGENT_CONFIGS[agentType]) {
      return { error: 'Invalid agent type', validTypes: Object.keys(AGENT_CONFIGS) }
    }

    agentStateStore.updateState(agentType, {
      status: 'idle',
      currentTask: undefined,
    })

    return { success: true, agent: agentType, status: 'idle' }
  }

  // 重置所有智能体
  Object.keys(AGENT_CONFIGS).forEach((type) => {
    if (type !== 'pop') {
      agentStateStore.updateState(type as AgentType, {
        status: 'idle',
        currentTask: undefined,
      })
    }
  })

  return { success: true, reset: 'all', message: 'All agents reset to idle' }
})
