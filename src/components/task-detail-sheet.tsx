'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  CheckCircle2, Circle, Clock, Play, Ban, Calendar, User,
  Save, Loader2, X, AlertTriangle, Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'done' | 'blocked'
  priority: 'low' | 'medium' | 'high'
  assignee?: string
  due_date?: string
  created_at: string
  updated_at: string
}

interface TaskDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
  onTaskUpdated?: () => void
  onTaskDeleted?: () => void
}

export function TaskDetailSheet({ 
  open, 
  onOpenChange, 
  task, 
  onTaskUpdated,
  onTaskDeleted 
}: TaskDetailSheetProps) {
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo' as 'todo' | 'in_progress' | 'done' | 'blocked',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assignee: '',
    due_date: '',
  })
  const [hasChanges, setHasChanges] = useState(false)

  // 初始化表单数据
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        assignee: task.assignee || '',
        due_date: task.due_date ? task.due_date.split('T')[0] : '',
      })
      setHasChanges(false)
    }
  }, [task])

  // 检测变化
  useEffect(() => {
    if (task) {
      const changed = 
        formData.title !== task.title ||
        formData.description !== (task.description || '') ||
        formData.status !== task.status ||
        formData.priority !== task.priority ||
        formData.assignee !== (task.assignee || '') ||
        formData.due_date !== (task.due_date ? task.due_date.split('T')[0] : '')
      setHasChanges(changed)
    }
  }, [formData, task])

  const handleSubmit = async () => {
    if (!task || !formData.title.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          status: formData.status,
          priority: formData.priority,
          assignee: formData.assignee || null,
          due_date: formData.due_date || null,
        }),
      })

      if (!response.ok) throw new Error('Failed to update task')

      onTaskUpdated?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to update task:', error)
      alert('更新任务失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!task) return

    setDeleteLoading(true)
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete task')

      onTaskDeleted?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to delete task:', error)
      alert('删除任务失败')
    } finally {
      setDeleteLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'todo':
        return { icon: Circle, color: 'text-gray-400', bg: 'bg-gray-500/10', label: '待办' }
      case 'in_progress':
        return { icon: Play, color: 'text-blue-400', bg: 'bg-blue-500/10', label: '进行中' }
      case 'done':
        return { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10', label: '已完成' }
      case 'blocked':
        return { icon: Ban, color: 'text-red-400', bg: 'bg-red-500/10', label: '阻塞' }
      default:
        return { icon: Circle, color: 'text-gray-400', bg: 'bg-gray-500/10', label: status }
    }
  }

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

  if (!task) return null

  const statusConfig = getStatusConfig(formData.status)
  const priorityConfig = getPriorityConfig(formData.priority)
  const StatusIcon = statusConfig.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StatusIcon className={cn("h-5 w-5", statusConfig.color)} />
              <DialogTitle className="text-lg">编辑任务</DialogTitle>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            创建于 {new Date(task.created_at).toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 标题 */}
          <div className="space-y-2">
            <Label htmlFor="title">标题 *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="任务标题"
            />
          </div>

          {/* 描述 */}
          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="详细描述..."
              rows={3}
            />
          </div>

          {/* 状态和优先级 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>状态</Label>
              <Select
                value={formData.status}
                onValueChange={(value: typeof formData.status) => 
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">
                    <div className="flex items-center gap-2">
                      <Circle className="h-3 w-3 text-gray-400" />
                      待办
                    </div>
                  </SelectItem>
                  <SelectItem value="in_progress">
                    <div className="flex items-center gap-2">
                      <Play className="h-3 w-3 text-blue-400" />
                      进行中
                    </div>
                  </SelectItem>
                  <SelectItem value="done">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-400" />
                      已完成
                    </div>
                  </SelectItem>
                  <SelectItem value="blocked">
                    <div className="flex items-center gap-2">
                      <Ban className="h-3 w-3 text-red-400" />
                      阻塞
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>优先级</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: typeof formData.priority) => 
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      高
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      中
                    </div>
                  </SelectItem>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      低
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 负责人和截止日期 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignee">负责人</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="assignee"
                  value={formData.assignee}
                  onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                  placeholder="负责人"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">截止日期</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {/* 当前状态预览 */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
            <span className="text-sm text-muted-foreground">当前状态：</span>
            <Badge className={cn(statusConfig.bg, statusConfig.color, "border-0")}>
              {statusConfig.label}
            </Badge>
            <Badge className={cn(priorityConfig.bg, priorityConfig.color, "border-0")}>
              {priorityConfig.label}优先级
            </Badge>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              {showDeleteConfirm ? (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-500">确认删除？</span>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      '确认'
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    取消
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  删除任务
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                取消
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.title.trim() || !hasChanges || loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                保存
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
