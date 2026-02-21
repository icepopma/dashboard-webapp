import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'
import { readFile, readdir } from 'fs/promises'
import { join } from 'path'
import matter from 'gray-matter'

// Local ideas directory
const IDEAS_DIR = '/root/notes/ideas'

// Parse markdown frontmatter
function parseMarkdown(filePath: string) {
  try {
    const content = readFile(filePath, 'utf-8')
    const { data, content: markdown } = matter(content)
    return {
      frontmatter: data,
      content: markdown,
    }
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error)
    return null
  }
}

// Sync ideas from local to Supabase
export async function POST(request: Request) {
  try {
    const { type } = await request.json()

    if (type === 'ideas') {
      // Read all ideas from local directory
      const ideaDirs = await readdir(IDEAS_DIR)
      const ideas = []

      for (const dir of ideaDirs) {
        const ideaPath = join(IDEAS_DIR, dir)
        const ideaMdPath = join(ideaPath, 'idea.md')
        const workPlanMdPath = join(ideaPath, 'work-plan.md')

        // Parse idea.md
        let ideaData = null
        try {
          const parsed = parseMarkdown(ideaMdPath)
          if (parsed) {
            ideaData = parsed.frontmatter
          }
        } catch {
          // No idea.md, skip
        }

        // Parse work-plan.md
        let hasWorkPlan = false
        try {
          const parsed = parseMarkdown(workPlanMdPath)
          if (parsed) {
            hasWorkPlan = true
          }
        } catch {
          // No work-plan.md
        }

        // Count tasks
        const tasksPath = join(ideaPath, 'tasks')
        let tasksCount = 0
        try {
          const tasksFiles = await readdir(tasksPath)
          tasksCount = tasksFiles.length
        } catch {
          // No tasks directory
        }

        if (ideaData || hasWorkPlan || tasksCount > 0) {
          ideas.push({
            name: dir,
            description: ideaData?.description || null,
            background: ideaData?.background || null,
            status: ideaData?.status || 'idea',
            priority: ideaData?.priority || 'medium',
            local_path: ideaPath,
            sync_status: 'synced',
          })
        }
      }

      // Upsert to Supabase
      for (const idea of ideas) {
        const { data: existing } = await supabase
          .from('ideas')
          .select('id')
          .eq('local_path', idea.local_path!)
          .single()

        if (existing) {
          // Update
          await supabase
            .from('ideas')
            .update(idea)
            .eq('id', existing.id)
        } else {
          // Insert
          await supabase
            .from('ideas')
            .insert(idea)
        }
      }

      return NextResponse.json({
        message: 'Ideas synced successfully',
        synced: ideas.length,
      })
    }

    return NextResponse.json(
      { error: 'Invalid sync type' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error syncing data:', error)
    return NextResponse.json(
      { error: 'Failed to sync data' },
      { status: 500 }
    )
  }
}
