'use client'

import { useState, useCallback } from 'react'
import { Sidebar, NavItemId } from '@/components/sidebar'
import { KanbanBoard } from '@/components/kanban/kanban-board'
import { TasksView } from '@/views/tasks-view'
import { PipelineView } from '@/views/pipeline-view'
import { CalendarView } from '@/views/calendar-view'
import { MemoryView } from '@/views/memory-view'
import { TeamView } from '@/views/team-view'
import { OfficeView } from '@/views/office-view'
import { HomeView } from '@/views/home-view'
import { ApprovalsView } from '@/views/approvals-view'
import { CouncilView } from '@/views/council-view'
import { ProjectsView } from '@/views/projects-view'
import { DocsView } from '@/views/docs-view'
import { PeopleView } from '@/views/people-view'
import { PopView } from '@/views/pop-view'
import { useKeyboardShortcut, navShortcuts } from '@/hooks/use-keyboard-shortcut'
import { KeyboardShortcutsHelp, KeyboardShortcutsButton } from '@/components/keyboard-shortcuts-help'
import { Toaster } from '@/components/ui/toaster'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<NavItemId>('pop')
  const [showHelp, setShowHelp] = useState(false)

  // 导航快捷键
  const navigationShortcuts = Object.entries(navShortcuts).map(([key, tabId]) => ({
    key,
    ctrlKey: true,
    action: () => setActiveTab(tabId as NavItemId),
    description: `切换到 ${tabId}`,
  }))

  // 帮助快捷键
  const helpShortcuts = [
    {
      key: '?',
      ctrlKey: true,
      shiftKey: true,
      action: () => setShowHelp(true),
      description: '显示快捷键帮助',
    },
    {
      key: 'Escape',
      action: () => setShowHelp(false),
      description: '关闭帮助',
      preventDefault: false,
    },
  ]

  // 注册所有快捷键
  useKeyboardShortcut([...navigationShortcuts, ...helpShortcuts])

  const renderContent = () => {
    switch (activeTab) {
      case 'pop':
        return <PopView />
      case 'home':
        return <HomeView />
      case 'tasks':
        return <TasksView />
      case 'content':
        return <PipelineView />
      case 'calendar':
        return <CalendarView />
      case 'memory':
        return <MemoryView />
      case 'team':
        return <TeamView />
      case 'office':
        return <OfficeView />
      case 'approvals':
        return <ApprovalsView />
      case 'council':
        return <CouncilView />
      case 'projects':
        return <ProjectsView />
      case 'docs':
        return <DocsView />
      case 'people':
        return <PeopleView />
      default:
        return <PopView />
    }
  }

  return (
    <main className="h-screen flex bg-background text-foreground overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <section className="flex-1 flex flex-col overflow-hidden relative">
        {/* 快捷键帮助按钮 */}
        <div className="absolute top-4 right-4 z-10">
          <KeyboardShortcutsButton onClick={() => setShowHelp(true)} />
        </div>
        
        {renderContent()}
      </section>

      {/* 快捷键帮助弹窗 */}
      <KeyboardShortcutsHelp isOpen={showHelp} onClose={() => setShowHelp(false)} />
      
      {/* Toast 通知 */}
      <Toaster position="top-right" richColors />
    </main>
  )
}
