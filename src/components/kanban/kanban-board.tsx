'use client'

import { useEffect, useState } from 'react'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { KanbanColumn, KanbanColumnData } from './kanban-column'
import { TaskStats } from './task-stats'
import { Button } from '@/components/ui/button'
import { RefreshCw, Loader2 } from 'lucide-react'
import { NavItemId } from '@/components/sidebar'
import { useI18n } from '@/lib/i18n'
import { useTasks, useUpdateTask } from '@/lib/use-query'
import { TaskCardData } from './task-card'

export { type TaskCardData }

interface KanbanBoardProps {
  onTabChange?: (tab: NavItemId) => void
}

export function KanbanBoard({ onTabChange }: KanbanBoardProps) {
  const { t } = useI18n()
  const { data: tasks = [], isLoading, refetch } = useTasks()
  const updateTask = useUpdateTask()
  
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')

  const getDefaultColumns = (): KanbanColumnData[] => [
    { id: 'recurring', title: t('tasks.recurring'), tasks: [], color: '#a855f7' },
    { id: 'backlog', title: t('tasks.backlog'), tasks: [], color: '#6b7280' },
    { id: 'in-progress', title: t('tasks.inProgress'), tasks: [], color: '#3b82f6' },
    { id: 'review', title: t('tasks.review'), tasks: [], color: '#eab308' },
    { id: 'done', title: t('tasks.done'), tasks: [], color: '#22c55e' },
  ]

  // Transform tasks into card data
  const transformTask = (task: any): TaskCardData => ({
    id: task.id,
    title: task.local_path?.split('/').pop() || 'Untitled',
    description: task.idea_id ? `Idea: ${task.idea_id.substring(0, 8)}...` : undefined,
    priority: task.priority || 'medium',
    assignee: 'Pop' as const,
    estimatedHours: task.estimated_hours,
    tags: ['开发'],
    project: 'Mission Control',
    createdAt: task.created_at || new Date().toISOString(),
  })

  // Group tasks by status
  const columns: KanbanColumnData[] = getDefaultColumns().map((col) => {
    const statusMap: Record<string, string> = {
      recurring: 'todo',
      backlog: 'todo',
      'in-progress': 'in_progress',
      review: 'in_progress',
      done: 'completed',
    }
    
    const columnTasks = tasks
      .filter((t) => statusMap[col.id] === mapStatus(t.status))
      .map(transformTask)
    
    return { ...col, tasks: columnTasks }
  })

  // Map API status to column
  function mapStatus(status: string): string {
    switch (status) {
      case 'todo': return 'todo'
      case 'in_progress': return 'in_progress'
      case 'completed': return 'completed'
      default: return 'todo'
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find source and target columns
    const sourceColumn = columns.find((col) => col.tasks.some((t) => t.id === activeId))
    const targetColumn = columns.find((col) => col.id === overId)

    if (!sourceColumn || !targetColumn) return

    // Map column to API status
    const statusMap: Record<string, string> = {
      recurring: 'todo',
      backlog: 'todo',
      'in-progress': 'in_progress',
      review: 'in_progress',
      done: 'completed',
    }

    // Optimistic update via React Query mutation
    updateTask.mutate({
      taskId: activeId,
      updates: { status: statusMap[targetColumn.id] as any },
    })
  }

  const handleRefresh = () => refetch()
  const handleNewTask = () => console.log('New task')

  // Filter tasks based on assignee and project
  const filteredColumns = columns.map((col) => ({
    ...col,
    tasks: col.tasks.filter((task) => {
      if (assigneeFilter !== 'all' && task.assignee !== assigneeFilter) return false
      // Add project filter logic here if needed
      return true
    }),
  }))

  const allTasks = filteredColumns.flatMap((col) => col.tasks)
  const stats = {
    thisWeek: allTasks.length,
    inProgress: filteredColumns.find((c) => c.id === 'in-progress')?.tasks.length || 0,
    total: allTasks.length,
    completion: allTasks.length > 0 
      ? Math.round((filteredColumns.find((c) => c.id === 'done')?.tasks.length || 0) / allTasks.length * 100)
      : 0,
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-semibold">{t('tasks.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('tasks.subtitle')}</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading} className="gap-2">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {t('common.refresh')}
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
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <DndContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4 h-full">
              {filteredColumns.map((column) => (
                <KanbanColumn key={column.id} column={column} />
              ))}
            </div>
          </DndContext>
        )}
      </div>
    </div>
  )
}
