# Dashboard Web App 测试指南

## 📋 测试前准备

### 1. 克隆仓库
```bash
git clone https://github.com/icepopma/dashboard-webapp.git
cd dashboard-webapp
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置 Supabase

#### 创建 Supabase 项目
1. 访问：https://supabase.com/dashboard
2. 创建新项目：`Dashboard Web App`
3. SQL Editor 中执行以下命令：

```sql
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_priority ON ideas(priority);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_idea_id ON tasks(idea_id);
CREATE INDEX IF NOT EXISTS idx_progress_logs_task_id ON progress_logs(task_id);

-- Row Level Security (RLS) Policies
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
```

#### 获取环境变量
在 Supabase Dashboard → Settings → API 获取：
- `Project URL`: `https://[your-project-id].supabase.co`
- `anon public key`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- `service role key`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### 创建 .env.local 文件
```bash
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-public-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
```

### 4. 启动开发服务器
```bash
npm run dev
```

---

## 🧪 测试步骤

### 测试 1：Ideas CRUD

#### 1.1 列出所有 Ideas
```bash
curl http://localhost:3000/api/ideas
```

**预期结果**：
```json
[]
```

#### 1.2 创建新 Idea
```bash
curl -X POST http://localhost:3000/api/ideas \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "测试 Idea",
    "description": "这是一个测试 Idea",
    "background": "这是测试背景",
    "status": "idea",
    "priority": "high"
  }'
```

**预期结果**：
```json
{
  "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "name": "测试 Idea",
  "description": "这是一个测试 Idea",
  "background": "这是测试背景",
  "status": "idea",
  "priority": "high",
  "created_at": "2026-02-09T...",
  "updated_at": "2026-02-09T..."
}
```

#### 1.3 获取单个 Idea
```bash
curl http://localhost:3000/api/ideas/[idea-id]
```

**预期结果**：返回刚才创建的 Idea 详情

#### 1.4 更新 Idea
```bash
curl -X PUT http://localhost:3000/api/ideas/[idea-id] \\
  -H "Content-Type: application/json" \\
  -d '{
    "status": "planning"
  }'
```

**预期结果**：返回更新后的 Idea，status 改为 "planning"

#### 1.5 删除 Idea
```bash
curl -X DELETE http://localhost:3000/api/ideas/[idea-id]
```

**预期结果**：`200 OK`

---

### 测试 2：Tasks CRUD

#### 2.1 列出所有 Tasks
```bash
curl http://localhost:3000/api/tasks?idea_id=[idea-id]
```

**预期结果**：返回该 Idea 下的所有 tasks（初始为空）

#### 2.2 创建新 Task
```bash
curl -X POST http://localhost:3000/api/tasks \\
  -H "Content-Type: application/json" \\
  -d '{
    "idea_id": "[idea-id]",
    "local_path": "test-task.md",
    "status": "todo",
    "priority": "medium",
    "estimated_hours": 2
  }'
```

**预期结果**：返回新创建的 task

#### 2.3 更新 Task 状态
```bash
curl -X PATCH http://localhost:3000/api/tasks/[task-id] \\
  -H "Content-Type: application/json" \\
  -d '{
    "status": "in_progress"
  }'
```

**预期结果**：返回更新后的 task

#### 2.4 标记 Task 为完成
```bash
curl -X PATCH http://localhost:3000/api/tasks/[task-id] \\
  -H "Content-Type: application/json" \\
  -d '{
    "status": "completed"
  }'
```

**预期结果**：返回更新后的 task，status 为 "completed"

#### 2.5 删除 Task
```bash
curl -X DELETE http://localhost:3000/api/tasks/[task-id]
```

**预期结果**：`200 OK`

---

## 🧪 UI 测试

### 测试 3：Ideas Sidebar 组件

1. 访问 `http://localhost:3000`
2. 查看是否显示 Ideas Sidebar
3. 检查筛选按钮（全部/Idea/规划中/开发中/已完成）
4. 测试搜索框（输入关键词过滤）
5. 检查每个 Idea 是否显示状态徽章和优先级徽章
6. 检查是否有 "创建新 Idea" 按钮

**预期结果**：
- Sidebar 正常显示
- 筛选和搜索功能正常工作
- Idea 卡片显示正确的状态和优先级
- "创建新 Idea" 按钮正常显示

### 测试 4：Idea 详情页

1. 点击某个 Idea 卡片
2. 检查是否跳转到详情页
3. 检查导航栏是否有 "返回" 按钮
4. 检查 Tab 切换（Idea/Work Plan/Tasks）
5. 检查 Work Plan 是否显示为只读
6. 检查 Tasks 列表是否支持筛选和排序

**预期结果**：
- 详情页正常加载
- 返回按钮正常工作
- Tab 切换正常
- Work Plan 正常显示（只读）
- Tasks 列表正常显示

### 测试 5：创建新 Idea 对话框

1. 点击 "创建新 Idea" 按钮
2. 检查对话框是否正常显示
3. 填写表单：
   - 名称：必填
   - 描述：可选
   - 背景：可选
   - 优先级：高/中/低
4. 点击 "创建" 按钮

**预期结果**：
- 对话框正常显示
- 表单验证正常工作
- 创建成功后对话框关闭
- 新 Idea 出现在列表中

---

## 🐛 常见问题

### 问题 1：API 返回 404
**原因**：路由未正确配置
**解决**：检查 `src/app/api/` 目录结构是否正确

### 问题 2：Supabase 连接失败
**原因**：环境变量未正确配置
**解决**：检查 `.env.local` 文件，确保 URL 和 keys 正确

### 问题 3：组件渲染错误
**原因**：shadcn/ui 组件未正确配置
**解决**：运行 `npx shadcn-ui@latest init` 重新配置

### 问题 4：TypeScript 类型错误
**原因**：类型定义不正确
**解决**：检查 `src/types/env.d.ts` 是否正确定义了环境变量类型

---

## 📊 测试检查清单

### API 测试
- [ ] Ideas GET /api/ideas - 列出所有
- [ ] Ideas POST /api/ideas - 创建新 Idea
- [ ] Ideas GET /api/ideas/[id] - 获取单个
- [ ] Ideas PUT /api/ideas/[id] - 更新
- [ ] Ideas DELETE /api/ideas/[id] - 删除
- [ ] Tasks GET /api/tasks - 列出所有（可选 idea_id 过滤）
- [ ] Tasks POST /api/tasks - 创建新 Task
- [ ] Tasks PATCH /api/tasks/[id] - 更新
- [ ] Tasks DELETE /api/tasks/[id] - 删除

### UI 组件测试
- [ ] IdeasSidebar 组件正常显示
- [ ] IdeaCard 组件正常显示（状态和优先级徽章）
- [ ] CreateIdeaDialog 组件正常工作
- [ ] IdeaDetailLayout 组件正常显示
- [ ] IdeaTabs 组件 Tab 切换正常
- [ ] WorkPlanView 组件只读显示正常
- [ ] TasksList 组件正常显示
- [ ] ProgressBar 组件正常显示
- [ ] 筛选功能正常工作（全部/Idea/规划中/开发中/已完成）
- [ ] 搜索功能正常工作（实时搜索）
- [ ] 排序功能正常工作（最新/最早/名称）

---

## 🎯 测试目标

### 主要目标
1. ✅ Ideas CRUD 功能完全正常
2. ✅ Tasks CRUD 功能完全正常
3. ✅ 所有 UI 组件正常渲染和工作
4. ✅ 与 Supabase 数据库集成正常
5. ✅ 响应式设计在 Mobile/Tablet/Desktop 正常工作

### 次要目标
1. 筛选和搜索功能流畅
2. 状态切换（todo → in_progress → completed）正常
3. 进度条正确计算和显示
4. 没有控制台错误或警告
5. 代码符合 TypeScript 类型检查

---

## 📝 测试记录

### 测试日期：2026-02-09
### 测试人：Matt
### 测试环境：本地开发环境（npm run dev）

### 测试结果
- Ideas API：[ ] 通过 / [ ] 失败
- Tasks API：[ ] 通过 / [ ] 失败
- UI 组件：[ ] 通过 / [ ] 失败
- Supabase 集成：[ ] 通过 / [ ] 失败

### 发现的问题
1. [待填写]
2. [待填写]
3. [待填写]

### 改进建议
1. [待填写]
2. [待填写]
3. [待填写]

---

**测试完成后，请更新测试记录和发现的问题！** 🧪
