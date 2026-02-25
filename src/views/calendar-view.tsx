'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface CalendarTask {
  id: string
  title: string
  type: 'cron' | 'scheduled' | 'oneTime'
  status: 'pending' | 'running' | 'completed' | 'failed'
  scheduledFor: string
  agent?: string
}

export function CalendarView() {
  const { t } = useI18n()
  const [tasks, setTasks] = useState<CalendarTask[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day')

  const fetchTasks = async () => {
    try {
      // 模拟从 sync API 获取定时任务
      const res = await fetch('/api/sync')
      const data = await res.json()
      
      // 添加一些模拟的日历任务
      const calendarTasks: CalendarTask[] = [
        {
          id: 'cal-001',
          title: '每日工作日志',
          type: 'cron',
          status: 'pending',
          scheduledFor: new Date(Date.now() + 3600000).toISOString(),
          agent: 'Pop',
        },
        {
          id: 'cal-002',
          title: '开发进度检查',
          type: 'cron',
          status: 'pending',
          scheduledFor: new Date(Date.now() + 7200000).toISOString(),
          agent: 'Pop',
        },
        {
          id: 'cal-003',
          title: '内容发布提醒',
          type: 'scheduled',
          status: 'pending',
          scheduledFor: new Date(Date.now() + 86400000).toISOString(),
          agent: 'Echo',
        },
        {
          id: 'cal-004',
          title: '周报生成',
          type: 'cron',
          status: 'completed',
          scheduledFor: new Date(Date.now() - 3600000).toISOString(),
          agent: 'Pop',
        },
      ]
      setTasks(calendarTasks)
    } catch (err) {
      console.error('Failed to fetch calendar tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'cron': return <Badge className="bg-blue-500/10 text-blue-500">{t('calendar.taskTypes.cron')}</Badge>
      case 'scheduled': return <Badge className="bg-purple-500/10 text-purple-500">{t('calendar.taskTypes.scheduled')}</Badge>
      case 'oneTime': return <Badge className="bg-green-500/10 text-green-500">{t('calendar.taskTypes.oneTime')}</Badge>
      default: return null
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'running': return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      default: return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) return '今天'
    if (date.toDateString() === tomorrow.toDateString()) return '明天'
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  const upcomingTasks = tasks.filter(t => t.status === 'pending').sort((a, b) => 
    new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
  )
  const completedTasks = tasks.filter(t => t.status === 'completed' || t.status === 'failed')

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
          <h2 className="text-2xl font-semibold">{t('calendar.title')}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t('calendar.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 text-sm ${viewMode === 'day' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
            >
              {t('calendar.today')}
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 text-sm ${viewMode === 'week' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
            >
              {t('calendar.week')}
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={fetchTasks}>
            <RotateCcw className="h-4 w-4 mr-2" />
            刷新
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-auto flex gap-4">
        {/* Upcoming */}
        <div className="flex-1">
          <Card className="border-border/60 shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                {t('calendar.nextUp')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {t('calendar.noUpcoming')}
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingTasks.map(task => (
                    <div key={task.id} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(task.status)}
                            <span className="font-medium text-sm">{task.title}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{formatDate(task.scheduledFor)} {formatTime(task.scheduledFor)}</span>
                            {task.agent && <span>• {task.agent}</span>}
                          </div>
                        </div>
                        {getTypeBadge(task.type)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Completed */}
        <div className="w-80 flex-shrink-0">
          <Card className="border-border/60 shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                最近完成
              </CardTitle>
            </CardHeader>
            <CardContent>
              {completedTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  暂无完成的任务
                </div>
              ) : (
                <div className="space-y-2">
                  {completedTasks.map(task => (
                    <div key={task.id} className="p-2 rounded-lg bg-muted/20 text-sm">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(task.status)}
                        <span className="truncate">{task.title}</span>
                      </div>
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
