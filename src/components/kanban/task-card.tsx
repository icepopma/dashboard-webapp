'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  GripVertical, Clock, User, CheckSquare, Square, 
  Sparkles, ChevronDown, ChevronUp, Timer, Link2
} from 'lucide-react'
import { SubTask } from './kanban-board'

export interface TaskCardData {
  id: string
  title: string
  description?: string
  priority: 'high' | 'medium' | 'low'
  assignee: 'Matt' | 'Pop'
  estimatedHours?: number
  actualHours?: number
  tags?: string[]
  subtasks?: SubTask[]
  dependencies?: string[]
  blockedBy?: string[]
}

interface TaskCardProps {
  task: TaskCardData
  isSelected?: boolean
  onSelect?: (taskId: string) => void
  onAISplit?: (taskId: string) => void
}

export function TaskCard({ task, isSelected = false, onSelect, onAISplit }: TaskCardProps) {
  const [showSubtasks, setShowSubtasks] = useState(false)
  const [isTracking, setIsTracking] = useState(false)
  const [trackedTime, setTrackedTime] = useState(0)

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

  const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0
  const totalSubtasks = task.subtasks?.length || 0
  const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  const toggleTimeTracking = () => {
    if (isTracking) {
      setIsTracking(false)
    } else {
      setIsTracking(true)
      const interval = setInterval(() => {
        setTrackedTime(prev => {
          if (!isTracking) {
            clearInterval(interval)
            return prev
          }
          return prev + 1
        })
      }, 60000) // Update every minute
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group"
    >
      <Card
        className={`p-3 cursor-grab active:cursor-grabbing hover:bg-accent/50 transition-all ${
          isDragging ? 'opacity-50 shadow-lg' : ''
        } ${isSelected ? 'ring-2 ring-primary bg-primary/5' : ''}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            {/* Selection checkbox */}
            {onSelect && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect(task.id)
                }}
                className="mt-0.5 flex-shrink-0"
              >
                {isSelected ? (
                  <CheckSquare className="h-4 w-4 text-primary" />
                ) : (
                  <Square className="h-4 w-4 text-muted-foreground/50 hover:text-muted-foreground" />
                )}
              </button>
            )}
            <h4 className="font-medium text-sm flex-1 leading-tight">{task.title}</h4>
          </div>
          <GripVertical 
            {...attributes} 
            {...listeners}
            className="h-4 w-4 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" 
          />
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2 ml-6">
            {task.description}
          </p>
        )}

        {/* Subtask Progress */}
        {totalSubtasks > 0 && (
          <div className="mb-2 ml-6">
            <button 
              onClick={() => setShowSubtasks(!showSubtasks)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showSubtasks ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              <CheckSquare className="h-3 w-3" />
              <span>{completedSubtasks}/{totalSubtasks}</span>
              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden ml-1 w-16">
                <div 
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${subtaskProgress}%` }}
                />
              </div>
            </button>
            
            {showSubtasks && (
              <div className="mt-2 space-y-1 pl-4">
                {task.subtasks?.map(subtask => (
                  <div key={subtask.id} className="flex items-center gap-2 text-xs">
                    {subtask.completed ? (
                      <CheckSquare className="h-3 w-3 text-green-500" />
                    ) : (
                      <Square className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span className={subtask.completed ? 'text-muted-foreground line-through' : ''}>
                      {subtask.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Dependencies Warning */}
        {(task.blockedBy && task.blockedBy.length > 0) && (
          <div className="mb-2 ml-6 flex items-center gap-1 text-xs text-orange-500">
            <Link2 className="h-3 w-3" />
            <span>被 {task.blockedBy.length} 个任务阻塞</span>
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-2 text-xs flex-wrap ml-6">
          {/* Priority */}
          <Badge
            variant="outline"
            className={`flex-shrink-0 text-[10px] px-1.5 py-0 ${priorityColors[task.priority]}`}
          >
            {task.priority}
          </Badge>

          {/* Assignee */}
          <div className="flex items-center gap-1 text-muted-foreground flex-shrink-0">
            <User className="h-3 w-3" />
            <span className="text-[10px]">{task.assignee}</span>
          </div>

          {/* Time Tracking */}
          {(task.estimatedHours || task.actualHours || trackedTime > 0) && (
            <div className="flex items-center gap-1 text-muted-foreground flex-shrink-0">
              <Clock className="h-3 w-3" />
              <span className="text-[10px]">
                {task.actualHours || trackedTime > 0 ? formatTime((task.actualHours || 0) * 60 + trackedTime) : `${task.estimatedHours}h`}
                {task.estimatedHours && task.actualHours && (
                  <span className="text-muted-foreground/50"> / {task.estimatedHours}h</span>
                )}
              </span>
            </div>
          )}

          {/* Time Tracking Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleTimeTracking()
            }}
            className={`flex-shrink-0 p-0.5 rounded transition-colors ${
              isTracking ? 'text-green-500 bg-green-500/10' : 'text-muted-foreground/50 hover:text-muted-foreground'
            }`}
            title={isTracking ? '停止计时' : '开始计时'}
          >
            <Timer className="h-3 w-3" />
          </button>
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2 ml-6">
            {task.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-[10px] px-1.5 py-0 font-normal"
              >
                {tag}
              </Badge>
            ))}
            {task.tags.length > 3 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                +{task.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* AI Split Button */}
        {onAISplit && totalSubtasks === 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAISplit(task.id)
            }}
            className="mt-2 ml-6 flex items-center gap-1 text-[10px] text-purple-500 hover:text-purple-400 transition-colors"
          >
            <Sparkles className="h-3 w-3" />
            <span>AI 拆分</span>
          </button>
        )}
      </Card>
    </div>
  )
}
