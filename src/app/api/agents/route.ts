// ─────────────────────────────────────────────────────────────────
// Agent State API - 智能体状态 API
// ─────────────────────────────────────────────────────────────────

import { apiHandler, parseJsonBody } from '@/lib/api-handler'
import { AppError, validators } from '@/lib/errors'
import { getAgentStates, agentStateStore, AGENT_CONFIGS } from '@/lib/agent-state'
import type { AgentType } from '@/orchestrator/types'

/**
 * GET /api/agents - 获取所有智能体状态
 */
export const GET = apiHandler(async () => {
  const states = await getAgentStates()
  const sessions = agentStateStore.getActiveSessions()
  const popTasks = agentStateStore.getPopTasks()
  
  return {
    agents: states.map(state => ({
      ...state,
      config: AGENT_CONFIGS[state.type],
    })),
    activeSessions: sessions,
    popTasks,
    timestamp: new Date().toISOString(),
  }
})

/**
 * POST /api/agents - 更新智能体状态
 */
export const POST = apiHandler(async (request) => {
  const body = await parseJsonBody<{
    agentType: AgentType
    updates: {
      status?: 'working' | 'idle' | 'offline' | 'error'
      currentTask?: string
    }
  }>(request)

  // 验证
  if (!body.agentType) {
    throw AppError.badRequest('缺少智能体类型')
  }

  if (!AGENT_CONFIGS[body.agentType]) {
    throw AppError.badRequest('无效的智能体类型', {
      validTypes: Object.keys(AGENT_CONFIGS),
    })
  }

  if (!body.updates || Object.keys(body.updates).length === 0) {
    throw AppError.badRequest('缺少更新内容')
  }

  if (body.updates.status) {
    validators.enum(
      body.updates.status,
      ['working', 'idle', 'offline', 'error'],
      '智能体状态'
    )
  }

  // 更新状态
  agentStateStore.updateState(body.agentType, body.updates)
  
  return {
    success: true,
    state: agentStateStore.getState(body.agentType),
  }
})
