'use client'

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Sparkles, FileText, CheckCircle2, Plus, Zap, TrendingUp, Users, Clock,
  Target, AlertCircle, Lightbulb, Calendar, FolderKanban, ArrowRight,
  Activity, RotateCcw
} from 'lucide-react'

// API 响应类型
interface AgentState {
  type: string
  status: 'working' | 'idle' | 'offline' | 'error'
  currentTask?: string
  lastActivity?: string
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

interface AgentData {
  agents: AgentState[]
  activeSessions: any[]
  popTasks: { active: number; completed: number; pending: number }
  timestamp: string
}

interface StatsData {
  totalIdeas: number
  withPlan: number
  totalTasks: number
  completedTasks: number
  completionRate: number
}

export function HomeView() {
  const { t } = useI18n()
  const [agentData, setAgentData] = useState<AgentData | null>(null)
  const [stats, setStats] = useState<StatsData>({
    totalIdeas: 0,
    withPlan: 0,
    totalTasks: 0,
    completedTasks: 0,
    completionRate: 0,
  })
  const [loading, setLoading] = useState(true)

  // 获取智能体状态
  const fetchAgentStates = async () => {
    try {
      const response = await fetch('/api/agents')
      if (response.ok) {
        const data = await response.json()
        setAgentData(data)
      }
    } catch (err) {
      console.error('Failed to fetch agent states:', err)
    }
  }

  // 获取统计数据
  const fetchStats = async () => {
    try {
      // 获取 ideas 统计
      const ideasRes = await fetch('/api/ideas')
      let totalIdeas = 0
      let withPlan = 0
      if (ideasRes.ok) {
        const ideas = await ideasRes.json()
        totalIdeas = ideas?.length || 0
        withPlan = ideas?.filter((i: any) => i.has_plan).length || 0
      }

      // 获取 tasks 统计
      const tasksRes = await fetch('/api/tasks')
      let totalTasks = 0
      let completedTasks = 0
      if (tasksRes.ok) {
        const tasks = await tasksRes.json()
        totalTasks = tasks?.length || 0
        completedTasks = tasks?.filter((t: any) => t.status === 'done' || t.status === 'completed').length || 0
      }

      setStats({
        totalIdeas,
        withPlan,
        totalTasks,
        completedTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      })
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAgentStates()
    fetchStats()
    // 每 30 秒刷新
    const interval = setInterval(() => {
      fetchAgentStates()
      fetchStats()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const workingAgents = agentData?.agents.filter(a => a.status === 'working').length || 0
  const totalAgents = agentData?.agents.length || 0

  // Pop 建议（基于实际数据生成）
  const popSuggestions = [
    { 
      id: 1, 
      title: stats.completionRate < 50 ? '推进未完成任务' : '保持当前进度', 
      reason: `当前完成率 ${stats.completionRate}%`, 
      confidence: stats.completionRate < 50 ? 90 : 75 
    },
    { 
      id: 2, 
      title: stats.totalIdeas > stats.withPlan ? '为想法制定计划' : '收集更多想法', 
      reason: `${stats.totalIdeas - stats.withPlan} 个想法待规划`, 
      confidence: 85 
    },
    { 
      id: 3, 
      title: '查看 Pop 标签了解团队状态', 
      reason: `${workingAgents} 个智能体正在工作`, 
      confidence: 95 
    },
  ]

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 px-6 pt-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-semibold">{t('home.title')}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t('home.subtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => { fetchAgentStates(); fetchStats(); }}>
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">{t('common.sync')}</span>
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t('common.newIdea')}</span>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-6 mb-4 flex-shrink-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10">
                  <FileText className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <div className="text-xl font-semibold">{stats.totalIdeas}</div>
                  <div className="text-[10px] text-muted-foreground">{t('home.totalIdeas')}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/10">
                  <Zap className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                  <div className="text-xl font-semibold">{stats.withPlan}</div>
                  <div className="text-[10px] text-muted-foreground">{t('home.withPlan')}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-orange-500/10">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                </div>
                <div>
                  <div className="text-xl font-semibold">{stats.totalTasks}</div>
                  <div className="text-[10px] text-muted-foreground">{t('home.totalTasks')}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <div className="text-xl font-semibold">{stats.completionRate}%</div>
                  <div className="text-[10px] text-muted-foreground">{t('home.completed')}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 pb-6 overflow-hidden flex flex-col lg:flex-row gap-4">
        {/* Left Column - Team Online */}
        <div className="flex-1 overflow-auto min-w-0">
          <Card className="border-border/60 shadow-sm h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  {t('home.teamOnline') || '团队在线'}
                </CardTitle>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  {workingAgents}/{totalAgents} 工作中
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {agentData?.agents.map((agent) => (
                  <div 
                    key={agent.type}
                    className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer border border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
                          {agent.config?.emoji || '🤖'}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${
                          agent.status === 'working' ? 'bg-green-500' : 
                          agent.status === 'idle' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{agent.config?.name || agent.type}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {agent.status === 'working' && agent.currentTask ? agent.currentTask : '空闲中'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Pop Suggestions */}
        <div className="w-80 flex-shrink-0">
          <Card className="border-border/60 shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                {t('home.popSuggestions') || 'Pop 建议'}
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-auto h-[calc(100%-60px)]">
              <div className="space-y-2">
                {popSuggestions.map((suggestion) => (
                  <div 
                    key={suggestion.id}
                    className="p-3 rounded-lg bg-gradient-to-r from-yellow-500/5 to-orange-500/5 border border-yellow-500/20 hover:border-yellow-500/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{suggestion.title}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{suggestion.reason}</div>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-yellow-500 flex-shrink-0">
                        <Activity className="h-3 w-3" />
                        {suggestion.confidence}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-4 flex-shrink-0">
        <div className="text-xs text-muted-foreground text-center">
          最后更新: {agentData?.timestamp ? new Date(agentData.timestamp).toLocaleString() : '-'}
        </div>
      </div>
    </div>
  )
}
