#!/usr/bin/env node

/**
 * Task: 004-创建数据库表
 * Description: 使用 Supabase SQL Editor 创建数据库表
 */

const fs = require('fs');
const path = require('path');

console.log('🗄️ 创建数据库表...');

try {
  const sqlFilePath = path.join(process.cwd(), 'supabase', 'schema.sql');
  const sqlDir = path.join(process.cwd(), 'supabase');

  // 创建 supabase 目录
  if (!fs.existsSync(sqlDir)) {
    fs.mkdirSync(sqlDir, { recursive: true });
    console.log('✅ 创建 supabase 目录');
  }

  // 创建 SQL schema 文件
  const schemaSQL = `-- Supabase Database Schema for Dashboard Web App
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/sql/new

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Ideas 表
CREATE TABLE IF NOT EXISTS ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  background TEXT,
  status TEXT DEFAULT 'idea' CHECK (status IN ('idea', 'planning', 'developing', 'completed', 'archived')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  local_path TEXT,
  sync_status TEXT DEFAULT 'local_only' CHECK (sync_status IN ('local_only', 'synced'))
);

-- 2. Idea files 表
CREATE TABLE IF NOT EXISTS idea_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  file_type TEXT NOT NULL CHECK (file_type IN ('idea', 'work_plan', 'task')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tasks 表
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  local_path TEXT NOT NULL,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'failed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  estimated_hours DECIMAL,
  actual_hours DECIMAL,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Progress logs 表
CREATE TABLE IF NOT EXISTS progress_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('status_change', 'progress_update', 'completion')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_priority ON ideas(priority);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_idea_id ON tasks(idea_id);
CREATE INDEX IF NOT EXISTS idx_progress_logs_task_id ON progress_logs(task_id);

-- Row Level Security (RLS) Policies
-- Users can only access their own ideas
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own ideas" ON ideas
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own ideas" ON ideas
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own ideas" ON ideas
  FOR UPDATE USING (true);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (true);
`;

  fs.writeFileSync(sqlFilePath, schemaSQL);
  console.log('✅ SQL schema 文件已创建:', sqlFilePath);
  console.log('📋 请在 Supabase SQL Editor 中执行此文件');
  console.log('🔗 https://supabase.com/dashboard/project/sql/new');

  process.exit(0);
} catch (error) {
  console.error('❌ 创建失败:', error.message);
  process.exit(1);
}
