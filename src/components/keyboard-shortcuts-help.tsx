'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'
import { Keyboard, X } from 'lucide-react'
import { navShortcuts, formatShortcut, KeyboardShortcut } from '@/hooks/use-keyboard-shortcut'

interface KeyboardShortcutsHelpProps {
  isOpen: boolean
  onClose: () => void
}

const navNames: Record<string, string> = {
  pop: 'Pop 智能体',
  home: '首页',
  tasks: '任务看板',
  content: '内容流水线',
  approvals: '审批中心',
  council: '智囊团',
  calendar: '日历',
  projects: '项目',
  memory: '记忆库',
  docs: '文档',
  people: '人员',
  office: '办公室',
  team: '团队',
}

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  const { t } = useI18n()

  if (!isOpen) return null

  const shortcutGroups = [
    {
      title: '导航',
      shortcuts: Object.entries(navShortcuts).map(([key, tabId]) => ({
        key,
        ctrlKey: true,
        description: navNames[tabId] || tabId,
      })),
    },
    {
      title: '通用',
      shortcuts: [
        { key: '?', ctrlKey: true, description: '显示快捷键帮助' },
        { key: 'Escape', description: '关闭弹窗/对话框' },
      ],
    },
  ]

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-background border border-border rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">快捷键</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {shortcutGroups.map((group, idx) => (
            <div key={group.title} className={idx > 0 ? 'mt-6' : ''}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, i) => (
                  <div 
                    key={i}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border border-border">
                      {formatShortcut(shortcut)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border text-center text-xs text-muted-foreground">
          按 <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Esc</kbd> 关闭
        </div>
      </div>
    </div>
  )
}

// 快捷键按钮组件
export function KeyboardShortcutsButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="h-8 w-8 p-0"
      title="快捷键 (?)"
    >
      <Keyboard className="h-4 w-4" />
    </Button>
  )
}
