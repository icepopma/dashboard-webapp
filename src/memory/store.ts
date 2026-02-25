// ─────────────────────────────────────────────────────────────────
// Memory Store - 记忆存储系统
// ─────────────────────────────────────────────────────────────────

import type { MemoryEntry, MemoryQuery, Task, TaskResult, FailureAnalysis, AgentType } from '../orchestrator/types'
import fs from 'fs/promises'
import path from 'path'

const MEMORY_DIR = process.env.MEMORY_DIR || './.clawdbot/memory'
const MEMORY_FILE = path.join(MEMORY_DIR, 'memory.json')

export class MemoryStore {
  private memory: MemoryEntry[] = []
  private loaded = false

  constructor() {
    this.ensureDir()
  }

  private async ensureDir(): Promise<void> {
    try {
      await fs.mkdir(MEMORY_DIR, { recursive: true })
    } catch (e) {
      // ignore
    }
  }

  private async load(): Promise<void> {
    if (this.loaded) return
    try {
      const data = await fs.readFile(MEMORY_FILE, 'utf-8')
      this.memory = JSON.parse(data)
      this.loaded = true
    } catch (e) {
      this.memory = []
      this.loaded = true
    }
  }

  private async save(): Promise<void> {
    await this.ensureDir()
    await fs.writeFile(MEMORY_FILE, JSON.stringify(this.memory, null, 2))
  }

  /**
   * 存储记忆
   */
  async store(key: string, value: any, metadata?: { type?: MemoryEntry['type']; agent?: AgentType; taskId?: string; relevance?: number }): Promise<void> {
    await this.load()
    
    const entry: MemoryEntry = {
      id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      key,
      value,
      type: metadata?.type || 'context',
      tags: [],
      metadata: {
        timestamp: new Date(),
        relevance: metadata?.relevance ?? 1.0,
        agent: metadata?.agent,
        taskId: metadata?.taskId,
      },
    }
    
    this.memory.push(entry)
    await this.save()
  }

  /**
   * 查询记忆
   */
  async query(params: MemoryQuery): Promise<MemoryEntry[]> {
    await this.load()
    
    let results = this.memory
    
    if (params.key) {
      results = results.filter(m => m.key.includes(params.key!))
    }
    
    if (params.type) {
      results = results.filter(m => m.type === params.type)
    }
    
    if (params.tags?.length) {
      results = results.filter(m => 
        params.tags!.some(tag => m.tags.includes(tag))
      )
    }
    
    if (params.agent) {
      results = results.filter(m => m.metadata.agent === params.agent)
    }
    
    if (params.taskId) {
      results = results.filter(m => m.metadata.taskId === params.taskId)
    }
    
    if (params.minRelevance) {
      results = results.filter(m => m.metadata.relevance >= params.minRelevance!)
    }
    
    // 按相关性排序
    results.sort((a, b) => b.metadata.relevance - a.metadata.relevance)
    
    if (params.limit) {
      results = results.slice(0, params.limit)
    }
    
    return results
  }

  /**
   * 记录成功模式
   */
  async recordSuccess(task: Task, prompt: string, result: TaskResult): Promise<void> {
    await this.store(`success:${task.type}:${task.id}`, {
      task: { id: task.id, type: task.type, goal: task.goal },
      prompt,
      result: { success: true, prNumber: result.prNumber },
      pattern: this.extractPattern(prompt, result),
    }, {
      type: 'success',
      agent: task.agent,
      taskId: task.id,
    })
  }

  /**
   * 记录失败模式
   */
  async recordFailure(task: Task, error: Error, analysis: FailureAnalysis): Promise<void> {
    await this.store(`failure:${task.type}:${task.id}`, {
      task: { id: task.id, type: task.type, goal: task.goal },
      error: error.message,
      analysis,
      lesson: analysis.suggestion,
    }, {
      type: 'failure',
      agent: task.agent,
      taskId: task.id,
    })
  }

  /**
   * 提取成功模式
   */
  private extractPattern(prompt: string, result: TaskResult): string {
    // 简化的模式提取
    const lines = prompt.split('\n').slice(0, 5).join('\n')
    return `Pattern: ${lines.substring(0, 200)}...`
  }

  /**
   * 获取相关上下文
   */
  async getRelevantContext(task: Task): Promise<MemoryEntry[]> {
    return this.query({
      tags: [task.type],
      minRelevance: 0.5,
      limit: 5,
    })
  }
}
