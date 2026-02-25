'use client'

import { useEffect, useState } from 'react'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { KanbanColumn, KanbanColumnData } from './kanban-column'
import { TaskStats } from './task-stats'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  RefreshCw, Loader2, LayoutGrid, List, GanttChart, GitBranch,
  Sparkles, CheckSquare, X, Check
} from 'lucide-react'
import { NavItemId } from '@/components/sidebar'
import { useI18n } from '@/lib/i18n'
import { DependencyGraph } from '@/components/dependency-graph'

export interface SubTask {
  id: string
  title: string
  completed: boolean
}

export interface TaskCardData {
  id: string
  title: string
  description?: string
  priority: 'high' | 'medium' | 'low'
  assignee: 'Matt' | 'Pop'
  estimatedHours?: number
  actualHours?: number
  tags?: string[]
  createdAt?: string
  project?: string
  subtasks?: SubTask[]
  dependencies?: string[]
  blockedBy?: string[]
}

type ViewMode = 'kanban' | 'list' | 'gantt' | 'dependency'

interface KanbanBoardProps {
  onTabChange?: (tab: NavItemId) => void
}

export function KanbanBoard({ onTabChange }: KanbanBoardProps) {
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const [viewMode, setViewMode] = useState<ViewMode>('kanban')
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [showAISplit, setShowAISplit] = useState(false)

  const getDefaultColumns = (): KanbanColumnData[] => [
    {
      id: 'recurring',
      title: t('tasks.recurring'),
      tasks: [],
      color: '#a855f7',
    },
    {
      id: 'backlog',
      title: t('tasks.backlog'),
      tasks: [],
      color: '#6b7280',
    },
    {
      id: 'in-progress',
      title: t('tasks.inProgress'),
      tasks: [],
      color: '#3b82f6',
    },
    {
      id: 'paused',
      title: t('tasks.paused') || '暂停',
      tasks: [],
      color: '#f97316',
    },
    {
      id: 'blocked',
      title: t('tasks.blocked') || '阻塞',
      tasks: [],
      color: '#ef4444',
    },
    {
      id: 'review',
      title: t('tasks.review'),
      tasks: [],
      color: '#eab308',
    },
    {
      id: 'done',
      title: t('tasks.done'),
      tasks: [],
      color: '#22c55e',
    },
  ]

  const [columns, setColumns] = useState<KanbanColumnData[]>(getDefaultColumns)

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/tasks')
      const data = await response.json()

      if (data.tasks) {
        const statusMap: Record<string, string> = {
          todo: 'backlog',
          in_progress: 'in-progress',
          completed: 'done',
        }

        const newColumns = getDefaultColumns().map((col) => ({
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

    const sourceColumnIndex = columns.findIndex((col) =>
      col.tasks.some((task) => task.id === activeId)
    )
    const targetColumnIndex = columns.findIndex((col) => col.id === overId)

    if (sourceColumnIndex === -1 || targetColumnIndex === -1) return

    const [movedTask] = columns[sourceColumnIndex].tasks.splice(
      columns[sourceColumnIndex].tasks.findIndex((t) => t.id === activeId),
      1
    )
    columns[targetColumnIndex].tasks.push(movedTask)
    setColumns([...columns])

    try {
      const statusMap: Record<string, string> = {
        recurring: 'todo',
        backlog: 'todo',
        'in-progress': 'in_progress',
        paused: 'in_progress',
        blocked: 'in_progress',
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
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleRefresh = () => fetchTasks()
  const handleNewTask = () => console.log('New task')

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
  }

  const handleBulkStatusChange = (status: string) => {
    console.log('Bulk change to:', status, selectedTasks)
    setSelectedTasks([])
  }

  const handleAISplit = (taskId: string) => {
    console.log('AI split task:', taskId)
    setShowAISplit(false)
  }

  const allTasks = columns.flatMap((col) => col.tasks)
  const stats = {
    thisWeek: allTasks.length,
    inProgress: columns.find((c) => c.id === 'in-progress')?.tasks.length || 0,
    total: allTasks.length,
    completion: allTasks.length > 0 
      ? Math.round((columns.find((c) => c.id === 'done')?.tasks.length || 0) / allTasks.length * 100)
      : 0,
  }

  const viewModeButtons = [
    { id: 'kanban', icon: LayoutGrid, label: t('tasks.viewKanban') || '看板' },
    { id: 'list', icon: List, label: t('tasks.viewList') || '列表' },
    { id: 'gantt', icon: GanttChart, label: t('tasks.viewGantt') || '甘特图' },
    { id: 'dependency', icon: GitBranch, label: t('tasks.viewDependency') || '依赖图' },
  ]

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 px-4 sm:px-6 flex-shrink-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold">{t('tasks.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('tasks.subtitle')}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex border border-border rounded-lg overflow-hidden">
            {viewModeButtons.map((btn) => {
              const Icon = btn.icon
              return (
                <button
                  key={btn.id}
                  onClick={() => setViewMode(btn.id as ViewMode)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    viewMode === btn.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted/30 hover:bg-muted/50 text-muted-foreground'
                  }`}
                  title={btn.label}
                >
                  <Icon className="h-4 w-4" />
                </button>
              )
            })}
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowAISplit(!showAISplit)}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            AI 拆分
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={loading} 
            className="gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {t('common.refresh')}
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedTasks.length > 0 && (
        <div className="px-4 sm:px-6 mb-2 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 p-2 bg-primary/10 rounded-lg border border-primary/20 overflow-x-auto">
            <Badge variant="secondary">{selectedTasks.length} 已选</Badge>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={() => handleBulkStatusChange('in-progress')}>
                开始
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkStatusChange('paused')}>
                暂停
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkStatusChange('done')}>
                完成
              </Button>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setSelectedTasks([])}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="px-4 sm:px-6 mb-4 flex-shrink-0">
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
      <div className="flex-1 overflow-x-auto px-4 sm:px-6 pb-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          </div>
        ) : viewMode === 'kanban' ? (
          <DndContext onDragEnd={handleDragEnd}>
            <div className="flex gap-3 h-full min-w-max sm:min-w-0">
              {columns.map((column) => (
                <KanbanColumn 
                  key={column.id} 
                  column={column}
                  selectedTasks={selectedTasks}
                  onTaskSelect={toggleTaskSelection}
                  onAISplit={handleAISplit}
                />
              ))}
            </div>
          </DndContext>
        ) : viewMode === 'list' ? (
          <div className="space-y-2">
            {allTasks.map(task => (
              <div 
                key={task.id}
                className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 cursor-pointer"
              >
                <input 
                  type="checkbox"
                  checked={selectedTasks.includes(task.id)}
                  onChange={() => toggleTaskSelection(task.id)}
                  className="rounded"
                />
                <div className="flex-1">
                  <div className="font-medium text-sm">{task.title}</div>
                  {task.description && (
                    <div className="text-xs text-muted-foreground">{task.description}</div>
                  )}
                </div>
                <Badge variant="outline">{task.priority}</Badge>
                <span className="text-xs text-muted-foreground">{task.assignee}</span>
                {task.estimatedHours && <span className="text-xs">{task.estimatedHours}h</span>}
              </div>
            ))}
          </div>
        ) : viewMode === 'gantt' ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <GanttChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-base font-medium">{t('tasks.ganttComingSoon') || '甘特图视图开发中'}</p>
              <p className="text-sm mt-1">即将支持时间线可视化</p>
            </div>
          </div>
        ) : viewMode === 'dependency' ? (
          <div className="h-full border border-border/60 rounded-lg overflow-hidden">
            <DependencyGraph />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-base font-medium">{t('tasks.dependencyComingSoon') || '依赖图视图开发中'}</p>
              <p className="text-sm mt-1">即将支持任务依赖关系可视化</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
