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
  CheckCircle2, Play, Ban, Circle, AlertTriangle, Plus, ListTodo, X as XIcon, History, MessageSquare, Send
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

interface Subtask {
  id: string
  task_id: string
  title: string
  status: 'todo' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  assignee?: string
  order_index: number
  created_at: string
}

interface TaskLog {
  id: string
  task_id: string
  action: string
  field?: string
  old_value?: string
  new_value?: string
  actor?: string
  created_at: string
}

interface TaskComment {
  id: string
  task_id: string
  content: string
  author?: string
  mentions: string[]
  created_at: string
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
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [subtaskLoading, setSubtaskLoading] = useState(false)
  const [logs, setLogs] = useState<TaskLog[]>([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [comments, setComments] = useState<TaskComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)

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
      fetchSubtasks()
      fetchLogs()
      fetchComments()
    }
    setDeleteConfirm(false)
  }, [task])

  // 获取子任务
  const fetchSubtasks = async () => {
    if (!task) return
    try {
      const res = await fetch(`/api/tasks/${task.id}/subtasks`)
      const data = await res.json()
      setSubtasks(data.subtasks || [])
    } catch (err) {
      console.error('Failed to fetch subtasks:', err)
    }
  }

  // 获取操作日志
  const fetchLogs = async () => {
    if (!task) return
    setLogsLoading(true)
    try {
      const res = await fetch(`/api/tasks/${task.id}/logs`)
      const data = await res.json()
      setLogs(data.logs || [])
    } catch (err) {
      console.error('Failed to fetch logs:', err)
    } finally {
      setLogsLoading(false)
    }
  }

  // 获取评论
  const fetchComments = async () => {
    if (!task) return
    try {
      const res = await fetch(`/api/tasks/${task.id}/comments`)
      const data = await res.json()
      setComments(data.comments || [])
    } catch (err) {
      console.error('Failed to fetch comments:', err)
    }
  }

  // 添加评论
  const handleAddComment = async () => {
    if (!task || !newComment.trim()) return
    setCommentLoading(true)
    try {
      await fetch(`/api/tasks/${task.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment, author: 'Matt' }),
      })
      setNewComment('')
      fetchComments()
    } catch (err) {
      console.error('Failed to add comment:', err)
    } finally {
      setCommentLoading(false)
    }
  }

  // 添加子任务
  const handleAddSubtask = async () => {
    if (!task || !newSubtaskTitle.trim()) return
    setSubtaskLoading(true)
    try {
      await fetch(`/api/tasks/${task.id}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newSubtaskTitle }),
      })
      setNewSubtaskTitle('')
      fetchSubtasks()
    } catch (err) {
      console.error('Failed to add subtask:', err)
    } finally {
      setSubtaskLoading(false)
    }
  }

  // 切换子任务状态
  const handleToggleSubtask = async (subtaskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done'
    try {
      await fetch(`/api/subtasks/${subtaskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      fetchSubtasks()
    } catch (err) {
      console.error('Failed to toggle subtask:', err)
    }
  }

  // 删除子任务
  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      await fetch(`/api/subtasks/${subtaskId}`, { method: 'DELETE' })
      fetchSubtasks()
    } catch (err) {
      console.error('Failed to delete subtask:', err)
    }
  }

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

          {/* 子任务 */}
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center gap-2">
              <ListTodo className="h-4 w-4 text-purple-500" />
              <Label className="text-sm font-medium">子任务</Label>
              <Badge variant="outline" className="text-[10px]">
                {subtasks.filter(s => s.status === 'done').length}/{subtasks.length}
              </Badge>
            </div>

            {/* 添加子任务 */}
            <div className="flex gap-2">
              <Input
                placeholder="添加子任务..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                className="flex-1"
              />
              <Button size="sm" onClick={handleAddSubtask} disabled={!newSubtaskTitle.trim() || subtaskLoading}>
                {subtaskLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>

            {/* 子任务列表 */}
            <div className="space-y-2 max-h-48 overflow-auto">
              {subtasks.map((subtask) => (
                <div 
                  key={subtask.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <button
                    onClick={() => handleToggleSubtask(subtask.id, subtask.status)}
                    className="flex-shrink-0"
                  >
                    {subtask.status === 'done' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-400 hover:text-gray-500" />
                    )}
                  </button>
                  <span className={cn(
                    "flex-1 text-sm",
                    subtask.status === 'done' && "line-through text-muted-foreground"
                  )}>
                    {subtask.title}
                  </span>
                  <button
                    onClick={() => handleDeleteSubtask(subtask.id)}
                    className="opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <XIcon className="h-3 w-3 text-red-500" />
                  </button>
                </div>
              ))}
              {subtasks.length === 0 && (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  暂无子任务
                </div>
              )}
            </div>
          </div>

          {/* 操作历史 */}
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-orange-500" />
              <Label className="text-sm font-medium">操作历史</Label>
            </div>

            {logsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-auto">
                {logs.map((log) => (
                  <div 
                    key={log.id}
                    className="flex items-start gap-2 p-2 rounded-lg bg-muted/30 text-sm"
                  >
                    <Clock className="h-3 w-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {log.action === 'created' && '创建任务'}
                          {log.action === 'status_changed' && '状态变更'}
                          {log.action === 'priority_changed' && '优先级变更'}
                          {log.action === 'assignee_changed' && '负责人变更'}
                          {log.action === 'title_changed' && '标题修改'}
                        </span>
                        {log.old_value && log.new_value && (
                          <span className="text-xs text-muted-foreground">
                            {log.old_value} → {log.new_value}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {new Date(log.created_at).toLocaleString('zh-CN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {log.actor && ` · ${log.actor}`}
                      </div>
                    </div>
                  </div>
                ))}
                {logs.length === 0 && (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    暂无操作记录
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 评论区 */}
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <Label className="text-sm font-medium">评论</Label>
              <Badge variant="outline" className="text-[10px]">
                {comments.length}
              </Badge>
            </div>

            {/* 评论列表 */}
            <div className="space-y-2 max-h-48 overflow-auto">
              {comments.map((comment) => (
                <div 
                  key={comment.id}
                  className="p-2.5 rounded-lg bg-muted/30"
                >
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs flex-shrink-0">
                      {comment.author?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{comment.author || '匿名'}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(comment.created_at).toLocaleString('zh-CN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {comment.content}
                      </p>
                      {comment.mentions && comment.mentions.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {comment.mentions.map((mention) => (
                            <span key={mention} className="text-[10px] text-blue-500">
                              @{mention}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  暂无评论
                </div>
              )}
            </div>

            {/* 添加评论 */}
            <div className="flex gap-2">
              <Input
                placeholder="添加评论... (@ 提及)"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
                className="flex-1"
              />
              <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim() || commentLoading}>
                {commentLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
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
