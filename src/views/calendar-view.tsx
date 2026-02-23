'use client'

import { useState } from 'react'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, isToday } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Clock, Repeat, CalendarDays, Zap } from 'lucide-react'

interface ScheduledTask {
  id: string
  title: string
  date: Date
  time: string
  type: 'cron' | 'scheduled' | 'one-time'
  status: 'pending' | 'completed' | 'running'
}

// Mock data
const scheduledTasks: ScheduledTask[] = [
  {
    id: 'task-1',
    title: 'mission control check',
    date: new Date(),
    time: '08:00',
    type: 'cron',
    status: 'pending',
  },
  {
    id: 'task-2',
    title: 'morning brief',
    date: new Date(),
    time: '09:00',
    type: 'cron',
    status: 'pending',
  },
  {
    id: 'task-3',
    title: 'competitor youtube scan',
    date: new Date(),
    time: '10:00',
    type: 'scheduled',
    status: 'pending',
  },
  {
    id: 'task-4',
    title: 'ai scarcity research',
    date: new Date(),
    time: '11:00',
    type: 'scheduled',
    status: 'pending',
  },
  {
    id: 'task-5',
    title: 'newsletter reminder',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    time: '14:00',
    type: 'one-time',
    status: 'pending',
  },
]

// Always running cron jobs
const alwaysRunning = [
  { id: 'cron-1', title: 'mission control check', interval: 'Every 30 min' },
  { id: 'cron-2', title: 'health check', interval: 'Every 1 hour' },
]

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Week view
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

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

  const getTaskBgColor = (type: string) => {
    switch (type) {
      case 'cron':
        return 'bg-blue-500'
      case 'scheduled':
        return 'bg-purple-500'
      case 'one-time':
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
  }

  // Calculate next up tasks
  const now = new Date()
  const nextUp = scheduledTasks
    .filter((t) => t.status === 'pending' && t.date >= now)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5)

  const getTimeUntil = (date: Date) => {
    const diff = date.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    if (hours > 0) return `in ${hours}h`
    if (minutes > 0) return `in ${minutes}m`
    return 'now'
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-semibold">Calendar</h2>
          <p className="text-sm text-muted-foreground">
            查看所有预定任务和 cron 作业
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('week')}
          >
            Week
          </Button>
          <Button
            variant={viewMode === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('month')}
          >
            Month
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
        </div>
      </div>

      <div className="flex-1 px-6 pb-6 flex gap-6 overflow-hidden">
        {/* Main Calendar Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Scheduled Tasks Section */}
          <Card className="mb-4 border-border/60 flex-shrink-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-500" />
                    Scheduled Tasks
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Pop's automated routines
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  Always Running
                </div>
                <div className="flex flex-wrap gap-2">
                  {alwaysRunning.map((cron) => (
                    <Badge
                      key={cron.id}
                      variant="outline"
                      className="gap-1.5 bg-blue-500/5"
                    >
                      <Repeat className="h-3 w-3 text-blue-500" />
                      <span>{cron.title}</span>
                      <span className="text-muted-foreground">• {cron.interval}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Week View Calendar */}
          <Card className="flex-1 border-border/60 overflow-hidden flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle>
                  {format(weekStart, 'MMM d', { locale: zhCN })} - {format(weekEnd, 'MMM d, yyyy', { locale: zhCN })}
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-4 pt-0">
              <div className="h-full flex flex-col">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-2 mb-2 flex-shrink-0">
                  {weekDays.map((day) => (
                    <div
                      key={day.toString()}
                      className={`text-center text-xs font-medium py-2 rounded ${
                        isToday(day) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      <div>{format(day, 'EEE')}</div>
                      <div className="text-lg font-semibold">{format(day, 'd')}</div>
                    </div>
                  ))}
                </div>

                {/* Day Cells */}
                <div className="flex-1 grid grid-cols-7 gap-2">
                  {weekDays.map((day) => {
                    const tasks = getTasksForDate(day)
                    const isSelected = selectedDate && isSameDay(day, selectedDate)

                    return (
                      <button
                        key={day.toString()}
                        onClick={() => setSelectedDate(day)}
                        className={`flex-1 border rounded-lg p-2 text-left transition-all overflow-hidden flex flex-col ${
                          isToday(day) ? 'border-primary bg-primary/5' : 'border-border'
                        } ${isSelected ? 'ring-2 ring-primary' : ''} hover:bg-accent`}
                      >
                        <div className="space-y-1 flex-1 overflow-hidden">
                          {tasks.slice(0, 3).map((task) => (
                            <div
                              key={task.id}
                              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] truncate ${getTaskTypeColor(task.type)}`}
                            >
                              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getTaskBgColor(task.type)}`} />
                              <span className="truncate">{task.title}</span>
                            </div>
                          ))}
                          {tasks.length > 3 && (
                            <div className="text-[10px] text-muted-foreground px-1">
                              +{tasks.length - 3} more
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-4 overflow-hidden">
          {/* Legend */}
          <Card className="border-border/60 flex-shrink-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Task Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <Repeat className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Cron Job</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-500" />
                <span className="text-sm">Scheduled</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-orange-500" />
                <span className="text-sm">One-time</span>
              </div>
            </CardContent>
          </Card>

          {/* Next Up */}
          <Card className="border-border/60 flex-1 overflow-hidden flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Next Up
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden pt-0">
              <div className="space-y-2">
                {nextUp.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getTaskBgColor(task.type)}`} />
                      <span className="text-sm truncate">{task.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                      {getTimeUntil(task.date)}
                    </span>
                  </div>
                ))}
                {nextUp.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    No upcoming tasks
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
