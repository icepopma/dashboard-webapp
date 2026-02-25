'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FolderKanban, Plus, CheckCircle2, Users, LayoutGrid, List, GanttChart, Flag, Calendar, Archive } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { ProjectDetail } from '@/components/project-detail'

type ViewMode = 'cards' | 'milestones' | 'gantt'

interface Project {
  id: string
  name: string
  description: string
  status: 'active' | 'archived' | 'planning'
  progress: number
  tasks: { total: number; completed: number }
  members: string[]
  milestones?: { title: string; date: string; completed: boolean }[]
  color?: string
}

const getProjects = (): Project[] => [
  { 
    id: '1', 
    name: 'Mission Control', 
    description: 'AI 团队任务控制中心', 
    status: 'active', 
    progress: 65, 
    tasks: { total: 20, completed: 13 }, 
    members: ['Pop', 'Codex'],
    color: '#3b82f6',
    milestones: [
      { title: 'Phase 1 完成', date: '2026-02-20', completed: true },
      { title: 'Phase 2 完成', date: '2026-02-27', completed: false },
      { title: 'MVP 发布', date: '2026-03-15', completed: false },
    ]
  },
  { 
    id: '2', 
    name: 'Dashboard Webapp', 
    description: 'Idea 管理可视化工具', 
    status: 'active', 
    progress: 30, 
    tasks: { total: 44, completed: 13 }, 
    members: ['Pop', 'Codex', 'Quill'],
    color: '#8b5cf6',
    milestones: [
      { title: '核心页面完成', date: '2026-02-26', completed: false },
      { title: '集成测试', date: '2026-03-05', completed: false },
    ]
  },
  { 
    id: '3', 
    name: 'YouTube Channel', 
    description: 'AI 工具教程频道', 
    status: 'active', 
    progress: 45, 
    tasks: { total: 15, completed: 7 }, 
    members: ['Quill', 'Pixel', 'Echo'],
    color: '#ec4899',
    milestones: [
      { title: '5 个视频发布', date: '2026-03-01', completed: false },
    ]
  },
  { 
    id: '4', 
    name: 'AI Agent System', 
    description: '多 Agent 协作框架', 
    status: 'planning', 
    progress: 15, 
    tasks: { total: 30, completed: 5 }, 
    members: ['Pop'],
    color: '#f59e0b',
  },
  { 
    id: '5', 
    name: 'Old Website v1', 
    description: '旧版网站（已归档）', 
    status: 'archived', 
    progress: 100, 
    tasks: { total: 10, completed: 10 }, 
    members: ['Pop'],
    color: '#6b7280',
  },
]

export function ProjectsView() {
  const { t } = useI18n()
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const [showArchived, setShowArchived] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  
  const projects = getProjects().filter(p => showArchived || p.status !== 'archived')

  // Show project detail if selected
  if (selectedProjectId) {
    return (
      <ProjectDetail 
        projectId={selectedProjectId} 
        onBack={() => setSelectedProjectId(null)} 
      />
    )
  }

  const viewModeButtons = [
    { id: 'cards' as ViewMode, icon: LayoutGrid, label: '卡片' },
    { id: 'milestones' as ViewMode, icon: Flag, label: '里程碑' },
    { id: 'gantt' as ViewMode, icon: GanttChart, label: '甘特图' },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'planning': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'archived': return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
      default: return ''
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4 px-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-semibold">{t('projects.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('projects.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowArchived(!showArchived)}
            className="gap-2"
          >
            <Archive className="h-4 w-4" />
            {showArchived ? '隐藏归档' : '显示归档'}
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            {t('projects.newProject')}
          </Button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="px-6 mb-4 flex-shrink-0">
        <div className="flex border border-border rounded-lg overflow-hidden w-fit">
          {viewModeButtons.map((btn) => {
            const Icon = btn.icon
            return (
              <button
                key={btn.id}
                onClick={() => setViewMode(btn.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === btn.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted/30 hover:bg-muted/50 text-muted-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {btn.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Card 
                key={project.id} 
                className="border-border/60 hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => setSelectedProjectId(project.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      <CardTitle className="text-base">{project.name}</CardTitle>
                    </div>
                    <Badge variant="outline" className={getStatusBadge(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{t('projects.progress')}</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all"
                        style={{ width: `${project.progress}%`, backgroundColor: project.color }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {project.tasks.completed}/{project.tasks.total} {t('projects.tasksLabel')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {project.members.length} {t('projects.members')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {viewMode === 'milestones' && (
          <div className="space-y-6">
            {projects.filter(p => p.milestones).map((project) => (
              <Card key={project.id} className="border-border/60">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <CardTitle className="text-base">{project.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {project.milestones?.map((milestone, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          milestone.completed ? 'bg-green-500' : 'bg-muted'
                        }`}>
                          {milestone.completed && <CheckCircle2 className="h-4 w-4 text-white" />}
                        </div>
                        <div className="flex-1">
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
            ))}
          </div>
        )}

        {viewMode === 'gantt' && (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <GanttChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-base font-medium">甘特图视图开发中</p>
              <p className="text-sm mt-1">即将支持时间线可视化</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
