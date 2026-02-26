'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle2, Circle, Clock, AlertTriangle, Plus, RotateCcw,
  Filter, LayoutGrid, List, ArrowUpDown, Calendar, User,
  ChevronDown, ChevronRight, Play, Pause, Ban, AlertCircle,
  Sunrise, UserCircle, GripVertical, CheckSquare, Square, X as XIcon, Trash2
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { CreateProjectTaskDialog } from '@/components/create-project-task-dialog'
import { TaskDetailDialog } from '@/components/task-detail-dialog'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core'
import {
  useSortable,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'done' | 'blocked'
  priority: 'low' | 'medium' | 'high'
  assignee?: string
  idea_id?: string
  due_date?: string
  created_at: string
  updated_at: string
}

type ViewMode = 'kanban' | 'list'
type SortBy = 'priority' | 'due_date' | 'created_at' | 'status'
type SmartFilter = 'all' | 'today' | 'overdue' | 'mine'

export function TasksView() {
  const { t } = useI18n()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('kanban')
  const [sortBy, setSortBy] = useState<SortBy>('priority')
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [smartFilter, setSmartFilter] = useState<SmartFilter>('all')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  
  // 批量选择状态
  const [batchMode, setBatchMode] = useState(false)
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set())
  const [batchLoading, setBatchLoading] = useState(false)

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 需要移动 5px 才开始拖拽，避免误触
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks')
      const data = await res.json()
      setTasks(data.tasks || [])
    } catch (err) {
      console.error('Failed to fetch tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  // 状态统计
  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    done: tasks.filter(t => t.status === 'done').length,
    blocked: tasks.filter(t => t.status === 'blocked').length,
  }

  const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0

  // 智能筛选计算
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const smartStats = {
    total: tasks.length,
    today: tasks.filter(t => {
      if (!t.due_date || t.status === 'done') return false
      const due = new Date(t.due_date)
      return due >= today && due < tomorrow
    }).length,
    overdue: tasks.filter(t => {
      if (!t.due_date || t.status === 'done') return false
      return new Date(t.due_date) < today
    }).length,
    mine: tasks.filter(t => t.assignee === 'me' || t.assignee === 'pop').length,
  }

  // 应用智能筛选
  const getFilteredBySmart = () => {
    if (smartFilter === 'today') {
      return tasks.filter(t => {
        if (!t.due_date || t.status === 'done') return false
        const due = new Date(t.due_date)
        return due >= today && due < tomorrow
      })
    } else if (smartFilter === 'overdue') {
      return tasks.filter(t => {
        if (!t.due_date || t.status === 'done') return false
        return new Date(t.due_date) < today
      })
    } else if (smartFilter === 'mine') {
      return tasks.filter(t => t.assignee === 'me' || t.assignee === 'pop')
    }
    return tasks
  }

  const filteredBySmart = getFilteredBySmart()
  const filteredTasks = filterStatus 
    ? filteredBySmart.filter(t => t.status === filterStatus)
    : filteredBySmart

  // 获取状态配置
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'todo':
        return { 
          icon: Circle, 
          color: 'text-gray-400', 
          bg: 'bg-gray-500/10',
          border: 'border-gray-500/20',
          label: t('tasks.backlog')
        }
      case 'in_progress':
        return { 
          icon: Play, 
          color: 'text-blue-400', 
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/20',
          label: t('tasks.inProgress')
        }
      case 'done':
        return { 
          icon: CheckCircle2, 
          color: 'text-green-400', 
          bg: 'bg-green-500/10',
          border: 'border-green-500/20',
          label: t('tasks.done')
        }
      case 'blocked':
        return { 
          icon: Ban, 
          color: 'text-red-400', 
          bg: 'bg-red-500/10',
          border: 'border-red-500/20',
          label: t('tasks.blocked')
        }
      default:
        return { 
          icon: Circle, 
          color: 'text-gray-400', 
          bg: 'bg-gray-500/10',
          border: 'border-gray-500/20',
          label: status
        }
    }
  }

  // 获取优先级配置
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high':
        return { color: 'text-red-400', bg: 'bg-red-500/10', label: '高' }
      case 'medium':
        return { color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: '中' }
      case 'low':
        return { color: 'text-green-400', bg: 'bg-green-500/10', label: '低' }
      default:
        return { color: 'text-gray-400', bg: 'bg-gray-500/10', label: priority }
    }
  }

  // 排序任务
  const sortTasks = (taskList: Task[]) => {
    return [...taskList].sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 }
          return priorityOrder[a.priority] - priorityOrder[b.priority]
        case 'due_date':
          if (!a.due_date) return 1
          if (!b.due_date) return -1
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'status':
          const statusOrder = { in_progress: 0, todo: 1, blocked: 2, done: 3 }
          return statusOrder[a.status] - statusOrder[b.status]
        default:
          return 0
      }
    })
  }

  const sortedTasks = sortTasks(filteredTasks)

  // 按状态分组（用于看板视图）- 使用智能筛选后的任务
  const tasksByStatus = {
    todo: sortTasks(filteredTasks.filter(t => t.status === 'todo')),
    in_progress: sortTasks(filteredTasks.filter(t => t.status === 'in_progress')),
    done: sortTasks(filteredTasks.filter(t => t.status === 'done')),
    blocked: sortTasks(filteredTasks.filter(t => t.status === 'blocked')),
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  // 更新任务状态
  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      fetchTasks()
    } catch (err) {
      console.error('Failed to update task:', err)
    }
  }

  // 点击任务卡片
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setDetailOpen(true)
  }

  // DnD handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = tasks.find(t => t.id === active.id)
    if (task) {
      setActiveTask(task)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId = active.id as string
    const newStatus = over.id as string

    // 如果拖到另一个列（状态）
    if (['todo', 'in_progress', 'done', 'blocked'].includes(newStatus)) {
      const currentTask = tasks.find(t => t.id === taskId)
      if (currentTask && currentTask.status !== newStatus) {
        updateTaskStatus(taskId, newStatus)
      }
    }
  }

  // 批量选择切换
  const toggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds(prev => {
      const updated = new Set(prev)
      if (updated.has(taskId)) {
        updated.delete(taskId)
      } else {
        updated.add(taskId)
      }
      return updated
    })
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedTaskIds.size === filteredTasks.length) {
      setSelectedTaskIds(new Set())
    } else {
      setSelectedTaskIds(new Set(filteredTasks.map(t => t.id)))
    }
  }

  // 批量操作
  const handleBatchAction = async (action: 'update_status' | 'update_priority' | 'delete', value?: string) => {
    if (selectedTaskIds.size === 0) return
    
    setBatchLoading(true)
    try {
      const response = await fetch('/api/tasks/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskIds: Array.from(selectedTaskIds),
          action,
          value
        })
      })

      if (!response.ok) throw new Error('Batch operation failed')

      const result = await response.json()
      
      // 清除选择
      setSelectedTaskIds(new Set())
      setBatchMode(false)
      
      // 刷新任务列表
      fetchTasks()
    } catch (err) {
      console.error('Batch operation failed:', err)
      alert('批量操作失败')
    } finally {
      setBatchLoading(false)
    }
  }

  // 可拖拽的任务卡片
  const DraggableTaskCard = ({ task, statusConfig }: { task: Task; statusConfig: ReturnType<typeof getStatusConfig> }) => {
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
      opacity: isDragging ? 0.5 : 1,
    }

    const priorityConfig = getPriorityConfig(task.priority)
    const isSelected = selectedTaskIds.has(task.id)

    return (
      <Card 
        ref={setNodeRef}
        style={style}
        className={cn(
          "border-border/40 shadow-sm hover:shadow-md transition-all cursor-pointer group",
          statusConfig.border,
          isDragging && "shadow-lg ring-2 ring-primary/50",
          isSelected && "ring-2 ring-primary bg-primary/5"
        )}
      >
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            {/* 批量选择复选框 */}
            {batchMode && (
              <button 
                className="mt-0.5 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleTaskSelection(task.id)
                }}
              >
                {isSelected ? (
                  <CheckSquare className="h-4 w-4 text-primary" />
                ) : (
                  <Square className="h-4 w-4 text-muted-foreground hover:text-primary" />
                )}
              </button>
            )}
            {!batchMode && (
              <button 
                className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing mt-0.5"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
            <div className="flex-1" onClick={() => !batchMode && handleTaskClick(task)}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="text-sm font-medium leading-tight flex-1">
                  {task.title}
                </h4>
                <Badge className={cn("text-[10px] px-1.5", priorityConfig.bg, priorityConfig.color)}>
                  {priorityConfig.label}
                </Badge>
              </div>
              
              {task.description && (
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {task.description}
                </p>
              )}
              
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                {task.due_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(task.due_date)}
                  </span>
                )}
                {task.assignee && (
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {task.assignee}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // 看板视图
  const KanbanView = () => (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-4 gap-4 h-full">
        {(['todo', 'in_progress', 'done', 'blocked'] as const).map(status => {
          const config = getStatusConfig(status)
          const columnTasks = tasksByStatus[status]
          const StatusIcon = config.icon
          
          return (
            <div key={status} className="flex flex-col">
              {/* 列标题 */}
              <div className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-t-lg",
                config.bg
              )}>
                <StatusIcon className={cn("h-4 w-4", config.color)} />
                <span className="font-medium text-sm">{config.label}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {columnTasks.length}
                </span>
              </div>
              
              {/* 任务卡片 - Droppable 区域 */}
              <div 
                id={status}
                className="flex-1 overflow-auto space-y-2 p-2 bg-muted/30 rounded-b-lg min-h-[200px]"
              >
                <SortableContext 
                  items={columnTasks.map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {columnTasks.map(task => (
                    <DraggableTaskCard 
                      key={task.id} 
                      task={task} 
                      statusConfig={config}
                    />
                  ))}
                </SortableContext>
                
                {columnTasks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-xs">
                    暂无任务
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Drag Overlay - 拖拽时显示的预览 */}
      <DragOverlay>
        {activeTask ? (
          <Card className="shadow-xl ring-2 ring-primary/50 border-border/40">
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="text-sm font-medium leading-tight flex-1">
                  {activeTask.title}
                </h4>
                <Badge className={cn(
                  "text-[10px] px-1.5", 
                  getPriorityConfig(activeTask.priority).bg, 
                  getPriorityConfig(activeTask.priority).color
                )}>
                  {getPriorityConfig(activeTask.priority).label}
                </Badge>
              </div>
              {activeTask.description && (
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {activeTask.description}
                </p>
              )}
            </CardContent>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  )

  // 列表视图
  const ListView = () => (
    <div className="space-y-2">
      {sortedTasks.map(task => {
        const statusConfig = getStatusConfig(task.status)
        const priorityConfig = getPriorityConfig(task.priority)
        const StatusIcon = statusConfig.icon
        
        return (
          <Card 
            key={task.id}
            className="border-border/40 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleTaskClick(task)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <StatusIcon className={cn("h-5 w-5 flex-shrink-0", statusConfig.color)} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium truncate">{task.title}</h4>
                    <Badge className={cn("text-[10px]", priorityConfig.bg, priorityConfig.color)}>
                      {priorityConfig.label}
                    </Badge>
                  </div>
                  
                  {task.description && (
                    <p className="text-xs text-muted-foreground truncate">
                      {task.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground flex-shrink-0">
                  {task.assignee && (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {task.assignee}
                    </span>
                  )}
                  {task.due_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(task.due_date)}
                    </span>
                  )}
                  <Badge className={cn("text-[10px]", statusConfig.bg, statusConfig.color)}>
                    {statusConfig.label}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
      
      {sortedTasks.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          {t('common.noData')}
        </div>
      )}
    </div>
  )

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-6 pt-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-semibold">{t('tasks.title')}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t('tasks.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchTasks}>
            <RotateCcw className="h-4 w-4 mr-2" />
            {t('common.refresh')}
          </Button>
          <CreateProjectTaskDialog onTaskCreated={fetchTasks} />
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 mb-4 flex-shrink-0">
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{t('tasks.total')}:</span>
            <span className="font-medium">{stats.total}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{t('tasks.inProgress')}:</span>
            <span className="font-medium text-blue-400">{stats.inProgress}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{t('tasks.done')}:</span>
            <span className="font-medium text-green-400">{stats.done}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{t('tasks.completion')}:</span>
            <span className="font-medium">{completionRate}%</span>
          </div>
          {stats.blocked > 0 && (
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span className="text-red-400 font-medium">{stats.blocked} {t('tasks.blocked')}</span>
            </div>
          )}
        </div>
      </div>

      {/* View Controls */}
      <div className="px-6 mb-4 flex items-center justify-between flex-shrink-0 flex-wrap gap-3">
        {/* Smart Filters */}
        <div className="flex items-center gap-2">
          <Button
            variant={smartFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSmartFilter('all')}
          >
            全部
            <Badge variant="secondary" className="ml-2 text-[10px]">{smartStats.total}</Badge>
          </Button>
          <Button
            variant={smartFilter === 'today' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSmartFilter('today')}
            className={smartStats.today > 0 ? 'border-orange-500/50' : ''}
          >
            <Sunrise className="h-4 w-4 mr-1" />
            今日
            {smartStats.today > 0 && (
              <Badge variant="secondary" className="ml-2 text-[10px] bg-orange-500/20 text-orange-500">{smartStats.today}</Badge>
            )}
          </Button>
          <Button
            variant={smartFilter === 'overdue' ? 'destructive' : 'outline'}
            size="sm"
            onClick={() => setSmartFilter('overdue')}
            className={smartStats.overdue > 0 ? 'border-red-500' : ''}
          >
            <AlertCircle className="h-4 w-4 mr-1" />
            逾期
            {smartStats.overdue > 0 && (
              <Badge variant="secondary" className="ml-2 text-[10px] bg-red-500/20 text-red-500">{smartStats.overdue}</Badge>
            )}
          </Button>
          <Button
            variant={smartFilter === 'mine' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSmartFilter('mine')}
          >
            <UserCircle className="h-4 w-4 mr-1" />
            我的
            {smartStats.mine > 0 && (
              <Badge variant="secondary" className="ml-2 text-[10px]">{smartStats.mine}</Badge>
            )}
          </Button>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={batchMode ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setBatchMode(!batchMode)
              setSelectedTaskIds(new Set())
            }}
          >
            <CheckSquare className="h-4 w-4 mr-2" />
            批量
          </Button>
          <Button
            variant={viewMode === 'kanban' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('kanban')}
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            {t('tasks.viewKanban')}
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4 mr-2" />
            {t('tasks.viewList')}
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={filterStatus || ''}
            onChange={(e) => setFilterStatus(e.target.value || null)}
            className="text-sm bg-background border border-border rounded px-2 py-1"
          >
            <option value="">{t('common.all')}</option>
            <option value="todo">{t('tasks.backlog')}</option>
            <option value="in_progress">{t('tasks.inProgress')}</option>
            <option value="done">{t('tasks.done')}</option>
            <option value="blocked">{t('tasks.blocked')}</option>
          </select>
          
          <ArrowUpDown className="h-4 w-4 text-muted-foreground ml-2" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="text-sm bg-background border border-border rounded px-2 py-1"
          >
            <option value="priority">优先级</option>
            <option value="due_date">截止日期</option>
            <option value="created_at">创建时间</option>
            <option value="status">状态</option>
          </select>
        </div>
      </div>

      {/* Batch Action Bar */}
      {batchMode && selectedTaskIds.size > 0 && (
        <div className="px-6 mb-4 flex-shrink-0">
          <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">
                已选择 {selectedTaskIds.size} 个任务
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTaskIds(new Set())}
              >
                <XIcon className="h-3 w-3 mr-1" />
                取消选择
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <select
                className="text-sm bg-background border border-border rounded px-2 py-1"
                onChange={(e) => {
                  if (e.target.value) {
                    handleBatchAction('update_status', e.target.value)
                    e.target.value = ''
                  }
                }}
                disabled={batchLoading}
              >
                <option value="">改状态...</option>
                <option value="todo">待办</option>
                <option value="in_progress">进行中</option>
                <option value="done">已完成</option>
                <option value="blocked">阻塞</option>
              </select>
              <select
                className="text-sm bg-background border border-border rounded px-2 py-1"
                onChange={(e) => {
                  if (e.target.value) {
                    handleBatchAction('update_priority', e.target.value)
                    e.target.value = ''
                  }
                }}
                disabled={batchLoading}
              >
                <option value="">改优先级...</option>
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirm(`确定删除 ${selectedTaskIds.size} 个任务？`)) {
                    handleBatchAction('delete')
                  }
                }}
                disabled={batchLoading}
              >
                {batchLoading ? (
                  <RotateCcw className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-1" />
                )}
                删除
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-auto">
        {viewMode === 'kanban' ? <KanbanView /> : <ListView />}
      </div>

      {/* Task Detail Dialog */}
      <TaskDetailDialog
        task={selectedTask}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onTaskUpdated={fetchTasks}
        onTaskDeleted={fetchTasks}
      />
    </div>
  )
}
