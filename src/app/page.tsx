'use client'

import { useState } from 'react'
import { Sidebar, NavItemId } from '@/components/sidebar'
import { KanbanBoard } from '@/components/kanban/kanban-board'
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

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<NavItemId>('kanban')

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView />
      case 'kanban':
        return <KanbanBoard onTabChange={setActiveTab} />
      case 'pipeline':
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
        return <KanbanBoard onTabChange={setActiveTab} />
    }
  }

  return (
    <main className="h-screen flex bg-background text-foreground overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <section className="flex-1 flex flex-col overflow-hidden">
        {renderContent()}
      </section>
    </main>
  )
}
