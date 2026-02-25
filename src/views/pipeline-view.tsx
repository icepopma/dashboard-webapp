'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GitBranch, RotateCcw, Plus, Lightbulb, FileText, Image, Video, Edit, Send } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface ContentItem {
  id: string
  title: string
  stage: 'idea' | 'script' | 'thumbnail' | 'filming' | 'editing' | 'publishing' | 'published'
  platform?: string
  assignee?: string
  createdAt: string
  updatedAt: string
}

const contentData: ContentItem[] = [
  { id: 'cont-001', title: 'AI Agent 系统介绍', stage: 'editing', assignee: 'Quill', createdAt: '2026-02-20', updatedAt: '2026-02-25' },
  { id: 'cont-002', title: 'Dashboard 演示视频', stage: 'filming', assignee: 'Echo', createdAt: '2026-02-22', updatedAt: '2026-02-25' },
  { id: 'cont-003', title: '每周技术分享', stage: 'script', assignee: 'Quill', createdAt: '2026-02-24', updatedAt: '2026-02-25' },
  { id: 'cont-004', title: 'OpenClaw 使用教程', stage: 'idea', createdAt: '2026-02-25', updatedAt: '2026-02-25' },
  { id: 'cont-005', title: '智能体协作案例', stage: 'published', platform: 'YouTube', assignee: 'Echo', createdAt: '2026-02-18', updatedAt: '2026-02-23' },
]

const stages = [
  { id: 'idea', label: '想法', icon: Lightbulb, color: 'text-yellow-500' },
  { id: 'script', label: '脚本', icon: FileText, color: 'text-blue-500' },
  { id: 'thumbnail', label: '缩略图', icon: Image, color: 'text-purple-500' },
  { id: 'filming', label: '拍摄', icon: Video, color: 'text-red-500' },
  { id: 'editing', label: '剪辑', icon: Edit, color: 'text-orange-500' },
  { id: 'publishing', label: '发布', icon: Send, color: 'text-green-500' },
]

export function PipelineView() {
  const { t } = useI18n()
  const [items, setItems] = useState<ContentItem[]>(contentData)
  const [loading, setLoading] = useState(true)
  const [selectedStage, setSelectedStage] = useState<string | null>(null)

  useEffect(() => {
    // 模拟加载
    setTimeout(() => setLoading(false), 500)
  }, [])

  const getItemsByStage = (stage: string) => 
    items.filter(item => item.stage === stage)

  const getStageIcon = (stageId: string) => {
    const stage = stages.find(s => s.id === stageId)
    return stage?.icon || FileText
  }

  const getStageColor = (stageId: string) => {
    const stage = stages.find(s => s.id === stageId)
    return stage?.color || 'text-gray-500'
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
          <h2 className="text-2xl font-semibold">{t('content.title')}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t('content.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            刷新
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t('content.newContent')}
          </Button>
        </div>
      </div>

      {/* Pipeline */}
      <div className="flex-1 px-6 pb-6 overflow-auto">
        <div className="flex gap-4 min-w-max">
          {stages.map((stage, index) => {
            const stageItems = getItemsByStage(stage.id)
            const Icon = stage.icon
            
            return (
              <div key={stage.id} className="w-64 flex-shrink-0">
                <div className="flex items-center gap-2 mb-3">
                  <Icon className={`h-5 w-5 ${stage.color}`} />
                  <span className="font-medium text-sm">{stage.label}</span>
                  <Badge variant="secondary" className="ml-auto">{stageItems.length}</Badge>
                </div>
                
                <div className="space-y-2">
                  {stageItems.length === 0 ? (
                    <Card className="border-border/40 border-dashed">
                      <CardContent className="py-8 text-center text-muted-foreground text-sm">
                        {t('content.noItems')}
                      </CardContent>
                    </Card>
                  ) : (
                    stageItems.map(item => (
                      <Card key={item.id} className="border-border/60 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-3">
                          <p className="font-medium text-sm mb-2">{item.title}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            {item.assignee ? (
                              <span>👤 {item.assignee}</span>
                            ) : (
                              <span>未分配</span>
                            )}
                            {item.platform && (
                              <Badge variant="outline" className="text-[10px]">{item.platform}</Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
                
                {index < stages.length - 1 && (
                  <div className="flex justify-center my-4">
                    <GitBranch className="h-4 w-4 text-muted-foreground rotate-90" />
                  </div>
                )}
              </div>
            )
          })}
          
          {/* Published Column */}
          <div className="w-64 flex-shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <Send className="h-5 w-5 text-green-500" />
              <span className="font-medium text-sm">已发布</span>
              <Badge variant="secondary" className="ml-auto">{getItemsByStage('published').length}</Badge>
            </div>
            
            <div className="space-y-2">
              {getItemsByStage('published').map(item => (
                <Card key={item.id} className="border-border/60 shadow-sm bg-green-500/5">
                  <CardContent className="p-3">
                    <p className="font-medium text-sm mb-2">{item.title}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>✅ 已发布</span>
                      {item.platform && (
                        <Badge variant="outline" className="text-[10px]">{item.platform}</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
