// ─────────────────────────────────────────────────────────────────
// Agent Launcher - 智能体启动器
// ─────────────────────────────────────────────────────────────────

import type { AgentType, AgentSession } from '../orchestrator/types'
import { spawn, ChildProcess } from 'child_process'
import path from 'path'
import fs from 'fs/promises'

const WORKTREES_DIR = process.env.WORKTREES_DIR || './.clawdbot/worktrees'
const LOGS_DIR = process.env.LOGS_DIR || './.clawdbot/logs'

interface LaunchOptions {
  agent: AgentType
  taskId: string
  prompt: string
  worktree?: boolean
  tmux?: boolean
}

export class AgentLauncher {
  private sessions: Map<string, AgentSession> = new Map()
  private processes: Map<string, ChildProcess> = new Map()

  constructor() {
    this.ensureDirs()
  }

  private async ensureDirs(): Promise<void> {
    await fs.mkdir(WORKTREES_DIR, { recursive: true })
    await fs.mkdir(LOGS_DIR, { recursive: true })
  }

  /**
   * 启动智能体
   */
  async launch(options: LaunchOptions): Promise<AgentSession> {
    const { agent, taskId, prompt, worktree, tmux } = options
    
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const branchName = `${agent}/${taskId}`
    const worktreePath = path.join(WORKTREES_DIR, branchName)
    
    // 创建 worktree
    if (worktree) {
      await this.createWorktree(branchName, worktreePath)
    }

    // 创建日志文件
    const logFile = path.join(LOGS_DIR, `${sessionId}.log`)
    const logHandle = await fs.open(logFile, 'w')

    const session: AgentSession = {
      id: sessionId,
      agent,
      taskId,
      status: 'starting',
      worktree: worktree ? worktreePath : undefined,
      tmuxSession: tmux ? sessionId : undefined,
      branch: branchName,
      startTime: new Date(),
    }

    // 获取智能体配置
    const config = this.getAgentConfig(agent)
    
    // 构建命令
    const fullPrompt = this.buildFullPrompt(prompt, taskId)
    
    // 启动进程
    if (tmux) {
      await this.launchInTmux(session, config, fullPrompt, logFile)
    } else {
      await this.launchDirect(session, config, fullPrompt, logHandle.fd)
    }

    this.sessions.set(sessionId, session)
    
    return session
  }

  /**
   * 直接启动进程
   */
  private async launchDirect(
    session: AgentSession,
    config: { command: string; args: string[] },
    prompt: string,
    logFd: number
  ): Promise<void> {
    const proc = spawn(config.command, [...config.args, prompt], {
      cwd: session.worktree || process.cwd(),
      stdio: ['ignore', logFd, logFd],
      detached: true,
    })

    proc.on('spawn', () => {
      session.status = 'running'
      session.pid = proc.pid
      this.sessions.set(session.id, session)
    })

    proc.on('close', (code) => {
      session.status = code === 0 ? 'completed' : 'failed'
      session.endTime = new Date()
      this.sessions.set(session.id, session)
      this.processes.delete(session.id)
    })

    this.processes.set(session.id, proc)
  }

  /**
   * 在 tmux 中启动
   */
  private async launchInTmux(
    session: AgentSession,
    config: { command: string; args: string[] },
    prompt: string,
    logFile: string
  ): Promise<void> {
    const tmuxCmd = [
      'tmux', 'new-session', '-d',
      '-s', session.tmuxSession!,
      '-c', session.worktree || process.cwd(),
      `${config.command} ${config.args.join(' ')} "${prompt.replace(/"/g, '\\"')}" 2>&1 | tee ${logFile}`,
    ]

    const proc = spawn(tmuxCmd[0], tmuxCmd.slice(1), {
      shell: true,
    })

    await new Promise((resolve) => {
      proc.on('close', () => {
        session.status = 'running'
        this.sessions.set(session.id, session)
        resolve(undefined)
      })
    })
  }

  /**
   * 发送命令到运行中的智能体
   */
  async sendCommand(session: AgentSession, command: string): Promise<void> {
    if (session.tmuxSession) {
      spawn('tmux', ['send-keys', '-t', session.tmuxSession, command, 'Enter'])
    }
  }

  /**
   * 等待完成
   */
  async waitForCompletion(
    session: AgentSession,
    options?: { timeout?: number; onProgress?: (output: string) => void }
  ): Promise<{ success: boolean; output?: string; error?: string; prNumber?: number }> {
    const timeout = options?.timeout || 30 * 60 * 1000
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      const current = this.sessions.get(session.id)
      
      if (current?.status === 'completed') {
        // 检查是否创建了 PR
        const prNumber = await this.checkForPR(session)
        return { success: true, prNumber }
      }
      
      if (current?.status === 'failed') {
        return { success: false, error: 'Agent execution failed' }
      }

      // 读取日志进度
      if (options?.onProgress) {
        const logContent = await this.readLog(session.id)
        if (logContent) {
          options.onProgress(logContent.slice(-500))
        }
      }

      await new Promise(r => setTimeout(r, 5000))
    }

    return { success: false, error: 'Timeout' }
  }

  /**
   * 终止会话
   */
  async terminate(session: AgentSession): Promise<void> {
    if (session.tmuxSession) {
      spawn('tmux', ['kill-session', '-t', session.tmuxSession])
    }
    
    const proc = this.processes.get(session.id)
    if (proc) {
      proc.kill('SIGTERM')
    }

    session.status = 'failed'
    session.endTime = new Date()
    this.sessions.set(session.id, session)
  }

  /**
   * 创建 worktree
   */
  private async createWorktree(branchName: string, worktreePath: string): Promise<void> {
    await spawn('git', ['worktree', 'add', worktreePath, '-b', branchName, 'origin/main'])
  }

  /**
   * 检查是否创建了 PR
   */
  private async checkForPR(session: AgentSession): Promise<number | undefined> {
    try {
      const result = await new Promise<string>((resolve, reject) => {
        let output = ''
        const proc = spawn('gh', ['pr', 'list', '--head', session.branch!, '--json', 'number'])
        proc.stdout.on('data', (d) => output += d)
        proc.on('close', () => resolve(output))
        proc.on('error', reject)
      })
      
      const prs = JSON.parse(result)
      return prs[0]?.number
    } catch {
      return undefined
    }
  }

  /**
   * 读取日志
   */
  private async readLog(sessionId: string): Promise<string> {
    try {
      const logFile = path.join(LOGS_DIR, `${sessionId}.log`)
      return await fs.readFile(logFile, 'utf-8')
    } catch {
      return ''
    }
  }

  /**
   * 获取智能体配置
   */
  private getAgentConfig(agent: AgentType): { command: string; args: string[] } {
    const configs: Record<AgentType, { command: string; args: string[] }> = {
      pop: {
        // Pop 是编排器本身，不需要外部命令
        command: 'openclaw',
        args: ['agent', 'run'],
      },
      codex: {
        command: 'codex',
        args: ['--model', 'gpt-5.3-codex', '-c', 'model_reasoning_effort=high', '--dangerously-bypass-approvals-and-sandbox', '-p'],
      },
      claude: {
        command: 'claude',
        args: ['--model', 'claude-opus-4.5', '--dangerously-skip-permissions', '-p'],
      },
      quill: {
        command: 'claude',
        args: ['--model', 'claude-sonnet-4', '--dangerously-skip-permissions', '-p'],
      },
      echo: {
        command: 'claude',
        args: ['--model', 'claude-sonnet-4', '--dangerously-skip-permissions', '-p'],
      },
      scout: {
        command: 'codex',
        args: ['--model', 'gpt-5.3-codex', '-c', 'model_reasoning_effort=medium', '-p'],
      },
      pixel: {
        command: 'claude',
        args: ['--model', 'claude-sonnet-4', '--dangerously-skip-permissions', '-p'],
      },
    }
    
    return configs[agent]
  }

  /**
   * 构建完整提示词
   */
  private buildFullPrompt(prompt: string, taskId: string): string {
    return `${prompt}

---
Task ID: ${taskId}
When complete, create a PR with a clear description.
Include screenshots if UI changes are made.`
  }
}
