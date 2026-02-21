'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserPlus, Bot, Code, FileText, Palette, Cpu, Activity } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Agent {
  id: string
  name: string
  role: string
  avatar: string
  status: 'active' | 'idle' | 'working'
  tasksCount: number
  color: string
}

export function TeamView() {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 'agent-1',
      name: 'Pop (泡泡)',
      role: '主 AI 助手',
      avatar: '🫧',
      status: 'active',
      tasksCount: 3,
      color: '#3b82f6',
    },
    {
      id: 'agent-2',
      name: 'Writer Agent',
      role: '内容创作',
      avatar: '✍️',
      status: 'idle',
      tasksCount: 0,
      color: '#8b5cf6',
    },
    {
      id: 'agent-3',
      name: 'Developer Agent',
      role: '代码开发',
      avatar: '💻',
      status: 'working',
      tasksCount: 5,
      color: '#10b981',
    },
    {
      id: 'agent-4',
      name: 'Designer Agent',
      role: 'UI 设计',
      avatar: '🎨',
      status: 'idle',
      tasksCount: 0,
      color: '#f59e0b',
    },
    {
      id: 'agent-5',
      name: 'Research Agent',
      role: '研究分析',
      avatar: '🔍',
      status: 'working',
      tasksCount: 2,
      color: '#ec4899',
    },
  ])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'idle':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
      case 'working':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      default:
        return ''
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return '在线'
      case 'idle':
        return '空闲'
      case 'working':
        return '工作中'
      default:
        return status
    }
  }

  const getRoleIcon = (role: string) => {
    if (role.includes('主')) return <Bot className="h-4 w-4" />
    if (role.includes('内容')) return <FileText className="h-4 w-4" />
    if (role.includes('代码')) return <Code className="h-4 w-4" />
    if (role.includes('设计')) return <Palette className="h-4 w-4" />
    if (role.includes('研究')) return <Cpu className="h-4 w-4" />
    return <Activity className="h-4 w-4" />
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-6">
        <div>
          <h2 className="text-2xl font-semibold">团队</h2>
          <p className="text-sm text-muted-foreground">
            管理所有 agents 和他们的职责
          </p>
        </div>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          添加成员
        </Button>
      </div>

      {/* Stats */}
      <div className="px-6 mb-4">
        <div className="grid grid-cols-4 gap-4">
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-semibold text-primary">
                  {agents.length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">总成员</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-semibold text-green-500">
                  {agents.filter((a) => a.status === 'active').length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">在线</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-semibold text-blue-500">
                  {agents.filter((a) => a.status === 'working').length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">工作中</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-500">
                  {agents.reduce((sum, a) => sum + a.tasksCount, 0)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">总任务</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {agents.map((agent) => (
            <Card
              key={agent.id}
              className="border-border/60 hover:border-primary/50 transition-colors"
            >
              <CardContent className="p-5">
                {/* Avatar */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${agent.color}20` }}
                  >
                    {agent.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base mb-1 truncate">
                      {agent.name}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      {getRoleIcon(agent.role)}
                      <span className="text-xs text-muted-foreground truncate">
                        {agent.role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status & Tasks */}
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className={getStatusBadge(agent.status)}
                  >
                    {getStatusLabel(agent.status)}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    {agent.tasksCount} 任务
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
