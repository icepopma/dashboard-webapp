'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MonitorPlay, RotateCcw, Users, Activity, MessageSquare } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface AgentState {
  type: string
  status: 'working' | 'idle' | 'offline' | 'error'
  currentTask?: string
  config?: {
    name: string
    emoji: string
  }
}

interface ActivityLog {
  id: string
  agent: string
  action: string
  timestamp: string
}

export function OfficeView() {
  const { t } = useI18n()
  const [agents, setAgents] = useState<AgentState[]>([])
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [agentsRes, actRes] = await Promise.all([
        fetch('/api/agents'),
        fetch('/api/activity?limit=20'),
      ])
      const agentsData = await agentsRes.json()
      const actData = await actRes.json()
      setAgents(agentsData.agents || [])
      setActivities(actData.activities || [])
    } catch (err) {
      console.error('Failed to fetch office data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const workingAgents = agents.filter(a => a.status === 'working')

  const getZoneForAgent = (agent: AgentState): string => {
    // 根据智能体类型分配区域
    if (agent.type === 'pop') return '指挥中心'
    if (['codex', 'claude'].includes(agent.type)) return '工程区'
    if (['quill', 'echo'].includes(agent.type)) return '内容区'
    if (agent.type === 'scout') return '分析区'
    return '协作区'
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
          <h2 className="text-2xl font-semibold">{t('office.title')}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t('office.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {workingAgents.length} {t('office.workingLabel')}
          </div>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RotateCcw className="h-4 w-4 mr-2" />
            刷新
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 pb-6 overflow-hidden flex gap-4">
        {/* Office Grid */}
        <div className="flex-1">
          <Card className="border-border/60 shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MonitorPlay className="h-4 w-4 text-blue-500" />
                办公区
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {agents.map(agent => (
                  <div 
                    key={agent.type}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      agent.status === 'working' 
                        ? 'border-green-500/50 bg-green-500/5' 
                        : 'border-border/50 bg-muted/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{agent.config?.emoji || '🤖'}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{agent.config?.name}</div>
                        <div className="text-xs text-muted-foreground">{getZoneForAgent(agent)}</div>
                        {agent.status === 'working' && agent.currentTask && (
                          <div className="text-xs text-green-500 mt-1 truncate">
                            💼 {agent.currentTask}
                          </div>
                        )}
                        {agent.status === 'idle' && (
                          <div className="text-xs text-yellow-500 mt-1">
                            ☕ 休息中
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <div className="w-80 flex-shrink-0">
          <Card className="border-border/60 shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-purple-500" />
                {t('office.liveActivity')}
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-auto h-[calc(100%-60px)]">
              {activities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {t('office.noActivity')}
                </div>
              ) : (
                <div className="space-y-2">
                  {activities.map(activity => (
                    <div key={activity.id} className="p-2 rounded-lg bg-muted/30 text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{activity.agent}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{activity.action}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
