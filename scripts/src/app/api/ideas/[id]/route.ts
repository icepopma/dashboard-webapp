import { NextRequest, NextResponse } from 'next/server'
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
