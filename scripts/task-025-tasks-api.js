#!/usr/bin/env node

/**
 * Task: 025-创建 Tasks API
 * Description: 创建 Task 相关的 API endpoints
 */

const fs = require('fs');
const path = require('path');

console.log('📋 创建 Tasks API...');

try {
  const apiDir = path.join(process.cwd(), 'src', 'app', 'api');
  const tasksApiDir = path.join(apiDir, 'tasks');
  
  if (!fs.existsSync(tasksApiDir)) {
    fs.mkdirSync(tasksApiDir, { recursive: true });
  }

  const routeFile = path.join(tasksApiDir, 'route.ts');

  const routeContent = `import { NextRequest, NextResponse } from 'next/server'
import { getTasks, createTask, updateTask, deleteTask } from '@/lib/supabase'

// GET /api/tasks - List all tasks (with optional idea_id filter)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idea_id = searchParams.get('idea_id');
    const tasks = await getTasks(idea_id || undefined);
    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const task = await createTask(body);
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
`;

  fs.writeFileSync(routeFile, routeContent);
  console.log('✅ Tasks API 已创建');
  process.exit(0);
} catch (error) {
  console.error('❌ 创建失败:', error.message);
  process.exit(1);
}
