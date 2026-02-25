import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key'

// Only create client if not using placeholders
export const supabase = (supabaseUrl.includes('placeholder') || supabaseAnonKey.includes('placeholder'))
  ? null
  : createClient(supabaseUrl, supabaseAnonKey)

// Database types (based on schema.sql)
export interface Database {
  public: {
    Tables: {
      ideas: {
        Row: {
          id: string
          name: string
          description: string | null
          background: string | null
          status: 'idea' | 'planning' | 'developing' | 'completed' | 'archived'
          priority: 'high' | 'medium' | 'low'
          created_at: string
          updated_at: string
          local_path: string | null
          sync_status: 'local_only' | 'synced'
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          background?: string | null
          status?: 'idea' | 'planning' | 'developing' | 'completed' | 'archived'
          priority?: 'high' | 'medium' | 'low'
          local_path?: string | null
          sync_status?: 'local_only' | 'synced'
        }
        Update: {
          id: string
          name?: string
          description?: string | null
          background?: string | null
          status?: 'idea' | 'planning' | 'developing' | 'completed' | 'archived'
          priority?: 'high' | 'medium' | 'low'
          local_path?: string | null
          sync_status?: 'local_only' | 'synced'
        }
      }
      tasks: {
        Row: {
          id: string
          idea_id: string
          local_path: string
          status: 'todo' | 'in_progress' | 'completed' | 'failed'
          priority: 'high' | 'medium' | 'low'
          estimated_hours: number | null
          actual_hours: number | null
          started_at: string | null
          completed_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          idea_id: string
          local_path: string
          status?: 'todo' | 'in_progress' | 'completed' | 'failed'
          priority?: 'high' | 'medium' | 'low'
          estimated_hours?: number | null
          actual_hours?: number | null
          started_at?: string | null
          completed_at?: string
        }
        Update: {
          id: string
          idea_id?: string
          local_path?: string
          status?: 'todo' | 'in_progress' | 'completed' | 'failed'
          priority?: 'high' | 'medium' | 'low'
          estimated_hours?: number | null
          actual_hours?: number | null
          started_at?: string | null
          completed_at?: string
        }
      }
      idea_files: {
        Row: {
          id: string
          idea_id: string
          file_type: 'idea' | 'work_plan' | 'task'
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          idea_id: string
          file_type: 'idea' | 'work_plan' | 'task'
          content: string
        }
        Update: {
          id: string
          idea_id?: string
          file_type?: 'idea' | 'work_plan' | 'task'
          content?: string
        }
      }
      progress_logs: {
        Row: {
          id: string
          task_id: string
          event_type: 'status_change' | 'progress_update' | 'completion'
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          event_type: 'status_change' | 'progress_update' | 'completion'
          description?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Idea = Database['public']['Tables']['ideas']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type IdeaFile = Database['public']['Tables']['idea_files']['Row']
export type ProgressLog = Database['public']['Tables']['progress_logs']['Row']

// Helper functions
export async function getIdeas() {
  if (!supabase) {
    console.log('Supabase not configured, returning empty ideas')
    return []
  }
  
  const { data, error } = await supabase
    .from('ideas')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getTasks(ideaId?: string) {
  if (!supabase) {
    console.log('Supabase not configured, returning empty tasks')
    return []
  }
  
  let query = supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })

  if (ideaId) {
    query = query.eq('idea_id', ideaId)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function updateTask(taskId: string, updates: Partial<Task>) {
  if (!supabase) {
    console.log('Supabase not configured, cannot update task')
    return null
  }
  
  const { data, error } = await supabase
    .from('tasks')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) {
  if (!supabase) {
    console.log('Supabase not configured, cannot create task')
    return null
  }
  
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      ...task,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Additional helper functions
export async function getIdeaById(id: string) {
  if (!supabase) return null
  const { data, error } = await supabase.from('ideas').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function createIdea(idea: Record<string, any>) {
  if (!supabase) return null
  const { data, error } = await supabase.from('ideas').insert(idea).select().single()
  if (error) throw error
  return data
}

export async function updateIdea(id: string, updates: Record<string, any>) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('ideas')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteIdea(id: string) {
  if (!supabase) return
  const { error } = await supabase.from('ideas').delete().eq('id', id)
  if (error) throw error
}

export async function deleteTask(id: string) {
  if (!supabase) return
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}

export async function getTaskById(id: string) {
  if (!supabase) return null
  const { data, error } = await supabase.from('tasks').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

// Re-export from supabase.ts for other tables
export * from './supabase'
