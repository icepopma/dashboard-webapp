'use client'

import { useState } from 'react'
import { Search, FileText, Calendar, Tag, ChevronRight, ChevronDown, Brain, BookOpen, Network, Clock, Plus, Sparkles, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'
import { KnowledgeGraphView } from '@/components/knowledge-graph'

type TabId = 'ai-memory' | 'journal' | 'knowledge' | 'graph'

interface Memory {
  id: string
  title: string
  content: string
  date: Date
  tags: string[]
  wordCount: number
  category: 'long-term' | 'daily'
}

interface KnowledgeNode {
  id: string
  label: string
  type: 'person' | 'project' | 'concept' | 'skill'
  connections: string[]
}

const memories: Memory[] = [
  { id: 'memory-1', title: 'Long-Term Memory', content: 'GitHub: icepopma\nEmail: icepopma@hotmail.com', date: new Date(2026, 1, 20), tags: ['凭证', '账号'], wordCount: 641, category: 'long-term' },
  { id: 'memory-2', title: 'Tue, Feb 17', content: '05:37 AM — Architecture Discussion\nDecided to keep 3 main persistent agents...', date: new Date(2026, 1, 17), tags: ['日常'], wordCount: 445, category: 'daily' },
  { id: 'memory-3', title: 'Mon, Feb 16', content: '10:00 AM — Mission Control Planning\nStarted building the dashboard...', date: new Date(2026, 1, 16), tags: ['日常'], wordCount: 312, category: 'daily' },
]

const knowledgeNodes: KnowledgeNode[] = [
  { id: '1', label: 'Dashboard Webapp', type: 'project', connections: ['2', '3', '4'] },
  { id: '2', label: 'Next.js', type: 'skill', connections: ['1'] },
  { id: '3', label: 'Supabase', type: 'skill', connections: ['1'] },
  { id: '4', label: 'Matt', type: 'person', connections: ['1', '5'] },
  { id: '5', label: 'Content Pipeline', type: 'project', connections: ['4'] },
]

const agentMemories = [
  { id: '1', agent: 'Pop', memory: '用户偏好：早睡早起，东八区，独立开发者', confidence: 95 },
  { id: '2', agent: 'Pop', memory: 'GitHub token 已配置，gh CLI 已登录', confidence: 100 },
  { id: '3', agent: 'Scout', memory: '竞争对手 YouTube 频道列表：...', confidence: 88 },
  { id: '4', agent: 'Quill', memory: '写作风格偏好：简洁、直接、有个性', confidence: 92 },
]

export function MemoryView() {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<TabId>('ai-memory')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(memories[0])
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({ 'long-term': true, 'daily': true })

  const tabs = [
    { id: 'ai-memory' as TabId, label: t('memory.aiMemory') || 'AI 记忆', icon: Brain },
    { id: 'journal' as TabId, label: t('memory.dailyJournal'), icon: Calendar },
    { id: 'knowledge' as TabId, label: t('memory.knowledge') || '知识库', icon: BookOpen },
    { id: 'graph' as TabId, label: t('memory.graph') || '图谱', icon: Network },
  ]

  const memoryGroups = [
    { label: t('memory.longTerm'), key: 'long-term', items: memories.filter((m) => m.category === 'long-term') },
    { label: t('memory.dailyJournal'), key: 'daily', items: memories.filter((m) => m.category === 'daily') },
  ]

  const toggleGroup = (group: string) => setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }))

  const formatDate = (date: Date) => new Date(date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
  const formatFileSize = (wordCount: number) => `${Math.ceil(wordCount * 6 / 1024).toFixed(1)} KB`

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'project': return 'bg-blue-500/20 text-blue-500 border-blue-500/30'
      case 'person': return 'bg-green-500/20 text-green-500 border-green-500/30'
      case 'skill': return 'bg-purple-500/20 text-purple-500 border-purple-500/30'
      case 'concept': return 'bg-orange-500/20 text-orange-500 border-orange-500/30'
      default: return 'bg-gray-500/20 text-gray-500 border-gray-500/30'
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-semibold">{t('memory.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('memory.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI 整理
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            {t('memory.newMemory')}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 mb-4 flex-shrink-0">
        <div className="flex gap-1 p-1 bg-muted/30 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
                  activeTab === tab.id
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-hidden">
        {activeTab === 'ai-memory' && (
          <div className="h-full flex gap-4">
            {/* Agent Memory List */}
            <div className="w-80 flex-shrink-0 border border-border/60 rounded-lg flex flex-col overflow-hidden">
              <div className="p-3 border-b border-border/60 flex-shrink-0">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="搜索 AI 记忆..." 
                    className="pl-8 h-8 text-sm" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                  />
                </div>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-3 space-y-3">
                  <div className="text-xs font-medium text-muted-foreground mb-2">Pop 的记忆</div>
                  {agentMemories.filter(m => m.agent === 'Pop').map((memory) => (
                    <div 
                      key={memory.id}
                      className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <div className="text-sm mb-1">{memory.memory}</div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <Activity className="h-3 w-3 text-green-500" />
                        <span>置信度 {memory.confidence}%</span>
                      </div>
                    </div>
                  ))}
                  
                  <div className="text-xs font-medium text-muted-foreground mt-4 mb-2">其他 Agent 记忆</div>
                  {agentMemories.filter(m => m.agent !== 'Pop').map((memory) => (
                    <div 
                      key={memory.id}
                      className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-[10px]">{memory.agent}</Badge>
                      </div>
                      <div className="text-sm mb-1">{memory.memory}</div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <Activity className="h-3 w-3 text-green-500" />
                        <span>置信度 {memory.confidence}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Memory Detail */}
            <div className="flex-1 border border-border/60 rounded-lg p-6 overflow-auto">
              <div className="max-w-2xl">
                <h3 className="text-lg font-semibold mb-4">记忆关联分析</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  选择左侧的 AI 记忆条目查看详情、关联和编辑历史
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-border/60">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">总记忆数</span>
                      </div>
                      <div className="text-2xl font-bold">{agentMemories.length}</div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/60">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">平均置信度</span>
                      </div>
                      <div className="text-2xl font-bold">
                        {Math.round(agentMemories.reduce((sum, m) => sum + m.confidence, 0) / agentMemories.length)}%
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'journal' && (
          <div className="h-full flex gap-4">
            {/* Sidebar */}
            <div className="w-64 flex-shrink-0 border border-border/60 rounded-lg flex flex-col overflow-hidden">
              <div className="p-3 border-b border-border/60 flex-shrink-0">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder={t('memory.searchMemory')} className="pl-8 h-8 text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-2">
                  {memoryGroups.map((group) => (
                    <div key={group.key} className="mb-2">
                      <button onClick={() => toggleGroup(group.key)} className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded text-sm">
                        {expandedGroups[group.key] ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                        {group.key === 'long-term' ? <Brain className="h-4 w-4 text-purple-500" /> : <Calendar className="h-4 w-4 text-muted-foreground" />}
                        <span className="flex-1 text-left font-medium text-xs">{group.label}</span>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1">{group.items.length}</Badge>
                      </button>
                      {expandedGroups[group.key] && (
                        <div className="ml-6 mt-1 space-y-1">
                          {group.items.map((item) => (
                            <button key={item.id} onClick={() => setSelectedMemory(item)}
                              className={cn('w-full text-left p-2 rounded text-xs hover:bg-accent transition-colors', selectedMemory?.id === item.id && 'bg-accent')}>
                              <div className="font-medium truncate">{item.title}</div>
                              <div className="text-muted-foreground mt-0.5">{formatFileSize(item.wordCount)} • {item.wordCount} {t('memory.words')}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden border border-border/60 rounded-lg">
              {selectedMemory ? (
                <>
                  <div className="p-4 border-b border-border/60 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{selectedMemory.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(selectedMemory.date)}</div>
                          <span>•</span>
                          <span>{formatFileSize(selectedMemory.wordCount)}</span>
                          <span>•</span>
                          <span>{selectedMemory.wordCount} {t('memory.words')}</span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">{t('memory.modified')}</div>
                    </div>
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="p-4">
                      <div className="prose prose-sm prose-invert max-w-none">
                        {selectedMemory.content.split('\n\n').map((paragraph, idx) => (
                          <div key={idx} className="mb-4">
                            {paragraph.split('\n').map((line, lineIdx) => {
                              if (line.match(/^\d{2}:\d{2}\s*(AM|PM)/i)) {
                                return <div key={lineIdx} className="font-medium text-primary mt-3 mb-1">{line}</div>
                              }
                              return <div key={lineIdx} className="text-sm text-muted-foreground">{line}</div>
                            })}
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 pt-4 border-t border-border/60">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          <div className="flex gap-1.5">
                            {selectedMemory.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-base font-medium">{t('memory.selectMemory')}</p>
                    <p className="text-sm mt-1">{t('memory.selectFromSidebar')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'knowledge' && (
          <div className="h-full border border-border/60 rounded-lg p-6 overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">知识库</h3>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                添加条目
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {knowledgeNodes.map((node) => (
                <Card key={node.id} className="border-border/60 hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getTypeColor(node.type)}>{node.type}</Badge>
                    </div>
                    <div className="font-medium">{node.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {node.connections.length} 个关联
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'graph' && (
          <div className="h-full border border-border/60 rounded-lg overflow-hidden">
            <KnowledgeGraphView />
          </div>
        )}
      </div>
    </div>
  )
}
