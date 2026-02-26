// ─────────────────────────────────────────────────────────────────
// Task Complete API - 任务完成 API
// ─────────────────────────────────────────────────────────────────

import { apiHandler, parseJsonBody } from '@/lib/api-handler'
import { AppError } from '@/lib/errors'
import { agentStateStore, AGENT_CONFIGS } from '@/lib/agent-state'
import type { AgentType } from '@/orchestrator/types'

/**
 * POST /api/tasks/[id]/complete - 标记任务完成
 */
export const POST = apiHandler(async (request, { params }) => {
  const { id } = await params
  const body = await parseJsonBody<{
    agent?: string
    result?: {
      type: 'text' | 'markdown' | 'code' | 'file'
      content: string
      files?: { name: string; url: string; size: string }[]
    }
  }>(request) || {}

  // 如果指定了智能体，更新其状态为空闲
  if (body.agent) {
    const agentType = body.agent as AgentType
    if (AGENT_CONFIGS[agentType]) {
      agentStateStore.updateState(agentType, {
        status: 'idle',
        currentTask: undefined,
      })
    }
  }

  // 尝试更新数据库中的任务状态
  try {
    const { updateTask } = await import('@/lib/supabase')
    await updateTask(id, {
      status: 'completed',
      updated_at: new Date().toISOString(),
    })
  } catch (dbError) {
    console.warn('Failed to update task in database:', dbError)
  }

  return {
    success: true,
    taskId: id,
    completedAt: new Date().toISOString(),
    result: body.result || null,
  }
})
