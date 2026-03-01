import type { Character, TaskBubbleData } from '../types'

/** Task bubble sprite (larger than permission/waiting bubbles) */
export const TASK_BUBBLE_SPRITE: string[][] = (() => {
  const B = '#555566'  // Border
  const F = '#EEEEFF'  // Fill
  const _ = ''         // Empty
  return [
    [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
    [B, F, F, F, F, F, F, F, F, F, F, F, F, F, F, B],
    [B, F, F, F, F, F, F, F, F, F, F, F, F, F, F, B],
    [B, F, F, F, F, F, F, F, F, F, F, F, F, F, F, B],
    [B, F, F, F, F, F, F, F, F, F, F, F, F, F, F, B],
    [B, F, F, F, F, F, F, F, F, F, F, F, F, F, F, B],
    [B, F, F, F, F, F, F, F, F, F, F, F, F, F, F, B],
    [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
    [_, _, _, _, B, B, B, B, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, B, B, _, _, _, _, _, _, _, _, _],
  ]
})()

/** Activity icon sprites */
export const ACTIVITY_ICONS: Record<string, string[][]> = {
  typing: [
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['.', '#', '#', '.', '#', '#', '.', '.'],
    ['.', '#', '#', '.', '#', '#', '.', '.'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
  ],
  rest: [
    ['', '', '', '', '', '', '', ''],
    ['', '#', '#', '#', '#', '#', '', ''],
    ['', '#', '#', '#', '#', '#', '', ''],
    ['', '', '#', '#', '#', '', '', ''],
    ['', '', '', '#', '', '', '', ''],
  ],
  coffee: [
    ['', '', '#', '#', '#', '', '', ''],
    ['', '#', '#', '#', '#', '#', '', ''],
    ['', '#', '#', '#', '#', '#', '', ''],
    ['', '#', '#', '#', '#', '#', '#', ''],
    ['', '#', '#', '#', '#', '#', '#', ''],
    ['', '', '#', '#', '#', '#', '', ''],
    ['', '', '', '#', '#', '', '', ''],
  ],
  gym: [
    ['', '#', '', '', '', '', '#', ''],
    ['', '#', '#', '', '', '#', '#', ''],
    ['', '#', '#', '#', '#', '#', '#', ''],
    ['', '#', '#', '#', '#', '#', '#', ''],
    ['', '#', '#', '', '', '#', '#', ''],
    ['', '#', '', '', '', '', '#', ''],
  ],
}

/**
 * Render a task detail bubble on canvas
 */
export function renderTaskBubble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  data: TaskBubbleData,
  zoom: number,
): void {
  const padding = 8 * zoom
  const lineHeight = 14 * zoom
  const fontSize = Math.max(9, Math.round(11 * Math.min(zoom, 2)))
  
  ctx.font = `500 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  
  // Calculate bubble size
  const lines = [
    data.taskName,
    `Status: ${data.status}`,
    data.tool ? `Tool: ${data.tool}` : '',
  ].filter(Boolean)
  
  const maxWidth = Math.max(...lines.map(l => ctx.measureText(l).width))
  const bubbleWidth = maxWidth + padding * 2
  const bubbleHeight = lines.length * lineHeight + padding * 2
  
  // Draw bubble background
  ctx.fillStyle = 'rgba(40, 44, 52, 0.95)'
  ctx.strokeStyle = '#666'
  ctx.lineWidth = 1
  
  const radius = 4 * zoom
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + bubbleWidth - radius, y)
  ctx.quadraticCurveTo(x + bubbleWidth, y, x + bubbleWidth, y + radius)
  ctx.lineTo(x + bubbleWidth, y + bubbleHeight - radius)
  ctx.quadraticCurveTo(x + bubbleWidth, y + bubbleHeight, x + bubbleWidth - radius, y + bubbleHeight)
  
  // Pointer
  ctx.lineTo(x + bubbleWidth / 2 + 6 * zoom, y + bubbleHeight)
  ctx.lineTo(x + bubbleWidth / 2, y + bubbleHeight + 8 * zoom)
  ctx.lineTo(x + bubbleWidth / 2 - 6 * zoom, y + bubbleHeight)
  
  ctx.lineTo(x + radius, y + bubbleHeight)
  ctx.quadraticCurveTo(x, y + bubbleHeight, x, y + bubbleHeight - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  
  // Draw text
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  
  lines.forEach((line, i) => {
    const textY = y + padding + i * lineHeight
    
    if (i === 0) {
      // Task name - bold
      ctx.fillStyle = '#fff'
    } else if (line.includes('Status:')) {
      // Status line
      ctx.fillStyle = data.status === 'working' ? '#44bb66' :
                      data.status === 'waiting' ? '#ccaa33' :
                      data.status === 'error' ? '#cc4444' : '#88ccff'
    } else {
      // Tool line
      ctx.fillStyle = '#aaa'
    }
    
    ctx.fillText(line, x + padding, textY)
  })
}

/**
 * Render an activity icon above character
 */
export function renderActivityIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  activityType: string,
  zoom: number,
): void {
  const icon = ACTIVITY_ICONS[activityType] || ACTIVITY_ICONS.typing
  if (!icon) return
  
  const iconWidth = icon[0].length * zoom
  const iconHeight = icon.length * zoom
  const iconX = x - iconWidth / 2
  const iconY = y - iconHeight - 4 * zoom
  
  ctx.save()
  for (let r = 0; r < icon.length; r++) {
    for (let c = 0; c < icon[r].length; c++) {
      const cell = icon[r][c]
      if (cell && cell !== '') {
        ctx.fillStyle = cell
        ctx.fillRect(iconX + c * zoom, iconY + r * zoom, zoom, zoom)
      }
    }
  }
  ctx.restore()
}
