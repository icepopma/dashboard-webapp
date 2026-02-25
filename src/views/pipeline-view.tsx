'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, FileText, Image, Video, Scissors, Lightbulb, Send, Globe, Youtube, Twitter, Newspaper, BookOpen, Check, Clock, ExternalLink } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useI18n } from '@/lib/i18n'

interface ContentItem {
  id: string
  title: string
  script?: string
  thumbnail?: string
  stage: 'idea' | 'script' | 'thumbnail' | 'filming' | 'editing' | 'publishing' | 'published'
  tags?: string[]
  platforms?: Platform[]
  createdAt: string
  updatedAt: string
}

interface Platform {
  name: 'youtube' | 'twitter' | 'wechat' | 'blog' | 'xiaohongshu'
  status: 'pending' | 'scheduled' | 'published'
  publishedAt?: string
  scheduledAt?: string
  url?: string
}

const getStages = (t: (key: string) => string) => [
  { id: 'idea', label: t('content.ideas'), color: '#eab308', icon: Lightbulb },
  { id: 'script', label: t('content.scripting'), color: '#3b82f6', icon: FileText },
  { id: 'thumbnail', label: t('content.thumbnail'), color: '#a855f7', icon: Image },
  { id: 'filming', label: t('content.filming'), color: '#ef4444', icon: Video },
  { id: 'editing', label: t('content.editing'), color: '#f97316', icon: Scissors },
  { id: 'publishing', label: '发布中', color: '#06b6d4', icon: Send },
  { id: 'published', label: '已发布', color: '#22c55e', icon: Globe },
]

const platformIcons: Record<string, any> = {
  youtube: Youtube,
  twitter: Twitter,
  wechat: BookOpen,
  blog: Newspaper,
  xiaohongshu: FileText,
}

const platformLabels: Record<string, string> = {
  youtube: 'YouTube',
  twitter: 'X/Twitter',
  wechat: '公众号',
  blog: '博客',
  xiaohongshu: '小红书',
}

const contentItems: ContentItem[] = [
  { 
    id: 'content-1', 
    title: 'AI 工具教程系列 EP1', 
    stage: 'publishing', 
    script: '今天我们学习如何使用...',
    tags: ['YouTube', '教程'],
    platforms: [
      { name: 'youtube', status: 'scheduled', scheduledAt: '2026-02-26 10:00' },
      { name: 'wechat', status: 'pending' },
    ],
    createdAt: '2026-02-20',
    updatedAt: '2 hours ago'
  },
  { 
    id: 'content-2', 
    title: 'Next.js 最佳实践', 
    stage: 'editing', 
    script: 'Next.js 是一个强大的 React 框架...',
    tags: ['YouTube', 'Story'],
    platforms: [],
    createdAt: '2026-02-22',
    updatedAt: '5 hours ago'
  },
  { 
    id: 'content-3', 
    title: 'Docker 入门教程', 
    stage: 'published', 
    script: 'Docker 是一个容器化技术...',
    tags: ['YouTube'],
    platforms: [
      { name: 'youtube', status: 'published', publishedAt: '2026-02-24', url: 'https://youtube.com/watch?v=xxx' },
      { name: 'wechat', status: 'published', publishedAt: '2026-02-24', url: 'https://mp.weixin.qq.com/xxx' },
    ],
    createdAt: '2026-02-18',
    updatedAt: '1 day ago'
  },
  { 
    id: 'content-4', 
    title: '一人公司运营心得', 
    stage: 'script', 
    tags: ['公众号'],
    platforms: [
      { name: 'wechat', status: 'pending' },
    ],
    createdAt: '2026-02-24',
    updatedAt: '1 hour ago'
  },
]

export function PipelineView() {
  const { t } = useI18n()
  const [items] = useState<ContentItem[]>(contentItems)
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)
  const [showPublishModal, setShowPublishModal] = useState(false)

  const stages = getStages(t)

  const getItemsByStage = (stage: string) => items.filter((item) => item.stage === stage)
  const stageCounts = stages.reduce((acc, stage) => {
    acc[stage.id] = getItemsByStage(stage.id).length
    return acc
  }, {} as Record<string, number>)

  const getStageColor = (stage: string) => {
    const s = stages.find(s => s.id === stage)
    return s?.color || '#6b7280'
  }

  const PlatformBadge = ({ platform }: { platform: Platform }) => {
    const Icon = platformIcons[platform.name]
    const statusColor = 
      platform.status === 'published' ? 'text-green-500 bg-green-500/10' :
      platform.status === 'scheduled' ? 'text-blue-500 bg-blue-500/10' :
      'text-yellow-500 bg-yellow-500/10'
    
    return (
      <Badge variant="outline" className={`gap-1 ${statusColor}`}>
        <Icon className="h-3 w-3" />
        {platformLabels[platform.name]}
        {platform.status === 'scheduled' && (
          <Clock className="h-3 w-3 ml-1" />
        )}
        {platform.status === 'published' && (
          <Check className="h-3 w-3 ml-1" />
        )}
      </Badge>
    )
  }

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
        <div className="flex gap-3 overflow-x-auto pb-2">
          {stages.map((stage) => {
            const Icon = stage.icon
            return (
              <Card key={stage.id} className="flex-shrink-0 w-28 border-border/60 shadow-sm">
                <CardContent className="p-3">
                  <div className="flex flex-col items-center">
                    <div className="p-1.5 rounded-lg mb-2" style={{ backgroundColor: stage.color + '20' }}>
                      <Icon className="h-4 w-4" style={{ color: stage.color }} />
                    </div>
                    <div className="text-lg font-semibold" style={{ color: stage.color }}>
                      {stageCounts[stage.id]}
                    </div>
                    <div className="text-[10px] text-muted-foreground text-center">{stage.label}</div>
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
          <div className="flex gap-3 pb-4">
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

                  <CardContent className="flex-1 p-3 pt-0 overflow-y-auto">
                    <div className="space-y-2">
                      {stageItems.map((item) => (
                        <Card 
                          key={item.id} 
                          className={`p-3 border-border/60 hover:border-primary/50 transition-colors cursor-pointer ${
                            selectedItem?.id === item.id ? 'ring-2 ring-primary' : ''
                          }`}
                          onClick={() => setSelectedItem(item)}
                        >
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
                          
                          {/* Platform badges */}
                          {item.platforms && item.platforms.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {item.platforms.map((platform) => (
                                <PlatformBadge key={platform.name} platform={platform} />
                              ))}
                            </div>
                          )}
                          
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex gap-1">
                              {item.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          {/* Publish button for ready items */}
                          {(stage.id === 'editing' || stage.id === 'publishing') && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full mt-2 gap-1"
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowPublishModal(true)
                              }}
                            >
                              <Send className="h-3 w-3" />
                              发布到平台
                            </Button>
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

      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-[500px]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>发布到平台</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowPublishModal(false)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">选择要发布的目标平台：</p>
              
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(platformLabels).map(([key, label]) => {
                  const Icon = platformIcons[key]
                  return (
                    <div 
                      key={key}
                      className="flex items-center gap-3 p-3 border border-border rounded-lg hover:border-primary/50 cursor-pointer transition-colors"
                    >
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{label}</div>
                        <div className="text-xs text-muted-foreground">点击选择</div>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              <div className="pt-4 border-t flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPublishModal(false)}>取消</Button>
                <Button className="gap-2">
                  <Send className="h-4 w-4" />
                  立即发布
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
