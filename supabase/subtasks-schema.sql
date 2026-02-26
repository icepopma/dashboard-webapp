-- ─────────────────────────────────────────────────────────────────
-- Subtasks 表结构 - 子任务系统
-- ─────────────────────────────────────────────────────────────────

-- Subtasks 表
CREATE TABLE IF NOT EXISTS subtasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assignee TEXT,
  order_index INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_status ON subtasks(status);
CREATE INDEX IF NOT EXISTS idx_subtasks_order ON subtasks(task_id, order_index);

-- RLS
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;

-- 公开访问策略 (开发环境)
CREATE POLICY "Allow all access" ON subtasks FOR ALL USING (true);

-- 触发器：自动更新 updated_at
CREATE TRIGGER subtasks_updated_at
  BEFORE UPDATE ON subtasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 函数：更新父任务的完成进度
CREATE OR REPLACE FUNCTION update_task_completion()
RETURNS TRIGGER AS $$
DECLARE
  total_subtasks INTEGER;
  completed_subtasks INTEGER;
  completion_rate DECIMAL(5,2);
BEGIN
  -- 计算子任务完成情况
  SELECT COUNT(*) INTO total_subtasks
  FROM subtasks WHERE task_id = COALESCE(NEW.task_id, OLD.task_id);
  
  SELECT COUNT(*) INTO completed_subtasks
  FROM subtasks WHERE task_id = COALESCE(NEW.task_id, OLD.task_id) AND status = 'done';
  
  -- 如果全部完成，更新父任务状态为 done
  IF total_subtasks > 0 AND completed_subtasks = total_subtasks THEN
    UPDATE tasks SET status = 'done', completed_at = NOW()
    WHERE id = COALESCE(NEW.task_id, OLD.task_id) AND status != 'done';
  -- 如果有子任务完成但不是全部，确保父任务不是 done
  ELSIF completed_subtasks > 0 AND completed_subtasks < total_subtasks THEN
    UPDATE tasks SET status = 'in_progress'
    WHERE id = COALESCE(NEW.task_id, OLD.task_id) AND status = 'done';
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 触发器：子任务变化时更新父任务
CREATE TRIGGER subtasks_completion_trigger
  AFTER INSERT OR UPDATE OR DELETE ON subtasks
  FOR EACH ROW
  EXECUTE FUNCTION update_task_completion();

-- 示例数据
INSERT INTO subtasks (task_id, title, status, priority, order_index) VALUES
((SELECT id FROM tasks WHERE title = '设计智能日程算法'), '研究现有算法', 'done', 'high', 1),
((SELECT id FROM tasks WHERE title = '设计智能日程算法'), '设计数据结构', 'in_progress', 'high', 2),
((SELECT id FROM tasks WHERE title = '设计智能日程算法'), '编写核心逻辑', 'todo', 'high', 3),
((SELECT id FROM tasks WHERE title = '设计智能日程算法'), '单元测试', 'todo', 'medium', 4);

SELECT 'Subtasks 表创建完成！' AS status;
