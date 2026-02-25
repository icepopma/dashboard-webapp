'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  UserPlus, Bot, Code, FileText, Palette, Cpu, Activity, Search,
  Settings, Play, Pause, Trash2, ChevronDown, ChevronRight, Sparkles,
  Plus, X, Check
} from 'lucide-react'
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
  workingDir?: string
  model?: string
}

const initialAgents: Agent[] = [
  { id: 'agent-1', name: 'Pop', role: 'Chief of Staff', description: 'Coordinates, delegates, keeps the ship tight.', skills: ['Communication', 'Delegation', 'Strategy'], avatar: '🫧', status: 'active', tasksCount: 3, color: '#3b82f6', layer: 'input', workingDir: '/root/.openclaw/workspace', model: 'zai/glm-5' },
  { id: 'agent-2', name: 'Scout', role: 'Trend Analyst', description: 'Monitors trends, scans competitors.', skills: ['Speed', 'Data', 'Insights'], avatar: '🔍', status: 'working', tasksCount: 2, color: '#10b981', layer: 'input' },
  { id: 'agent-3', name: 'Quill', role: 'Content Writer', description: 'Crafts compelling narratives and scripts.', skills: ['Writing', 'Research', 'Clarity'], avatar: '✍️', status: 'idle', tasksCount: 0, color: '#8b5cf6', layer: 'input' },
  { id: 'agent-4', name: 'Pixel', role: 'Thematic Designer', description: 'Creates visual assets and thumbnails.', skills: ['Design', 'Aesthetics', 'Vision'], avatar: '🎨', status: 'idle', tasksCount: 0, color: '#f59e0b', layer: 'output' },
  { id: 'agent-5', name: 'Echo', role: 'Social Media Manager', description: 'Manages social presence and community.', skills: ['Social', 'Speed', 'Reach'], avatar: '📣', status: 'working', tasksCount: 1, color: '#ec4899', layer: 'output' },
  { id: 'agent-6', name: 'Codex', role: 'Lead Engineer', description: 'Build, test, automate. Makes everything work.', skills: ['Code', 'Systems', 'Reliability'], avatar: '💻', status: 'working', tasksCount: 5, color: '#f97316', layer: 'meta', workingDir: '/root/.openclaw/workspace/dashboard-webapp-opt' },
]

const availableSkills = ['Communication', 'Delegation', 'Strategy', 'Speed', 'Data', 'Insights', 'Writing', 'Research', 'Clarity', 'Design', 'Aesthetics', 'Vision', 'Social', 'Reach', 'Code', 'Systems', 'Reliability', 'Testing', 'DevOps', 'Analytics']

export function TeamView() {
  const { t } = useI18n()
  const [agents, setAgents] = useState<Agent[]>(initialAgents)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [expandedLayer, setExpandedLayer] = useState<string | null>(null)

  const [newAgent, setNewAgent] = useState<Partial<Agent>>({
    name: '',
    role: '',
    description: '',
    skills: [],
    layer: 'input',
    color: '#3b82f6',
    avatar: '🤖',
  })

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

  const handleCreateAgent = () => {
    if (!newAgent.name || !newAgent.role) return
    
    const agent: Agent = {
      id: `agent-${Date.now()}`,
      name: newAgent.name,
      role: newAgent.role,
      description: newAgent.description || '',
      skills: newAgent.skills || [],
      avatar: newAgent.avatar || '🤖',
      status: 'idle',
      tasksCount: 0,
      color: newAgent.color || '#3b82f6',
      layer: newAgent.layer as 'input' | 'output' | 'meta',
    }
    
    setAgents([...agents, agent])
    setShowCreateModal(false)
    setNewAgent({
      name: '',
      role: '',
      description: '',
      skills: [],
      layer: 'input',
      color: '#3b82f6',
      avatar: '🤖',
    })
  }

  const handleUpdateAgent = () => {
    if (!editingAgent) return
    setAgents(agents.map(a => a.id === editingAgent.id ? editingAgent : a))
    setEditingAgent(null)
    setSelectedAgent(editingAgent)
  }

  const handleDeleteAgent = (id: string) => {
    setAgents(agents.filter(a => a.id !== id))
    if (selectedAgent?.id === id) setSelectedAgent(null)
  }

  const handleToggleSkill = (skill: string) => {
    if (!editingAgent) return
    const skills = editingAgent.skills.includes(skill)
      ? editingAgent.skills.filter(s => s !== skill)
      : [...editingAgent.skills, skill]
    setEditingAgent({ ...editingAgent, skills })
  }

  const AgentCard = ({ agent, borderColor }: { agent: Agent; borderColor: string }) => (
    <Card 
      className={`border-2 hover:border-primary/50 transition-all cursor-pointer ${
        selectedAgent?.id === agent.id ? 'ring-2 ring-primary' : ''
      }`}
      style={{ borderColor: selectedAgent?.id === agent.id ? undefined : borderColor }}
      onClick={() => setSelectedAgent(agent)}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: `${agent.color}20` }}>
            {agent.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{agent.name}</h3>
            <p className="text-[10px] text-muted-foreground truncate">{agent.role}</p>
          </div>
          <div className="flex gap-1">
            <button 
              onClick={(e) => { e.stopPropagation(); setEditingAgent(agent) }}
              className="p-1 hover:bg-accent rounded"
            >
              <Settings className="h-3 w-3 text-muted-foreground" />
            </button>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mb-2 line-clamp-2">{agent.description}</p>
        <div className="flex flex-wrap gap-1 mb-2">
          {agent.skills.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-[10px] px-1.5 py-0">{skill}</Badge>
          ))}
          {agent.skills.length > 3 && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">+{agent.skills.length - 3}</Badge>
          )}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border/60">
          <Badge variant="outline" className={`text-[10px] ${getStatusBadge(agent.status)}`}>{getStatusLabel(agent.status)}</Badge>
          <span className="text-[10px] text-muted-foreground">{agent.tasksCount} tasks</span>
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
          <Button size="sm" className="gap-2" onClick={() => setShowCreateModal(true)}>
            <UserPlus className="h-4 w-4" />
            {t('team.addMember')}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 mb-4 flex-shrink-0">
        <div className="grid grid-cols-4 gap-4">
          <Card className="border-border/60">
            <CardContent className="p-3">
              <div className="text-center">
                <div className="text-xl font-semibold text-primary">{agents.length}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{t('team.totalMembers')}</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-3">
              <div className="text-center">
                <div className="text-xl font-semibold text-green-500">{agents.filter((a) => a.status === 'active').length}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{t('team.online')}</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-3">
              <div className="text-center">
                <div className="text-xl font-semibold text-blue-500">{agents.filter((a) => a.status === 'working').length}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{t('team.working')}</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-3">
              <div className="text-center">
                <div className="text-xl font-semibold text-muted-foreground">{agents.reduce((sum, a) => sum + a.tasksCount, 0)}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{t('team.totalTasksLabel')}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 pb-6 overflow-hidden flex gap-4">
        {/* Agent List */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Input Layer */}
          <div>
            <button 
              onClick={() => setExpandedLayer(expandedLayer === 'input' ? null : 'input')}
              className="flex items-center gap-2 mb-2 w-full"
            >
              {expandedLayer === 'input' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <h3 className="text-sm font-semibold">{t('team.layers.input')}</h3>
              <span className="text-xs text-muted-foreground">{inputAgents.length}{t('team.agents')}</span>
            </button>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {inputAgents.map((agent) => <AgentCard key={agent.id} agent={agent} borderColor="#22c55e" />)}
            </div>
          </div>

          {/* Output Layer */}
          <div>
            <button 
              onClick={() => setExpandedLayer(expandedLayer === 'output' ? null : 'output')}
              className="flex items-center gap-2 mb-2 w-full"
            >
              {expandedLayer === 'output' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <h3 className="text-sm font-semibold">{t('team.layers.output')}</h3>
              <span className="text-xs text-muted-foreground">{outputAgents.length}{t('team.agents')}</span>
            </button>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {outputAgents.map((agent) => <AgentCard key={agent.id} agent={agent} borderColor="#3b82f6" />)}
            </div>
          </div>

          {/* Meta Layer */}
          <div>
            <button 
              onClick={() => setExpandedLayer(expandedLayer === 'meta' ? null : 'meta')}
              className="flex items-center gap-2 mb-2 w-full"
            >
              {expandedLayer === 'meta' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <h3 className="text-sm font-semibold">{t('team.layers.meta')}</h3>
              <span className="text-xs text-muted-foreground">{metaAgents.length}{t('team.agents')}</span>
            </button>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {metaAgents.map((agent) => <AgentCard key={agent.id} agent={agent} borderColor="#f97316" />)}
            </div>
          </div>
        </div>

        {/* Agent Detail Panel */}
        {selectedAgent && (
          <div className="w-72 flex-shrink-0 border border-border/60 rounded-lg overflow-hidden flex flex-col">
            <div className="p-4 bg-muted/30 border-b border-border/60 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Agent 详情</h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedAgent(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${selectedAgent.color}20` }}>
                  {selectedAgent.avatar}
                </div>
                <div>
                  <div className="font-semibold">{selectedAgent.name}</div>
                  <div className="text-xs text-muted-foreground">{selectedAgent.role}</div>
                </div>
              </div>
              
              <div>
                <div className="text-xs text-muted-foreground mb-1">描述</div>
                <div className="text-sm">{selectedAgent.description}</div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground mb-1">状态</div>
                <Badge variant="outline" className={getStatusBadge(selectedAgent.status)}>
                  {getStatusLabel(selectedAgent.status)}
                </Badge>
              </div>

              <div>
                <div className="text-xs text-muted-foreground mb-1">技能</div>
                <div className="flex flex-wrap gap-1">
                  {selectedAgent.skills.map(skill => (
                    <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                  ))}
                </div>
              </div>

              {selectedAgent.workingDir && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">工作目录</div>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{selectedAgent.workingDir}</code>
                </div>
              )}

              {selectedAgent.model && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">模型</div>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{selectedAgent.model}</code>
                </div>
              )}

              <div className="pt-4 border-t border-border/60 space-y-2">
                <Button size="sm" className="w-full gap-2" onClick={() => setEditingAgent(selectedAgent)}>
                  <Settings className="h-4 w-4" />
                  配置 Agent
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" className="gap-1">
                    <Play className="h-3 w-3" />
                    启动
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Pause className="h-3 w-3" />
                    暂停
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Agent Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-[500px] max-h-[80vh] overflow-hidden">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle>创建新 Agent</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">名称</label>
                  <Input 
                    value={newAgent.name} 
                    onChange={e => setNewAgent({ ...newAgent, name: e.target.value })}
                    placeholder="Agent 名称"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">角色</label>
                  <Input 
                    value={newAgent.role} 
                    onChange={e => setNewAgent({ ...newAgent, role: e.target.value })}
                    placeholder="角色描述"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">描述</label>
                <Input 
                  value={newAgent.description} 
                  onChange={e => setNewAgent({ ...newAgent, description: e.target.value })}
                  placeholder="Agent 的职责和能力"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">层级</label>
                  <select 
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    value={newAgent.layer}
                    onChange={e => setNewAgent({ ...newAgent, layer: e.target.value as 'input' | 'output' | 'meta' })}
                  >
                    <option value="input">输入信号</option>
                    <option value="output">输出动作</option>
                    <option value="meta">元层级</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">颜色</label>
                  <Input 
                    type="color"
                    value={newAgent.color} 
                    onChange={e => setNewAgent({ ...newAgent, color: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">技能</label>
                <div className="flex flex-wrap gap-1 p-2 border rounded-md min-h-[60px]">
                  {availableSkills.map(skill => (
                    <Badge 
                      key={skill}
                      variant={newAgent.skills?.includes(skill) ? 'default' : 'outline'}
                      className="cursor-pointer text-xs"
                      onClick={() => {
                        const skills = newAgent.skills?.includes(skill)
                          ? newAgent.skills.filter(s => s !== skill)
                          : [...(newAgent.skills || []), skill]
                        setNewAgent({ ...newAgent, skills })
                      }}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>取消</Button>
                <Button onClick={handleCreateAgent} disabled={!newAgent.name || !newAgent.role}>
                  <Plus className="h-4 w-4 mr-2" />
                  创建 Agent
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Agent Modal */}
      {editingAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-[500px] max-h-[80vh] overflow-hidden">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle>配置 {editingAgent.name}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setEditingAgent(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">名称</label>
                  <Input 
                    value={editingAgent.name} 
                    onChange={e => setEditingAgent({ ...editingAgent, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">角色</label>
                  <Input 
                    value={editingAgent.role} 
                    onChange={e => setEditingAgent({ ...editingAgent, role: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">描述</label>
                <Input 
                  value={editingAgent.description} 
                  onChange={e => setEditingAgent({ ...editingAgent, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">层级</label>
                  <select 
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    value={editingAgent.layer}
                    onChange={e => setEditingAgent({ ...editingAgent, layer: e.target.value as 'input' | 'output' | 'meta' })}
                  >
                    <option value="input">输入信号</option>
                    <option value="output">输出动作</option>
                    <option value="meta">元层级</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">颜色</label>
                  <Input 
                    type="color"
                    value={editingAgent.color} 
                    onChange={e => setEditingAgent({ ...editingAgent, color: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">工作目录</label>
                <Input 
                  value={editingAgent.workingDir || ''} 
                  onChange={e => setEditingAgent({ ...editingAgent, workingDir: e.target.value })}
                  placeholder="/path/to/workspace"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">模型</label>
                <Input 
                  value={editingAgent.model || ''} 
                  onChange={e => setEditingAgent({ ...editingAgent, model: e.target.value })}
                  placeholder="zai/glm-5"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">技能</label>
                <div className="flex flex-wrap gap-1 p-2 border rounded-md min-h-[60px]">
                  {availableSkills.map(skill => (
                    <Badge 
                      key={skill}
                      variant={editingAgent.skills.includes(skill) ? 'default' : 'outline'}
                      className="cursor-pointer text-xs"
                      onClick={() => handleToggleSkill(skill)}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="destructive" onClick={() => { handleDeleteAgent(editingAgent.id); setEditingAgent(null) }}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  删除
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setEditingAgent(null)}>取消</Button>
                  <Button onClick={handleUpdateAgent}>
                    <Check className="h-4 w-4 mr-2" />
                    保存
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
