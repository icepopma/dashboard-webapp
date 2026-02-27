// ─────────────────────────────────────────────────────────────────
// Dispatch API - 任务派发 API (通过 OpenClaw Gateway 调用真实 subagent)
// ─────────────────────────────────────────────────────────────────

import { apiHandler, parseJsonBody } from '@/lib/api-handler'
import { AppError } from '@/lib/errors'
import { agentStateStore, AGENT_CONFIGS } from '@/lib/agent-state'
import type { AgentType } from '@/orchestrator/types'

// OpenClaw Gateway 配置
const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://127.0.0.1:18789'
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || '160ee9bafae48a448824b4eec20752e53412ca1df55f5335'

// 智能体 ID 映射（Dashboard 智能体类型 → OpenClaw agentId）
const AGENT_ID_MAP: Record<string, string> = {
  codex: 'codex',
  claude: 'claude',
  quill: 'quill',
  echo: 'echo',
  scout: 'scout',
  pixel: 'pixel',
}

/**
 * 调用 OpenClaw Gateway 的 sessions_spawn 工具
 */
async function spawnSubagent(agentId: string, task: string): Promise<{
  success: boolean
  sessionKey?: string
  runId?: string
  error?: string
}> {
  try {
    const response = await fetch(`${GATEWAY_URL}/tools/invoke`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GATEWAY_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tool: 'sessions_spawn',
        args: {
          task,
          // 不指定 agentId，使用当前 main agent 执行
          mode: 'run',
          cleanup: 'keep',
        },
        sessionKey: 'main',
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gateway error:', response.status, errorText)
      return { success: false, error: `Gateway returned ${response.status}` }
    }

    const result = await response.json()
    console.log('[Dispatch] Gateway response:', JSON.stringify(result, null, 2))
    
    if (!result.ok) {
      return { success: false, error: result.error?.message || 'Unknown error' }
    }

    const sessionKey = result.result?.details?.childSessionKey || result.result?.childSessionKey
    console.log('[Dispatch] Extracted sessionKey:', sessionKey)

    return {
      success: true,
      sessionKey,
      runId: result.result?.details?.runId || result.result?.runId,
    }
  } catch (error) {
    console.error('Failed to spawn subagent:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Network error' 
    }
  }
}

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

  // 获取 OpenClaw agentId
  const openclawAgentId = AGENT_ID_MAP[agentType] || agentType

  // 调用 OpenClaw Gateway 启动真实的 subagent
  const spawnResult = await spawnSubagent(openclawAgentId, body.description)

  // 更新智能体状态
  agentStateStore.updateState(agentType, {
    status: 'working',
    currentTask: title,
  })

  // 添加会话记录
  const sessionId = spawnResult.sessionKey || `session-${Date.now()}-${Math.random().toString(36).slice(2)}`
  agentStateStore.addSession({
    id: sessionId,
    agent: agentType,
    taskId: dbTask?.id || taskId,
    status: spawnResult.success ? 'running' : 'starting',
    startTime: new Date(),
  })

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
      runId: spawnResult.runId,
      realSpawn: spawnResult.success,
      reason: spawnResult.success 
        ? `已通过 OpenClaw 启动 ${AGENT_CONFIGS[agentType].name} subagent`
        : `派发失败: ${spawnResult.error}`,
    },
    timestamp: new Date().toISOString(),
  }
})
