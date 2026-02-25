'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  FolderKanban, Plus, CheckCircle2, Users, LayoutGrid, List, GanttChart, Flag, Calendar, Archive,
  ArrowLeft, Settings, Trash2, MoreHorizontal, Clock, FileText, GitBranch
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface Project {
  id: string
  name: string
  description: string
  status: 'active' | 'archived' | 'planning'
  progress: number
  tasks: { total: number; completed: number }
  members: string[]
  milestones: { title: string; date: string; completed: boolean }[]
  color: string
  createdAt: string
  updatedAt: string
}

const mockProject: Project = {
  id: '1',
  name: 'Dashboard Webapp',
  description: 'Idea 管理可视化工具，帮助超级个体管理想法、任务和内容',
  status: 'active',
  progress: 30,
  tasks: { total: 44, completed: 13 },
  members: ['Pop', 'Codex', 'Quill'],
  color: '#8b5cf6',
  milestones: [
    { title: 'Phase 1: 核心页面', date: '2026-02-26', completed: true },
    { title: 'Phase 2: 审批决策', date: '2026-02-28', completed: false },
    { title: 'Phase 3: 内容管线', date: '2026-03-05', completed: false },
    { title: 'MVP 发布', date: '2026-03-15', completed: false },
  ],
  createdAt: '2026-02-20',
  updatedAt: '2 hours ago',
}

const projectTasks = [
  { id: '1', title: '完成 Home 页面', status: 'completed', priority: 'high', assignee: 'Pop' },
  { id: '2', title: '完成 Tasks 页面', status: 'completed', priority: 'high', assignee: 'Codex' },
  { id: '3', title: '完成 Memory 页面', status: 'completed', priority: 'high', assignee: 'Pop' },
  { id: '4', title: '完成 Team 页面', status: 'in_progress', priority: 'medium', assignee: 'Pop' },
  { id: '5', title: '完成 Office 页面', status: 'in_progress', priority: 'medium', assignee: 'Codex' },
  { id: '6', title: 'E2E 测试', status: 'todo', priority: 'medium', assignee: 'Codex' },
  { id: '7', title: '性能优化', status: 'todo', priority: 'low', assignee: 'Pop' },
]

const projectFiles = [
  { id: '1', name: 'work-plan.md', type: 'doc', size: '15.4 KB' },
  { id: '2', name: 'TODO.md', type: 'doc', size: '3.2 KB' },
  { id: '3', name: 'package.json', type: 'config', size: '1.1 KB' },
  { id: '4', name: 'tsconfig.json', type: 'config', size: '0.8 KB' },
]

type TabId = 'overview' | 'tasks' | 'files' | 'activity'

interface ProjectDetailProps {
  projectId?: string
  onBack?: () => void
}

export function ProjectDetail({ projectId, onBack }: ProjectDetailProps) {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [project] = useState<Project>(mockProject)

  const tabs = [
    { id: 'overview' as TabId, label: '概览', icon: LayoutGrid },
    { id: 'tasks' as TabId, label: '任务', icon: CheckCircle2, count: project.tasks.total },
    { id: 'files' as TabId, label: '文件', icon: FileText, count: projectFiles.length },
    { id: 'activity' as TabId, label: '活动', icon: Clock },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'planning': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'archived': return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
      default: return ''
    }
  }

  const completedMilestones = project.milestones.filter(m => m.completed).length
  const totalMilestones = project.milestones.length

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-border/60 flex-shrink-0">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div className="flex items-center gap-3 flex-1">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: project.color + '20' }}
          >
            <FolderKanban className="h-5 w-5" style={{ color: project.color }} />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{project.name}</h2>
            <p className="text-xs text-muted-foreground">{project.description}</p>
          </div>
        </div>
        <Badge variant="outline" className={getStatusBadge(project.status)}>
          {project.status}
        </Badge>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-2 border-b border-border/60 flex-shrink-0">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.count !== undefined && (
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{tab.count}</Badge>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Progress */}
            <Card className="border-border/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">进度</h3>
                  <span className="text-2xl font-bold" style={{ color: project.color }}>
                    {project.progress}%
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden mb-4">
                  <div 
                    className="h-full transition-all"
                    style={{ width: `${project.progress}%`, backgroundColor: project.color }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold">{project.tasks.completed}</div>
                    <div className="text-xs text-muted-foreground">已完成</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">{project.tasks.total - project.tasks.completed}</div>
                    <div className="text-xs text-muted-foreground">进行中</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">{project.tasks.total}</div>
                    <div className="text-xs text-muted-foreground">总任务</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Milestones */}
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">里程碑</CardTitle>
                  <span className="text-xs text-muted-foreground">
                    {completedMilestones}/{totalMilestones}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.milestones.map((milestone, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        milestone.completed ? 'bg-green-500' : 'bg-muted'
                      }`}>
                        {milestone.completed && <CheckCircle2 className="h-4 w-4 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm ${milestone.completed ? 'text-muted-foreground line-through' : ''}`}>
                          {milestone.title}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {milestone.date}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Team */}
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">团队成员</CardTitle>
                  <Button variant="ghost" size="sm" className="h-6 text-xs">
                    <Plus className="h-3 w-3 mr-1" />
                    添加
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.members.map((member, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-2">
                      <div className="w-4 h-4 rounded-full bg-primary/20" />
                      {member}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="space-y-3">
              {project.status !== 'archived' ? (
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Archive className="h-4 w-4" />
                  归档项目
                </Button>
              ) : (
                <Button variant="outline" className="w-full justify-start gap-2">
                  <FolderKanban className="h-4 w-4" />
                  恢复项目
                </Button>
              )}
              <Button variant="outline" className="w-full justify-start gap-2 text-red-500 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
                删除项目
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <Badge variant="secondary">{projectTasks.filter(t => t.status === 'completed').length} 完成</Badge>
                <Badge variant="outline">{projectTasks.filter(t => t.status === 'in_progress').length} 进行中</Badge>
                <Badge variant="outline">{projectTasks.filter(t => t.status === 'todo').length} 待办</Badge>
              </div>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                添加任务
              </Button>
            </div>
            {projectTasks.map((task) => (
              <Card key={task.id} className="border-border/60 hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      task.status === 'completed' ? 'bg-green-500' : 
                      task.status === 'in_progress' ? 'bg-blue-500' : 'bg-muted'
                    }`}>
                      {task.status === 'completed' && <CheckCircle2 className="h-3 w-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm ${task.status === 'completed' ? 'text-muted-foreground line-through' : ''}`}>
                        {task.title}
                      </div>
                      <div className="text-xs text-muted-foreground">{task.assignee}</div>
                    </div>
                    <Badge variant="outline" className={
                      task.priority === 'high' ? 'text-red-500 border-red-500/20' :
                      task.priority === 'medium' ? 'text-yellow-500 border-yellow-500/20' :
                      'text-green-500 border-green-500/20'
                    }>
                      {task.priority}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'files' && (
          <div className="space-y-2">
            <div className="flex justify-end mb-4">
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                上传文件
              </Button>
            </div>
            {projectFiles.map((file) => (
              <Card key={file.id} className="border-border/60 hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{file.name}</div>
                      <div className="text-xs text-muted-foreground">{file.size}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-2">
            {[
              { action: '完成任务', item: '完成 Home 页面', user: 'Pop', time: '2 hours ago' },
              { action: '创建任务', item: 'E2E 测试', user: 'Codex', time: '3 hours ago' },
              { action: '更新里程碑', item: 'Phase 1 完成', user: 'Pop', time: '5 hours ago' },
              { action: '添加成员', item: 'Quill', user: 'Pop', time: '1 day ago' },
            ].map((activity, idx) => (
              <Card key={idx} className="border-border/60">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <GitBranch className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm">
                        <span className="font-medium">{activity.user}</span>
                        <span className="text-muted-foreground"> {activity.action}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{activity.item}</div>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
