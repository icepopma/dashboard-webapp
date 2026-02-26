// ─────────────────────────────────────────────────────────────────
// Agent Action API - 智能体操作 API (暂停/恢复/重启/启动)
// ─────────────────────────────────────────────────────────────────

import { apiHandler, parseJsonBody } from '@/lib/api-handler'
import { AppError } from '@/lib/errors'
import { agentStateStore, AGENT_CONFIGS } from '@/lib/agent-state'
import { getLauncher } from '@/lib/launcher-instance'
import type { AgentType } from '@/orchestrator/types'

const VALID_ACTIONS = ['pause', 'resume', 'restart', 'start', 'stop'] as const
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

  // Pop 不能被控制
  if (agentType === 'pop' && ['pause', 'stop'].includes(agentAction)) {
    throw AppError.badRequest('Pop 不能被暂停或停止')
  }

  // 获取当前状态
  const currentState = agentStateStore.getState(agentType)
  if (!currentState) {
    throw AppError.notFound('智能体不存在')
  }

  const launcher = getLauncher()
  const body = await parseJsonBody<{ prompt?: string; taskId?: string }>(request).catch(() => ({})) as { prompt?: string; taskId?: string }

  // 执行操作
  let newState
  switch (agentAction) {
    case 'start':
      if (currentState.status !== 'idle' && currentState.status !== 'offline') {
        throw AppError.badRequest('只能启动空闲或离线的智能体')
      }
      if (!body.prompt || !body.taskId) {
        throw AppError.badRequest('启动需要 prompt 和 taskId')
      }

      // 使用真实 Launcher 启动
      if (launcher) {
        try {
          const session = await launcher.launch({
            agent: agentType,
            taskId: body.taskId,
            prompt: body.prompt,
            worktree: true,
          })

          agentStateStore.updateState(agentType, {
            status: 'working',
            currentTask: body.prompt.slice(0, 50),
          })

          // 监听会话事件
          launcher.on('closed', (s) => {
            if (s.id === session.id) {
              agentStateStore.updateState(agentType, {
                status: 'idle',
                currentTask: undefined,
              })
            }
          })

          newState = agentStateStore.getState(agentType)
        } catch (err) {
          console.error('Failed to launch agent:', err)
          throw AppError.internal('启动智能体失败')
        }
      } else {
        // 降级：模拟启动
        agentStateStore.updateState(agentType, {
          status: 'working',
          currentTask: body.prompt.slice(0, 50),
        })
        newState = agentStateStore.getState(agentType)
      }
      break

    case 'pause':
      if (currentState.status !== 'working') {
        throw AppError.badRequest('只能暂停工作中的智能体')
      }

      // 使用真实 Launcher 暂停
      if (launcher) {
        const sessions = launcher.getAllSessions()
        const agentSession = sessions.find(s => s.agent === agentType && s.status === 'running')
        if (agentSession) {
          // 标记为暂停（实际进程继续，但不再处理）
          launcher.emit('paused', agentSession)
        }
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
      // 重启逻辑
      agentStateStore.updateState(agentType, {
        status: 'offline',
        currentTask: '重启中...'
      })

      // 使用真实 Launcher 重启
      if (launcher) {
        const sessions = launcher.getAllSessions()
        const agentSession = sessions.find(s => s.agent === agentType)
        if (agentSession) {
          await launcher.restart(agentSession.id)
        }
      } else {
        // 降级：模拟重启延迟
        setTimeout(() => {
          agentStateStore.updateState(agentType, {
            status: 'idle',
            currentTask: undefined
          })
        }, 2000)
      }
      newState = agentStateStore.getState(agentType)
      break

    case 'stop':
      if (currentState.status === 'offline') {
        throw AppError.badRequest('智能体已离线')
      }

      // 使用真实 Launcher 停止
      if (launcher) {
        const sessions = launcher.getAllSessions()
        const agentSession = sessions.find(s => s.agent === agentType)
        if (agentSession) {
          // 清理会话
          launcher.cleanupOldSessions(0)
        }
      }

      agentStateStore.updateState(agentType, {
        status: 'offline',
        currentTask: undefined
      })
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
