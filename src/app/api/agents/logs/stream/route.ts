// ─────────────────────────────────────────────────────────────────
// Agent Log Stream API - 智能体实时日志流
// ─────────────────────────────────────────────────────────────────

import { NextRequest } from 'next/server'
import type { AgentType } from '@/orchestrator/types'

export interface LogEntry {
  id: string
  timestamp: Date
  agent: AgentType
  type: 'info' | 'success' | 'error' | 'warning' | 'command' | 'output'
  message: string
  metadata?: Record<string, any>
}

// 内存中的日志存储（生产环境应使用数据库或消息队列）
const logBuffers: Map<AgentType, LogEntry[]> = new Map()
const subscribers: Set<(log: LogEntry) => void> = new Set()

// 初始化日志缓冲区
const agentTypes: AgentType[] = ['pop', 'codex', 'claude', 'quill', 'echo', 'scout', 'pixel']
agentTypes.forEach((type) => {
  logBuffers.set(type, [])
})

// 添加日志
export function addLog(log: LogEntry) {
  const buffer = logBuffers.get(log.agent)
  if (buffer) {
    buffer.push(log)
    // 保留最近 500 条
    if (buffer.length > 500) {
      buffer.shift()
    }
  }
  // 通知所有订阅者
  subscribers.forEach((callback) => callback(log))
}

// 获取日志
export function getLogs(agent?: AgentType | 'all', limit = 100): LogEntry[] {
  if (agent === 'all') {
    // 合并所有智能体的日志并按时间排序
    const allLogs = agentTypes.flatMap((type) => logBuffers.get(type) || [])
    return allLogs
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .slice(-limit)
  }
  
  const buffer = logBuffers.get(agent as AgentType)
  return buffer ? buffer.slice(-limit) : []
}

// SSE 流式端点
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const agent = (searchParams.get('agent') || 'all') as AgentType | 'all'

  // 创建 TransformStream 用于 SSE
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()
  const encoder = new TextEncoder()

  // 订阅日志更新
  const callback = async (log: LogEntry) => {
    // 过滤智能体
    if (agent !== 'all' && log.agent !== agent) {
      return
    }

    try {
      await writer.write(
        encoder.encode(`data: ${JSON.stringify(log)}\n\n`)
      )
    } catch (error) {
      // 写入失败，可能客户端已断开
      subscribers.delete(callback)
    }
  }

  subscribers.add(callback)

  // 发送初始日志
  const initialLogs = getLogs(agent, 50)
  for (const log of initialLogs) {
    await writer.write(
      encoder.encode(`data: ${JSON.stringify(log)}\n\n`)
    )
  }

  // 保持连接打开
  const keepAlive = setInterval(async () => {
    try {
      await writer.write(encoder.encode(': keepalive\n\n'))
    } catch (error) {
      clearInterval(keepAlive)
      subscribers.delete(callback)
    }
  }, 15000)

  // 清理函数
  const cleanup = () => {
    clearInterval(keepAlive)
    subscribers.delete(callback)
    writer.close()
  }

  // 返回 SSE 响应
  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

// 模拟日志生成（开发环境）
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    const agents: AgentType[] = ['pop', 'codex', 'claude', 'quill', 'echo', 'scout', 'pixel']
    const types: LogEntry['type'][] = ['info', 'success', 'error', 'warning', 'command', 'output']
    const messages = [
      '正在分析任务...',
      '文件读取完成',
      '开始执行代码重构',
      '检测到依赖更新',
      '任务执行成功',
      '等待用户输入',
      '正在连接数据库',
      '缓存已清理',
    ]

    const randomAgent = agents[Math.floor(Math.random() * agents.length)]
    const randomType = types[Math.floor(Math.random() * types.length)]
    const randomMessage = messages[Math.floor(Math.random() * messages.length)]

    addLog({
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      agent: randomAgent,
      type: randomType,
      message: randomMessage,
      metadata: Math.random() > 0.7 ? { duration: Math.floor(Math.random() * 1000) } : undefined,
    })
  }, 2000) // 每 2 秒生成一条模拟日志
}
