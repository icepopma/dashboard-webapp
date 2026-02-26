'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Play, Pause, RotateCcw, Activity, Clock, CheckCircle2, 
  XCircle, MessageSquare, TrendingUp, Terminal, ChevronRight,
  AlertCircle, Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AgentType } from '@/orchestrator/types'

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

interface Task {
  id: string
  title: string
  status: string
  created_at: string
  agent?: string
}

interface AgentLog {
  id: string
  timestamp: Date
  type: 'info' | 'success' | 'error' | 'warning'
  message: string
}

interface AgentDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agent: AgentState | null
}

export function AgentDetailSheet({ open, onOpenChange, agent }: AgentDetailSheetProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [logs, setLogs] = useState<AgentLog[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // 获取智能体相关任务
  useEffect(() => {
    if (open && agent) {
      fetchAgentData()
    }
  }, [open, agent])

  const fetchAgentData = async () => {
    if (!agent) return
    setLoading(true)
    try {
      // 获取任务列表
      const tasksRes = await fetch('/api/tasks')
      const tasksData = await tasksRes.json()
      const allTasks = tasksData.tasks || []
      // 筛选该智能体的任务
      const agentTasks = allTasks.filter((t: Task) => 
        t.agent?.toLowerCase() === agent.type.toLowerCase()
      ).slice(0, 10)
      setTasks(agentTasks)

      // 模拟生成日志（后续替换为真实日志）
      generateMockLogs()
    } catch (err) {
      console.error('Failed to fetch agent data:', err)
    } finally {
      setLoading(false)
    }
  }

  // 生成模拟日志
  const generateMockLogs = () => {
    const mockLogs: AgentLog[] = [
      { id: '1', timestamp: new Date(Date.now() - 60000), type: 'info', message: '智能体启动完成' },
      { id: '2', timestamp: new Date(Date.now() - 55000), type: 'info', message: '等待任务分配...' },
      { id: '3', timestamp: new Date(Date.now() - 30000), type: 'success', message: '接收到新任务' },
      { id: '4', timestamp: new Date(Date.now() - 25000), type: 'info', message: '正在分析任务需求' },
      { id: '5', timestamp: new Date(Date.now() - 10000), type: 'info', message: '执行中...' },
    ]
    setLogs(mockLogs)
  }

  // 智能体操作
  const handleAction = async (action: 'pause' | 'resume' | 'restart') => {
    if (!agent) return
    setActionLoading(action)
    try {
      const response = await fetch(`/api/agents/${agent.type}/${action}`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error(`Failed to ${action}`)
      // 刷新数据
      fetchAgentData()
    } catch (err) {
      console.error(`Failed to ${action}:`, err)
    } finally {
      setActionLoading(null)
    }
  }

  if (!agent) return null

  const getStatusConfig = () => {
    switch (agent.status) {
      case 'working':
        return { color: 'text-green-500', bg: 'bg-green-500/10', label: '工作中', icon: Activity }
      case 'idle':
        return { color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: '空闲', icon: Clock }
      case 'offline':
        return { color: 'text-gray-500', bg: 'bg-gray-500/10', label: '离线', icon: XCircle }
      case 'error':
        return { color: 'text-red-500', bg: 'bg-red-500/10', label: '错误', icon: AlertCircle }
      default:
        return { color: 'text-gray-500', bg: 'bg-gray-500/10', label: agent.status, icon: Clock }
    }
  }

  const statusConfig = getStatusConfig()
  const StatusIcon = statusConfig.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                {agent.config?.emoji || '🤖'}
              </div>
              <div className={cn(
                "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background",
                statusConfig.bg.replace('/10', '')
              )} />
            </div>
            <div>
              <DialogTitle className="text-lg">{agent.config?.name || agent.type}</DialogTitle>
              <DialogDescription>{agent.config?.role}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* 状态和操作 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <StatusIcon className={cn("h-5 w-5", statusConfig.color)} />
            <Badge className={cn(statusConfig.bg, statusConfig.color, "border-0")}>
              {statusConfig.label}
            </Badge>
          </div>
          
          <div className="flex gap-2">
            {agent.status === 'working' && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleAction('pause')}
                disabled={actionLoading !== null}
              >
                {actionLoading === 'pause' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Pause className="h-4 w-4" />
                )}
              </Button>
            )}
            {agent.status === 'idle' && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleAction('resume')}
                disabled={actionLoading !== null}
              >
                {actionLoading === 'resume' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            )}
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleAction('restart')}
              disabled={actionLoading !== null}
            >
              {actionLoading === 'restart' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* 当前任务 */}
        {agent.currentTask && (
          <Card className="mb-4 border-green-500/30 bg-green-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                <Activity className="h-4 w-4 animate-pulse" />
                当前任务
              </div>
              <div className="text-sm">{agent.currentTask}</div>
            </CardContent>
          </Card>
        )}

        {/* 性能统计 */}
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              性能统计
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold">{agent.sessionCount}</div>
                <div className="text-xs text-muted-foreground">总会话数</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{(agent.successRate * 100).toFixed(0)}%</div>
                <div className="text-xs text-muted-foreground">成功率</div>
                <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${agent.successRate * 100}%` }}
                  />
                </div>
              </div>
            </div>
            
            {/* 能力标签 */}
            <div className="mt-4">
              <div className="text-xs text-muted-foreground mb-2">能力</div>
              <div className="flex flex-wrap gap-1">
                {agent.config?.capabilities.map((cap) => (
                  <Badge key={cap} variant="outline" className="text-[10px]">
                    {cap}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* 模型信息 */}
            <div className="mt-3 text-xs text-muted-foreground">
              模型: <span className="font-mono">{agent.config?.model}</span>
            </div>
          </CardContent>
        </Card>

        {/* 历史任务 */}
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-purple-500" />
              历史任务
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : tasks.length > 0 ? (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div 
                    key={task.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-sm"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{task.title}</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[10px] flex-shrink-0",
                        task.status === 'completed' && "text-green-500 border-green-500/30",
                        task.status === 'in_progress' && "text-blue-500 border-blue-500/30",
                        task.status === 'failed' && "text-red-500 border-red-500/30"
                      )}
                    >
                      {task.status === 'completed' ? '完成' :
                       task.status === 'in_progress' ? '进行中' :
                       task.status === 'failed' ? '失败' : task.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                暂无历史任务
              </div>
            )}
          </CardContent>
        </Card>

        {/* 终端输出 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Terminal className="h-4 w-4 text-orange-500" />
              终端输出
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-zinc-900 dark:bg-zinc-950 rounded-lg p-3 font-mono text-xs space-y-1 max-h-48 overflow-auto">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2">
                  <span className="text-zinc-500 flex-shrink-0">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                  <span className={cn(
                    log.type === 'success' && 'text-green-400',
                    log.type === 'error' && 'text-red-400',
                    log.type === 'warning' && 'text-yellow-400',
                    log.type === 'info' && 'text-zinc-300'
                  )}>
                    {log.message}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-1 text-zinc-400">
                <span className="animate-pulse">▌</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
