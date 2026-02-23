'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FolderKanban, Plus, CheckCircle2, Clock, Users } from 'lucide-react'

const projects = [
  {
    id: '1',
    name: 'Mission Control',
    description: 'Pop 的任务控制中心',
    status: 'active',
    progress: 65,
    tasks: { total: 20, completed: 13 },
    members: ['Pop', 'Codex'],
  },
  {
    id: '2',
    name: 'Dashboard Webapp',
    description: 'Idea 管理和追踪 Dashboard',
    status: 'active',
    progress: 30,
    tasks: { total: 44, completed: 13 },
    members: ['Pop', 'Codex', 'Quill'],
  },
  {
    id: '3',
    name: 'YouTube Channel',
    description: 'AI 工具教程系列',
    status: 'active',
    progress: 45,
    tasks: { total: 15, completed: 7 },
    members: ['Quill', 'Pixel', 'Echo'],
  },
]

export function ProjectsView() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-semibold">Projects</h2>
          <p className="text-sm text-muted-foreground">
            管理所有项目及其进度
          </p>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="border-border/60 hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderKanban className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">{project.name}</CardTitle>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {project.description}
                </p>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {project.tasks.completed}/{project.tasks.total} tasks
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {project.members.length} members
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
