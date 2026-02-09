import { NextRequest, NextResponse } from 'next/server'
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
