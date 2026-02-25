// ─────────────────────────────────────────────────────────────────
// Realtime Bus - 简单的发布/订阅系统
// ─────────────────────────────────────────────────────────────────

type EventHandler = (data: any) => void

interface RealtimeEvent {
  type: 'agents' | 'tasks' | 'ideas' | 'activity'
  data: any
  timestamp: Date
}

class RealtimeBus {
  private handlers: Map<string, Set<EventHandler>> = new Map()

  // 订阅事件
  subscribe(eventType: string, handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set())
    }
    this.handlers.get(eventType)!.add(handler)

    // 返回取消订阅函数
    return () => {
      this.handlers.get(eventType)?.delete(handler)
    }
  }

  // 发布事件
  publish(eventType: string, data: any): void {
    const event: RealtimeEvent = {
      type: eventType as any,
      data,
      timestamp: new Date(),
    }

    const handlers = this.handlers.get(eventType)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event)
        } catch (err) {
          console.error(`Error in event handler for ${eventType}:`, err)
        }
      })
    }
  }

  // 发布智能体更新
  publishAgentsUpdate(data: any): void {
    this.publish('agents', data)
  }

  // 发布任务更新
  publishTasksUpdate(data: any): void {
    this.publish('tasks', data)
  }

  // 发布想法更新
  publishIdeasUpdate(data: any): void {
    this.publish('ideas', data)
  }

  // 发布活动更新
  publishActivityUpdate(data: any): void {
    this.publish('activity', data)
  }
}

// 单例实例
export const realtimeBus = new RealtimeBus()
