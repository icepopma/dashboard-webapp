'use client'

import * as React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  Home,
  KanbanSquare,
  GitBranch,
  Calendar,
  FileText,
  Users,
  MonitorPlay,
  CheckSquare,
  Users2,
  FolderKanban,
  Brain,
  FileCode,
  User,
} from 'lucide-react'

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'kanban', label: 'Tasks', icon: KanbanSquare },
  { id: 'pipeline', label: 'Content', icon: GitBranch },
  { id: 'approvals', label: 'Approvals', icon: CheckSquare },
  { id: 'council', label: 'Council', icon: Users2 },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'memory', label: 'Memory', icon: Brain },
  { id: 'docs', label: 'Docs', icon: FileCode },
  { id: 'people', label: 'People', icon: User },
  { id: 'office', label: 'Office', icon: MonitorPlay },
  { id: 'team', label: 'Team', icon: Users },
] as const

export type NavItemId = typeof navItems[number]['id']

interface SidebarProps {
  activeTab: NavItemId
  onTabChange: (tab: NavItemId) => void
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-border bg-sidebar flex-shrink-0 flex flex-col">
      {/* Logo Area */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-xl">
            🫧
          </div>
          <div>
            <h1 className="text-lg font-semibold text-sidebar-foreground">Pop</h1>
            <p className="text-xs text-muted-foreground">Mission Control</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="p-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onTabChange(item.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          v1.0.0 • OpenClaw
        </div>
      </div>
    </aside>
  )
}
