-- ─────────────────────────────────────────────────────────────────
-- Task Comments 表结构 - 任务评论
-- ─────────────────────────────────────────────────────────────────

-- Task Comments 表
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author TEXT,
  mentions TEXT[] DEFAULT '{}',
  parent_id UUID REFERENCES task_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_author ON task_comments(author);
CREATE INDEX IF NOT EXISTS idx_task_comments_created_at ON task_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_comments_parent_id ON task_comments(parent_id);

-- RLS
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

-- 公开访问策略 (开发环境)
CREATE POLICY "Allow all access" ON task_comments FOR ALL USING (true);

-- 触发器：自动更新 updated_at
CREATE TRIGGER task_comments_updated_at
  BEFORE UPDATE ON task_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 函数：提取 @ 提及
CREATE OR REPLACE FUNCTION extract_mentions(content TEXT)
RETURNS TEXT[] AS $$
DECLARE
  mentions TEXT[];
BEGIN
  -- 提取 @username 格式的提及
  SELECT ARRAY(
    SELECT DISTINCT regexp_matches(content, '@([a-zA-Z0-9_-]+)', 'g')
  ) INTO mentions;

  RETURN COALESCE(mentions, '{}');
END;
$$ LANGUAGE plpgsql;

-- 触发器：自动提取提及
CREATE OR REPLACE FUNCTION auto_extract_mentions()
RETURNS TRIGGER AS $$
BEGIN
  NEW.mentions := extract_mentions(NEW.content);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_comments_mentions_trigger
  BEFORE INSERT OR UPDATE ON task_comments
  FOR EACH ROW
  EXECUTE FUNCTION auto_extract_mentions();

SELECT 'Task Comments 表创建完成！' AS status;
