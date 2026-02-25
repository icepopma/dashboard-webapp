'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FolderKanban, RotateCcw, Plus, Calendar, Users } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface Project {
  id: string
  name: string
  description: string
  status: 'active' | 'planning' | 'completed' | 'paused'
  progress: number
  color: string
  startDate: string
  targetDate: string
  tasks: { total: number; completed: number }
  members: string[]
  lastUpdate: string
}

export function ProjectsView() {
  const { t } = useI18n()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data.projects || [])
    } catch (err) {
      console.error('Failed to fetch projects:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-500'
      case 'planning': return 'bg-yellow-500/10 text-yellow-500'
      case 'completed': return 'bg-blue-500/10 text-blue-500'
      case 'paused': return 'bg-gray-500/10 text-gray-500'
      default: return 'bg-gray-500/10 text-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '进行中'
      case 'planning': return '规划中'
      case 'completed': return '已完成'
      case 'paused': return '已暂停'
      default: return status
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-6 pt-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-semibold">{t('projects.title')}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t('projects.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchProjects}>
            <RotateCcw className="h-4 w-4 mr-2" />
            刷新
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t('projects.newProject')}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 mb-4 flex-shrink-0">
        <div className="flex gap-4 text-sm">
          <span className="text-muted-foreground">
            总计: <span className="text-foreground font-medium">{projects.length}</span>
          </span>
          <span className="text-muted-foreground">
            进行中: <span className="text-green-500 font-medium">{projects.filter(p => p.status === 'active').length}</span>
          </span>
          <span className="text-muted-foreground">
            规划中: <span className="text-yellow-500 font-medium">{projects.filter(p => p.status === 'planning').length}</span>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <Card key={project.id} className="border-border/60 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-12 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <div>
                      <CardTitle className="text-sm">{project.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">{project.description}</p>
                    </div>
                  </div>
                  <Badge className={getStatusBadge(project.status)}>
                    {getStatusText(project.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">进度</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ width: `${project.progress}%`, backgroundColor: project.color }}
                    />
                  </div>
                </div>

                {/* Tasks */}
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span>{t('projects.tasksLabel')}: {project.tasks.completed}/{project.tasks.total}</span>
                </div>

                {/* Timeline */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(project.startDate)} - {formatDate(project.targetDate)}
                  </span>
                </div>

                {/* Members */}
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {project.members.slice(0, 3).map((member, i) => (
                      <div 
                        key={member}
                        className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] border-2 border-background"
                        style={{ zIndex: 3 - i }}
                      >
                        {member.charAt(0)}
                      </div>
                    ))}
                    {project.members.length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] border-2 border-background">
                        +{project.members.length - 3}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    更新于 {new Date(project.lastUpdate).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
