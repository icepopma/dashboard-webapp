// ─────────────────────────────────────────────────────────────────
// Dispatch API - 任务派发 API
// ─────────────────────────────────────────────────────────────────

import { apiHandler, parseJsonBody } from '@/lib/api-handler'
import { AppError } from '@/lib/errors'
import { agentStateStore, AGENT_CONFIGS } from '@/lib/agent-state'
import { createTask } from '@/lib/supabase'
import type { AgentType } from '@/orchestrator/types'

/**
 * POST /api/dispatch - 派发任务给智能体
 */
export const POST = apiHandler(async (request) => {
  const body = await parseJsonBody<{
    description: string
    agent: string
    title?: string
    priority?: 'low' | 'medium' | 'high' | 'critical'
  }>(request)
  
  // 验证
  if (!body.description?.trim()) {
    throw AppError.badRequest('请输入任务描述')
  }
  
  if (!body.agent) {
    throw AppError.badRequest('请指定智能体')
  }
  
  const agentType = body.agent as AgentType
  if (!AGENT_CONFIGS[agentType]) {
    throw AppError.badRequest('无效的智能体类型', {
      validTypes: Object.keys(AGENT_CONFIGS),
    })
  }

  // 生成任务标题（从描述中提取前50个字符）
  const title = body.title || body.description.slice(0, 50) + (body.description.length > 50 ? '...' : '')
  
  // 创建任务记录
  const task = await createTask({
    title,
    description: body.description,
    agent: agentType,
    priority: body.priority || 'medium',
    status: 'todo',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
  
  // 更新智能体状态（如果空闲则设为工作）
  const currentState = agentStateStore.getState(agentType)
  if (currentState && currentState.status === 'idle') {
    agentStateStore.updateState(agentType, {
      status: 'working',
      currentTask: title,
    })
  }
  
  // 添加会话记录
  const sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2)}`
  agentStateStore.addSession({
    id: sessionId,
    agent: agentType,
    taskId: task.id,
    status: 'starting',
    startTime: new Date(),
  })

  return {
    success: true,
    task: {
      id: task.id,
      title: task.title,
      status: task.status,
    },
    dispatch: {
      agent: agentType,
      agentName: AGENT_CONFIGS[agentType].name,
      sessionId,
    },
    timestamp: new Date().toISOString(),
  }
})
