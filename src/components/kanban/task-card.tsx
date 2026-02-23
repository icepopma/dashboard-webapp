'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GripVertical, Clock, User, Calendar, FolderKanban } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export interface TaskCardData {
  id: string
  title: string
  description?: string
  priority: 'high' | 'medium' | 'low'
  assignee: 'Matt' | 'Pop'
  estimatedHours?: number
  tags?: string[]
  createdAt?: string
  project?: string
}

interface TaskCardProps {
  task: TaskCardData
}

export function TaskCard({ task }: TaskCardProps) {
  const { locale } = useI18n()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const priorityColors = {
    high: 'bg-red-500/10 text-red-500 border-red-500/20',
    medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    low: 'bg-green-500/10 text-green-500 border-green-500/20',
  }

  const priorityLabels = {
    high: locale === 'zh' ? '高' : 'High',
    medium: locale === 'zh' ? '中' : 'Medium',
    low: locale === 'zh' ? '低' : 'Low',
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
      
      if (locale === 'zh') {
        if (diffDays === 0) return '今天'
        if (diffDays === 1) return '昨天'
        if (diffDays < 7) return `${diffDays} 天前`
        return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
      } else {
        if (diffDays === 0) return 'Today'
        if (diffDays === 1) return 'Yesterday'
        if (diffDays < 7) return `${diffDays} days ago`
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }
    } catch {
      return dateString
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <Card
        className={`p-4 cursor-grab active:cursor-grabbing hover:bg-accent/50 transition-colors ${
          isDragging ? 'opacity-50' : ''
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="font-medium text-sm flex-1">{task.title}</h4>
          <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Project */}
        {task.project && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <FolderKanban className="h-3 w-3" />
            <span>{task.project}</span>
          </div>
        )}

        {/* Meta Row 1 */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          {/* Priority */}
          <Badge
            variant="outline"
            className={`flex-shrink-0 text-[10px] ${priorityColors[task.priority]}`}
          >
            {priorityLabels[task.priority]}
          </Badge>

          {/* Assignee */}
          <div className="flex items-center gap-1 text-muted-foreground flex-shrink-0">
            <User className="h-3 w-3" />
            <span>{task.assignee}</span>
          </div>

          {/* Hours */}
          {task.estimatedHours && (
            <div className="flex items-center gap-1 text-muted-foreground flex-shrink-0">
              <Clock className="h-3 w-3" />
              <span>{task.estimatedHours}h</span>
            </div>
          )}

          {/* Created At */}
          {task.createdAt && (
            <div className="flex items-center gap-1 text-muted-foreground flex-shrink-0">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(task.createdAt)}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {task.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-[10px] font-normal"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
