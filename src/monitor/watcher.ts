// ─────────────────────────────────────────────────────────────────
// Agent Watcher - 智能体监控器
// ─────────────────────────────────────────────────────────────────

import type { AgentSession, AgentStatus } from '../orchestrator/types'
import { spawn } from 'child_process'

export class AgentWatcher {
  private checkInterval: NodeJS.Timeout | null = null
  private sessions: Map<string, AgentSession> = new Map()

  /**
   * 开始监控
   */
  startMonitoring(
    session: AgentSession,
    callbacks: {
      onProgress?: (status: AgentStatus) => void
      onComplete?: (session: AgentSession) => void
      onFailure?: (session: AgentSession, error: string) => void
    },
    intervalMs: number = 60000 // 默认 1 分钟检查一次
  ): void {
    this.sessions.set(session.id, session)

    this.checkInterval = setInterval(async () => {
      const status = await this.checkStatus(session.id)
      
      if (status.status === 'completed') {
        callbacks.onComplete?.(session)
        this.stopMonitoring(session.id)
      } else if (status.status === 'failed') {
        callbacks.onFailure?.(session, status.lastOutput || 'Unknown error')
        this.stopMonitoring(session.id)
      } else {
        callbacks.onProgress?.(status)
      }
    }, intervalMs)
  }

  /**
   * 停止监控
   */
  stopMonitoring(sessionId: string): void {
    this.sessions.delete(sessionId)
    
    if (this.sessions.size === 0 && this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }

  /**
   * 检查状态
   */
  async checkStatus(sessionId: string): Promise<AgentStatus> {
    const session = this.sessions.get(sessionId)
    
    if (!session) {
      return {
        sessionId,
        status: 'failed',
        lastUpdate: new Date(),
      }
    }

    // 检查 tmux 会话状态
    if (session.tmuxSession) {
      const tmuxStatus = await this.checkTmuxSession(session.tmuxSession)
      if (!tmuxStatus) {
        return {
          sessionId,
          status: 'completed',
          lastUpdate: new Date(),
        }
      }
    }

    // 检查进程状态
    if (session.pid) {
      const procStatus = await this.checkProcess(session.pid)
      if (!procStatus) {
        return {
          sessionId,
          status: 'completed',
          lastUpdate: new Date(),
        }
      }
    }

    // 获取最新输出
    const lastOutput = await this.getLastOutput(session)

    return {
      sessionId,
      status: session.status,
      lastOutput,
      lastUpdate: new Date(),
    }
  }

  /**
   * 检查所有活跃会话
   */
  async checkAllSessions(): Promise<AgentStatus[]> {
    const statuses: AgentStatus[] = []
    
    for (const sessionId of this.sessions.keys()) {
      statuses.push(await this.checkStatus(sessionId))
    }
    
    return statuses
  }

  /**
   * 检查 tmux 会话
   */
  private async checkTmuxSession(sessionName: string): Promise<boolean> {
    return new Promise((resolve) => {
      const proc = spawn('tmux', ['has-session', '-t', sessionName])
      
      proc.on('close', (code) => {
        resolve(code === 0)
      })
      
      proc.on('error', () => {
        resolve(false)
      })
    })
  }

  /**
   * 检查进程
   */
  private async checkProcess(pid: number): Promise<boolean> {
    try {
      process.kill(pid, 0)
      return true
    } catch {
      return false
    }
  }

  /**
   * 获取最后输出
   */
  private async getLastOutput(session: AgentSession): Promise<string | undefined> {
    if (!session.tmuxSession) return undefined

    return new Promise((resolve) => {
      let output = ''
      const proc = spawn('tmux', ['capture-pane', '-t', session.tmuxSession!, '-p'])
      
      proc.stdout.on('data', (data) => {
        output += data.toString()
      })
      
      proc.on('close', () => {
        resolve(output.slice(-500))
      })
      
      proc.on('error', () => {
        resolve(undefined)
      })
    })
  }

  /**
   * 获取活跃会话数
   */
  getActiveCount(): number {
    return this.sessions.size
  }

  /**
   * 获取所有会话
   */
  getAllSessions(): AgentSession[] {
    return Array.from(this.sessions.values())
  }
}
