import type { TaskInfo } from '../types'

interface TaskBoardConfig {
  x: number
  y: number
  width: number
  height: number
  zoom: number
}

/**
 * Render a task board on the whiteboard area
 */
export function renderTaskBoard(
  ctx: CanvasRenderingContext2D,
  tasks: TaskInfo[],
  config: TaskBoardConfig,
): void {
  const { x, y, width, height, zoom } = config
  const fontSize = Math.max(8, Math.round(10 * Math.min(zoom, 1.5)))
  const padding = 4 * zoom
  const lineHeight = 12 * zoom
  const headerHeight = 16 * zoom
  
  // Split tasks by status
  const inProgress = tasks.filter(t => t.status === 'in_progress')
  const completed = tasks.filter(t => t.status === 'completed')
  
  ctx.save()
  
  // Draw board background (slightly transparent to overlay on whiteboard)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
  ctx.fillRect(x, y, width, height)
  
  // Draw column headers
  ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  
  const colWidth = (width - padding * 3) / 2
  
  // In Progress column
  ctx.fillStyle = '#007fd4'
  ctx.fillText(`进行中 (${inProgress.length})`, x + padding, y + padding)
  
  // Completed column
  ctx.fillStyle = '#44bb66'
  ctx.fillText(`已完成 (${completed.length})`, x + colWidth + padding * 2, y + padding)
  
  // Draw divider line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x + colWidth + padding * 1.5, y + padding)
  ctx.lineTo(x + colWidth + padding * 1.5, y + height - padding)
  ctx.stroke()
  
  // Draw tasks
  ctx.font = `400 ${Math.max(7, fontSize - 1)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  
  // In progress tasks
  let taskY = y + headerHeight
  for (const task of inProgress.slice(0, 4)) {
    ctx.fillStyle = '#ffffff'
    const text = task.title.length > 12 ? task.title.slice(0, 11) + '…' : task.title
    ctx.fillText(`• ${text}`, x + padding, taskY)
    ctx.fillStyle = '#888888'
    ctx.fillText(`  @${task.assignee}`, x + padding + 4 * zoom, taskY + lineHeight * 0.7)
    taskY += lineHeight * 1.5
  }
  
  // Completed tasks
  taskY = y + headerHeight
  for (const task of completed.slice(0, 4)) {
    ctx.fillStyle = '#aaaaaa'
    const text = task.title.length > 12 ? task.title.slice(0, 11) + '…' : task.title
    ctx.fillText(`✓ ${text}`, x + colWidth + padding * 2, taskY)
    taskY += lineHeight * 1.2
  }
  
  ctx.restore()
}

/**
 * Get task board position on the whiteboard
 */
export function getTaskBoardPosition(
  whiteboardCol: number,
  whiteboardRow: number,
  zoom: number,
): TaskBoardConfig {
  const tileSize = 16 * zoom
  return {
    x: whiteboardCol * tileSize + 2 * zoom,
    y: whiteboardRow * tileSize + 2 * zoom,
    width: 28 * zoom,
    height: 10 * zoom,
    zoom,
  }
}
