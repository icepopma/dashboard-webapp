'use client'

import { useState, useCallback, lazy, Suspense } from 'react'
import { Sidebar, NavItemId } from '@/components/sidebar'
import { useKeyboardShortcut, navShortcuts } from '@/hooks/use-keyboard-shortcut'
import { KeyboardShortcutsHelp, KeyboardShortcutsButton } from '@/components/keyboard-shortcuts-help'
import { Toaster } from '@/components/ui/toaster'

// Lazy load views for better initial load performance
const TasksView = lazy(() => import('@/views/tasks-view').then(m => ({ default: m.TasksView })))
const PipelineView = lazy(() => import('@/views/pipeline-view').then(m => ({ default: m.PipelineView })))
const CalendarView = lazy(() => import('@/views/calendar-view').then(m => ({ default: m.CalendarView })))
const MemoryView = lazy(() => import('@/views/memory-view').then(m => ({ default: m.MemoryView })))
const TeamView = lazy(() => import('@/views/team-view').then(m => ({ default: m.TeamView })))
const OfficeView = lazy(() => import('@/views/office-view').then(m => ({ default: m.OfficeView })))
const HomeView = lazy(() => import('@/views/home-view').then(m => ({ default: m.HomeView })))
const ApprovalsView = lazy(() => import('@/views/approvals-view').then(m => ({ default: m.ApprovalsView })))
const CouncilView = lazy(() => import('@/views/council-view').then(m => ({ default: m.CouncilView })))
const ProjectsView = lazy(() => import('@/views/projects-view').then(m => ({ default: m.ProjectsView })))
const DocsView = lazy(() => import('@/views/docs-view').then(m => ({ default: m.DocsView })))
const PeopleView = lazy(() => import('@/views/people-view').then(m => ({ default: m.PeopleView })))
const PopView = lazy(() => import('@/views/pop-view').then(m => ({ default: m.PopView })))

// Loading fallback component
const ViewLoader = () => (
  <div className="flex-1 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
)

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
    let ViewComponent;
    
    switch (activeTab) {
      case 'pop':
        ViewComponent = PopView;
        break;
      case 'home':
        ViewComponent = HomeView;
        break;
      case 'tasks':
        ViewComponent = TasksView;
        break;
      case 'content':
        ViewComponent = PipelineView;
        break;
      case 'calendar':
        ViewComponent = CalendarView;
        break;
      case 'memory':
        ViewComponent = MemoryView;
        break;
      case 'team':
        ViewComponent = TeamView;
        break;
      case 'office':
        ViewComponent = OfficeView;
        break;
      case 'approvals':
        ViewComponent = ApprovalsView;
        break;
      case 'council':
        ViewComponent = CouncilView;
        break;
      case 'projects':
        ViewComponent = ProjectsView;
        break;
      case 'docs':
        ViewComponent = DocsView;
        break;
      case 'people':
        ViewComponent = PeopleView;
        break;
      default:
        ViewComponent = PopView;
    }
    
    return (
      <Suspense fallback={<ViewLoader />}>
        <ViewComponent />
      </Suspense>
    );
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
