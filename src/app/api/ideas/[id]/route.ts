import { NextRequest, NextResponse } from 'next/server'
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
