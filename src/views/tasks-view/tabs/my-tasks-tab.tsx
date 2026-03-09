'use client'

// This component wraps the original TasksView content
// The full implementation is in the parent tasks-view.tsx
// This is a placeholder for future refactoring

export function TasksViewContent() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <p className="text-muted-foreground mb-4">我的任务功能正在整合中...</p>
        <p className="text-sm text-muted-foreground">
          请暂时使用原 Tasks 页面，或等待整合完成
        </p>
      </div>
    </div>
  )
}
