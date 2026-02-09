import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Ideas table operations
export async function getIdeas() {
  const { data, error } = await supabase
    .from('ideas')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getIdeaById(id: string) {
  const { data, error } = await supabase
    .from('ideas')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createIdea(idea: Partial<Idea>) {
  const { data, error } = await supabase
    .from('ideas')
    .insert([idea])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateIdea(id: string, updates: Partial<Idea>) {
  const { data, error } = await supabase
    .from('ideas')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteIdea(id: string) {
  const { error } = await supabase
    .from('ideas')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Tasks table operations
export async function getTasks(ideaId?: string) {
  let query = supabase.from('tasks').select('*')

  if (ideaId) {
    query = query.eq('idea_id', ideaId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createTask(task: Partial<Task>) {
  const { data, error } = await supabase
    .from('tasks')
    .insert([task])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTask(id: string, updates: Partial<Task>) {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTask(id: string) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// TypeScript types
export interface Idea {
  id?: string
  name: string
  description?: string
  background?: string
  status?: 'idea' | 'planning' | 'developing' | 'completed' | 'archived'
  priority?: 'high' | 'medium' | 'low'
  created_at?: string
  updated_at?: string
  local_path?: string
  sync_status?: 'local_only' | 'synced'
}

export interface Task {
  id?: string
  idea_id?: string
  local_path: string
  status?: 'todo' | 'in_progress' | 'completed' | 'failed'
  priority?: 'high' | 'medium' | 'low'
  estimated_hours?: number
  actual_hours?: number
  started_at?: string
  completed_at?: string
  created_at?: string
  updated_at?: string
}
