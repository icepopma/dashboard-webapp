'use client'

import * as React from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { KanbanSquare, GitBranch, Calendar, FileText, Users, MonitorPlay } from 'lucide-react'

const tabs = [
  { id: 'kanban', label: '任务看板', icon: KanbanSquare },
  { id: 'pipeline', label: '内容流水线', icon: GitBranch },
  { id: 'calendar', label: '日历', icon: Calendar },
  { id: 'memory', label: '记忆', icon: FileText },
  { id: 'team', label: '团队', icon: Users },
  { id: 'office', label: '办公室', icon: MonitorPlay },
] as const

type TabId = (typeof tabs)[number]['id']

interface TabsNavigationProps {
  value: TabId
  onValueChange: (value: TabId) => void
  children: React.ReactNode
}

export function TabsNavigation({ value, onValueChange, children }: TabsNavigationProps) {
  return (
    <Tabs value={value} onValueChange={onValueChange} className="h-full flex flex-col">
      <div className="border-b border-border bg-background/95 backdrop-blur px-6">
        <TabsList className="h-12 w-full justify-start gap-2 bg-transparent p-0">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            )
          })}
        </TabsList>
      </div>
      {children}
    </Tabs>
  )
}

export type { TabId }
