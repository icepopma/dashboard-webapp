'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileCode, Search, Edit3, Save, X, FileText, Code, FileSpreadsheet } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState } from 'react'
import { useI18n } from '@/lib/i18n'

interface Doc {
  id: string
  name: string
  path: string
  size: string
  type: 'markdown' | 'code' | 'config' | 'data'
  content?: string
  lastModified?: string
}

const docs: Doc[] = [
  { id: '1', name: 'SKILL.md', path: 'skills/github/SKILL.md', size: '2.3 KB', type: 'markdown', content: '# GitHub Skill\n\nInteract with GitHub using the `gh` CLI...', lastModified: '2 hours ago' },
  { id: '2', name: 'MEMORY.md', path: 'MEMORY.md', size: '1.8 KB', type: 'markdown', content: '# Long-Term Memory\n\nImportant credentials and preferences...', lastModified: '1 day ago' },
  { id: '3', name: 'AGENTS.md', path: 'AGENTS.md', size: '4.2 KB', type: 'markdown', content: '# AGENTS.md - Your Workspace\n\nThis folder is home...', lastModified: '3 days ago' },
  { id: '4', name: 'work-plan.md', path: 'work-plan.md', size: '15.4 KB', type: 'markdown', content: '# Work Plan\n\n## Phase 1: Setup...', lastModified: '1 week ago' },
  { id: '5', name: 'tsconfig.json', path: 'tsconfig.json', size: '0.8 KB', type: 'config', content: '{\n  "compilerOptions": {...}\n}', lastModified: '2 weeks ago' },
  { id: '6', name: 'package.json', path: 'package.json', size: '1.2 KB', type: 'config', content: '{\n  "name": "dashboard-webapp",\n  "version": "0.1.0",\n  ...\n}', lastModified: '1 week ago' },
  { id: '7', name: 'README.md', path: 'README.md', size: '2.1 KB', type: 'markdown', content: '# Dashboard Webapp\n\nA visual idea management tool...', lastModified: '2 weeks ago' },
]

const getFileIcon = (type: string) => {
  switch (type) {
    case 'markdown': return <FileText className="h-5 w-5 text-blue-500" />
    case 'code': return <Code className="h-5 w-5 text-green-500" />
    case 'config': return <FileCode className="h-5 w-5 text-yellow-500" />
    case 'data': return <FileSpreadsheet className="h-5 w-5 text-purple-500" />
    default: return <FileCode className="h-5 w-5 text-muted-foreground" />
  }
}

export function DocsView() {
  const { t } = useI18n()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [fileTreeExpanded, setFileTreeExpanded] = useState<Record<string, boolean>>({
    'root': true,
    'skills': true,
  })

  const filteredDocs = docs.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.path.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectDoc = (doc: Doc) => {
    setSelectedDoc(doc)
    setEditContent(doc.content || '')
    setIsEditing(false)
  }

  const handleSave = () => {
    if (!selectedDoc) return
    // In real app, this would save to backend
    setSelectedDoc({ ...selectedDoc, content: editContent })
    setIsEditing(false)
  }

  // Build file tree structure
  const buildFileTree = () => {
    const tree: Record<string, Doc[]> = {}
    filteredDocs.forEach(doc => {
      const parts = doc.path.split('/')
      if (parts.length > 1) {
        const folder = parts[0]
        if (!tree[folder]) tree[folder] = []
        tree[folder].push(doc)
      } else {
        if (!tree['root']) tree['root'] = []
        tree['root'].push(doc)
      }
    })
    return tree
  }

  const fileTree = buildFileTree()

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4 px-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-semibold">{t('docs.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('docs.subtitle')}</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={t('docs.searchDocs')} 
            className="pl-8" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 px-6 pb-6 overflow-hidden flex gap-4">
        {/* File Tree */}
        <div className="w-64 flex-shrink-0 border border-border/60 rounded-lg flex flex-col overflow-hidden">
          <div className="p-3 border-b border-border/60 flex-shrink-0">
            <h3 className="text-sm font-medium">文件浏览器</h3>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2">
              {Object.entries(fileTree).map(([folder, folderDocs]) => (
                <div key={folder} className="mb-2">
                  {folder !== 'root' && (
                    <button
                      onClick={() => setFileTreeExpanded({ ...fileTreeExpanded, [folder]: !fileTreeExpanded[folder] })}
                      className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded text-sm"
                    >
                      <span className="text-xs">{fileTreeExpanded[folder] ? '📂' : '📁'}</span>
                      <span className="font-medium text-xs">{folder}</span>
                      <Badge variant="secondary" className="text-[10px] h-4 px-1 ml-auto">{folderDocs.length}</Badge>
                    </button>
                  )}
                  {(folder === 'root' || fileTreeExpanded[folder]) && (
                    <div className={folder !== 'root' ? 'ml-4 space-y-0.5' : 'space-y-0.5'}>
                      {folderDocs.map((doc) => (
                        <button
                          key={doc.id}
                          onClick={() => handleSelectDoc(doc)}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${
                            selectedDoc?.id === doc.id ? 'bg-accent' : 'hover:bg-accent/50'
                          }`}
                        >
                          {getFileIcon(doc.type)}
                          <span className="truncate flex-1 text-left">{doc.name}</span>
                          <span className="text-muted-foreground text-[10px]">{doc.size}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Document Viewer/Editor */}
        <div className="flex-1 border border-border/60 rounded-lg flex flex-col overflow-hidden">
          {selectedDoc ? (
            <>
              {/* Toolbar */}
              <div className="flex items-center justify-between p-3 border-b border-border/60 flex-shrink-0">
                <div className="flex items-center gap-2">
                  {getFileIcon(selectedDoc.type)}
                  <div>
                    <h3 className="font-medium text-sm">{selectedDoc.name}</h3>
                    <p className="text-[10px] text-muted-foreground">{selectedDoc.path}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{selectedDoc.lastModified}</span>
                  {isEditing ? (
                    <>
                      <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                        <X className="h-3 w-3 mr-1" />
                        取消
                      </Button>
                      <Button size="sm" onClick={handleSave}>
                        <Save className="h-3 w-3 mr-1" />
                        保存
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit3 className="h-3 w-3 mr-1" />
                      编辑
                    </Button>
                  )}
                </div>
              </div>

              {/* Content */}
              {isEditing ? (
                <textarea
                  className="flex-1 p-4 bg-background text-sm font-mono resize-none focus:outline-none"
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  placeholder="在此编辑内容..."
                />
              ) : (
                <ScrollArea className="flex-1">
                  <div className="p-4">
                    {selectedDoc.type === 'markdown' ? (
                      <div className="prose prose-sm prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap text-sm">{selectedDoc.content}</pre>
                      </div>
                    ) : (
                      <pre className="text-sm font-mono whitespace-pre-wrap">{selectedDoc.content}</pre>
                    )}
                  </div>
                </ScrollArea>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <FileCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-base font-medium">选择文件查看</p>
                <p className="text-sm mt-1">从左侧文件浏览器选择文件</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
