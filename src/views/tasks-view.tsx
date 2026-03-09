'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  RotateCcw, LayoutGrid, List, ArrowUpDown, Filter,
  CheckSquare, UserCircle, Sunrise, AlertCircle
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { CreateProjectTaskDialog } from '@/components/create-project-task-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AgentTasksTab } from './tasks-view/tabs/agent-tasks-tab'
import { AgentMonitorTab } from './tasks-view/tabs/agent-monitor-tab'

type ViewMode = 'kanban' | 'list'
type SortBy = 'priority' | 'due_date' | 'created_at' | 'status'
type SmartFilter = 'all' | 'today' | 'overdue' | 'mine'

// Import the original TasksView content as a component
import { TasksViewContent } from './tasks-view/tabs/my-tasks-tab'

export function TasksView() {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState('my-tasks')

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-6 pt-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-semibold">{t('tasks.title')}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t('tasks.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            {t('common.refresh')}
          </Button>
          <CreateProjectTaskDialog onTaskCreated={() => {}} />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 flex-shrink-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="my-tasks">
              <UserCircle className="h-4 w-4 mr-2" />
              我的任务
            </TabsTrigger>
            <TabsTrigger value="agent-tasks">
              <CheckSquare className="h-4 w-4 mr-2" />
              Agent 任务
            </TabsTrigger>
            <TabsTrigger value="agent-monitor">
              <Sunrise className="h-4 w-4 mr-2" />
              Agent 监控
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tab Content */}
      <div className="flex-1 px-6 pb-6 overflow-auto mt-4">
        {activeTab === 'my-tasks' && (
          <TasksViewContent />
        )}
        {activeTab === 'agent-tasks' && (
          <AgentTasksTab />
        )}
        {activeTab === 'agent-monitor' && (
          <AgentMonitorTab />
        )}
      </div>
    </div>
  )
}
