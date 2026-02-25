'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Card } from '@/components/ui/card'
import { TaskCard, TaskCardData } from './task-card'
import { Plus } from 'lucide-react'

export interface KanbanColumnData {
  id: string
  title: string
  tasks: TaskCardData[]
  color: string
}

interface KanbanColumnProps {
  column: KanbanColumnData
  selectedTasks?: string[]
  onTaskSelect?: (taskId: string) => void
  onAISplit?: (taskId: string) => void
}

export function KanbanColumn({ column, selectedTasks = [], onTaskSelect, onAISplit }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  return (
    <div
      ref={setNodeRef}
      className="flex-shrink-0 w-72 flex flex-col gap-2"
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: column.color }}
          />
          <h3 className="font-medium text-sm">{column.title}</h3>
          <span className="text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
            {column.tasks.length}
          </span>
        </div>
        <button
          className="p-1 hover:bg-accent rounded transition-colors"
          title="Add task"
        >
          <Plus className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Column Body */}
      <Card
        className={`flex-1 min-h-[200px] p-2 transition-colors overflow-hidden ${
          isOver ? 'bg-accent/50 border-primary' : 'bg-muted/20'
        }`}
      >
        <SortableContext
          items={column.tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 h-full overflow-y-auto">
            {column.tasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task}
                isSelected={selectedTasks.includes(task.id)}
                onSelect={onTaskSelect}
                onAISplit={onAISplit}
              />
            ))}
            {column.tasks.length === 0 && (
              <div className="text-center text-xs text-muted-foreground py-8">
                拖拽任务到这里
              </div>
            )}
          </div>
        </SortableContext>
      </Card>
    </div>
  )
}
