# Work Plan: Dashboard Web App

## 设计方案

### 方案 A：Next.js + shadcn/ui + Supabase + Docker
**前端**：Next.js 15+ + TypeScript + shadcn/ui + TailwindCSS
- **App Router**：简单强大，内置布局支持
- **Server Components**：shadcn/ui 基于 Radix UI，可定制性强
- **TailwindCSS**：shadcn/ui 原生支持，设计灵活
- **TypeScript**：类型安全
- **生态成熟**：大量教程和案例

**后端**：Next.js API Routes + Supabase (PostgreSQL)
- **Realtime**：内置 WebSocket 支持（实时更新）
- **Auth**：开箱即用的认证系统
- **Storage**：文件存储 + CDN
- **Edge Functions**：Serverless 计算支持
- **开源**：有慷慨的免费层

### 方案 B：React + Ant Design + PostgreSQL
**优点**：企业级 UI，稳定可靠
**缺点**：需要独立路由，与 Next.js 集成复杂

### 方案 C：Next.js + 自定义 UI + SQLite
**优点**：最快启动，零配置
**缺点**：无团队协作，搜索能力弱

## 推荐方案
- **方案 A**：Next.js + shadcn/ui + Supabase
- 为什么：生态成熟、开发效率高、未来可扩展
- 特别优势：shadcn/ui 与 Next.js 无缝集成

---

## 架构概览

### 整体架构

```
┌─────────────────────────────────────────┐
│          Browser                    │
└───────────┬─────────────────────────┘
            │
         Next.js App (Docker)
            │
    ┌───────┴───────┬───────┐
    │                 │          │
  App Router      │   Supabase   │
  (API Routes)     │   (PostgreSQL)  │
    │                 │          │
    └───────┬───────┘
            │
         shadcn/ui Components
         (Client-side State)
```

### 布局设计

```
┌─────────────────────────────────────────────────┐
│                                               │
│  ┌─────┐        ┌──────────────────────┐  │
│  │Side │        │      Main Content      │  │
│  │ bar  │        │                       │  │
│  │       │        │  Idea List           │  │
│  │       │        │  Work Plan           │  │
│  │       │        │  Tasks               │  │
│  │       │        │  Progress Visual.    │  │
│  │       │        │  Statistics          │  │
│  │       │        │                       │  │
│  └─────┘        └──────────────────────┘  │
│                                               │
│         Main Content                          │
│  ┌──────────────────────────────────┐     │
│  │ Selected Idea Detail           │     │
│  │                              │     │
│  │  - idea.md                   │     │
│  │  - work-plan.md              │     │
│  │  - tasks/                   │     │
│  │  - Progress Chart            │     │
│  │                              │     │
│  └──────────────────────────────────┘     │
│                                               │
└─────────────────────────────────────────────────┘
```

---

## 数据模型设计

### Supabase Tables

#### 1. ideas 表
```sql
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  background TEXT,
  status TEXT DEFAULT 'idea', -- 'idea', 'planning', 'developing', 'completed', 'archived'
  priority TEXT DEFAULT 'medium', -- 'high', 'medium', 'low'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  local_path TEXT, -- 本地文件路径（与文件系统集成）
  sync_status TEXT DEFAULT 'local_only' -- 'local_only', 'synced'
);
```

#### 2. idea_files 表（work-plan 和 tasks）
```sql
CREATE TABLE idea_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  file_type TEXT NOT NULL, -- 'idea', 'work_plan', 'task'
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. tasks 表
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  local_path TEXT NOT NULL,
  status TEXT DEFAULT 'todo', -- 'todo', 'in_progress', 'completed', 'failed'
  priority TEXT DEFAULT 'medium',
  estimated_hours DECIMAL,
  actual_hours DECIMAL,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 4. progress_logs 表（进度记录）
```sql
CREATE TABLE progress_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'status_change', 'progress_update', 'completion'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 核心组件设计

### 1. Ideas Sidebar
```
components/ideas/
├── Sidebar.tsx              # 主组件
├── IdeaCard.tsx              # 单个 idea 卡片
├── CreateIdeaDialog.tsx     # 创建新 idea 对话框
└── types.ts                 # TypeScript 类型
```

### 2. Idea Detail View
```
components/idea-detail/
├── IdeaDetailLayout.tsx      # 布局容器
├── IdeaHeader.tsx            # idea 头部（名称、状态、优先级）
├── IdeaTabs.tsx              # Tab 切换（idea/work-plan/tasks）
├── WorkPlanView.tsx         # Work Plan 视图（只读）
├── TasksList.tsx            # Tasks 列表
├── TaskCard.tsx             # 单个 task 卡片
└── ProgressChart.tsx         # 进度可视化
```

### 3. Statistics View
```
components/statistics/
├── StatsOverview.tsx         # 统计概览
├── CompletionRateChart.tsx   # 完成率图表
└── TaskDistributionChart.tsx # 任务分布图
```

### 4. Shared UI Components (shadcn/ui)
```
components/ui/
├── Button.tsx
├── Input.tsx
├── Textarea.tsx
├── Select.tsx
├── Badge.tsx              # 状态徽章
├── ProgressBar.tsx       # 进度条
└── Dialog.tsx
```

---

## 实施步骤

### 阶段 1：项目初始化 🚀
- [ ] 1.1：创建 Next.js 项目（Docker 友好）
  ```bash
  npx create-next-app@latest dashboard --typescript --tailwind --eslint
  cd dashboard
  ```
- [ ] 1.2：安装 shadcn/ui
  ```bash
  npx shadcn-ui@latest init
  ```
- [ ] 1.3：配置 Supabase
  - 创建 Supabase 项目
  - 获取 Project URL 和 Anon Key
  - 配置环境变量
- [ ] 1.4：设置 Docker Compose
  ```yaml
  version: '3.8'
  services:
    dashboard:
      build:
        context: .
        dockerfile: Dockerfile
      ports:
        - "3000:3000"
      environment:
        - DATABASE_URL=postgresql://...
        - NEXT_PUBLIC_SUPABASE_URL=...
        - NEXT_PUBLIC_SUPABASE_ANON_KEY=...
  ```
- [ ] 1.5：初始化数据库表
  - 使用 Supabase SQL Editor
  - 执行建表 SQL
  - 创建 RLS 策略
- [ ] 1.6：配置环境变量（.env.local）

**里程碑**：可运行的本地开发环境

---

### 阶段 2：基础数据层 📦
- [ ] 2.1：创建 Supabase TypeScript 客户端
  ```bash
  npm install @supabase/supabase-js
  ```
- [ ] 2.2：创建 API routes（/app/api/ideas/*）
  - GET /api/ideas - 列表
  - POST /api/ideas - 创建
  - GET /api/ideas/[id] - 详情
  - PATCH /api/ideas/[id] - 更新
- [ ] 2.3：实现文件系统同步（读取 `notes/ideas/`）
  - 文件系统监听（fs.watch）
  - 解析 idea.md、work-plan.md、tasks/
  - 同步到 Supabase
- [ ] 2.4：创建 RLS (Row Level Security) 策略
  - 用户只能访问自己的 ideas
  - 实现安全策略
- [ ] 2.5：实现 ideas CRUD 操作
  - 使用 Supabase Client
  - 实现增删改查

**里程碑**：数据库 API 可用，与文件系统集成

---

### 阶段 3：Sidebar - Ideas 列表 📋
- [ ] 3.1：创建 IdeasSidebar 组件
  - 使用 shadcn/ui 的 ScrollArea
  - 显示所有 ideas（来自 Supabase）
  - 支持筛选（按状态、优先级）
  - 支持搜索
  - 点击进入详情视图
- [ ] 3.2：实现 IdeaCard（显示名称、状态、优先级）
  - 使用 shadcn/ui 的 Card
  - 显示 idea 状态（Idea/Planning/Developing）
  - 显示优先级徽章
- [ ] 3.3：添加筛选功能
  - 状态筛选下拉
  - 优先级筛选
  - 搜索框
- [ ] 3.4：添加搜索功能
  - 实时搜索 ideas
  - 使用 Supabase Full-text Search
- [ ] 3.5：实现 CreateIdeaDialog
  - 使用 shadcn/ui 的 Dialog
  - 表单：名称、描述、背景、优先级

**里程碑**：可浏览所有 ideas，创建新 idea

---

### 阶段 4：Idea Detail - Tabs 和内容 📄
- [ ] 4.1：创建 IdeaDetailLayout
  - 使用 shadcn/ui 的 ResizablePanel
  - 侧边栏可调整宽度
- [ ] 4.2：实现 IdeaTabs
  - 使用 shadcn/ui 的 TabsList
  - Tab 1：Idea 概述
  - Tab 2：Work Plan（只读）
  - Tab 3：Tasks（可编辑）
- [ ] 4.3：Work Plan 视图
  - 只读显示 work-plan.md 内容
  - 引用对应 work-plan 步骤
- [ ] 4.4：Tasks 列表
  - 显示所有 tasks
  - 支持状态切换
  - 支持优先级排序
  - 支持删除
- [ ] 4.5：编辑功能
  - idea.md 可编辑
  - 实时保存到 Supabase
- [ ] 4.6：进度条显示
  - 计算完成度（已完成任务/总任务）
  - 使用 shadcn/ui 的 Progress 组件

**里程碑**：完整查看单个 idea 的所有信息

---

### 阶段 5：Tasks 管理 📋
- [ ] 5.1：TaskCard 组件
  - 使用 shadcn/ui 的 Card
  - 任务名称、描述、状态
  - 优先级选择
  - 预计时间输入
  - 状态切换按钮
- [ ] 5.2：状态切换
  - 点击切换状态
  - 实时更新 Supabase
  - 更新 local task 文件
- [ ] 5.3：添加新任务
  - 创建新 task 记录
  - 同步到 Supabase
- [ ] 5.4：删除任务
  - 从 Supabase 和本地文件删除
  - 确认对话框
- [ ] 5.5：任务拖拽排序
  - 实现拖拽 API
  - 更新任务顺序

**里程碑**：完整的任务管理功能

---

### 阶段 6：进度可视化 📊
- [ ] 6.1：安装图表库
  ```bash
  npm install recharts
  ```
- [ ] 6.2：DoughnutChart（完成进度环形图）
  - 使用 shadcn/ui 的 Card
  - 显示：已完成/进行中/待做
  - 中心显示总完成度
- [ ] 6.3：TimelineChart（时间线视图）
  - 时间轴：创建 → 规划 → 开发 → 完成
  - 每个阶段的任务标记
- [ ] 6.4：进度计算逻辑
  - 统计各阶段任务数
  - 计算加权完成度
  - 考虑优先级权重

**里程碑**：可视化完整的生命周期进度

---

### 阶段 7：统计和报告 📈
- [ ] 7.1：StatsOverview
  - 总 ideas 数
  - 完成率（已完成/总计）
  - 高/中/低优先级分布
  - 近 7 天创建趋势
- [ ] 7.2：CompletionRateChart
  - 折线图：完成率趋势
  - 每日完成率
  - 移动平均
- [ ] 7.3：TaskDistributionChart
  - 饼图：优先级分布
  - 按状态分布
  - 按阶段分布
- [ ] 7.4：导出功能
  - 导出为 JSON/CSV
  - 包含所有 ideas 和 tasks

**里程碑**：数据洞察和报告

---

### 阶段 8：与文件系统集成 🔄
- [ ] 8.1：监听 `notes/ideas/` 变化
  - 使用 Node.js `chokidar` 库
  - 监听文件创建、修改、删除
  - 同步到 Supabase
- [ ] 8.2：双向同步（文件 ↔ Supabase）
  - Supabase 变化 → 更新本地文件
  - 本地文件变化 → 更新 Supabase
  - 冲突解决：最后更新时间戳检测
- [ ] 8.3：冲突解决
  - 提示用户选择保留哪个版本
  - "检测到冲突：本地更新 vs 云端更新"
  - 选项：保留本地 / 保留云端
- [ ] 8.4：离线优先策略
  - 优先显示本地数据
  - 网络恢复后自动同步云端

**里程碑**：文件和数据库保持同步

---

### 阶段 9：优化和部署 🚀
- [ ] 9.1：性能优化
  - 虚拟化列表（React Query）
  - 分页加载（每页 20 个 ideas）
  - 延迟加载详情和 tasks
- [ ] 9.2：响应式设计
  - 使用 TailwindCSS 响应式类
  - 移动端适配（sidebar 可折叠）
  - 触摸优化
- [ ] 9.3：Docker 多阶段构建
  - 优化 Dockerfile
  - 缓存 node_modules
  - 多阶段构建优化
- [ ] 9.4：Vercel 部署配置
  - 配置 vercel.json
  - 环境变量配置（Vercel Dashboard）
  - 部署命令
- [ ] 9.5：Supabase 生产配置
  - 更新为生产 Project URL
  - 配置环境变量

**里程碑**：生产就绪的应用

---

## 风险和缓解

### 风险 1：同步冲突
**问题**：同时编辑文件和数据库可能冲突
**缓解**：
- 实现最后更新时间戳检测
- 冲突时提示用户选择保留哪个版本

### 风险 2：数据迁移复杂度
**问题**：从文件系统迁移到 Supabase
**缓解**：
- 初始导入脚本
- 渐进式迁移（先 ideas，再 tasks）
- 冲突检测和解决

### 风险 3：性能问题
**问题**：大量 ideas 可能有性能瓶颈
**缓解**：
- 虚拟化列表（React Query）
- 分页加载（每页 20 个 ideas）
- 延迟加载详情和 tasks

---

## shadcn/ui 关键组件

### 核心组件使用
- **Sidebar**：`<Sidebar />` + `<ScrollArea />`
- **Cards**：`<Card />` + `<CardContent />`
- **Tabs**：`<TabsList />` + `<TabsContent />`
- **Dialogs**：`<Dialog />` + `<DialogContent />`
- **Forms**：`<Input />` + `<Textarea />` + `<Select />`
- **Badges**：`<Badge />`（状态显示）
- **Progress**：`<Progress value={x} />`（进度条）
- **Charts**：使用 recharts 库（环形图、时间线）

---

## 预估时间和里程碑

| 阶段 | 预计时间 | 说明 |
|--------|---------|------|
| **1. 项目初始化** | 2-3 小时 | 创建项目、配置环境 |
| **2. 基础数据层** | 4-6 小时 | API routes、文件同步 |
| **3. Ideas Sidebar** | 3-4 小时 | 列表、筛选、搜索 |
| **4. Idea Detail** | 4-6 小时 | Tabs、Work Plan 视图 |
| **5. Tasks 管理** | 4-6 小时 | CRUD、状态管理 |
| **6. 进度可视化** | 3-4 小时 | 图表、计算逻辑 |
| **7. 统计报告** | 2-3 小时 | 统计、导出 |
| **8. 文件集成** | 4-6 小时 | 监听、同步 |
| **9. 优化部署** | 3-4 小时 | 性能、Docker、Vercel |
| **总计** | **29-42 小时** | ~3.5-4.5 天 |

---

## 立即可以开始的下一步

### Prototype 阶段（快速验证）
1. 创建 Next.js 项目
2. 配置 shadcn/ui
3. 实现基础的 Idea 列表和详情
4. 手动测试文件系统集成

### MVP 功能
- Ideas CRUD（创建、查看、编辑）
- Tasks 管理基础功能
- 进度可视化（环形图）
- 文件同步（单向读取）

---

## 推荐方案
- **Next.js + shadcn/ui + Supabase**：生态成熟、开发效率高
- **混合数据存储**：文件为主、Supabase 为同步层
- **Docker 部署**：与开发环境一致，易于扩展
- **完整生命周期可视化**：覆盖 idea 从产生到落地的全流程
