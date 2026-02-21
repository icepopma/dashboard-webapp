'use client'

import { useState, useEffect } from 'react'
import { Search, FileText, Calendar, Tag } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

interface Memory {
  id: string
  title: string
  content: string
  date: Date
  tags: string[]
}

export function MemoryView() {
  const [memories, setMemories] = useState<Memory[]>([
    {
      id: 'memory-1',
      title: 'Matt 的作息时间',
      content: '早上 7 点起床，晚上 11 点睡觉。晚上 11 点后是我主动工作的时间。',
      date: new Date(2026, 1, 10),
      tags: ['作息', '用户偏好'],
    },
    {
      id: 'memory-2',
      title: 'GitHub 凭证',
      content: '用户名：icepopma，已配置环境变量。',
      date: new Date(2026, 1, 6),
      tags: ['账号', 'GitHub'],
    },
    {
      id: 'memory-3',
      title: '业务账号',
      content: 'X (Twitter): @icepopma, Email: icepopma@hotmail.com',
      date: new Date(2026, 1, 6),
      tags: ['社交', '账号'],
    },
    {
      id: 'memory-4',
      title: 'PR 策略',
      content: '只创建 PR 供审核，不直接上线任何内容。Matt 会亲自测试并提交最终版本。',
      date: new Date(2026, 1, 6),
      tags: ['开发', '工作流'],
    },
    {
      id: 'memory-5',
      title: '工作原则',
      content: '主动开展工作，让 Matt 的生活更轻松、业务更赚钱。大胆但谨慎。',
      date: new Date(2026, 1, 6),
      tags: ['原则', '工作方式'],
    },
  ])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const filteredMemories = memories.filter((memory) => {
    const matchesSearch =
      !searchQuery ||
      memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memory.content.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTag = !selectedTag || memory.tags.includes(selectedTag)

    return matchesSearch && matchesTag
  })

  const allTags = Array.from(
    new Set(memories.flatMap((m) => m.tags))
  )

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-6">
        <div>
          <h2 className="text-2xl font-semibold">记忆</h2>
          <p className="text-sm text-muted-foreground">
            搜索和查看所有记忆和对话
          </p>
        </div>
        <Button className="gap-2">
          <FileText className="h-4 w-4" />
          新记忆
        </Button>
      </div>

      {/* Search Bar */}
      <div className="px-6 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索记忆..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tags Filter */}
      <div className="px-6 mb-4">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={!selectedTag ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => setSelectedTag(null)}
            >
              全部
            </Badge>
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? 'default' : 'secondary'}
                className="cursor-pointer"
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Memories List */}
      <div className="flex-1 px-6 pb-6">
        <ScrollArea className="h-full">
          <div className="grid gap-4">
            {filteredMemories.map((memory) => (
              <Card
                key={memory.id}
                className="border-border/60 hover:border-primary/50 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="font-semibold text-base">{memory.title}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                      <Calendar className="h-3 w-3" />
                      {formatDate(memory.date)}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                    {memory.content}
                  </p>

                  <div className="flex items-center gap-2">
                    {memory.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredMemories.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="p-12 text-center text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-base font-medium">没有找到记忆</p>
                  <p className="text-sm mt-1">
                    尝试调整搜索词或选择其他标签
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
