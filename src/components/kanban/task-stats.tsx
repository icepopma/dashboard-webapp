'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Calendar, Clock, CheckCircle2, BarChart3 } from 'lucide-react'

interface TaskStatsProps {
  stats: {
    thisWeek: number
    inProgress: number
    total: number
    completion: number
  }
  onNewTask?: () => void
  assigneeFilter: string
  onAssigneeChange: (value: string) => void
  projectFilter: string
  onProjectChange: (value: string) => void
}

export function TaskStats({
  stats,
  onNewTask,
  assigneeFilter,
  onAssigneeChange,
  projectFilter,
  onProjectChange,
}: TaskStatsProps) {
  const statItems = [
    {
      label: 'This week',
      value: stats.thisWeek,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      icon: Calendar,
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      icon: Clock,
    },
    {
      label: 'Total',
      value: stats.total,
      color: 'text-foreground',
      bgColor: 'bg-muted',
      icon: BarChart3,
    },
    {
      label: 'Completion',
      value: `${stats.completion}%`,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      icon: CheckCircle2,
    },
  ]

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="flex items-center gap-4">
        {statItems.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.label} className="flex-1 border-border/60 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${item.bgColor}`}>
                    <Icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <div>
                    <div className={`text-xl font-semibold ${item.color}`}>
                      {item.value}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.label}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {/* New Task Button */}
        <Button onClick={onNewTask} className="gap-2 h-auto py-3 px-4">
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>

      {/* Filters Row */}
      <div className="flex items-center gap-3">
        {/* Assignee Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filter:</span>
          <div className="flex gap-1">
            <Badge
              variant={assigneeFilter === 'all' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => onAssigneeChange('all')}
            >
              All
            </Badge>
            <Badge
              variant={assigneeFilter === 'Matt' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => onAssigneeChange('Matt')}
            >
              Matt
            </Badge>
            <Badge
              variant={assigneeFilter === 'Pop' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => onAssigneeChange('Pop')}
            >
              Pop
            </Badge>
          </div>
        </div>

        {/* Project Filter */}
        <Select value={projectFilter} onValueChange={onProjectChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            <SelectItem value="mission-control">Mission Control</SelectItem>
            <SelectItem value="dashboard">Dashboard</SelectItem>
            <SelectItem value="youtube">YouTube</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
