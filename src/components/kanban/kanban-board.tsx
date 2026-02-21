'use client'

import { useEffect, useState } from 'react'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { KanbanColumn, KanbanColumnData } from './kanban-column'
import { Button } from '@/components/ui/button'
import { RefreshCw, Loader2 } from 'lucide-react'

export interface TaskCardData {
  id: string
  title: string
  description?: string
  priority: 'high' | 'medium' | 'low'
  assignee: 'Matt' | 'Pop'
  estimatedHours?: number
  tags?: string[]
}

const defaultColumns: KanbanColumnData[] = [
  {
    id: 'todo',
    title: '待办',
    tasks: [],
    color: '#ef4444',
  },
  {
    id: 'in-progress',
    title: '进行中',
    tasks: [],
    color: '#eab308',
  },
  {
    id: 'done',
    title: '已完成',
    tasks: [],
    color: '#22c55e',
  },
]

interface KanbanBoardProps {
  refreshTasks?: () => void
  isLoading?: boolean
}

export function KanbanBoard({ refreshTasks, isLoading }: KanbanBoardProps) {
  const [columns, setColumns] = useState<KanbanColumnData[]>(defaultColumns)
  const [loading, setLoading] = useState(false)

  // Fetch tasks from API
  const fetchTasks = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/tasks')
      const data = await response.json()

      if (data.tasks) {
        // Group tasks by status
        const todoTasks = data.tasks
          .filter((t: any) => t.status === 'todo')
          .map((t: any) => ({
            id: t.id,
            title: t.local_path.split('/').pop() || 'Untitled',
            description: `Idea: ${t.idea_id?.substring(0, 8)}...`,
            priority: t.priority,
            assignee: 'Pop', // Default to Pop
            estimatedHours: t.estimated_hours,
            tags: ['开发'],
          }))

        const inProgressTasks = data.tasks
          .filter((t: any) => t.status === 'in_progress')
          .map((t: any) => ({
            id: t.id,
            title: t.local_path.split('/').pop() || 'Untitled',
            description: `Idea: ${t.idea_id?.substring(0, 8)}...`,
            priority: t.priority,
            assignee: 'Pop',
            estimatedHours: t.estimated_hours,
            tags: ['开发'],
          }))

        const doneTasks = data.tasks
          .filter((t: any) => t.status === 'completed')
          .map((t: any) => ({
            id: t.id,
            title: t.local_path.split('/').pop() || 'Untitled',
            description: `Idea: ${t.idea_id?.substring(0, 8)}...`,
            priority: t.priority,
            assignee: 'Pop',
            estimatedHours: t.actual_hours,
            tags: ['完成'],
          }))

        setColumns([
          { ...defaultColumns[0], tasks: todoTasks },
          { ...defaultColumns[1], tasks: inProgressTasks },
          { ...defaultColumns[2], tasks: doneTasks },
        ])
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
        todo: 'todo',
        'in-progress': 'in_progress',
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
    if (refreshTasks) refreshTasks()
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-6">
        <div>
          <h2 className="text-2xl font-semibold">任务看板</h2>
          <p className="text-sm text-muted-foreground">
            追踪所有任务的状态和负责人
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading || isLoading}
          className="gap-2"
        >
          {loading || isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          )}
          刷新
        </Button>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto px-6 pb-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <DndContext onDragEnd={handleDragEnd}>
            <div className="flex gap-6">
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
