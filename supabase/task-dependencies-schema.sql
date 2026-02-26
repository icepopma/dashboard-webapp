-- ─────────────────────────────────────────────────────────────────
-- Task Dependencies 表结构 - 任务依赖关系
-- ─────────────────────────────────────────────────────────────────

-- Task Dependencies 表
CREATE TABLE IF NOT EXISTS task_dependencies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id, depends_on_task_id),
  CHECK (task_id != depends_on_task_id) -- 不能依赖自己
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_task_dependencies_task_id ON task_dependencies(task_id);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_depends_on ON task_dependencies(depends_on_task_id);

-- RLS
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;

-- 公开访问策略 (开发环境)
CREATE POLICY "Allow all access" ON task_dependencies FOR ALL USING (true);

-- 触发器函数：自动更新任务状态为阻塞
CREATE OR REPLACE FUNCTION check_task_dependencies()
RETURNS TRIGGER AS $$
DECLARE
  all_deps_completed BOOLEAN;
BEGIN
  -- 检查所有依赖是否完成
  SELECT BOOL_AND(dep_task.status = 'done')
  INTO all_deps_completed
  FROM task_dependencies td
  JOIN tasks dep_task ON td.depends_on_task_id = dep_task.id
  WHERE td.task_id = NEW.id;

  -- 如果有依赖且未全部完成，标记为阻塞
  IF all_deps_completed IS NULL THEN
    -- 没有依赖，不做处理
    NULL;
  ELSIF all_deps_completed = FALSE AND NEW.status = 'in_progress' THEN
    -- 有未完成的依赖，且当前是进行中，改为阻塞
    UPDATE tasks SET status = 'blocked' WHERE id = NEW.id;
  ELSIF all_deps_completed = TRUE AND NEW.status = 'blocked' THEN
    -- 所有依赖完成，且当前是阻塞，改为待办
    UPDATE tasks SET status = 'todo' WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 触发器
CREATE TRIGGER check_dependencies_trigger
  AFTER UPDATE OF status ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION check_task_dependencies();

-- 函数：当依赖任务完成时检查被阻塞的任务
CREATE OR REPLACE FUNCTION unblock_dependent_tasks()
RETURNS TRIGGER AS $$
BEGIN
  -- 当任务完成时，检查依赖此任务的任务
  IF NEW.status = 'done' AND OLD.status != 'done' THEN
    -- 更新所有被阻塞的依赖任务
    UPDATE tasks t
    SET status = 'todo'
    FROM task_dependencies td
    WHERE td.task_id = t.id
      AND td.depends_on_task_id = NEW.id
      AND t.status = 'blocked'
      AND NOT EXISTS (
        -- 确保没有其他未完成的依赖
        SELECT 1 FROM task_dependencies td2
        JOIN tasks dep ON td2.depends_on_task_id = dep.id
        WHERE td2.task_id = t.id AND dep.status != 'done'
      );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 触发器
CREATE TRIGGER unblock_dependent_trigger
  AFTER UPDATE OF status ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION unblock_dependent_tasks();

SELECT 'Task Dependencies 表创建完成！' AS status;
