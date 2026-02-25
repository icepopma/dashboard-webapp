'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Types
export interface Task {
  id: string
  idea_id?: string
  local_path: string
  status: 'todo' | 'in_progress' | 'completed' | 'failed'
  priority: 'high' | 'medium' | 'low'
  estimated_hours?: number
  actual_hours?: number
  created_at?: string
  updated_at?: string
}

export interface Idea {
  id: string
  name: string
  description?: string
  status: string
  priority: string
  local_path?: string
  created_at?: string
}

// Fetch all tasks
export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async (): Promise<Task[]> => {
      const response = await fetch('/api/tasks')
      const data = await response.json()
      return data.tasks || []
    },
  })
}

// Fetch single task
export function useTask(taskId: string) {
  return useQuery({
    queryKey: ['tasks', taskId],
    queryFn: async (): Promise<Task | null> => {
      const response = await fetch(`/api/tasks/${taskId}`)
      const data = await response.json()
      return data.task || null
    },
    enabled: !!taskId,
  })
}

// Update task status (with optimistic update)
export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      return response.json()
    },
    onMutate: async ({ taskId, updates }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks'] })

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks'])

      // Optimistically update to the new value
      queryClient.setQueryData<Task[]>(['tasks'], (old) =>
        old?.map((task) =>
          task.id === taskId ? { ...task, ...updates } : task
        ) || []
      )

      return { previousTasks }
    },
    onError: (err, { taskId }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(['tasks'], context?.previousTasks)
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

// Create new task
export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (task: Omit<Task, 'id'>) => {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

// Fetch all ideas
export function useIdeas() {
  return useQuery({
    queryKey: ['ideas'],
    queryFn: async (): Promise<Idea[]> => {
      const response = await fetch('/api/ideas')
      const data = await response.json()
      return data.ideas || []
    },
  })
}

// Fetch single idea
export function useIdea(ideaId: string) {
  return useQuery({
    queryKey: ['ideas', ideaId],
    queryFn: async (): Promise<Idea | null> => {
      const response = await fetch(`/api/ideas/${ideaId}`)
      const data = await response.json()
      return data.idea || null
    },
    enabled: !!ideaId,
  })
}

// Sync local files to Supabase
export function useSync() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (type: 'ideas' | 'tasks') => {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })
      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch all data after sync
      queryClient.invalidateQueries({ queryKey: ['ideas'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
