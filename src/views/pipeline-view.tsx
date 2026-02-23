'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, FileText, Image, Video, Scissors, Lightbulb } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useI18n } from '@/lib/i18n'

interface ContentItem {
  id: string
  title: string
  script?: string
  thumbnail?: string
  stage: 'idea' | 'script' | 'thumbnail' | 'filming' | 'editing'
  tags?: string[]
}

const getStages = (t: (key: string) => string) => [
  { id: 'idea', label: t('content.ideas'), color: '#eab308', icon: Lightbulb, bgColor: 'bg-yellow-500/10' },
  { id: 'script', label: t('content.scripting'), color: '#3b82f6', icon: FileText, bgColor: 'bg-blue-500/10' },
  { id: 'thumbnail', label: t('content.thumbnail'), color: '#a855f7', icon: Image, bgColor: 'bg-purple-500/10' },
  { id: 'filming', label: t('content.filming'), color: '#ef4444', icon: Video, bgColor: 'bg-red-500/10' },
  { id: 'editing', label: t('content.editing'), color: '#f97316', icon: Scissors, bgColor: 'bg-orange-500/10' },
]

export function PipelineView() {
  const { t } = useI18n()
  const [items] = useState<ContentItem[]>([
    { id: 'content-1', title: 'AI 工具教程系列', stage: 'script', script: '今天我们学习如何使用...', tags: ['YouTube'] },
    { id: 'content-2', title: 'Next.js 最佳实践', stage: 'idea', tags: ['YouTube', 'Story'] },
    { id: 'content-3', title: 'Docker 入门', stage: 'filming', script: 'Docker 是一个容器化技术...', tags: ['YouTube'] },
  ])

  const stages = getStages(t)

  const getItemsByStage = (stage: string) => items.filter((item) => item.stage === stage)
  const stageCounts = stages.reduce((acc, stage) => {
    acc[stage.id] = getItemsByStage(stage.id).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-semibold">{t('content.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('content.subtitle')}</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {t('content.newContent')}
        </Button>
      </div>

      {/* Stage Stats */}
      <div className="px-6 mb-4 flex-shrink-0">
        <div className="flex gap-4">
          {stages.map((stage) => {
            const Icon = stage.icon
            return (
              <Card key={stage.id} className="flex-1 border-border/60 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${stage.bgColor}`}>
                      <Icon className="h-4 w-4" style={{ color: stage.color }} />
                    </div>
                    <div>
                      <div className="text-2xl font-semibold" style={{ color: stage.color }}>
                        {stageCounts[stage.id]}
                      </div>
                      <div className="text-xs text-muted-foreground">{stage.label}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Pipeline Board */}
      <div className="flex-1 px-6 pb-6 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="flex gap-4 pb-4">
            {stages.map((stage) => {
              const Icon = stage.icon
              const stageItems = getItemsByStage(stage.id)

              return (
                <Card key={stage.id} className="flex-shrink-0 w-72 border-border/60 flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                        <CardTitle className="text-sm font-medium">{stage.label}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{stageItems.length}</span>
                        <button className="p-1 hover:bg-accent rounded transition-colors">
                          <Plus className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 p-3 pt-0">
                    <div className="space-y-2">
                      {stageItems.map((item) => (
                        <Card key={item.id} className="p-3 border-border/60 hover:border-primary/50 transition-colors cursor-pointer">
                          <h4 className="font-medium text-sm mb-2">{item.title}</h4>
                          {item.script && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{item.script}</p>
                          )}
                          {item.thumbnail && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                              <Image className="h-3 w-3" />
                              <span>{t('content.hasThumbnail')}</span>
                            </div>
                          )}
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex gap-1">
                              {item.tags.map((tag) => (
                                <Badge key={tag} variant={tag === 'YouTube' ? 'default' : 'secondary'} className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </Card>
                      ))}
                      {stageItems.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground text-xs border border-dashed border-border rounded-lg">
                          {t('content.noItems')}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
