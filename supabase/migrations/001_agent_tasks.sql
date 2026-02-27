-- Supabase Database Schema Update for Agent Tasks
-- Run this in Supabase SQL Editor

-- 1. 更新 tasks 表，添加 agent 相关字段
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assignee TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS session_id TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS run_id TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS result TEXT;

-- 让 idea_id 和 local_path 可以为空（对于直接派发的任务）
ALTER TABLE tasks ALTER COLUMN idea_id DROP NOT NULL;
ALTER TABLE tasks ALTER COLUMN local_path DROP NOT NULL;

-- 2. 创建 subagent 执行结果表
CREATE TABLE IF NOT EXISTS subagent_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  session_key TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'timeout')),
  input TEXT,
  output TEXT,
  error TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  tokens_used INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建 agent 状态历史表
CREATE TABLE IF NOT EXISTS agent_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('idle', 'working', 'error')),
  current_task TEXT,
  session_count INTEGER DEFAULT 0,
  success_rate DECIMAL DEFAULT 0.85,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_subagent_results_task_id ON subagent_results(task_id);
CREATE INDEX IF NOT EXISTS idx_subagent_results_session_key ON subagent_results(session_key);
CREATE INDEX IF NOT EXISTS idx_subagent_results_agent_id ON subagent_results(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_states_agent_id ON agent_states(agent_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee);
CREATE INDEX IF NOT EXISTS idx_tasks_session_id ON tasks(session_id);

-- RLS 策略
ALTER TABLE subagent_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view subagent_results" ON subagent_results
  FOR SELECT USING (true);
CREATE POLICY "Users can insert subagent_results" ON subagent_results
  FOR INSERT WITH CHECK (true);

ALTER TABLE agent_states ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view agent_states" ON agent_states
  FOR SELECT USING (true);
CREATE POLICY "Users can insert agent_states" ON agent_states
  FOR INSERT WITH CHECK (true);
