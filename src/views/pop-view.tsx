'use client'

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Bot, Activity, Clock, CheckCircle2, AlertCircle, Zap, 
  TrendingUp, Users, MessageSquare, Play, Pause, RotateCcw, ListTodo
} from 'lucide-react'
import type { AgentType, Task } from '@/orchestrator/types'
import { CreateTaskDialog } from '@/components/create-task-dialog'

interface AgentConfig {
  name: string
  role: string
  emoji: string
  capabilities: string[]
  model: string
}

interface AgentState {
  type: AgentType
  status: 'working' | 'idle' | 'offline' | 'error'
  currentTask?: string
  lastActivity?: string
  sessionCount: number
  successRate: number
  config?: AgentConfig
}

interface PopTasks {
  active: number
  completed: number
  pending: number
}

interface AgentData {
  agents: AgentState[]
  activeSessions: any[]
  popTasks: PopTasks
  timestamp: string
}

export function PopView() {
  const { t } = useI18n()
  const [data, setData] = useState<AgentData | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 获取智能体状态
  const fetchAgentStates = async () => {
    try {
      const response = await fetch('/api/agents')
      if (!response.ok) throw new Error('Failed to fetch')
      const result = await response.json()
      // API returns { success: true, data: { agents: [...] } }
      setData(result.data || result)
      setError(null)
    } catch (err) {
      setError('无法获取智能体状态')
    } finally {
      setLoading(false)
    }
  }

  // 获取任务列表
  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
      if (!response.ok) throw new Error('Failed to fetch tasks')
      const result = await response.json()
      setTasks(result.tasks || result.data?.tasks || [])
    } catch (err) {
      console.error('Failed to fetch tasks:', err)
    }
  }

  useEffect(() => {
    fetchAgentStates()
    fetchTasks()
    // 每 30 秒刷新一次
    const interval = setInterval(() => {
      fetchAgentStates()
      fetchTasks()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working': return 'bg-green-500'
      case 'idle': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'working': return <Badge className="bg-green-500/20 text-green-500">工作中</Badge>
      case 'idle': return <Badge className="bg-yellow-500/20 text-yellow-500">空闲</Badge>
      case 'offline': return <Badge className="bg-gray-500/20 text-gray-500">离线</Badge>
      case 'error': return <Badge className="bg-red-500/20 text-red-500">错误</Badge>
      default: return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={fetchAgentStates} variant="outline">
          <RotateCcw className="h-4 w-4 mr-2" />
          重试
        </Button>
      </div>
    )
  }

  const agents = Array.isArray(data?.agents) ? data.agents : []
  const workingAgents = agents.filter((a: any) => a?.status === 'working').length
  const totalAgents = agents.length
  const popAgent = agents.find((a: any) => a?.type === 'pop')

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 px-4 sm:px-6 pt-4 sm:pt-6 flex-shrink-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
            🫧 Pop
            <Badge className="bg-green-500/20 text-green-500 text-xs">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse" />
              运行中
            </Badge>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            智能体集群编排器 · 指挥中心
          </p>
        </div>
        <div className="flex gap-2">
          <CreateTaskDialog onTaskCreated={() => {
            fetchTasks()
            fetchAgentStates()
          }} />
          <Button variant="outline" size="sm" onClick={() => {
            fetchAgentStates()
            fetchTasks()
          }}>
            <RotateCcw className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">刷新</span>
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="px-4 sm:px-6 mb-4 flex-shrink-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-green-500/10">
                  <Activity className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <div className="text-xl font-semibold">{workingAgents}/{totalAgents}</div>
                  <div className="text-[10px] text-muted-foreground">工作中</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10">
                  <Play className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <div className="text-xl font-semibold">{data?.popTasks.active || 0}</div>
                  <div className="text-[10px] text-muted-foreground">活跃任务</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/10">
                  <CheckCircle2 className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                  <div className="text-xl font-semibold">{data?.popTasks.completed || 0}</div>
                  <div className="text-[10px] text-muted-foreground">已完成</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-orange-500/10">
                  <Clock className="h-4 w-4 text-orange-500" />
                </div>
                <div>
                  <div className="text-xl font-semibold">{data?.popTasks.pending || 0}</div>
                  <div className="text-[10px] text-muted-foreground">待处理</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 sm:px-6 pb-6 overflow-hidden flex flex-col lg:flex-row gap-4">
        {/* Left - Agent Grid */}
        <div className="flex-1 overflow-auto min-w-0">
          <Card className="border-border/60 shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                智能体集群
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {agents.map((agent, index) => (
                  <div 
                    key={agent.type}
                    className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 hover-lift cursor-pointer border border-border/50 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                          {agent.config?.emoji || '🤖'}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(agent.status)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{agent.config?.name || agent.type}</span>
                          {getStatusBadge(agent.status)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {agent.config?.role}
                        </div>
                        {agent.currentTask && (
                          <div className="text-xs text-muted-foreground mt-2 truncate">
                            📌 {agent.currentTask}
                          </div>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                          <span>会话: {agent.sessionCount}</span>
                          <span>成功率: {(agent.successRate * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right - Activity Log & Tasks */}
        <div className="w-80 flex-shrink-0 flex flex-col gap-4">
          {/* Active Sessions */}
          <Card className="border-border/60 shadow-sm flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-purple-500" />
                活动日志
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-auto h-[calc(100%-60px)]">
              <div className="space-y-2">
                {data?.activeSessions.map((session, idx) => (
                  <div key={session.id || idx} className="p-2.5 rounded-lg bg-muted/30 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="font-medium">{session.agent}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      任务: {session.taskId}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      开始: {new Date(session.startTime).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                {(!data?.activeSessions || data.activeSessions.length === 0) && (
                  <div className="text-sm text-muted-foreground text-center py-8">
                    暂无活跃会话
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Tasks */}
          <Card className="border-border/60 shadow-sm flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <ListTodo className="h-4 w-4 text-orange-500" />
                最近任务
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-auto h-[calc(100%-60px)]">
              <div className="space-y-2">
                {tasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="p-2.5 rounded-lg bg-muted/30 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{task.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                            task.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                            task.status === 'running' ? 'bg-blue-500/20 text-blue-500' :
                            task.status === 'failed' ? 'bg-red-500/20 text-red-500' :
                            'bg-gray-500/20 text-gray-500'
                          }`}>
                            {task.status === 'completed' ? '✓ 完成' :
                             task.status === 'running' ? '▶ 运行中' :
                             task.status === 'failed' ? '✗ 失败' : '○ 待处理'}
                          </span>
                          {task.agent && <span>→ {task.agent}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-8">
                    暂无任务
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer - Last Update */}
      <div className="px-6 pb-4 flex-shrink-0">
        <div className="text-xs text-muted-foreground text-center">
          最后更新: {data?.timestamp ? new Date(data.timestamp).toLocaleString() : '-'}
        </div>
      </div>
    </div>
  )
}
