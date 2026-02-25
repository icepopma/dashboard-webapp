// ─────────────────────────────────────────────────────────────────
// Agent State Manager - 智能体状态管理
// ─────────────────────────────────────────────────────────────────

import type { AgentType, AgentSession, AgentStatus } from '@/orchestrator/types'

// 智能体配置
export const AGENT_CONFIGS: Record<AgentType, {
  name: string
  role: string
  emoji: string
  capabilities: string[]
  model: string
}> = {
  pop: {
    name: 'Pop',
    role: 'Chief of Staff',
    emoji: '🫧',
    capabilities: ['orchestration', 'planning', 'coordination'],
    model: 'zai/glm-5',
  },
  codex: {
    name: 'Codex',
    role: 'Lead Engineer',
    emoji: '🤖',
    capabilities: ['feature', 'bugfix', 'refactor', 'test'],
    model: 'gpt-5.3-codex',
  },
  claude: {
    name: 'Claude Code',
    role: 'Senior Engineer',
    emoji: '🧠',
    capabilities: ['feature', 'bugfix', 'docs', 'refactor'],
    model: 'claude-opus-4.5',
  },
  quill: {
    name: 'Quill',
    role: 'Content Writer',
    emoji: '✍️',
    capabilities: ['docs', 'blog', 'copywriting'],
    model: 'claude-opus-4.5',
  },
  echo: {
    name: 'Echo',
    role: 'Social Media Manager',
    emoji: '📢',
    capabilities: ['publish', 'distribute', 'sync'],
    model: 'claude-sonnet-4',
  },
  scout: {
    name: 'Scout',
    role: 'Trend Analyst',
    emoji: '🔍',
    capabilities: ['analysis', 'research', 'monitoring'],
    model: 'gemini-2.0-flash',
  },
  pixel: {
    name: 'Pixel',
    role: 'Designer',
    emoji: '🎨',
    capabilities: ['design', 'ui', 'graphics'],
    model: 'gemini-2.0-flash',
  },
}

// 智能体运行时状态
export interface AgentRuntimeState {
  type: AgentType
  status: 'working' | 'idle' | 'offline' | 'error'
  currentTask?: string
  lastActivity?: Date
  sessionCount: number
  successRate: number
}

// 内存中的智能体状态存储
class AgentStateStore {
  private states: Map<AgentType, AgentRuntimeState> = new Map()
  private sessions: Map<string, AgentSession> = new Map()

  constructor() {
    // 初始化所有智能体
    Object.keys(AGENT_CONFIGS).forEach((type) => {
      this.states.set(type as AgentType, {
        type: type as AgentType,
        status: type === 'pop' ? 'working' : 'idle',
        currentTask: type === 'pop' ? '管理系统运行' : undefined,
        sessionCount: 0,
        successRate: AGENT_CONFIGS[type as AgentType]?.capabilities ? 0.85 : 0.85,
      })
    })
  }

  // 获取所有智能体状态
  getAllStates(): AgentRuntimeState[] {
    return Array.from(this.states.values())
  }

  // 获取单个智能体状态
  getState(type: AgentType): AgentRuntimeState | undefined {
    return this.states.get(type)
  }

  // 更新智能体状态
  updateState(type: AgentType, updates: Partial<AgentRuntimeState>): void {
    const current = this.states.get(type)
    if (current) {
      this.states.set(type, { ...current, ...updates, lastActivity: new Date() })
    }
  }

  // 添加会话
  addSession(session: AgentSession): void {
    this.sessions.set(session.id, session)
    const state = this.states.get(session.agent)
    if (state) {
      this.states.set(session.agent, {
        ...state,
        status: 'working',
        currentTask: session.taskId,
        sessionCount: state.sessionCount + 1,
        lastActivity: new Date(),
      })
    }
  }

  // 更新会话
  updateSession(sessionId: string, updates: Partial<AgentSession>): void {
    const session = this.sessions.get(sessionId)
    if (session) {
      this.sessions.set(sessionId, { ...session, ...updates })
      
      // 如果会话完成或失败，更新智能体状态
      if (updates.status === 'completed' || updates.status === 'failed') {
        const state = this.states.get(session.agent)
        if (state) {
          // 检查是否还有其他运行中的会话
          const hasRunningSession = Array.from(this.sessions.values())
            .some(s => s.agent === session.agent && s.status === 'running')
          
          this.states.set(session.agent, {
            ...state,
            status: hasRunningSession ? 'working' : 'idle',
            currentTask: hasRunningSession ? state.currentTask : undefined,
          })
        }
      }
    }
  }

  // 获取活跃会话
  getActiveSessions(): AgentSession[] {
    return Array.from(this.sessions.values())
      .filter(s => s.status === 'running' || s.status === 'starting')
  }

  // 获取 Pop 的当前任务
  getPopTasks(): { active: number; completed: number; pending: number } {
    const sessions = Array.from(this.sessions.values())
    return {
      active: sessions.filter(s => s.status === 'running').length,
      completed: sessions.filter(s => s.status === 'completed').length,
      pending: sessions.filter(s => s.status === 'starting' || s.status === 'paused').length,
    }
  }
}

// 单例实例
export const agentStateStore = new AgentStateStore()

// API 辅助函数
export async function getAgentStates(): Promise<AgentRuntimeState[]> {
  return agentStateStore.getAllStates()
}

export async function getAgentState(type: AgentType): Promise<AgentRuntimeState | undefined> {
  return agentStateStore.getState(type)
}

export async function getActiveSessions(): Promise<AgentSession[]> {
  return agentStateStore.getActiveSessions()
}
