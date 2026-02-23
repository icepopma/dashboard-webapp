'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserPlus, Bot, Code, FileText, Palette, Cpu, Activity, Search } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface Agent {
  id: string
  name: string
  role: string
  description: string
  skills: string[]
  avatar: string
  status: 'active' | 'idle' | 'working'
  tasksCount: number
  color: string
  layer: 'input' | 'output' | 'meta'
}

const agents: Agent[] = [
  { id: 'agent-1', name: 'Pop', role: 'Chief of Staff', description: 'Coordinates, delegates, keeps the ship tight.', skills: ['Communication', 'Delegation', 'Strategy'], avatar: '🫧', status: 'active', tasksCount: 3, color: '#3b82f6', layer: 'input' },
  { id: 'agent-2', name: 'Scout', role: 'Trend Analyst', description: 'Monitors trends, scans competitors.', skills: ['Speed', 'Data', 'Insights'], avatar: '🔍', status: 'working', tasksCount: 2, color: '#10b981', layer: 'input' },
  { id: 'agent-3', name: 'Quill', role: 'Content Writer', description: 'Crafts compelling narratives and scripts.', skills: ['Writing', 'Research', 'Clarity'], avatar: '✍️', status: 'idle', tasksCount: 0, color: '#8b5cf6', layer: 'input' },
  { id: 'agent-4', name: 'Pixel', role: 'Thematic Designer', description: 'Creates visual assets and thumbnails.', skills: ['Design', 'Aesthetics', 'Vision'], avatar: '🎨', status: 'idle', tasksCount: 0, color: '#f59e0b', layer: 'output' },
  { id: 'agent-5', name: 'Echo', role: 'Social Media Manager', description: 'Manages social presence and community.', skills: ['Social', 'Speed', 'Reach'], avatar: '📣', status: 'working', tasksCount: 1, color: '#ec4899', layer: 'output' },
  { id: 'agent-6', name: 'Codex', role: 'Lead Engineer', description: 'Build, test, automate. Makes everything work.', skills: ['Code', 'Systems', 'Reliability'], avatar: '💻', status: 'working', tasksCount: 5, color: '#f97316', layer: 'meta' },
]

export function TeamView() {
  const { t } = useI18n()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'idle': return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
      case 'working': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      default: return ''
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return t('team.status.active')
      case 'idle': return t('team.status.idle')
      case 'working': return t('team.status.workingLabel')
      default: return status
    }
  }

  const inputAgents = agents.filter((a) => a.layer === 'input')
  const outputAgents = agents.filter((a) => a.layer === 'output')
  const metaAgents = agents.filter((a) => a.layer === 'meta')

  const AgentCard = ({ agent, borderColor }: { agent: Agent; borderColor: string }) => (
    <Card className="border-2 hover:border-primary/50 transition-all" style={{ borderColor }}>
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${agent.color}20` }}>
            {agent.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate">{agent.name}</h3>
            <p className="text-xs text-muted-foreground truncate">{agent.role}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{agent.description}</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {agent.skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="text-[10px] px-2 py-0.5">{skill}</Badge>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border/60">
          <Badge variant="outline" className={getStatusBadge(agent.status)}>{getStatusLabel(agent.status)}</Badge>
          <span className="text-xs text-muted-foreground">{agent.tasksCount} tasks</span>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-semibold">{t('team.title')}</h2>
          <p className="text-sm text-muted-foreground">{agents.length}{t('team.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Search className="h-4 w-4" />
            {t('common.search')}
          </Button>
          <Button size="sm" className="gap-2">
            <UserPlus className="h-4 w-4" />
            {t('team.addMember')}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 mb-4 flex-shrink-0">
        <div className="grid grid-cols-4 gap-4">
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-semibold text-primary">{agents.length}</div>
                <div className="text-xs text-muted-foreground mt-1">{t('team.totalMembers')}</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-semibold text-green-500">{agents.filter((a) => a.status === 'active').length}</div>
                <div className="text-xs text-muted-foreground mt-1">{t('team.online')}</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-semibold text-blue-500">{agents.filter((a) => a.status === 'working').length}</div>
                <div className="text-xs text-muted-foreground mt-1">{t('team.working')}</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-semibold text-muted-foreground">{agents.reduce((sum, a) => sum + a.tasksCount, 0)}</div>
                <div className="text-xs text-muted-foreground mt-1">{t('team.totalTasksLabel')}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Agent Layers */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <h3 className="text-sm font-semibold">{t('team.layers.input')}</h3>
            <span className="text-xs text-muted-foreground">{inputAgents.length}{t('team.agents')}</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {inputAgents.map((agent) => <AgentCard key={agent.id} agent={agent} borderColor="#22c55e" />)}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <h3 className="text-sm font-semibold">{t('team.layers.output')}</h3>
            <span className="text-xs text-muted-foreground">{outputAgents.length}{t('team.agents')}</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {outputAgents.map((agent) => <AgentCard key={agent.id} agent={agent} borderColor="#3b82f6" />)}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <h3 className="text-sm font-semibold">{t('team.layers.meta')}</h3>
            <span className="text-xs text-muted-foreground">{metaAgents.length}{t('team.agents')}</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {metaAgents.map((agent) => <AgentCard key={agent.id} agent={agent} borderColor="#f97316" />)}
          </div>
        </div>
      </div>
    </div>
  )
}
