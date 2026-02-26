// ─────────────────────────────────────────────────────────────────
// Dispatch API - 任务派发 API
// ─────────────────────────────────────────────────────────────────

import { apiHandler, parseJsonBody } from '@/lib/api-handler'
import { AppError } from '@/lib/errors'
import { agentStateStore, AGENT_CONFIGS } from '@/lib/agent-state'
import { getLauncher } from '@/lib/launcher-instance'
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

  // Pop 不能被派发任务（它是协调者）
  if (agentType === 'pop') {
    throw AppError.badRequest('Pop 是协调者，不能直接执行任务')
  }

  // 检查智能体状态
  const currentState = agentStateStore.getState(agentType)
  if (currentState && currentState.status === 'working') {
    throw AppError.badRequest(`${AGENT_CONFIGS[agentType].name} 正在执行其他任务，请稍后再试`)
  }

  // 生成任务标题
  const title = body.title || body.description.slice(0, 50) + (body.description.length > 50 ? '...' : '')

  // 生成任务 ID
  const taskId = `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  // 尝试保存到数据库
  let dbTask = null
  try {
    const { createTask } = await import('@/lib/supabase')
    dbTask = await createTask({
      id: taskId,
      title,
      description: body.description,
      assignee: agentType,
      priority: body.priority || 'medium',
      status: 'in_progress',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  } catch (dbError) {
    console.warn('Failed to save task to database:', dbError)
  }

  // 真正启动智能体
  const launcher = getLauncher()
  let sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2)}`

  if (launcher) {
    try {
      const session = await launcher.launch({
        agent: agentType,
        taskId: dbTask?.id || taskId,
        prompt: body.description,
        worktree: true,
      })
      sessionId = session.id

      // 更新智能体状态
      agentStateStore.updateState(agentType, {
        status: 'working',
        currentTask: title,
      })

      // 添加会话记录
      agentStateStore.addSession({
        id: session.id,
        agent: agentType,
        taskId: dbTask?.id || taskId,
        status: 'starting',
        startTime: new Date(),
      })
    } catch (launchError) {
      console.error('Failed to launch agent:', launchError)
      // 降级：只更新状态
      agentStateStore.updateState(agentType, {
        status: 'working',
        currentTask: title,
      })
    }
  } else {
    // 无 Launcher，模拟派发
    agentStateStore.updateState(agentType, {
      status: 'working',
      currentTask: title,
    })

    agentStateStore.addSession({
      id: sessionId,
      agent: agentType,
      taskId: dbTask?.id || taskId,
      status: 'starting',
      startTime: new Date(),
    })
  }

  return {
    task: {
      id: dbTask?.id || taskId,
      title,
      status: 'in_progress',
    },
    dispatch: {
      agent: agentType,
      agentName: AGENT_CONFIGS[agentType].name,
      agentEmoji: AGENT_CONFIGS[agentType].emoji,
      sessionId,
      reason: `根据任务描述，选择了 ${AGENT_CONFIGS[agentType].name} 来执行此任务`,
    },
    timestamp: new Date().toISOString(),
  }
})
