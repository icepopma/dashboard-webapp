# 🤖 Agent 任务管理界面

## 访问地址

- **任务管理**: http://localhost:4001/agent-tasks
- **Agent 监控**: http://localhost:4001/agent-monitor

---

## 功能

### 任务管理页面 (`/agent-tasks`)

- ✅ 任务列表展示
- ✅ 状态筛选（全部/待审批/执行中/已完成）
- ✅ 批准计划按钮
- ✅ 标记完成按钮
- ✅ Agent 标签
- ✅ 统计卡片

### Agent 监控页面 (`/agent-monitor`)

- ✅ Agent 状态实时显示
- ✅ 当前任务显示
- ✅ 完成任务统计
- ✅ 成功率统计
- ✅ 在线/忙碌状态

---

## 使用方式

1. 启动 Dashboard: `npm run dev`
2. 访问 http://localhost:4001/agent-tasks
3. 查看待审批计划
4. 点击"批准计划"
5. Agent 执行任务
6. 点击"标记完成"

---

## API 集成

- `GET /api/agent/pending-plans` - 获取任务列表
- `POST /api/agent/approve-plan` - 批准计划
- `POST /api/agent/complete-task` - 完成任务

---

**创建时间**: 2026-03-09 06:52 UTC
