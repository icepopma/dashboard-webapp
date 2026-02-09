#!/usr/bin/env node

/**
 * Task: 026-更新 Idea API
 * Description: 创建 PUT /api/ideas/[id] API（更新 idea）
 */

const fs = require('fs');
const path = require('path');

console.log('✏️ 创建更新 Idea API...');

try {
  const apiDir = path.join(process.cwd(), 'src', 'app', 'api');
  const routeFile = path.join(apiDir, 'ideas', '[id]', 'route.ts');

  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
  }

  const routeContent = `import { NextRequest, NextResponse } from 'next/server'
import { updateIdea } from '@/lib/supabase'

// PUT /api/ideas/[id] - Update idea
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const idea = await updateIdea(id, body);
    return NextResponse.json(idea, { status: 200 });
  } catch (error) {
    console.error('Error updating idea:', error);
    return NextResponse.json(
      { error: 'Failed to update idea' },
      { status: 500 }
    );
  }
}
`;

  fs.writeFileSync(routeFile, routeContent);
  console.log('✅ 更新 Idea API 已创建');
  process.exit(0);
} catch (error) {
  console.error('❌ 创建失败:', error.message);
  process.exit(1);
}
