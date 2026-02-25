'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Brain, RotateCcw, FileText, Activity, Network } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface MemoryEntry {
  id: string
  key: string
  value: any
  type: 'success' | 'failure' | 'context' | 'decision'
  timestamp: string
}

export function MemoryView() {
  const { t } = useI18n()
  const [memories, setMemories] = useState<MemoryEntry[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'memory' | 'logs' | 'knowledge' | 'graph'>('memory')

  const fetchData = async () => {
    try {
      // 获取活动日志
      const actRes = await fetch('/api/activity?limit=10')
      const actData = await actRes.json()
      setActivities(actData.activities || [])
      
      // 模拟记忆数据
      setMemories([
        { id: 'mem-001', key: 'success:feature:dashboard', value: { pattern: '使用组件库加速开发' }, type: 'success', timestamp: new Date().toISOString() },
        { id: 'mem-002', key: 'failure:bugfix:auth', value: { lesson: '认证逻辑变更需要测试覆盖' }, type: 'failure', timestamp: new Date(Date.now() - 86400000).toISOString() },
        { id: 'mem-003', key: 'decision:framework', value: { decision: '选择 Next.js 作为前端框架' }, type: 'decision', timestamp: new Date(Date.now() - 172800000).toISOString() },
      ])
    } catch (err) {
      console.error('Failed to fetch memory data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'success': return <Badge className="bg-green-500/10 text-green-500">成功</Badge>
      case 'failure': return <Badge className="bg-red-500/10 text-red-500">失败</Badge>
      case 'decision': return <Badge className="bg-purple-500/10 text-purple-500">决策</Badge>
      default: return <Badge className="bg-blue-500/10 text-blue-500">上下文</Badge>
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
          <h2 className="text-2xl font-semibold">{t('memory.title')}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t('memory.subtitle')}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RotateCcw className="h-4 w-4 mr-2" />
          刷新
        </Button>
      </div>

      {/* Tabs */}
      <div className="px-6 mb-4 flex-shrink-0">
        <div className="flex gap-2">
          {[
            { id: 'memory', label: t('memory.aiMemory'), icon: Brain },
            { id: 'logs', label: t('memory.dailyJournal'), icon: FileText },
            { id: 'knowledge', label: t('memory.knowledge'), icon: Activity },
            { id: 'graph', label: t('memory.graph'), icon: Network },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted/30 hover:bg-muted/50'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-auto">
        {activeTab === 'memory' && (
          <div className="space-y-3">
            {memories.map(memory => (
              <Card key={memory.id} className="border-border/60 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-sm">{memory.key}</span>
                        {getTypeBadge(memory.type)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {typeof memory.value === 'object' ? JSON.stringify(memory.value) : memory.value}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(memory.timestamp).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-2">
            {activities.map(activity => (
              <div key={activity.id} className="p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{activity.agent}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleString('zh-CN')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{activity.action}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'knowledge' && (
          <Card className="border-border/60 shadow-sm">
            <CardContent className="py-12 text-center">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">知识库功能开发中...</p>
            </CardContent>
          </Card>
        )}

        {activeTab === 'graph' && (
          <Card className="border-border/60 shadow-sm h-full">
            <CardContent className="py-12 text-center">
              <Network className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">知识图谱功能开发中...</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
