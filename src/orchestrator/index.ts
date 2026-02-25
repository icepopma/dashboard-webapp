// ─────────────────────────────────────────────────────────────────
// Pop Orchestrator - Core orchestration engine
// ─────────────────────────────────────────────────────────────────

import type { Task, TaskType, AgentType, AgentSession, TaskResult, TaskContext, FailureAnalysis, RalphLoopState } from './types'
import { MemoryStore } from '../memory/store'
import { TaskManager } from '../tasks/manager'
import { AgentLauncher } from '../launcher/process'
import { QQChannelNotifier } from '../notify/qqChannel'
import { analyzeGoal } from './goalAnalyzer'
import { selectAgent } from './agentSelector'
import { buildPrompt } from './promptBuilder'
import { ralphLoop } from './ralphLoop'
import { scanGitHubIssues, scanSentryErrors, scanMeetingNotes } from './scanners'

// Agent configurations
const AGENT_CONFIGS: Record<AgentType, {
  name: string
  capabilities: TaskType[]
  successRate: number
}> = {
  pop: {
    name: 'Pop',
    capabilities: ['feature', 'bugfix', 'docs', 'refactor', 'test', 'design', 'analysis'],
    successRate: 0.92,
  },
  codex: {
    name: 'Codex',
    capabilities: ['feature', 'bugfix', 'refactor', 'test'],
    successRate: 0.90,
  },
  claude: {
    name: 'Claude Code',
    capabilities: ['feature', 'bugfix', 'docs'],
    successRate: 0.88,
  },
  quill: {
    name: 'Quill',
    capabilities: ['docs'],
    successRate: 0.85,
  },
  echo: {
    name: 'Echo',
    capabilities: [],
    successRate: 0.80,
  },
  scout: {
    name: 'Scout',
    capabilities: ['analysis'],
    successRate: 0.85,
  },
  pixel: {
    name: 'Pixel',
    capabilities: ['design'],
    successRate: 0.75,
  },
}

export class PopOrchestrator {
  private memory: MemoryStore
  private tasks: TaskManager
  private launcher: AgentLauncher
  private notifier: QQChannelNotifier
  private activeSessions: Map<string, AgentSession> = new Map()

  constructor(config?: {
    qqChannelId?: string
    qqBotToken?: string
  }) {
    this.memory = new MemoryStore()
    this.tasks = new TaskManager()
    this.launcher = new AgentLauncher()
    this.notifier = new QQChannelNotifier(
      config?.qqChannelId || process.env.QQ_CHANNEL_ID || '',
      config?.qqBotToken || process.env.QQ_BOT_TOKEN || ''
    )
  }

  /**
   * 接收用户目标并创建任务
   */
  async handleGoal(goal: string, options?: {
    priority?: Task['priority']
    type?: Task['type']
  }): Promise<Task> {
    console.log(`[Pop] 收到目标: ${goal}`)

    // 1. 分析目标
    const analysis = await analyzeGoal(goal)
    console.log(`[Pop] 分析结果:`, analysis)

    // 2. 获取相关上下文
    const context = await this.getRelevantContext(goal, analysis)
    console.log(`[Pop] 获取到 ${context.history?.length || 0} 条相关记忆`)

    // 3. 创建任务
    const task = await this.tasks.create({
      title: analysis.title,
      description: analysis.description,
      type: options?.type || analysis.type,
      priority: options?.priority || 'medium',
      goal,
      context,
      maxAttempts: 3,
    })

    // 4. 选择智能体
    const agent = selectAgent(analysis, AGENT_CONFIGS)
    task.agent = agent
    await this.tasks.update(task.id, { agent })

    console.log(`[Pop] 任务 ${task.id} 已创建，分配给 ${agent}`)

    // 5. 启动 Ralph Loop
    this.executeTask(task)

    return task
  }

  /**
   * 执行任务（使用 Ralph Loop）
   */
  private async executeTask(task: Task): Promise<void> {
    try {
      // 更新状态
      await this.tasks.update(task.id, { status: 'running' })

      // 执行 Ralph Loop
      const result = await ralphLoop({
        task,
        memory: this.memory,
        launcher: this.launcher,
        maxAttempts: task.maxAttempts,
        onAttempt: async (attempt, prompt, session) => {
          console.log(`[Pop] 任务 ${task.id} 第 ${attempt} 次尝试`)
          await this.tasks.update(task.id, { 
            sessionId: session.id,
            attempts: attempt,
          })
          this.activeSessions.set(session.id, session)
        },
        onSuccess: async (result) => {
          console.log(`[Pop] 任务 ${task.id} 成功!`)
          await this.tasks.update(task.id, { 
            status: 'completed',
            result,
          })
          
          // 成功模式已在 ralphLoop 内部记录
          
          // 通知用户
          await this.notifier.send({
            type: 'task_complete',
            title: `✅ 任务完成: ${task.title}`,
            message: result.prNumber 
              ? `PR #${result.prNumber} 已创建`
              : '任务已成功完成',
            data: { taskId: task.id, prNumber: result.prNumber },
            priority: 'medium',
          })
        },
        onFailure: async (error, analysis) => {
          console.log(`[Pop] 任务 ${task.id} 失败: ${error}`)
          await this.tasks.update(task.id, { 
            status: 'failed',
            failureAnalysis: analysis,
          })
          
          // 记录失败模式
          await this.memory.recordFailure(task, error, analysis)
          
          // 通知用户
          await this.notifier.send({
            type: 'task_failed',
            title: `❌ 任务失败: ${task.title}`,
            message: `原因: ${analysis.reason}\n建议: ${analysis.suggestion}`,
            data: { taskId: task.id, analysis },
            priority: 'high',
          })
        },
      })
    } catch (error) {
      console.error(`[Pop] 任务 ${task.id} 执行异常:`, error)
      await this.tasks.update(task.id, { status: 'failed' })
    }
  }

  /**
   * 获取相关上下文
   */
  private async getRelevantContext(goal: string, analysis: any): Promise<TaskContext> {
    // 查询相关记忆
    const memories = await this.memory.query({
      tags: [analysis.type, analysis.area],
      limit: 5,
      minRelevance: 0.5,
    })

    return {
      history: memories,
      requirements: analysis.requirements,
      constraints: analysis.constraints,
    }
  }

  /**
   * 获取任务状态
   */
  async getTask(taskId: string): Promise<Task | null> {
    return this.tasks.get(taskId)
  }

  /**
   * 获取所有任务
   */
  async listTasks(filter?: { status?: Task['status'] }): Promise<Task[]> {
    return this.tasks.list(filter)
  }

  /**
   * 向运行中的智能体发送指令
   */
  async sendCommand(sessionId: string, command: string): Promise<void> {
    const session = this.activeSessions.get(sessionId)
    if (!session) {
      throw new Error(`Session ${sessionId} not found`)
    }

    await this.launcher.sendCommand(session, command)
    console.log(`[Pop] 向 ${sessionId} 发送指令: ${command}`)
  }

  /**
   * 终止任务
   */
  async terminateTask(taskId: string): Promise<void> {
    const task = await this.tasks.get(taskId)
    if (!task || !task.sessionId) return

    const session = this.activeSessions.get(task.sessionId)
    if (session) {
      await this.launcher.terminate(session)
      this.activeSessions.delete(task.sessionId)
    }

    await this.tasks.update(taskId, { status: 'failed' })
    console.log(`[Pop] 任务 ${taskId} 已终止`)
  }

  /**
   * 主动扫描工作
   */
  async proactiveScan(): Promise<Task[]> {
    const tasks: Task[] = []

    // 扫描 GitHub Issues
    try {
      const githubTasks = await scanGitHubIssues({
        owner: process.env.GITHUB_OWNER || '',
        repo: process.env.GITHUB_REPO || '',
        token: process.env.GITHUB_TOKEN,
        labels: ['bug', 'enhancement'],  // 只扫描 bug 和 feature
        limit: 5,
      })
      tasks.push(...githubTasks)
      console.log(`[Pop] GitHub 扫描发现 ${githubTasks.length} 个 issues`)
    } catch (error) {
      console.error('[Pop] GitHub 扫描失败:', error)
    }

    // 扫描 Sentry 错误
    try {
      const sentryTasks = await scanSentryErrors({
        organization: process.env.SENTRY_ORG || '',
        project: process.env.SENTRY_PROJECT,
        token: process.env.SENTRY_TOKEN,
        environment: process.env.NODE_ENV === 'production' ? 'production' : undefined,
        minCount: 5,
        limit: 3,
      })
      tasks.push(...sentryTasks)
      console.log(`[Pop] Sentry 扫描发现 ${sentryTasks.length} 个错误`)
    } catch (error) {
      console.error('[Pop] Sentry 扫描失败:', error)
    }

    // 扫描会议记录
    try {
      const meetingTasks = await scanMeetingNotes({
        notesDir: process.env.MEETING_NOTES_DIR || './notes/meetings',
        daysBack: 7,
        limit: 5,
      })
      tasks.push(...meetingTasks)
      console.log(`[Pop] 会议记录扫描发现 ${meetingTasks.length} 个待办`)
    } catch (error) {
      console.error('[Pop] 会议记录扫描失败:', error)
    }

    return tasks
  }

  /**
   * 发送每日总结
   */
  async sendDailySummary(): Promise<void> {
    const todayTasks = await this.tasks.list({
      // 今天创建的任务
    })

    const completed = todayTasks.filter(t => t.status === 'completed')
    const pending = todayTasks.filter(t => t.status === 'pending')
    const failed = todayTasks.filter(t => t.status === 'failed')

    await this.notifier.send({
      type: 'daily_summary',
      title: '📊 每日总结',
      message: `
✅ 完成: ${completed.length} 个任务
⏳ 进行中: ${pending.length} 个任务
❌ 失败: ${failed.length} 个任务

${completed.map(t => `• ${t.title}`).join('\n')}
      `.trim(),
      priority: 'low',
    })
  }
}

// 导出单例
export const pop = new PopOrchestrator()
