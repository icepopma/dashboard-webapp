-- ─────────────────────────────────────────────────────────────────
-- Tags 表结构 - 任务标签系统
-- ─────────────────────────────────────────────────────────────────

-- Tags 表
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#6366f1',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task-Tags 关联表
CREATE TABLE IF NOT EXISTS task_tags (
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (task_id, tag_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
CREATE INDEX IF NOT EXISTS idx_task_tags_task_id ON task_tags(task_id);
CREATE INDEX IF NOT EXISTS idx_task_tags_tag_id ON task_tags(tag_id);

-- RLS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tags ENABLE ROW LEVEL SECURITY;

-- 公开访问策略 (开发环境)
CREATE POLICY "Allow all access" ON tags FOR ALL USING (true);
CREATE POLICY "Allow all access" ON task_tags FOR ALL USING (true);

-- 预置标签
INSERT INTO tags (name, color, description) VALUES
('前端', '#3b82f6', '前端开发相关'),
('后端', '#10b981', '后端开发相关'),
('设计', '#f59e0b', 'UI/UX 设计'),
('紧急', '#ef4444', '紧急任务'),
('文档', '#8b5cf6', '文档编写'),
('测试', '#ec4899', '测试相关'),
('Bug', '#f97316', 'Bug 修复'),
('优化', '#06b6d4', '性能优化')
ON CONFLICT (name) DO NOTHING;

-- 添加 tags 字段到 tasks 表（简化版，直接存储标签名数组）
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

SELECT 'Tags 表创建完成！' AS status;
