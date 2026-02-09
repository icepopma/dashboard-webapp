#!/usr/bin/env node

/**
 * Task: 008-创建 API Routes
 * Description: 创建 Next.js API Routes 用于 Ideas 和 Tasks CRUD 操作
 */

const fs = require('fs');
const path = require('path');

console.log('🛣️ 创建 API Routes...');

try {
  const apiDir = path.join(process.cwd(), 'src', 'app', 'api');

  // 创建 API 目录结构
  const directories = [
    path.join(apiDir, 'ideas'),
    path.join(apiDir, 'ideas', '[id]'),
    path.join(apiDir, 'tasks'),
    path.join(apiDir, 'tasks', '[id]')
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  console.log('✅ API 目录结构已创建');

  // 创建 /api/ideas/route.ts (GET list, POST create)
  const ideasListRoute = `import { NextRequest, NextResponse } from 'next/server'
import { getIdeas, createIdea } from '@/lib/supabase'

// GET /api/ideas - List all ideas
export async function GET(request: NextRequest) {
  try {
    const ideas = await getIdeas()
    return NextResponse.json(ideas, { status: 200 })
  } catch (error) {
    console.error('Error fetching ideas:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ideas' },
      { status: 500 }
    )
  }
}

// POST /api/ideas - Create new idea
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const idea = await createIdea(body)
    return NextResponse.json(idea, { status: 201 })
  } catch (error) {
    console.error('Error creating idea:', error)
    return NextResponse.json(
      { error: 'Failed to create idea' },
      { status: 500 }
    )
  }
}
`;

  fs.writeFileSync(path.join(apiDir, 'ideas', 'route.ts'), ideasListRoute);
  console.log('✅ POST /api/ideas 已创建');

  // 创建 /api/ideas/[id]/route.ts (GET, PATCH, DELETE)
  const ideaDetailRoute = `import { NextRequest, NextResponse } from 'next/server'
import { getIdeaById, updateIdea, deleteIdea } from '@/lib/supabase'

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/ideas/[id] - Get idea by ID
export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params
    const idea = await getIdeaById(id)
    if (!idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(idea, { status: 200 })
  } catch (error) {
    console.error('Error fetching idea:', error)
    return NextResponse.json(
      { error: 'Failed to fetch idea' },
      { status: 500 }
    )
  }
}

// PATCH /api/ideas/[id] - Update idea
export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params
    const body = await request.json()
    const idea = await updateIdea(id, body)
    return NextResponse.json(idea, { status: 200 })
  } catch (error) {
    console.error('Error updating idea:', error)
    return NextResponse.json(
      { error: 'Failed to update idea' },
      { status: 500 }
    )
  }
}

// DELETE /api/ideas/[id] - Delete idea
export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params
    await deleteIdea(id)
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error deleting idea:', error)
    return NextResponse.json(
      { error: 'Failed to delete idea' },
      { status: 500 }
    )
  }
}
`;

  fs.writeFileSync(path.join(apiDir, 'ideas', '[id]', 'route.ts'), ideaDetailRoute);
  console.log('✅ GET/PATCH/DELETE /api/ideas/[id] 已创建');

  // 创建 /api/tasks/route.ts (GET list, POST create)
  const tasksListRoute = `import { NextRequest, NextResponse } from 'next/server'
import { getTasks, createTask } from '@/lib/supabase'

// GET /api/tasks - List all tasks (optional idea_id filter)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ideaId = searchParams.get('idea_id')
    const tasks = await getTasks(ideaId || undefined)
    return NextResponse.json(tasks, { status: 200 })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

// POST /api/tasks - Create new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const task = await createTask(body)
    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}
`;

  fs.writeFileSync(path.join(apiDir, 'tasks', 'route.ts'), tasksListRoute);
  console.log('✅ POST /api/tasks 已创建');

  // 创建 /api/tasks/[id]/route.ts (PATCH, DELETE)
  const taskDetailRoute = `import { NextRequest, NextResponse } from 'next/server'
import { updateTask, deleteTask } from '@/lib/supabase'

interface RouteContext {
  params: Promise<{ id: string }>
}

// PATCH /api/tasks/[id] - Update task
export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params
    const body = await request.json()
    const task = await updateTask(id, body)
    return NextResponse.json(task, { status: 200 })
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

// DELETE /api/tasks/[id] - Delete task
export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params
    await deleteTask(id)
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}
`;

  fs.writeFileSync(path.join(apiDir, 'tasks', '[id]', 'route.ts'), taskDetailRoute);
  console.log('✅ PATCH/DELETE /api/tasks/[id] 已创建');

  console.log('✅ API Routes 创建完成');
  process.exit(0);
} catch (error) {
  console.error('❌ 创建失败:', error.message);
  process.exit(1);
}
