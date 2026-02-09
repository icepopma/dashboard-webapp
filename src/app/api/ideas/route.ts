import { NextRequest, NextResponse } from 'next/server'
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
