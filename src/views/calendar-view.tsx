'use client'

import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, Clock, Repeat } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ScheduledTask {
  id: string
  title: string
  date: Date
  type: 'cron' | 'scheduled' | 'one-time'
  status: 'pending' | 'completed' | 'running'
}

export function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const scheduledTasks: ScheduledTask[] = [
    {
      id: 'task-1',
      title: '晨间简报',
      date: new Date(2026, 1, 21, 7, 0, 0),
      type: 'cron',
      status: 'completed',
    },
    {
      id: 'task-2',
      title: '夜间工作',
      date: new Date(2026, 1, 21, 23, 0, 0),
      type: 'cron',
      status: 'pending',
    },
    {
      id: 'task-3',
      title: '内容创作',
      date: new Date(2026, 1, 22, 9, 0, 0),
      type: 'scheduled',
      status: 'pending',
    },
    {
      id: 'task-4',
      title: '项目审查',
      date: new Date(2026, 1, 23, 14, 0, 0),
      type: 'one-time',
      status: 'pending',
    },
  ]

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getTasksForDate = (date: Date) => {
    return scheduledTasks.filter((task) => isSameDay(task.date, date))
  }

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'cron':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'scheduled':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      case 'one-time':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      default:
        return ''
    }
  }

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'cron':
        return <Repeat className="h-3 w-3" />
      case 'scheduled':
        return <Clock className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-6">
        <div>
          <h2 className="text-2xl font-semibold">日历</h2>
          <p className="text-sm text-muted-foreground">
            查看所有预定任务和 cron 作业
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
            今天
          </Button>
        </div>
      </div>

      <div className="flex-1 px-6 pb-6 flex gap-6 overflow-hidden">
        {/* Calendar */}
        <Card className="flex-1 border-border/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {format(currentMonth, 'yyyy年 MMMM', { locale: zhCN })}
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((date) => {
                const tasks = getTasksForDate(date)
                const isToday = isSameDay(date, new Date())
                const isSelected = selectedDate && isSameDay(date, selectedDate)
                const isCurrentMonth = isSameMonth(date, currentMonth)

                return (
                  <button
                    key={date.toString()}
                    onClick={() => setSelectedDate(date)}
                    className={`
                      aspect-square p-1 rounded-lg border text-left transition-all
                      ${isToday ? 'border-primary bg-primary/10' : 'border-border'}
                      ${isSelected ? 'ring-2 ring-primary' : ''}
                      ${!isCurrentMonth ? 'opacity-30' : ''}
                      hover:bg-accent hover:border-accent-foreground/50
                    `}
                  >
                    <div className="text-xs font-medium mb-1">
                      {format(date, 'd')}
                    </div>
                    <div className="space-y-0.5">
                      {tasks.slice(0, 2).map((task) => (
                        <div
                          key={task.id}
                          className={`flex items-center gap-1 px-1 py-0.5 rounded text-[10px] truncate ${getTaskTypeColor(task.type)}`}
                        >
                          {getTaskTypeIcon(task.type)}
                          <span className="truncate">{task.title}</span>
                        </div>
                      ))}
                      {tasks.length > 2 && (
                        <div className="text-[10px] text-muted-foreground">
                          +{tasks.length - 2} 更多
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tasks Panel */}
        <Card className="w-80 flex-shrink-0 border-border/60">
          <CardHeader>
            <CardTitle className="text-sm">图例</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Repeat className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Cron 作业</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-500" />
              <span className="text-sm">预定任务</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-sm">一次性任务</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
