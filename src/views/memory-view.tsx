'use client'

import { useState } from 'react'
import { Search, FileText, Calendar, Tag, ChevronRight, ChevronDown, Brain } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'

interface Memory {
  id: string
  title: string
  content: string
  date: Date
  tags: string[]
  wordCount: number
  category: 'long-term' | 'daily'
}

const memories: Memory[] = [
  { id: 'memory-1', title: 'Long-Term Memory', content: 'GitHub: icepopma\nEmail: icepopma@hotmail.com', date: new Date(2026, 1, 20), tags: ['凭证', '账号'], wordCount: 641, category: 'long-term' },
  { id: 'memory-2', title: 'Tue, Feb 17', content: '05:37 AM — Architecture Discussion\nDecided to keep 3 main persistent agents...', date: new Date(2026, 1, 17), tags: ['日常'], wordCount: 445, category: 'daily' },
  { id: 'memory-3', title: 'Mon, Feb 16', content: '10:00 AM — Mission Control Planning\nStarted building the dashboard...', date: new Date(2026, 1, 16), tags: ['日常'], wordCount: 312, category: 'daily' },
]

export function MemoryView() {
  const { t } = useI18n()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(memories[0])
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({ 'long-term': true, 'daily': true })

  const memoryGroups = [
    { label: t('memory.longTerm'), key: 'long-term', items: memories.filter((m) => m.category === 'long-term') },
    { label: t('memory.dailyJournal'), key: 'daily', items: memories.filter((m) => m.category === 'daily') },
  ]

  const toggleGroup = (group: string) => setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }))

  const formatDate = (date: Date) => new Date(date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
  const formatFileSize = (wordCount: number) => `${Math.ceil(wordCount * 6 / 1024).toFixed(1)} KB`

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-semibold">{t('memory.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('memory.subtitle')}</p>
        </div>
        <Button className="gap-2">
          <FileText className="h-4 w-4" />
          {t('memory.newMemory')}
        </Button>
      </div>

      <div className="flex-1 flex gap-4 px-6 pb-6 overflow-hidden">
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
    </div>
  )
}
