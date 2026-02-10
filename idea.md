# Idea: Dashboard Web App

## 概述
一个可视化的 Idea 管理和追踪 Dashboard Web 应用，覆盖从 idea 产生到落地的全部进度。

## 背景
Matt 想要一个可视化工具来管理他的大量 ideas（自媒体、开发工具、自动化系统等），并追踪从头脑风暴到落地的全生命周期进度。

## 目标
- Idea 管理：创建、查看、编辑、删除 ideas
- Work Plan 支持：通过头脑风暴生成设计方案
- Task 管理：将 plan 分解成可执行任务
- 进度可视化：完成度、优先级、时间线
- 数据同步：文件系统 ↔ Supabase（备份和协作）

## 约束条件
- 技术栈：Next.js 15+ + TypeScript + shadcn/ui + TailwindCSS + Supabase + Docker
- 部署：Docker（开发）→ Vercel（生产）
- 用户范围：个人使用（不需要团队协作）
- 数据优先：本地文件为主，Supabase 作为同步层

## 优先级
- [ ] 高
- [ ] 中
- [ ] 低

## 状态
- [ ] 💡 Idea 孵化
- [ ] 🧠 规划中
- [ ] 🚧 开发中
- [ ] ✅ 已完成
- [ ] 📁 已归档

## 创建日期
2026-02-06

---

## 工作流程链接
- Work Plan: work-plan.md
- Tasks: tasks/
- Progress Chart: tasks/ 006-progress-chart.md
