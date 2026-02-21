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
}

export function KanbanColumn({ column }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  return (
    <div
      ref={setNodeRef}
      className="flex-shrink-0 w-80 flex flex-col gap-3"
    >
      {/* Column Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${column.color}`}
            style={{ backgroundColor: column.color }}
          />
          <h3 className="font-semibold text-sm">{column.title}</h3>
          <span className="text-xs text-muted-foreground">
            {column.tasks.length}
          </span>
        </div>
        <button
          className="p-1 hover:bg-accent rounded transition-colors"
          title="Add task"
        >
          <Plus className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Column Body */}
      <Card
        className={`flex-1 min-h-[400px] p-3 transition-colors ${
          isOver ? 'bg-accent/50 border-primary' : 'bg-muted/30'
        }`}
      >
        <SortableContext
          items={column.tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {column.tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </SortableContext>
      </Card>
    </div>
  )
}
