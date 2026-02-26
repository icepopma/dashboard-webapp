// ─────────────────────────────────────────────────────────────────
// Agent Action API - 智能体操作 API (暂停/恢复/重启)
// ─────────────────────────────────────────────────────────────────

import { apiHandler } from '@/lib/api-handler'
import { AppError } from '@/lib/errors'
import { agentStateStore, AGENT_CONFIGS } from '@/lib/agent-state'
import type { AgentType } from '@/orchestrator/types'

const VALID_ACTIONS = ['pause', 'resume', 'restart'] as const
type AgentAction = typeof VALID_ACTIONS[number]

/**
 * POST /api/agents/[type]/[action] - 执行智能体操作
 */
export const POST = apiHandler(async (request, { params }) => {
  const { type, action } = await params
  
  // 验证智能体类型
  if (!type || !AGENT_CONFIGS[type as AgentType]) {
    throw AppError.badRequest('无效的智能体类型', {
      validTypes: Object.keys(AGENT_CONFIGS),
    })
  }

  // 验证操作类型
  if (!VALID_ACTIONS.includes(action as AgentAction)) {
    throw AppError.badRequest('无效的操作', {
      validActions: VALID_ACTIONS,
    })
  }

  const agentType = type as AgentType
  const agentAction = action as AgentAction

  // 获取当前状态
  const currentState = agentStateStore.getState(agentType)
  if (!currentState) {
    throw AppError.notFound('智能体不存在')
  }

  // 执行操作
  let newState
  switch (agentAction) {
    case 'pause':
      if (currentState.status !== 'working') {
        throw AppError.badRequest('只能暂停工作中的智能体')
      }
      agentStateStore.updateState(agentType, { 
        status: 'idle',
        currentTask: undefined 
      })
      newState = agentStateStore.getState(agentType)
      break

    case 'resume':
      if (currentState.status !== 'idle') {
        throw AppError.badRequest('只能恢复空闲的智能体')
      }
      agentStateStore.updateState(agentType, { 
        status: 'working',
        currentTask: '等待任务分配' 
      })
      newState = agentStateStore.getState(agentType)
      break

    case 'restart':
      // 重启逻辑：先设为离线，再恢复
      agentStateStore.updateState(agentType, { 
        status: 'offline',
        currentTask: '重启中...' 
      })
      // 模拟重启延迟
      setTimeout(() => {
        agentStateStore.updateState(agentType, { 
          status: 'idle',
          currentTask: undefined 
        })
      }, 2000)
      newState = agentStateStore.getState(agentType)
      break
  }

  return {
    success: true,
    action: agentAction,
    agent: agentType,
    previousStatus: currentState.status,
    newStatus: newState?.status,
    timestamp: new Date().toISOString(),
  }
})
