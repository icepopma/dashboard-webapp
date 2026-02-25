// ─────────────────────────────────────────────────────────────────
// Supabase 数据初始化脚本
// ─────────────────────────────────────────────────────────────────

import { supabase } from './supabase'

// 初始化示例数据
export async function initializeSupabaseData() {
  console.log('🚀 开始初始化 Supabase 数据...')

  try {
    // 1. 初始化 Ideas
    const { error: ideasError } = await supabase.from('ideas').upsert([
      { title: '智能日程安排', description: 'AI 自动安排日程', status: 'new', priority: 'high' },
      { title: '多语言支持', description: '支持中英文切换', status: 'planned', priority: 'medium' },
      { title: '移动端适配', description: '优化移动端体验', status: 'in-progress', priority: 'high' },
      { title: '数据导出', description: '支持导出 CSV/JSON', status: 'new', priority: 'low' },
    ], { onConflict: 'title' })

    if (ideasError) {
      console.warn('Ideas 初始化警告:', ideasError.message)
    } else {
      console.log('✅ Ideas 初始化完成')
    }

    // 2. 初始化 Tasks
    const { data: ideas } = await supabase.from('ideas').select('id, title')
    const ideaMap = new Map(ideas?.map(i => [i.title, i.id]) || [])

    const { error: tasksError } = await supabase.from('tasks').upsert([
      { 
        title: '设计智能日程算法', 
        description: '研究并设计时间优化算法',
        status: 'in-progress', 
        priority: 'high',
        type: 'feature',
        idea_id: ideaMap.get('智能日程安排'),
        estimated_hours: 8,
        assignee: 'Codex'
      },
      { 
        title: '实现语言切换组件', 
        description: '创建语言选择器和上下文',
        status: 'completed', 
        priority: 'medium',
        type: 'feature',
        idea_id: ideaMap.get('多语言支持'),
        estimated_hours: 4,
        assignee: 'Pop'
      },
      { 
        title: '优化移动端布局', 
        description: '修复响应式断点问题',
        status: 'completed', 
        priority: 'high',
        type: 'bugfix',
        idea_id: ideaMap.get('移动端适配'),
        estimated_hours: 2,
        assignee: 'Pop'
      },
    ], { onConflict: 'title' })

    if (tasksError) {
      console.warn('Tasks 初始化警告:', tasksError.message)
    } else {
      console.log('✅ Tasks 初始化完成')
    }

    // 3. 初始化 Projects
    const { error: projectsError } = await supabase.from('projects').upsert([
      { 
        name: 'Dashboard Webapp', 
        description: 'AI 智能体管理仪表板',
        status: 'active', 
        progress: 65,
        color: '#3b82f6',
        tasks_total: 58,
        tasks_completed: 38,
        members: ['Pop', 'Codex', 'Claude']
      },
      { 
        name: 'Content Pipeline', 
        description: '内容创作与发布流程',
        status: 'active', 
        progress: 45,
        color: '#8b5cf6',
        tasks_total: 24,
        tasks_completed: 11,
        members: ['Quill', 'Echo']
      },
    ], { onConflict: 'name' })

    if (projectsError) {
      console.warn('Projects 初始化警告:', projectsError.message)
    } else {
      console.log('✅ Projects 初始化完成')
    }

    // 4. 初始化 Approvals
    const { error: approvalsError } = await supabase.from('approvals').upsert([
      { title: '部署 Dashboard 到生产环境', type: 'deployment', risk: 'medium', requester: 'Codex', status: 'pending' },
      { title: '合并 PR #12: 添加用户认证', type: 'merge', risk: 'high', requester: 'Claude', status: 'pending' },
    ], { onConflict: 'title' })

    if (approvalsError) {
      console.warn('Approvals 初始化警告:', approvalsError.message)
    } else {
      console.log('✅ Approvals 初始化完成')
    }

    console.log('🎉 Supabase 数据初始化完成！')
    return { success: true }
  } catch (error) {
    console.error('❌ 初始化失败:', error)
    return { success: false, error }
  }
}

// 迁移内存数据到 Supabase
export async function migrateMemoryToSupabase(memoryData: {
  ideas?: any[]
  tasks?: any[]
  projects?: any[]
}) {
  console.log('📦 开始迁移内存数据...')

  const results = {
    ideas: 0,
    tasks: 0,
    projects: 0,
    errors: [] as string[]
  }

  try {
    // 迁移 Ideas
    if (memoryData.ideas?.length) {
      const { error } = await supabase.from('ideas').insert(memoryData.ideas)
      if (error) {
        results.errors.push(`Ideas: ${error.message}`)
      } else {
        results.ideas = memoryData.ideas.length
      }
    }

    // 迁移 Tasks
    if (memoryData.tasks?.length) {
      const { error } = await supabase.from('tasks').insert(memoryData.tasks)
      if (error) {
        results.errors.push(`Tasks: ${error.message}`)
      } else {
        results.tasks = memoryData.tasks.length
      }
    }

    // 迁移 Projects
    if (memoryData.projects?.length) {
      const { error } = await supabase.from('projects').insert(memoryData.projects)
      if (error) {
        results.errors.push(`Projects: ${error.message}`)
      } else {
        results.projects = memoryData.projects.length
      }
    }

    console.log('✅ 迁移完成:', results)
    return results
  } catch (error) {
    console.error('❌ 迁移失败:', error)
    results.errors.push(String(error))
    return results
  }
}

// 检查 Supabase 连接
export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('ideas').select('count').limit(1)
    if (error) {
      return { connected: false, error: error.message }
    }
    return { connected: true }
  } catch (error) {
    return { connected: false, error: String(error) }
  }
}
