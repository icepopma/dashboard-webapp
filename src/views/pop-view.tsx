'use client'

import { useEffect, useState, useCallback } from 'react'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Bot, Activity, Clock, CheckCircle2, AlertCircle, Zap, 
  TrendingUp, Users, MessageSquare, Play, Pause, RotateCcw, ListTodo,
  ArrowDown, Sparkles, Radio, Eye
} from 'lucide-react'
import type { AgentType, Task } from '@/orchestrator/types'
import { CreateTaskDialog } from '@/components/create-task-dialog'
import { AgentDetailSheet } from '@/components/agent-detail-sheet'
import { TaskDispatchInput } from '@/components/task-dispatch-input'
import { TaskResultDialog, generateMockTaskResult } from '@/components/task-result-dialog'
import { toast } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'

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

// 调度事件类型
interface DispatchEvent {
  id: string
  timestamp: Date
  fromAgent: string
  toAgent: string
  task: string
  status: 'dispatching' | 'running' | 'completed'
}

// 任务结果类型
interface TaskResultData {
  id: string
  title: string
  agent: string
  agentName: string
  agentEmoji: string
  status: 'completed' | 'failed'
  startedAt: string
  completedAt: string
  duration: number
  output: {
    type: 'text' | 'markdown' | 'code' | 'file'
    content: string
    language?: string
    files?: { name: string; url: string; size: string }[]
  }
  logs: { time: string; message: string; type: 'info' | 'success' | 'error' }[]
}

export function PopView() {
  const { t } = useI18n()
  const [data, setData] = useState<AgentData | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dispatchEvents, setDispatchEvents] = useState<DispatchEvent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<AgentState | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  
  // 任务结果相关状态
  const [taskResults, setTaskResults] = useState<Map<string, TaskResultData>>(new Map())
  const [selectedTaskResult, setSelectedTaskResult] = useState<TaskResultData | null>(null)
  const [resultDialogOpen, setResultDialogOpen] = useState(false)
  const [pendingCompletions, setPendingCompletions] = useState<Set<string>>(new Set())

  // 获取智能体状态
  const fetchAgentStates = async () => {
    try {
      const response = await fetch('/api/agents')
      if (!response.ok) throw new Error('Failed to fetch')
      const result = await response.json()
      setData(result.data || result)
      setError(null)
      
      // 模拟生成调度事件（后续替换为真实数据）
      generateDispatchEvents(result.data?.agents || result.agents || [])
    } catch (err) {
      setError('无法获取智能体状态')
    } finally {
      setLoading(false)
    }
  }

  // 生成调度事件
  const generateDispatchEvents = (agents: AgentState[]) => {
    const workingAgents = agents.filter((a: AgentState) => a.status === 'working' && a.type !== 'pop')
    const events: DispatchEvent[] = workingAgents.map((agent: AgentState, idx: number) => ({
      id: `dispatch-${idx}`,
      timestamp: new Date(),
      fromAgent: 'pop',
      toAgent: agent.type,
      task: agent.currentTask || '处理任务中',
      status: 'running' as const,
    }))
    setDispatchEvents(events)
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
    
    // 模拟任务完成检测（每10秒检查一次）
    const completionCheck = setInterval(() => {
      checkTaskCompletions()
    }, 10000)
    
    return () => {
      clearInterval(interval)
      clearInterval(completionCheck)
    }
  }, [])
  
  // 检查任务完成（模拟）
  const checkTaskCompletions = useCallback(() => {
    const agents = Array.isArray(data?.agents) ? data.agents : []
    
    agents.forEach(agent => {
      if (agent.status === 'working' && agent.currentTask) {
        // 模拟：30% 概率完成任务
        if (Math.random() < 0.3) {
          const taskId = `task-${Date.now()}`
          const result = generateMockTaskResult(taskId, agent.currentTask, agent.type)
          
          // 保存结果
          setTaskResults(prev => new Map(prev).set(taskId, result))
          
          // 显示通知
          toast.success(`${agent.config?.emoji || '🤖'} ${agent.config?.name || agent.type} 完成了任务`, {
            description: agent.currentTask,
            action: {
              label: '查看结果',
              onClick: () => {
                setSelectedTaskResult(result)
                setResultDialogOpen(true)
              }
            }
          })
          
          // 更新智能体状态为空闲
          fetchAgentStates()
        }
      }
    })
  }, [data?.agents])

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
      case 'working': return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">工作中</Badge>
      case 'idle': return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">空闲</Badge>
      case 'offline': return <Badge className="bg-gray-500/20 text-gray-500 border-gray-500/30">离线</Badge>
      case 'error': return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">错误</Badge>
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
  const popAgent = agents.find((a: any) => a?.type === 'pop')
  const subAgents = agents.filter((a: any) => a?.type !== 'pop')
  const workingAgents = agents.filter((a: any) => a?.status === 'working')
  const totalAgents = agents.length

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 px-4 sm:px-6 pt-4 sm:pt-6 flex-shrink-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
            🫧 Pop
            <Badge className="bg-green-500/20 text-green-500 text-xs border-green-500/30">
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
                  <div className="text-xl font-semibold">{workingAgents.length}/{totalAgents}</div>
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
        {/* Left - Agent Hierarchy */}
        <div className="flex-1 overflow-auto min-w-0 flex flex-col gap-4">
          
          {/* Pop Master Card */}
          <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-4xl shadow-lg">
                    🫧
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-background animate-pulse" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">Pop</h3>
                    <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                      Chief of Staff
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    主控智能体 · 负责任务分析、分配和协调
                  </p>
                  
                  {/* 当前调度状态 */}
                  <div className="flex items-center gap-2 text-sm">
                    <Radio className="h-4 w-4 text-green-500 animate-pulse" />
                    <span className="text-muted-foreground">当前状态：</span>
                    <span className="font-medium">{popAgent?.currentTask || '监控系统中'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dispatch Flow */}
          {dispatchEvents.length > 0 && (
            <div className="flex items-center justify-center py-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowDown className="h-4 w-4 animate-bounce" />
                <span>正在调度 {dispatchEvents.length} 个任务</span>
              </div>
            </div>
          )}

          {/* Task Dispatch Input */}
          <TaskDispatchInput 
            onTaskDispatched={() => {
              fetchTasks()
              fetchAgentStates()
            }}
          />

          {/* Sub-agents Grid */}
          <Card className="border-border/60 shadow-sm flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                智能体集群
                <span className="text-xs text-muted-foreground font-normal ml-auto">
                  {subAgents.filter(a => a.status === 'working').length}/{subAgents.length} 工作
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {subAgents.map((agent, index) => (
                  <div 
                    key={agent.type}
                    onClick={() => {
                      setSelectedAgent(agent)
                      setDetailOpen(true)
                    }}
                    className={cn(
                      "p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md",
                      agent.status === 'working' 
                        ? "bg-green-500/5 border-green-500/30 hover:border-green-500/50" 
                        : "bg-muted/30 border-border/50 hover:border-border"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                          {agent.config?.emoji || '🤖'}
                        </div>
                        <div className={cn(
                          "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
                          getStatusColor(agent.status)
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{agent.config?.name || agent.type}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          {agent.config?.role}
                        </div>
                        
                        {/* 当前任务 */}
                        {agent.status === 'working' && agent.currentTask && (
                          <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                            <div className="flex items-center gap-2 text-xs">
                              <Sparkles className="h-3 w-3 text-green-500 animate-pulse" />
                              <span className="text-green-600 dark:text-green-400 truncate">
                                {agent.currentTask}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {/* 统计 + 负载指示器 */}
                        <div className="mt-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>会话: {agent.sessionCount}</span>
                            <span>成功率: {(agent.successRate * 100).toFixed(0)}%</span>
                          </div>
                          {/* 负载均衡指示器 */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-muted-foreground">负载:</span>
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  agent.status === 'working' ? "bg-green-500" : 
                                  agent.status === 'idle' ? "bg-yellow-500" : 
                                  agent.status === 'error' ? "bg-red-500" : "bg-gray-400"
                                )}
                                style={{ 
                                  width: agent.status === 'working' ? '75%' : 
                                         agent.status === 'idle' ? '25%' : '0%' 
                                }}
                              />
                            </div>
                            <span className={cn(
                              "text-[10px]",
                              agent.status === 'working' && "text-green-500",
                              agent.status === 'idle' && "text-yellow-500",
                            )}>
                              {agent.status === 'working' ? '高' : agent.status === 'idle' ? '低' : '-'}
                            </span>
                          </div>
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
          {/* Active Dispatch */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                实时调度
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-auto max-h-48">
              {dispatchEvents.length > 0 ? (
                <div className="space-y-2">
                  {dispatchEvents.map((event) => (
                    <div key={event.id} className="p-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">Pop</span>
                        <ArrowDown className="h-3 w-3 text-yellow-500" />
                        <span className="font-medium capitalize">{event.toAgent}</span>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {event.task}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  暂无活跃调度
                </div>
              )}
            </CardContent>
          </Card>

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
                {tasks.slice(0, 5).map((task) => {
                  const hasResult = task.status === 'completed'
                  const result = taskResults.get(task.id)
                  
                  return (
                    <div key={task.id} className="p-2.5 rounded-lg bg-muted/30 text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{task.title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                            <span className={cn(
                              "px-1.5 py-0.5 rounded text-[10px]",
                              task.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                              task.status === 'running' ? 'bg-blue-500/20 text-blue-500' :
                              task.status === 'failed' ? 'bg-red-500/20 text-red-500' :
                              task.status === 'blocked' ? 'bg-orange-500/20 text-orange-500' :
                              'bg-gray-500/20 text-gray-500'
                            )}>
                              {task.status === 'completed' ? '✓ 完成' :
                               task.status === 'running' ? '▶ 运行中' :
                               task.status === 'analyzing' ? '📊 分析中' :
                               task.status === 'reviewing' ? '👁 审核中' :
                               task.status === 'failed' ? '✗ 失败' :
                               task.status === 'blocked' ? '🚫 阻塞' : '○ 待处理'}
                            </span>
                            {task.agent && <span>→ {task.agent}</span>}
                          </div>
                        </div>
                        {/* 查看结果按钮 */}
                        {(hasResult || result) && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-6 px-2 text-[10px]"
                            onClick={() => {
                              // 使用已有结果或生成模拟结果
                              const taskResult = result || generateMockTaskResult(
                                task.id, 
                                task.title, 
                                task.agent || 'codex'
                              )
                              setSelectedTaskResult(taskResult)
                              setResultDialogOpen(true)
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            结果
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
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

      {/* Agent Detail Sheet */}
      <AgentDetailSheet 
        open={detailOpen} 
        onOpenChange={setDetailOpen} 
        agent={selectedAgent} 
      />
      
      {/* Task Result Dialog */}
      <TaskResultDialog
        open={resultDialogOpen}
        onOpenChange={setResultDialogOpen}
        task={selectedTaskResult}
      />
    </div>
  )
}
