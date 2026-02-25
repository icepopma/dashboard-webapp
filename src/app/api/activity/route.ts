// ─────────────────────────────────────────────────────────────────
// Activity API - 活动日志 (Supabase)
// ─────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { getActivityLogs, createActivityLog } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '20')
  const agent = searchParams.get('agent') || undefined
  
  try {
    const activities = await getActivityLogs(limit, agent)
    
    return NextResponse.json({
      activities,
      total: activities.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching activity logs:', error)
    // Fallback to empty if Supabase fails
    return NextResponse.json({
      activities: [],
      total: 0,
      timestamp: new Date().toISOString(),
      error: 'Failed to fetch from Supabase',
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agent, action, type, metadata } = body
    
    if (!agent || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: agent, action' },
        { status: 400 }
      )
    }
    
    const newActivity = await createActivityLog({
      agent,
      action,
      type: type || 'general',
      metadata: metadata || {},
    })
    
    return NextResponse.json({ success: true, activity: newActivity })
  } catch (error) {
    console.error('Error creating activity log:', error)
    return NextResponse.json(
      { error: 'Failed to create activity log' },
      { status: 500 }
    )
  }
}
