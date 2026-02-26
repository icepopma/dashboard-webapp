'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Loader2, Calendar, User, Clock, Trash2, 
  CheckCircle2, Play, Ban, Circle, AlertTriangle
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

interface TaskDetailDialogProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onTaskUpdated: () => void
  onTaskDeleted: () => void
}

const statusConfig = {
  todo: { icon: Circle, color: 'text-gray-400', bg: 'bg-gray-500/10', label: '待办' },
  in_progress: { icon: Play, color: 'text-blue-400', bg: 'bg-blue-500/10', label: '进行中' },
  done: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10', label: '已完成' },
  blocked: { icon: Ban, color: 'text-red-400', bg: 'bg-red-500/10', label: '阻塞' },
}

const priorityConfig = {
  high: { color: 'text-red-400', bg: 'bg-red-500/10', label: '高' },
  medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: '中' },
  low: { color: 'text-green-400', bg: 'bg-green-500/10', label: '低' },
}

export function TaskDetailDialog({ 
  task, 
  open, 
  onOpenChange, 
  onTaskUpdated,
  onTaskDeleted 
}: TaskDetailDialogProps) {
  const [loading, setLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo' as 'todo' | 'in_progress' | 'done' | 'blocked',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assignee: '',
    due_date: '',
  })

  // 当任务改变时更新表单
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        assignee: task.assignee || '',
        due_date: task.due_date ? task.due_date.split('T')[0] : '',
      })
    }
    setDeleteConfirm(false)
  }, [task])

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

      onTaskUpdated()
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

    if (!deleteConfirm) {
      setDeleteConfirm(true)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete task')

      onTaskDeleted()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to delete task:', error)
      alert('删除任务失败')
    } finally {
      setLoading(false)
      setDeleteConfirm(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!task) return null

  const StatusIcon = statusConfig[task.status].icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <StatusIcon className={cn("h-5 w-5", statusConfig[task.status].color)} />
              任务详情
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge className={cn(priorityConfig[task.priority].bg, priorityConfig[task.priority].color)}>
                {priorityConfig[task.priority].label}优先级
              </Badge>
            </div>
          </div>
          <DialogDescription>
            编辑任务信息或更改状态
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* 任务标题 */}
          <div className="grid gap-2">
            <Label htmlFor="edit-title">任务标题 *</Label>
            <Input
              id="edit-title"
              placeholder="任务标题"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* 任务描述 */}
          <div className="grid gap-2">
            <Label htmlFor="edit-description">任务描述</Label>
            <Textarea
              id="edit-description"
              placeholder="详细描述任务内容..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* 状态和优先级 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
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
                      <Circle className="h-4 w-4 text-gray-400" />
                      待办
                    </div>
                  </SelectItem>
                  <SelectItem value="in_progress">
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4 text-blue-400" />
                      进行中
                    </div>
                  </SelectItem>
                  <SelectItem value="done">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      已完成
                    </div>
                  </SelectItem>
                  <SelectItem value="blocked">
                    <div className="flex items-center gap-2">
                      <Ban className="h-4 w-4 text-red-400" />
                      阻塞
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
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
                      <span className="text-red-400">🔴</span>
                      高
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400">🟡</span>
                      中
                    </div>
                  </SelectItem>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">🟢</span>
                      低
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 负责人和截止日期 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-assignee">负责人</Label>
              <Input
                id="edit-assignee"
                placeholder="例如：Pop, Matt"
                value={formData.assignee}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-due_date">截止日期</Label>
              <div className="relative">
                <Input
                  id="edit-due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="pr-10"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {/* 元数据 */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              创建: {formatDate(task.created_at)}
            </div>
            <div className="flex items-center gap-1">
              更新: {formatDate(task.updated_at)}
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          {/* 删除按钮 */}
          <Button 
            variant={deleteConfirm ? "destructive" : "outline"} 
            size="sm"
            onClick={handleDelete}
            disabled={loading}
          >
            {deleteConfirm ? (
              <>
                <AlertTriangle className="h-4 w-4 mr-2" />
                确认删除?
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                删除
              </>
            )}
          </Button>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!formData.title.trim() || loading}
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              保存更改
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
