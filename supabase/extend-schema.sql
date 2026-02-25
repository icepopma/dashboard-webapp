-- ─────────────────────────────────────────────────────────────────
-- Dashboard Supabase 表结构扩展
-- 执行时间: 2026-02-25 夜间值班
-- ─────────────────────────────────────────────────────────────────

-- 1. 审批表
CREATE TABLE IF NOT EXISTS approvals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'general',
  risk TEXT DEFAULT 'low',
  requester TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by TEXT,
  rejected_at TIMESTAMPTZ,
  rejected_by TEXT,
  rejection_reason TEXT
);

-- 2. 委员会投票表
CREATE TABLE IF NOT EXISTS council_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  options JSONB NOT NULL DEFAULT '[]',
  status TEXT DEFAULT 'active',
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deadline TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- 3. 项目表
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planning',
  progress INTEGER DEFAULT 0,
  color TEXT DEFAULT '#3b82f6',
  start_date DATE,
  target_date DATE,
  tasks_total INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  members TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 活动日志表
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent TEXT NOT NULL,
  action TEXT NOT NULL,
  type TEXT DEFAULT 'general',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 智能体会话表
CREATE TABLE IF NOT EXISTS agent_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  agent TEXT NOT NULL,
  task_id TEXT,
  status TEXT DEFAULT 'starting',
  worktree TEXT,
  tmux_session TEXT,
  branch TEXT,
  pid INTEGER,
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  output TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);
CREATE INDEX IF NOT EXISTS idx_approvals_created_at ON approvals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_council_votes_status ON council_votes(status);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_agent ON activity_logs(agent);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_agent ON agent_sessions(agent);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_status ON agent_sessions(status);

-- 启用 RLS (Row Level Security)
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE council_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_sessions ENABLE ROW LEVEL SECURITY;

-- 创建公开访问策略 (开发环境)
CREATE POLICY "Allow all access" ON approvals FOR ALL USING (true);
CREATE POLICY "Allow all access" ON council_votes FOR ALL USING (true);
CREATE POLICY "Allow all access" ON projects FOR ALL USING (true);
CREATE POLICY "Allow all access" ON activity_logs FOR ALL USING (true);
CREATE POLICY "Allow all access" ON agent_sessions FOR ALL USING (true);

-- 插入示例数据

-- 审批示例
INSERT INTO approvals (title, description, type, risk, requester, status) VALUES
('部署 Dashboard 到生产环境', 'Dashboard v1.0.0 已通过测试，请求部署到生产环境', 'deployment', 'medium', 'Codex', 'pending'),
('合并 PR #12: 添加用户认证', 'PR 包含认证逻辑变更，需要审批', 'merge', 'high', 'Claude', 'pending'),
('发送营销邮件给 5000 用户', '周报邮件，内容已审核', 'action', 'low', 'Echo', 'pending');

-- 投票示例
INSERT INTO council_votes (title, description, options, status, created_by, deadline) VALUES
('选择前端框架：React vs Vue', '新项目应该使用哪个前端框架？', 
 '[{"id": "react", "label": "React", "votes": ["Pop", "Codex"]}, {"id": "vue", "label": "Vue", "votes": ["Quill"]}, {"id": "svelte", "label": "Svelte", "votes": []}]'::jsonb,
 'active', 'Pop', NOW() + INTERVAL '1 day'),
('发布时间：早上 vs 晚上', '内容最佳发布时间？',
 '[{"id": "morning", "label": "早上 8-10 点", "votes": ["Echo", "Scout"]}, {"id": "evening", "label": "晚上 8-10 点", "votes": ["Quill"]}]'::jsonb,
 'active', 'Echo', NOW() + INTERVAL '12 hours');

-- 项目示例
INSERT INTO projects (name, description, status, progress, color, start_date, target_date, tasks_total, tasks_completed, members) VALUES
('Dashboard Webapp', 'AI 智能体管理仪表板', 'active', 65, '#3b82f6', '2026-02-20', '2026-03-15', 58, 38, ARRAY['Pop', 'Codex', 'Claude']),
('Content Pipeline', '内容创作与发布流程', 'active', 45, '#8b5cf6', '2026-02-15', '2026-03-01', 24, 11, ARRAY['Quill', 'Echo']),
('AI Agent System', '智能体集群架构', 'planning', 20, '#f59e0b', '2026-02-25', '2026-04-01', 15, 3, ARRAY['Pop', 'Scout']);

-- 活动日志示例
INSERT INTO activity_logs (agent, action, type) VALUES
('Pop', '完成智能体集群架构', 'complete'),
('Codex', '提交 PR #12: 用户认证', 'pr'),
('Quill', '完成博客文章初稿', 'content'),
('Echo', '发布 Twitter 线程', 'publish'),
('Scout', '完成竞品分析报告', 'analysis');

-- 完成
SELECT 'Supabase 表结构扩展完成！' AS status;
