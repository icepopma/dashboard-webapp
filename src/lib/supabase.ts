// ─────────────────────────────────────────────────────────────────
// Supabase Client - 数据库客户端
// ─────────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// 辅助函数

// 审批
export async function getApprovals(status?: string) {
  let query = supabase.from('approvals').select('*').order('created_at', { ascending: false })
  if (status) query = query.eq('status', status)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function updateApproval(id: string, updates: Record<string, any>) {
  const { data, error } = await supabase
    .from('approvals')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// 委员会投票
export async function getCouncilVotes(status?: string) {
  let query = supabase.from('council_votes').select('*').order('created_at', { ascending: false })
  if (status) query = query.eq('status', status)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function updateCouncilVote(id: string, updates: Record<string, any>) {
  const { data, error } = await supabase
    .from('council_votes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// 项目
export async function getProjects(status?: string) {
  let query = supabase.from('projects').select('*').order('updated_at', { ascending: false })
  if (status) query = query.eq('status', status)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createProject(project: Record<string, any>) {
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateProject(id: string, updates: Record<string, any>) {
  const { data, error } = await supabase
    .from('projects')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// 活动日志
export async function getActivityLogs(limit = 20, agent?: string) {
  let query = supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(limit)
  if (agent) query = query.eq('agent', agent)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createActivityLog(log: { agent: string; action: string; type?: string; metadata?: any }) {
  const { data, error } = await supabase
    .from('activity_logs')
    .insert(log)
    .select()
    .single()
  if (error) throw error
  return data
}

// 智能体会话
export async function getAgentSessions(status?: string) {
  let query = supabase.from('agent_sessions').select('*').order('start_time', { ascending: false })
  if (status) query = query.eq('status', status)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createAgentSession(session: Record<string, any>) {
  const { data, error } = await supabase
    .from('agent_sessions')
    .insert(session)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateAgentSession(sessionId: string, updates: Record<string, any>) {
  const { data, error } = await supabase
    .from('agent_sessions')
    .update(updates)
    .eq('session_id', sessionId)
    .select()
    .single()
  if (error) throw error
  return data
}

// Ideas
export async function getIdeas(status?: string) {
  let query = supabase.from('ideas').select('*').order('created_at', { ascending: false })
  if (status) query = query.eq('status', status)
  const { data, error } = await query
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

export async function createIdea(idea: Record<string, any>) {
  const { data, error } = await supabase
    .from('ideas')
    .insert(idea)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateIdea(id: string, updates: Record<string, any>) {
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
  const { error } = await supabase.from('ideas').delete().eq('id', id)
  if (error) throw error
}

// Tasks
export async function getTasks(status?: string) {
  let query = supabase.from('tasks').select('*').order('created_at', { ascending: false })
  if (status) query = query.eq('status', status)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getTaskById(id: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createTask(task: Record<string, any>) {
  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateTask(id: string, updates: Record<string, any>) {
  const { data, error } = await supabase
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTask(id: string) {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}

// Subagent Results
export async function getSubagentResults(agentId?: string, status?: string) {
  let query = supabase.from('subagent_results').select('*').order('created_at', { ascending: false })
  if (agentId) query = query.eq('agent_id', agentId)
  if (status) query = query.eq('status', status)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getSubagentResultBySessionKey(sessionKey: string) {
  const { data, error } = await supabase
    .from('subagent_results')
    .select('*')
    .eq('session_key', sessionKey)
    .single()
  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
  return data
}

export async function createSubagentResult(result: {
  task_id?: string
  session_key: string
  agent_id: string
  status?: string
  input?: string
}) {
  const { data, error } = await supabase
    .from('subagent_results')
    .insert(result)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateSubagentResult(sessionKey: string, updates: {
  status?: string
  output?: string
  error?: string
  completed_at?: string
  duration_seconds?: number
}) {
  const { data, error } = await supabase
    .from('subagent_results')
    .update(updates)
    .eq('session_key', sessionKey)
    .select()
    .single()
  if (error) throw error
  return data
}
