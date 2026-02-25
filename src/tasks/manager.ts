// ─────────────────────────────────────────────────────────────────
// Task Manager - 任务管理系统
// ─────────────────────────────────────────────────────────────────

import type { Task, TaskStatus, TaskEvent } from '../orchestrator/types'
import fs from 'fs/promises'
import path from 'path'

const TASKS_DIR = process.env.TASKS_DIR || './.clawdbot/tasks'
const TASKS_FILE = path.join(TASKS_DIR, 'tasks.json')

export class TaskManager {
  private tasks: Map<string, Task> = new Map()
  private loaded = false

  constructor() {
    this.ensureDir()
  }

  private async ensureDir(): Promise<void> {
    try {
      await fs.mkdir(TASKS_DIR, { recursive: true })
    } catch (e) {
      // ignore
    }
  }

  private async load(): Promise<void> {
    if (this.loaded) return
    try {
      const data = await fs.readFile(TASKS_FILE, 'utf-8')
      const tasks = JSON.parse(data)
      this.tasks = new Map(tasks.map((t: Task) => [t.id, t]))
      this.loaded = true
    } catch (e) {
      this.tasks = new Map()
      this.loaded = true
    }
  }

  private async save(): Promise<void> {
    await this.ensureDir()
    const tasks = Array.from(this.tasks.values())
    await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2))
  }

  /**
   * 创建任务
   */
  async create(input: Partial<Task>): Promise<Task> {
    await this.load()
    
    const task: Task = {
      id: input.id || `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: input.title || 'Untitled Task',
      description: input.description || '',
      type: input.type || 'feature',
      priority: input.priority || 'medium',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      goal: input.goal || '',
      context: input.context || {},
      attempts: 0,
      maxAttempts: input.maxAttempts || 3,
    }
    
    this.tasks.set(task.id, task)
    await this.save()
    
    return task
  }

  /**
   * 获取任务
   */
  async get(id: string): Promise<Task | null> {
    await this.load()
    return this.tasks.get(id) || null
  }

  /**
   * 列出任务
   */
  async list(filter?: { status?: TaskStatus }): Promise<Task[]> {
    await this.load()
    let tasks = Array.from(this.tasks.values())
    
    if (filter?.status) {
      tasks = tasks.filter(t => t.status === filter.status)
    }
    
    return tasks.sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    )
  }

  /**
   * 更新任务
   */
  async update(id: string, updates: Partial<Task>): Promise<Task> {
    await this.load()
    
    const task = this.tasks.get(id)
    if (!task) {
      throw new Error(`Task ${id} not found`)
    }
    
    const updated = {
      ...task,
      ...updates,
      updatedAt: new Date(),
    }
    
    this.tasks.set(id, updated)
    await this.save()
    
    return updated
  }

  /**
   * 删除任务
   */
  async delete(id: string): Promise<void> {
    await this.load()
    this.tasks.delete(id)
    await this.save()
  }

  /**
   * 任务状态转换
   */
  async transition(id: string, event: TaskEvent): Promise<Task> {
    const task = await this.get(id)
    if (!task) {
      throw new Error(`Task ${id} not found`)
    }

    const transitions: Partial<Record<TaskStatus, Partial<Record<TaskEvent, TaskStatus>>>> = {
      pending: { start: 'analyzing', cancel: 'failed' },
      analyzing: { complete: 'running', fail: 'failed', cancel: 'failed' },
      running: { complete: 'reviewing', fail: 'failed', block: 'blocked', cancel: 'failed' },
      blocked: { unblock: 'running', cancel: 'failed' },
      reviewing: { approve: 'completed', reject: 'failed' },
      completed: {},
      failed: { retry: 'pending' },
    }

    const newStatus = transitions[task.status]?.[event]
    if (!newStatus) {
      throw new Error(`Invalid transition: ${task.status} -> ${event}`)
    }

    return this.update(id, { status: newStatus })
  }
}
