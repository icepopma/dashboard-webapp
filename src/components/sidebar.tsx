'use client'

import * as React from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/language-switcher'
import {
  Home,
  KanbanSquare,
  GitBranch,
  Calendar,
  Brain,
  Users,
  MonitorPlay,
  CheckSquare,
  Users2,
  FolderKanban,
  FileCode,
  User,
  Menu,
  X,
  Sparkles,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

const navItems = [
  { id: 'pop', icon: Sparkles },
  { id: 'home', icon: Home },
  { id: 'tasks', icon: KanbanSquare },
  { id: 'content', icon: GitBranch },
  { id: 'approvals', icon: CheckSquare },
  { id: 'council', icon: Users2 },
  { id: 'calendar', icon: Calendar },
  { id: 'projects', icon: FolderKanban },
  { id: 'memory', icon: Brain },
  { id: 'docs', icon: FileCode },
  { id: 'people', icon: User },
  { id: 'office', icon: MonitorPlay },
  { id: 'team', icon: Users },
] as const

export type NavItemId = typeof navItems[number]['id']

interface SidebarProps {
  activeTab: NavItemId
  onTabChange: (tab: NavItemId) => void
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { t } = useI18n()
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)

  const handleNavClick = (id: NavItemId) => {
    onTabChange(id)
    setIsMobileOpen(false)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-background border border-border shadow-sm"
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          'w-64 border-r border-border bg-sidebar flex-shrink-0 flex flex-col transition-transform duration-300',
          'fixed lg:relative inset-y-0 left-0 z-40',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo Area */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-xl">
                🫧
              </div>
              <div>
                <h1 className="text-lg font-semibold text-sidebar-foreground">Pop</h1>
                <p className="text-xs text-muted-foreground">Mission Control</p>
              </div>
            </div>
            <LanguageSwitcher />
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
                      onClick={() => handleNavClick(item.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {t(`nav.${item.id}`)}
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              v1.0.0 • OpenClaw
            </div>
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  )
}
