'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, CheckCircle2, Play, AlertCircle, ArrowRight,
  Circle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimelineEvent {
  id: string
  time: Date
  agent: string
  agentName: string
  agentEmoji: string
  task: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  duration?: number // 秒
}

interface TaskTimelineProps {
  events: TimelineEvent[]
  title?: string
}

export function TaskTimeline({ events, title = '今日时间线' }: TaskTimelineProps) {
  // 按时间排序
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => b.time.getTime() - a.time.getTime())
  }, [events])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}秒`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}分${secs}秒`
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10', line: 'bg-green-500' }
      case 'running':
        return { icon: Play, color: 'text-blue-500', bg: 'bg-blue-500/10', line: 'bg-blue-500' }
      case 'failed':
        return { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10', line: 'bg-red-500' }
      default:
        return { icon: Circle, color: 'text-gray-400', bg: 'bg-gray-500/10', line: 'bg-gray-500' }
    }
  }

  if (events.length === 0) {
    return (
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-8">
            暂无任务记录
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-500" />
          {title}
          <Badge variant="outline" className="text-[10px] ml-auto">
            {events.length} 个事件
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* 时间线 */}
          <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-border" />
          
          {/* 事件列表 */}
          <div className="space-y-3">
            {sortedEvents.map((event, index) => {
              const config = getStatusConfig(event.status)
              const StatusIcon = config.icon
              
              return (
                <div 
                  key={event.id}
                  className="relative flex items-start gap-3 pl-1"
                >
                  {/* 状态节点 */}
                  <div className={cn(
                    "relative z-10 w-4 h-4 rounded-full flex items-center justify-center",
                    config.bg
                  )}>
                    <StatusIcon className={cn("h-2.5 w-2.5", config.color)} />
                  </div>
                  
                  {/* 连接线 */}
                  {index < sortedEvents.length - 1 && (
                    <div className={cn(
                      "absolute left-[7px] top-4 w-0.5 h-full",
                      config.line
                    )} style={{ opacity: 0.3 }} />
                  )}
                  
                  {/* 内容 */}
                  <div className="flex-1 min-w-0 pb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground font-mono">
                        {formatTime(event.time)}
                      </span>
                      <span className="text-lg">{event.agentEmoji}</span>
                      <span className="text-sm font-medium truncate">
                        {event.agentName}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={cn("text-[10px]", config.bg, config.color, "border-0")}
                      >
                        {event.status === 'completed' ? '完成' :
                         event.status === 'running' ? '运行中' :
                         event.status === 'failed' ? '失败' : '待处理'}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {event.task}
                    </div>
                    {event.duration && event.status === 'completed' && (
                      <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        耗时 {formatDuration(event.duration)}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 生成模拟时间线事件
export function generateMockTimelineEvents(count: number = 5): TimelineEvent[] {
  const agents = [
    { type: 'codex', name: 'Codex', emoji: '🤖' },
    { type: 'quill', name: 'Quill', emoji: '✍️' },
    { type: 'scout', name: 'Scout', emoji: '🔍' },
    { type: 'pixel', name: 'Pixel', emoji: '🎨' },
    { type: 'echo', name: 'Echo', emoji: '📢' },
  ]
  
  const tasks = [
    '优化首页加载速度',
    '编写技术博客',
    '分析用户行为数据',
    '设计新的 UI 组件',
    '发布社交媒体内容',
    '修复登录 Bug',
    '重构 API 模块',
    '添加单元测试',
  ]
  
  const statuses: TimelineEvent['status'][] = ['completed', 'running', 'failed', 'pending']
  
  const events: TimelineEvent[] = []
  const now = new Date()
  
  for (let i = 0; i < count; i++) {
    const agent = agents[Math.floor(Math.random() * agents.length)]
    const status = i === 0 ? 'running' : statuses[Math.floor(Math.random() * 3)] // 最新的是 running
    const time = new Date(now.getTime() - i * (15 + Math.random() * 30) * 60 * 1000) // 每15-45分钟一个事件
    
    events.push({
      id: `event-${i}`,
      time,
      agent: agent.type,
      agentName: agent.name,
      agentEmoji: agent.emoji,
      task: tasks[Math.floor(Math.random() * tasks.length)],
      status,
      duration: status === 'completed' ? Math.floor(Math.random() * 300) + 30 : undefined,
    })
  }
  
  return events
}
