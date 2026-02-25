// ─────────────────────────────────────────────────────────────────
// Meeting Scanner - Scan meeting notes for actionable tasks
// ─────────────────────────────────────────────────────────────────

import type { Task, TaskType, TaskPriority } from '../types'
import { promises as fs } from 'fs'
import path from 'path'

export interface MeetingNote {
  id: string
  title: string
  date: string
  attendees: string[]
  actionItems: ActionItem[]
  rawContent: string
  filePath: string
}

export interface ActionItem {
  text: string
  assignee?: string
  dueDate?: string
  priority?: TaskPriority
  type?: TaskType
}

export interface MeetingScannerConfig {
  notesDir?: string      // Directory containing meeting notes
  daysBack?: number      // How many days back to scan
  limit?: number         // Max notes to process
  patterns?: string[]    // File patterns to match (e.g., ['*.md', 'meetings/*.txt'])
}

const DEFAULT_NOTES_DIR = './notes/meetings'
const DEFAULT_PATTERNS = ['*.md', '*.txt']

/**
 * 扫描会议记录并提取任务
 */
export async function scanMeetingNotes(config: MeetingScannerConfig = {}): Promise<Task[]> {
  const { 
    notesDir = DEFAULT_NOTES_DIR, 
    daysBack = 7, 
    limit = 10,
    patterns = DEFAULT_PATTERNS 
  } = config

  try {
    // 检查目录是否存在
    const dirPath = path.resolve(notesDir)
    
    try {
      await fs.access(dirPath)
    } catch {
      console.warn(`[Meeting Scanner] Directory not found: ${dirPath}`)
      return []
    }

    // 获取文件列表
    const files = await getMatchingFiles(dirPath, patterns)
    
    if (files.length === 0) {
      console.log('[Meeting Scanner] No meeting notes found')
      return []
    }

    // 过滤日期
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysBack)

    // 处理文件
    const tasks: Task[] = []
    const recentFiles = files.slice(0, limit)

    for (const file of recentFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8')
        const note = parseMeetingNote(content, file)
        
        // 检查日期
        if (new Date(note.date) >= cutoffDate) {
          const noteTasks = convertNoteToTasks(note)
          tasks.push(...noteTasks)
        }
      } catch (error) {
        console.error(`[Meeting Scanner] Error parsing ${file}:`, error)
      }
    }

    return tasks
  } catch (error) {
    console.error('[Meeting Scanner] Error scanning notes:', error)
    return []
  }
}

/**
 * 获取匹配的文件列表
 */
async function getMatchingFiles(dir: string, patterns: string[]): Promise<string[]> {
  const files: string[] = []
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      
      if (entry.isDirectory()) {
        // 递归扫描子目录
        const subFiles = await getMatchingFiles(fullPath, patterns)
        files.push(...subFiles)
      } else if (entry.isFile()) {
        // 检查是否匹配模式
        const matches = patterns.some(pattern => {
          if (pattern.includes('*')) {
            const regex = new RegExp(pattern.replace('*', '.*'))
            return regex.test(entry.name)
          }
          return entry.name === pattern
        })
        
        if (matches) {
          files.push(fullPath)
        }
      }
    }
  } catch (error) {
    console.error(`[Meeting Scanner] Error reading directory ${dir}:`, error)
  }

  // 按修改时间排序（最新的在前）
  const filesWithStats = await Promise.all(
    files.map(async (f) => {
      const stat = await fs.stat(f)
      return { file: f, mtime: stat.mtime }
    })
  )
  
  filesWithStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
  
  return filesWithStats.map(f => f.file)
}

/**
 * 解析会议记录
 */
function parseMeetingNote(content: string, filePath: string): MeetingNote {
  const lines = content.split('\n')
  const id = path.basename(filePath, path.extname(filePath))
  
  // 提取标题（通常是第一行 # heading 或文件名）
  let title = id.replace(/[-_]/g, ' ')
  const firstLine = lines[0]?.trim()
  if (firstLine?.startsWith('#')) {
    title = firstLine.replace(/^#+\s*/, '')
  }

  // 提取日期
  let date = new Date().toISOString()
  const dateMatch = content.match(/(\d{4}[-/]\d{2}[-/]\d{2}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/)
  if (dateMatch) {
    date = dateMatch[1]
  }

  // 提取参会者
  const attendees: string[] = []
  const attendeeMatch = content.match(/(?:attendees|参会者|参与者)[:：]\s*([^\n]+)/i)
  if (attendeeMatch) {
    const names = attendeeMatch[1].split(/[,，、]/)
    attendees.push(...names.map(n => n.trim()).filter(n => n))
  }

  // 提取行动项
  const actionItems = extractActionItems(content)

  return {
    id,
    title,
    date,
    attendees,
    actionItems,
    rawContent: content,
    filePath,
  }
}

/**
 * 从内容中提取行动项
 */
function extractActionItems(content: string): ActionItem[] {
  const items: ActionItem[] = []
  const lines = content.split('\n')

  let inActionSection = false

  for (const line of lines) {
    const trimmed = line.trim()
    
    // 检测 action items 区域开始
    if (/^(action\s*items|待办|任务|todos?)\s*[:：]?$/i.test(trimmed)) {
      inActionSection = true
      continue
    }

    // 检测区域结束（遇到另一个标题）
    if (trimmed.startsWith('#') && inActionSection) {
      inActionSection = false
    }

    // 提取行动项
    if (inActionSection || isActionItem(trimmed)) {
      const item = parseActionItem(trimmed)
      if (item) {
        items.push(item)
      }
    }
  }

  return items
}

/**
 * 检测是否是行动项
 */
function isActionItem(line: string): boolean {
  // 匹配常见的行动项格式
  const patterns = [
    /^[-*]\s*\[?\s*\]?\s*\S+/,  // Bullet points with optional checkbox
    /^\d+\.\s+\S+/,              // Numbered list
    /^TODO\s*[:：]/i,            // TODO prefix
    /^@[\w]+\s*[:：]/,           // @mention assignee
  ]
  
  return patterns.some(p => p.test(line))
}

/**
 * 解析单个行动项
 */
function parseActionItem(line: string): ActionItem | null {
  // 移除前缀符号
  let text = line
    .replace(/^[-*]\s*\[?\s*[x]?\s*\]?\s*/, '')
    .replace(/^\d+\.\s*/, '')
    .replace(/^TODO\s*[:：]\s*/i, '')
    .trim()

  if (!text) return null

  const item: ActionItem = { text }

  // 提取负责人
  const assigneeMatch = text.match(/@(\w+)/)
  if (assigneeMatch) {
    item.assignee = assigneeMatch[1]
    text = text.replace(/@\w+\s*/, '').trim()
  }

  // 提取截止日期
  const dateMatch = text.match(/(?:by|before|due|截止|前)\s*[:：]?\s*(\d{1,2}[-/]\d{1,2}(?:[-/]\d{2,4})?)/i)
  if (dateMatch) {
    item.dueDate = dateMatch[1]
    text = text.replace(dateMatch[0], '').trim()
  }

  // 提取优先级
  const priorityMatch = text.match(/\b(high|medium|low|高|中|低)\s*(?:priority)?\b/i)
  if (priorityMatch) {
    const p = priorityMatch[1].toLowerCase()
    item.priority = 
      p === 'high' || p === '高' ? 'high' :
      p === 'medium' || p === '中' ? 'medium' : 'low'
    text = text.replace(priorityMatch[0], '').trim()
  }

  // 推断任务类型
  item.type = inferTaskType(text)
  item.text = text

  return item
}

/**
 * 从文本推断任务类型
 */
function inferTaskType(text: string): TaskType {
  const lower = text.toLowerCase()
  
  if (/fix|bug|修复|问题/.test(lower)) return 'bugfix'
  if (/test|测试/.test(lower)) return 'test'
  if (/doc|document|文档/.test(lower)) return 'docs'
  if (/refactor|重构|优化/.test(lower)) return 'refactor'
  if (/design|设计/.test(lower)) return 'design'
  
  return 'feature'
}

/**
 * 将会议记录转换为任务
 */
function convertNoteToTasks(note: MeetingNote): Task[] {
  return note.actionItems.map((item, index) => ({
    id: `meeting-${note.id}-${index}`,
    title: item.text,
    description: `From meeting: ${note.title} (${note.date})`,
    type: item.type || 'feature',
    priority: item.priority || 'medium',
    status: 'pending',
    createdAt: new Date(note.date),
    updatedAt: new Date(),
    goal: item.text,
    context: {
      requirements: item.assignee ? [`Assigned to: ${item.assignee}`] : [],
      references: [note.filePath],
    },
    attempts: 0,
    maxAttempts: 3,
  }))
}
