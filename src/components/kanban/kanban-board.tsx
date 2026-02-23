'use client'

import { useEffect, useState } from 'react'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { KanbanColumn, KanbanColumnData } from './kanban-column'
import { TaskStats } from './task-stats'
import { Button } from '@/components/ui/button'
import { RefreshCw, Loader2 } from 'lucide-react'
import { NavItemId } from '@/components/sidebar'

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

const defaultColumns: KanbanColumnData[] = [
  {
    id: 'recurring',
    title: 'Recurring',
    tasks: [],
    color: '#a855f7', // purple
  },
  {
    id: 'backlog',
    title: 'Backlog',
    tasks: [],
    color: '#6b7280', // gray
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    tasks: [],
    color: '#3b82f6', // blue
  },
  {
    id: 'review',
    title: 'Review',
    tasks: [],
    color: '#eab308', // yellow
  },
  {
    id: 'done',
    title: 'Done',
    tasks: [],
    color: '#22c55e', // green
  },
]

interface KanbanBoardProps {
  onTabChange?: (tab: NavItemId) => void
}

export function KanbanBoard({ onTabChange }: KanbanBoardProps) {
  const [columns, setColumns] = useState<KanbanColumnData[]>(defaultColumns)
  const [loading, setLoading] = useState(false)
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')

  // Fetch tasks from API
  const fetchTasks = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/tasks')
      const data = await response.json()

      if (data.tasks) {
        // Group tasks by status
        const statusMap: Record<string, string> = {
          todo: 'backlog',
          in_progress: 'in-progress',
          completed: 'done',
        }

        const newColumns = defaultColumns.map((col) => ({
          ...col,
          tasks: data.tasks
            .filter((t: any) => statusMap[t.status] === col.id)
            .map((t: any) => ({
              id: t.id,
              title: t.local_path?.split('/').pop() || 'Untitled',
              description: `Idea: ${t.idea_id?.substring(0, 8)}...`,
              priority: t.priority || 'medium',
              assignee: 'Pop' as const,
              estimatedHours: t.estimated_hours,
              tags: ['开发'],
              project: 'Mission Control',
            })),
        }))

        setColumns(newColumns)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find column containing dragged task
    const sourceColumnIndex = columns.findIndex((col) =>
      col.tasks.some((task) => task.id === activeId)
    )
    const sourceColumn = columns[sourceColumnIndex]

    // Find target column
    const targetColumnIndex = columns.findIndex((col) => col.id === overId)

    if (sourceColumnIndex === -1 || targetColumnIndex === -1) return

    // Move task in local state
    const taskIndex = sourceColumn.tasks.findIndex((t) => t.id === activeId)
    const [movedTask] = sourceColumn.tasks.splice(taskIndex, 1)
    columns[targetColumnIndex].tasks.push(movedTask)

    setColumns([...columns])

    // Update Supabase
    try {
      const statusMap: Record<string, string> = {
        recurring: 'todo',
        backlog: 'todo',
        'in-progress': 'in_progress',
        review: 'in_progress',
        done: 'completed',
      }

      await fetch(`/api/tasks/${activeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: statusMap[columns[targetColumnIndex].id],
        }),
      })

      console.log(`Task ${activeId} moved to ${columns[targetColumnIndex].title}`)
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleRefresh = () => {
    fetchTasks()
  }

  const handleNewTask = () => {
    // TODO: Open new task dialog
    console.log('New task')
  }

  // Calculate stats
  const allTasks = columns.flatMap((col) => col.tasks)
  const stats = {
    thisWeek: allTasks.filter((t) => {
      // Tasks created this week
      return true // Placeholder
    }).length,
    inProgress: columns.find((c) => c.id === 'in-progress')?.tasks.length || 0,
    total: allTasks.length,
    completion: allTasks.length > 0 
      ? Math.round((columns.find((c) => c.id === 'done')?.tasks.length || 0) / allTasks.length * 100)
      : 0,
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-semibold">Tasks</h2>
          <p className="text-sm text-muted-foreground">
            追踪所有任务的状态和负责人
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
          className="gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          )}
          刷新
        </Button>
      </div>

      {/* Stats */}
      <div className="px-6 mb-4 flex-shrink-0">
        <TaskStats
          stats={stats}
          onNewTask={handleNewTask}
          assigneeFilter={assigneeFilter}
          onAssigneeChange={setAssigneeFilter}
          projectFilter={projectFilter}
          onProjectChange={setProjectFilter}
        />
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto px-6 pb-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <DndContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4 h-full">
              {columns.map((column) => (
                <KanbanColumn key={column.id} column={column} />
              ))}
            </div>
          </DndContext>
        )}
      </div>
    </div>
  )
}
