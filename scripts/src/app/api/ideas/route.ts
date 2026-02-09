import { NextRequest, NextResponse } from 'next/server'
import { getIdeas } from '@/lib/supabase'

// GET /api/ideas - List all ideas
export async function GET(request: NextRequest) {
  try {
    const ideas = await getIdeas();
    return NextResponse.json(ideas, { status: 200 });
  } catch (error) {
    console.error('Error fetching ideas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ideas' },
      { status: 500 }
    );
  }
}
