-- ─────────────────────────────────────────────────────────────────
-- Task Logs 表结构 - 任务操作日志
-- ─────────────────────────────────────────────────────────────────

-- Task Logs 表
CREATE TABLE IF NOT EXISTS task_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  field TEXT,
  old_value TEXT,
  new_value TEXT,
  actor TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_task_logs_task_id ON task_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_task_logs_created_at ON task_logs(created_at DESC);

-- RLS
ALTER TABLE task_logs ENABLE ROW LEVEL SECURITY;

-- 公开访问策略 (开发环境)
CREATE POLICY "Allow all access" ON task_logs FOR ALL USING (true);

-- 触发器函数：自动记录任务变更
CREATE OR REPLACE FUNCTION log_task_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- 记录创建
  IF TG_OP = 'INSERT' THEN
    INSERT INTO task_logs (task_id, action, actor, new_value)
    VALUES (NEW.id, 'created', NEW.assignee, to_jsonb(NEW));
    RETURN NEW;
  END IF;

  -- 记录更新
  IF TG_OP = 'UPDATE' THEN
    -- 状态变更
    IF OLD.status != NEW.status THEN
      INSERT INTO task_logs (task_id, action, field, old_value, new_value, actor)
      VALUES (NEW.id, 'status_changed', 'status', OLD.status, NEW.status, NEW.assignee);
    END IF;

    -- 优先级变更
    IF OLD.priority != NEW.priority THEN
      INSERT INTO task_logs (task_id, action, field, old_value, new_value, actor)
      VALUES (NEW.id, 'priority_changed', 'priority', OLD.priority, NEW.priority, NEW.assignee);
    END IF;

    -- 负责人变更
    IF OLD.assignee != NEW.assignee THEN
      INSERT INTO task_logs (task_id, action, field, old_value, new_value, actor)
      VALUES (NEW.id, 'assignee_changed', 'assignee', OLD.assignee, NEW.assignee, NEW.assignee);
    END IF;

    -- 标题变更
    IF OLD.title != NEW.title THEN
      INSERT INTO task_logs (task_id, action, field, old_value, new_value, actor)
      VALUES (NEW.id, 'title_changed', 'title', OLD.title, NEW.title, NEW.assignee);
    END IF;

    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 触发器
CREATE TRIGGER tasks_log_trigger
  AFTER INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION log_task_changes();

SELECT 'Task Logs 表创建完成！' AS status;
