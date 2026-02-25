-- ─────────────────────────────────────────────────────────────────
-- Ideas & Tasks 表结构
-- ─────────────────────────────────────────────────────────────────

-- Ideas 表
CREATE TABLE IF NOT EXISTS ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'new',
  priority TEXT DEFAULT 'medium',
  tags TEXT[] DEFAULT '{}',
  source TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks 表
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  type TEXT DEFAULT 'feature',
  idea_id UUID REFERENCES ideas(id),
  local_path TEXT,
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  assignee TEXT,
  tags TEXT[] DEFAULT '{}',
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_idea_id ON tasks(idea_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);

-- RLS
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 公开访问策略 (开发环境)
CREATE POLICY "Allow all access" ON ideas FOR ALL USING (true);
CREATE POLICY "Allow all access" ON tasks FOR ALL USING (true);

-- 触发器：自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ideas_updated_at
  BEFORE UPDATE ON ideas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 示例数据
INSERT INTO ideas (title, description, status, priority, tags) VALUES
('智能日程安排', 'AI 自动安排日程，优化时间利用', 'new', 'high', ARRAY['AI', 'productivity']),
('多语言支持', '支持中英文切换', 'planned', 'medium', ARRAY['i18n', 'feature']),
('移动端适配', '优化移动端体验', 'in-progress', 'high', ARRAY['mobile', 'ui']),
('数据导出', '支持导出 CSV/JSON', 'new', 'low', ARRAY['feature', 'data']);

INSERT INTO tasks (title, description, status, priority, type, idea_id, estimated_hours, assignee) VALUES
('设计智能日程算法', '研究并设计时间优化算法', 'in-progress', 'high', 'feature', 
  (SELECT id FROM ideas WHERE title = '智能日程安排'), 8, 'Codex'),
('实现语言切换组件', '创建语言选择器和上下文', 'completed', 'medium', 'feature',
  (SELECT id FROM ideas WHERE title = '多语言支持'), 4, 'Pop'),
('优化移动端布局', '修复响应式断点问题', 'completed', 'high', 'bugfix',
  (SELECT id FROM ideas WHERE title = '移动端适配'), 2, 'Pop');

SELECT 'Ideas & Tasks 表创建完成！' AS status;
