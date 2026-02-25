// ─────────────────────────────────────────────────────────────────
// Tasks API - 任务管理 API
// ─────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { agentStateStore } from '@/lib/agent-state'
import type { TaskType, AgentType, Task } from '@/orchestrator/types'

// 简化的任务存储（生产环境应该用数据库）
const tasksStore = new Map<string, Task>()

// 任务计数器
let taskCounter = 0

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    let tasks = Array.from(tasksStore.values())
    
    if (status) {
      tasks = tasks.filter(t => t.status === status)
    }
    
    return NextResponse.json({
      tasks,
      total: tasks.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to get tasks:', error)
    return NextResponse.json(
      { error: 'Failed to get tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, type, priority, goal } = body as {
      title: string
      description?: string
      type?: TaskType
      priority?: 'low' | 'medium' | 'high' | 'critical'
      goal?: string
    }
    
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }
    
    // 创建任务
    taskCounter++
    const taskId = `task-${Date.now()}-${taskCounter}`
    
    const task: Task = {
      id: taskId,
      title,
      description: description || '',
      type: type || 'feature',
      priority: priority || 'medium',
      status: 'pending',
      goal: goal || title,
      context: {
        requirements: [],
        constraints: [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      maxAttempts: 3,
      attempts: 0,
    }
    
    tasksStore.set(taskId, task)
    
    // 选择智能体（简化版逻辑）
    const agent = selectAgentForTask(task)
    task.agent = agent
    tasksStore.set(taskId, { ...task, updatedAt: new Date() })
    
    // 更新智能体状态
    agentStateStore.updateState(agent, {
      status: 'working',
      currentTask: taskId,
    })
    
    // 创建会话（模拟）
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    agentStateStore.addSession({
      id: sessionId,
      agent,
      taskId,
      status: 'starting',
      startTime: new Date(),
      branch: `${agent}/${taskId}`,
    })
    
    // 模拟任务执行（实际应该调用 PopOrchestrator.handleGoal）
    simulateTaskExecution(taskId, sessionId, agent)
    
    return NextResponse.json({
      success: true,
      task,
      sessionId,
      message: `任务已创建并分配给 ${agent}`,
    })
  } catch (error) {
    console.error('Failed to create task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}

// 简单的智能体选择逻辑
function selectAgentForTask(task: Task): AgentType {
  const typeAgentMap: Record<TaskType, AgentType> = {
    feature: 'codex',
    bugfix: 'claude',
    docs: 'quill',
    refactor: 'codex',
    test: 'codex',
    design: 'pixel',
    analysis: 'scout',
  }
  
  return typeAgentMap[task.type] || 'codex'
}

// 模拟任务执行（实际应该连接到 PopOrchestrator）
async function simulateTaskExecution(taskId: string, sessionId: string, agent: AgentType): Promise<void> {
  // 更新会话状态为运行中
  setTimeout(() => {
    agentStateStore.updateSession(sessionId, { status: 'running' })
    tasksStore.set(taskId, { 
      ...tasksStore.get(taskId)!, 
      status: 'running',
      sessionId,
      updatedAt: new Date()
    })
  }, 1000)
  
  // 模拟完成（随机 5-15 秒）
  const duration = 5000 + Math.random() * 10000
  setTimeout(() => {
    const success = Math.random() > 0.2 // 80% 成功率
    
    if (success) {
      agentStateStore.updateSession(sessionId, { 
        status: 'completed',
        endTime: new Date()
      })
      tasksStore.set(taskId, { 
        ...tasksStore.get(taskId)!, 
        status: 'completed',
        updatedAt: new Date(),
        result: {
          success: true,
          prNumber: Math.floor(Math.random() * 1000),
        }
      })
      
      // 智能体变为空闲
      agentStateStore.updateState(agent, {
        status: 'idle',
        currentTask: undefined,
      })
    } else {
      agentStateStore.updateSession(sessionId, { 
        status: 'failed',
        endTime: new Date()
      })
      tasksStore.set(taskId, { 
        ...tasksStore.get(taskId)!, 
        status: 'failed',
        updatedAt: new Date(),
      })
      
      // 智能体变为空闲
      agentStateStore.updateState(agent, {
        status: 'idle',
        currentTask: undefined,
      })
    }
  }, duration)
}
