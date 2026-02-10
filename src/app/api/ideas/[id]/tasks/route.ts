import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/ideas/[id]/tasks - 获取某个 idea 的所有 tasks
 * 支持查询参数：
 * - status: 过滤状态（todo, in_progress, completed, failed, cancelled）
 * - priority: 过滤优先级（high, medium, low）
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    let query = supabase
      .from('tasks')
      .select('*')
      .eq('idea_id', id);

    // Filter by status
    if (status) {
      query = query.eq('status', status);
    }

    // Filter by priority
    if (priority) {
      query = query.eq('priority', priority);
    }

    // Order by priority DESC, created_at DESC
    query = query.order('priority', { ascending: false })
                   .order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching tasks:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tasks', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ tasks: data, count: data?.length || 0 });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ideas/[id]/tasks - 创建新 task
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate required fields
    if (!body.local_path) {
      return NextResponse.json(
        { error: 'local_path is required' },
        { status: 400 }
      );
    }

    // Create task
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        idea_id: id,
        local_path: body.local_path,
        status: body.status || 'todo',
        priority: body.priority || 'medium',
        estimated_hours: body.estimated_hours || null,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return NextResponse.json(
        { error: 'Failed to create task', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ task: data }, { status: 201 });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
