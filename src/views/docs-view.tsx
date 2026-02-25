'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileCode, Folder, File, RotateCcw, Search } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface DocFile {
  name: string
  type: 'file' | 'folder'
  path: string
  lastModified?: string
  size?: string
}

const docsStructure: DocFile[] = [
  { name: 'README.md', type: 'file', path: '/README.md', lastModified: '2026-02-25', size: '2.1 KB' },
  { name: 'ARCHITECTURE.md', type: 'file', path: '/ARCHITECTURE.md', lastModified: '2026-02-25', size: '8.5 KB' },
  { name: 'TODO.md', type: 'file', path: '/TODO.md', lastModified: '2026-02-25', size: '3.2 KB' },
  { name: 'DEPLOY.md', type: 'file', path: '/DEPLOY.md', lastModified: '2026-02-23', size: '1.1 KB' },
  { name: 'src', type: 'folder', path: '/src' },
  { name: 'components', type: 'folder', path: '/src/components' },
  { name: 'orchestrator', type: 'folder', path: '/src/orchestrator' },
  { name: 'package.json', type: 'file', path: '/package.json', lastModified: '2026-02-25', size: '1.2 KB' },
  { name: 'tailwind.config.ts', type: 'file', path: '/tailwind.config.ts', lastModified: '2026-02-23', size: '5.4 KB' },
]

export function DocsView() {
  const { t } = useI18n()
  const [docs, setDocs] = useState<DocFile[]>(docsStructure)
  const [selectedDoc, setSelectedDoc] = useState<DocFile | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredDocs = docs.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const folders = filteredDocs.filter(d => d.type === 'folder')
  const files = filteredDocs.filter(d => d.type === 'file')

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-6 pt-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-semibold">{t('docs.title')}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t('docs.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('docs.searchDocs')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-hidden flex gap-4">
        {/* File Tree */}
        <div className="w-80 flex-shrink-0">
          <Card className="border-border/60 shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Folder className="h-4 w-4 text-yellow-500" />
                文件
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-auto h-[calc(100%-60px)]">
              <div className="space-y-1">
                {folders.map(doc => (
                  <button
                    key={doc.path}
                    onClick={() => setSelectedDoc(doc)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-left hover:bg-muted/50 transition-colors ${
                      selectedDoc?.path === doc.path ? 'bg-muted/50' : ''
                    }`}
                  >
                    <Folder className="h-4 w-4 text-yellow-500" />
                    <span>{doc.name}</span>
                  </button>
                ))}
                {files.map(doc => (
                  <button
                    key={doc.path}
                    onClick={() => setSelectedDoc(doc)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-left hover:bg-muted/50 transition-colors ${
                      selectedDoc?.path === doc.path ? 'bg-muted/50' : ''
                    }`}
                  >
                    <FileCode className="h-4 w-4 text-blue-500" />
                    <span className="flex-1 truncate">{doc.name}</span>
                    <span className="text-[10px] text-muted-foreground">{doc.size}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="flex-1">
          <Card className="border-border/60 shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <File className="h-4 w-4 text-muted-foreground" />
                  {selectedDoc?.name || '选择文件查看'}
                </span>
                {selectedDoc && (
                  <Badge variant="secondary">{selectedDoc.path}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDoc ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-muted-foreground">
                    文件预览功能开发中...
                  </p>
                  <div className="mt-4 text-xs text-muted-foreground">
                    <p>最后修改: {selectedDoc.lastModified}</p>
                    <p>大小: {selectedDoc.size}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>从左侧选择文件查看内容</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
