'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, RotateCcw, Plus, Bot, Activity } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface AgentState {
  type: string
  status: 'working' | 'idle' | 'offline' | 'error'
  currentTask?: string
  sessionCount: number
  successRate: number
  config?: {
    name: string
    role: string
    emoji: string
    capabilities: string[]
    model: string
  }
}

export function TeamView() {
  const { t } = useI18n()
  const [agents, setAgents] = useState<AgentState[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/agents')
      const data = await res.json()
      setAgents(data.agents || [])
    } catch (err) {
      console.error('Failed to fetch agents:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAgents()
    const interval = setInterval(fetchAgents, 30000)
    return () => clearInterval(interval)
  }, [])

  const workingAgents = agents.filter(a => a.status === 'working').length
  const totalAgents = agents.length

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

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-6 pt-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-semibold">{t('team.title')}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t('team.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {workingAgents}/{totalAgents} 工作中
          </div>
          <Button variant="outline" size="sm" onClick={fetchAgents}>
            <RotateCcw className="h-4 w-4 mr-2" />
            刷新
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t('team.addMember')}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 mb-4 flex-shrink-0">
        <div className="grid grid-cols-4 gap-3">
          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10">
                  <Users className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <div className="text-xl font-semibold">{totalAgents}</div>
                  <div className="text-[10px] text-muted-foreground">{t('team.totalMembers')}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-green-500/10">
                  <Activity className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <div className="text-xl font-semibold">{workingAgents}</div>
                  <div className="text-[10px] text-muted-foreground">{t('team.status.workingLabel')}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-yellow-500/10">
                  <Bot className="h-4 w-4 text-yellow-500" />
                </div>
                <div>
                  <div className="text-xl font-semibold">{agents.filter(a => a.status === 'idle').length}</div>
                  <div className="text-[10px] text-muted-foreground">{t('team.status.idle')}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/10">
                  <Activity className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                  <div className="text-xl font-semibold">
                    {Math.round(agents.reduce((sum, a) => sum + a.successRate, 0) / totalAgents * 100)}%
                  </div>
                  <div className="text-[10px] text-muted-foreground">平均成功率</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map(agent => (
            <Card key={agent.type} className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                      {agent.config?.emoji || '🤖'}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getStatusColor(agent.status)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{agent.config?.name || agent.type}</span>
                      {getStatusBadge(agent.status)}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {agent.config?.role}
                    </p>
                    {agent.currentTask && (
                      <p className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                        📌 {agent.currentTask}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {agent.config?.capabilities?.slice(0, 3).map(cap => (
                        <span key={cap} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                          {cap}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
                      <span>会话: {agent.sessionCount}</span>
                      <span>成功率: {(agent.successRate * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
