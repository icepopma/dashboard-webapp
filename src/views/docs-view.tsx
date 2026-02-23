'use client'

import { Card, CardContent } from '@/components/ui/card'
import { FileCode, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useI18n } from '@/lib/i18n'

const docs = [
  { id: '1', name: 'SKILL.md', path: 'skills/github/SKILL.md', size: '2.3 KB' },
  { id: '2', name: 'MEMORY.md', path: 'MEMORY.md', size: '1.8 KB' },
  { id: '3', name: 'AGENTS.md', path: 'AGENTS.md', size: '4.2 KB' },
  { id: '4', name: 'work-plan.md', path: 'work-plan.md', size: '15.4 KB' },
]

export function DocsView() {
  const { t } = useI18n()

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4 px-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-semibold">{t('docs.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('docs.subtitle')}</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t('docs.searchDocs')} className="pl-8" />
        </div>
      </div>

      <div className="flex-1 px-6 pb-6 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-2">
            {docs.map((doc) => (
              <Card key={doc.id} className="border-border/60 hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted">
                      <FileCode className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{doc.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">{doc.path}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{doc.size}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
