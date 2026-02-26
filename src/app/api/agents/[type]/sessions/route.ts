// ─────────────────────────────────────────────────────────────────
// Agent Sessions API - 智能体会话 API
// ─────────────────────────────────────────────────────────────────

import { apiHandler } from '@/lib/api-handler'
import { AppError } from '@/lib/errors'
import { AGENT_CONFIGS } from '@/lib/agent-state'
import { getLauncher } from '@/lib/launcher-instance'
import type { AgentType } from '@/orchestrator/types'

/**
 * GET /api/agents/[type]/sessions - 获取智能体会话
 */
export const GET = apiHandler(async (request, { params }) => {
  const { type } = await params

  if (!type || !AGENT_CONFIGS[type as AgentType]) {
    throw AppError.badRequest('无效的智能体类型')
  }

  const launcher = getLauncher()

  if (!launcher) {
    return { sessions: [] }
  }

  const allSessions = launcher.getAllSessions()
  const agentSessions = allSessions.filter(s => s.agent === type)

  return {
    sessions: agentSessions.map(s => ({
      id: s.id,
      taskId: s.taskId,
      status: s.status,
      startTime: s.startTime,
      branch: s.branch,
      worktree: s.worktree,
    }))
  }
})
