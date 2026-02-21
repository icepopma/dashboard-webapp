import { NextResponse } from 'next/server'
import { getIdeas, getTasks } from '@/lib/supabase-client'

export async function GET() {
  try {
    const ideas = await getIdeas()
    return NextResponse.json({ ideas })
  } catch (error) {
    console.error('Error fetching ideas:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ideas' },
      { status: 500 }
    )
  }
}
