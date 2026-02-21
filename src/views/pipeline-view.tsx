'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FileText, Image, Video } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ContentItem {
  id: string
  title: string
  script?: string
  thumbnail?: string
  stage: 'idea' | 'script' | 'thumbnail' | 'filming'
}

const stages = [
  { id: 'idea', label: '创意', color: '#ef4444', icon: FileText },
  { id: 'script', label: '脚本', color: '#f59e0b', icon: FileText },
  { id: 'thumbnail', label: '缩略图', color: '#eab308', icon: Image },
  { id: 'filming', label: '拍摄', color: '#22c55e', icon: Video },
] as const

export function PipelineView() {
  const [items, setItems] = useState<ContentItem[]>([
    {
      id: 'content-1',
      title: 'AI 工具教程系列',
      stage: 'script',
      script: '今天我们学习如何使用...',
    },
    {
      id: 'content-2',
      title: 'Next.js 最佳实践',
      stage: 'idea',
    },
    {
      id: 'content-3',
      title: 'Docker 入门',
      stage: 'filming',
      script: 'Docker 是一个容器化技术...',
      thumbnail: '/placeholder.jpg',
    },
  ])

  const getItemsByStage = (stage: string) =>
    items.filter((item) => item.stage === stage)

  const moveStage = (itemId: string, direction: 'forward' | 'backward') => {
    setItems((items) => {
      return items.map((item) => {
        if (item.id !== itemId) return item

        const stageIndex = stages.findIndex((s) => s.id === item.stage)
        const newStageIndex = direction === 'forward'
          ? Math.min(stageIndex + 1, stages.length - 1)
          : Math.max(stageIndex - 1, 0)

        return { ...item, stage: stages[newStageIndex].id as any }
      })
    })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-6">
        <div>
          <h2 className="text-2xl font-semibold">内容流水线</h2>
          <p className="text-sm text-muted-foreground">
            管理内容创作流程：创意 → 脚本 → 缩略图 → 拍摄
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          新内容
        </Button>
      </div>

      {/* Pipeline */}
      <div className="flex-1 px-6 pb-6 overflow-x-auto">
        <ScrollArea className="h-full">
          <div className="flex gap-4 min-w-max">
            {stages.map((stage) => {
              const Icon = stage.icon
              const stageItems = getItemsByStage(stage.id)

              return (
                <Card
                  key={stage.id}
                  className="flex-shrink-0 w-80 border-border/60"
                >
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: stage.color }}
                      />
                      <CardTitle className="text-sm">{stage.label}</CardTitle>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {stageItems.length}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      {stageItems.map((item) => (
                        <Card
                          key={item.id}
                          className="p-3 border-border/60 hover:border-primary/50 transition-colors"
                        >
                          <h4 className="font-medium text-sm mb-2">
                            {item.title}
                          </h4>
                          {item.script && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {item.script}
                            </p>
                          )}
                          {item.thumbnail && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                              <Image className="h-3 w-3" />
                              <span>有缩略图</span>
                            </div>
                          )}
                        </Card>
                      ))}
                      {stageItems.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground text-xs">
                          暂无内容
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
