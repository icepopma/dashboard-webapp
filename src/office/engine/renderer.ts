import { TileType, Direction } from '../types'
import { TILE_SIZE } from '../constants'
import type { TileType as TileTypeVal, FurnitureInstance, Character, SpriteData, Seat, FloorColor } from '../types'
import { getCachedSprite, getOutlineSprite } from '../sprites/spriteCache'
import { getCharacterSprites, BUBBLE_PERMISSION_SPRITE, BUBBLE_WAITING_SPRITE } from '../sprites/spriteData'
import { getCharacterSprite } from './characters'
import {
  SELECTED_OUTLINE_ALPHA,
  HOVERED_OUTLINE_ALPHA,
  CHARACTER_SITTING_OFFSET_PX,
  CHARACTER_Z_SORT_OFFSET,
  OUTLINE_Z_SORT_OFFSET,
  BUBBLE_SITTING_OFFSET_PX,
  BUBBLE_VERTICAL_OFFSET_PX,
  BUBBLE_FADE_DURATION_SEC,
  FALLBACK_FLOOR_COLOR,
  WALL_COLOR,
  GRID_LINE_COLOR,
} from '../constants'

export function renderTileGrid(
  ctx: CanvasRenderingContext2D,
  tileMap: TileTypeVal[][],
  offsetX: number,
  offsetY: number,
  zoom: number,
  tileColors?: Array<FloorColor | null>,
  cols?: number,
): void {
  const s = TILE_SIZE * zoom
  const tmRows = tileMap.length
  const tmCols = tmRows > 0 ? tileMap[0].length : 0
  const layoutCols = cols ?? tmCols

  for (let r = 0; r < tmRows; r++) {
    for (let c = 0; c < tmCols; c++) {
      const tile = tileMap[r][c]

      if (tile === TileType.VOID) continue

      if (tile === TileType.WALL) {
        ctx.fillStyle = WALL_COLOR
        ctx.fillRect(offsetX + c * s, offsetY + r * s, s, s)
        continue
      }

      // Floor tiles with color variation
      const colorIdx = r * layoutCols + c
      const color = tileColors?.[colorIdx]
      
      // Simple floor rendering with slight color variation
      const baseColor = color ? hsbToHex(color.h, color.s, 50 + color.b) : FALLBACK_FLOOR_COLOR
      ctx.fillStyle = baseColor
      ctx.fillRect(offsetX + c * s, offsetY + r * s, s, s)
      
      // Add subtle tile pattern
      if ((r + c) % 2 === 0) {
        ctx.fillStyle = 'rgba(0,0,0,0.05)'
        ctx.fillRect(offsetX + c * s, offsetY + r * s, s, s)
      }
    }
  }
}

function hsbToHex(h: number, s: number, b: number): string {
  s /= 100
  b /= 100
  const k = (n: number) => (n + h / 60) % 6
  const f = (n: number) => b * (1 - s * Math.max(0, Math.min(k(n), 4 - k(n), 1)))
  const r = Math.round(255 * f(5))
  const g = Math.round(255 * f(3))
  const bl = Math.round(255 * f(1))
  const toHex = (n: number) => n.toString(16).padStart(2, '0')
  return '#' + toHex(r) + toHex(g) + toHex(bl)
}

interface ZDrawable {
  zY: number
  draw: (ctx: CanvasRenderingContext2D) => void
}

export function renderScene(
  ctx: CanvasRenderingContext2D,
  furniture: FurnitureInstance[],
  characters: Character[],
  offsetX: number,
  offsetY: number,
  zoom: number,
  selectedAgentId: number | null,
  hoveredAgentId: number | null,
): void {
  const drawables: ZDrawable[] = []

  // Furniture
  for (const f of furniture) {
    const cached = getCachedSprite(f.sprite, zoom)
    const fx = offsetX + f.x * zoom
    const fy = offsetY + f.y * zoom
    drawables.push({
      zY: f.zY,
      draw: (c) => {
        c.drawImage(cached, fx, fy)
      },
    })
  }

  // Characters
  for (const ch of characters) {
    if (ch.matrixEffect) continue // Skip matrix effect for now
    
    const sprites = getCharacterSprites(ch.palette, ch.hueShift)
    const spriteData = getCharacterSprite(ch, sprites)
    const cached = getCachedSprite(spriteData, zoom)
    const sittingOffset = ch.state === 'type' ? CHARACTER_SITTING_OFFSET_PX : 0
    const drawX = Math.round(offsetX + ch.x * zoom - cached.width / 2)
    const drawY = Math.round(offsetY + (ch.y + sittingOffset) * zoom - cached.height)
    const charZY = ch.y + TILE_SIZE / 2 + CHARACTER_Z_SORT_OFFSET

    const isSelected = selectedAgentId !== null && ch.id === selectedAgentId
    const isHovered = hoveredAgentId !== null && ch.id === hoveredAgentId
    
    if (isSelected || isHovered) {
      const outlineAlpha = isSelected ? SELECTED_OUTLINE_ALPHA : HOVERED_OUTLINE_ALPHA
      const outlineData = getOutlineSprite(spriteData)
      const outlineCached = getCachedSprite(outlineData, zoom)
      const olDrawX = drawX - zoom
      const olDrawY = drawY - zoom
      drawables.push({
        zY: charZY - OUTLINE_Z_SORT_OFFSET,
        draw: (c) => {
          c.save()
          c.globalAlpha = outlineAlpha
          c.drawImage(outlineCached, olDrawX, olDrawY)
          c.restore()
        },
      })
    }

    drawables.push({
      zY: charZY,
      draw: (c) => {
        c.drawImage(cached, drawX, drawY)
      },
    })
  }

  drawables.sort((a, b) => a.zY - b.zY)
  for (const d of drawables) {
    d.draw(ctx)
  }
}

export function renderBubbles(
  ctx: CanvasRenderingContext2D,
  characters: Character[],
  offsetX: number,
  offsetY: number,
  zoom: number,
): void {
  for (const ch of characters) {
    if (!ch.bubbleType) continue

    const sprite = ch.bubbleType === 'permission' ? BUBBLE_PERMISSION_SPRITE : BUBBLE_WAITING_SPRITE

    let alpha = 1.0
    if (ch.bubbleType === 'waiting' && ch.bubbleTimer < BUBBLE_FADE_DURATION_SEC) {
      alpha = ch.bubbleTimer / BUBBLE_FADE_DURATION_SEC
    }

    const cached = getCachedSprite(sprite, zoom)
    const sittingOff = ch.state === 'type' ? BUBBLE_SITTING_OFFSET_PX : 0
    const bubbleX = Math.round(offsetX + ch.x * zoom - cached.width / 2)
    const bubbleY = Math.round(offsetY + (ch.y + sittingOff - BUBBLE_VERTICAL_OFFSET_PX) * zoom - cached.height - 1 * zoom)

    ctx.save()
    if (alpha < 1.0) ctx.globalAlpha = alpha
    ctx.drawImage(cached, bubbleX, bubbleY)
    ctx.restore()
  }
}

export function renderGridOverlay(
  ctx: CanvasRenderingContext2D,
  offsetX: number,
  offsetY: number,
  zoom: number,
  cols: number,
  rows: number,
): void {
  const s = TILE_SIZE * zoom
  ctx.strokeStyle = GRID_LINE_COLOR
  ctx.lineWidth = 1

  for (let c = 0; c <= cols; c++) {
    ctx.beginPath()
    ctx.moveTo(offsetX + c * s, offsetY)
    ctx.lineTo(offsetX + c * s, offsetY + rows * s)
    ctx.stroke()
  }

  for (let r = 0; r <= rows; r++) {
    ctx.beginPath()
    ctx.moveTo(offsetX, offsetY + r * s)
    ctx.lineTo(offsetX + cols * s, offsetY + r * s)
    ctx.stroke()
  }
}

// ── Agent Name Labels ───────────────────────────────────────────

const LABEL_PADDING_X = 4
const LABEL_PADDING_Y = 2
const LABEL_OFFSET_Y = -4
const LABEL_HEIGHT_ESTIMATE = 24

export function renderAgentLabels(
  ctx: CanvasRenderingContext2D,
  characters: Character[],
  offsetX: number,
  offsetY: number,
  zoom: number,
  selectedAgentId: number | null,
): void {
  const fontSize = Math.max(8, Math.round(10 * Math.min(zoom, 2)))
  ctx.font = '500 ' + fontSize + 'px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'

  for (const ch of characters) {
    if (ch.matrixEffect === 'despawn') continue

    const sittingOffset = ch.state === 'type' ? CHARACTER_SITTING_OFFSET_PX : 0
    const screenX = offsetX + ch.x * zoom
    const screenY = offsetY + (ch.y + sittingOffset) * zoom - LABEL_HEIGHT_ESTIMATE * zoom - LABEL_OFFSET_Y * zoom

    // Determine label style based on state
    const isActive = ch.isActive || ch.state === 'type'
    const isSelected = selectedAgentId === ch.id
    
    // Draw name background
    const name = ch.name || 'Agent'
    const textWidth = ctx.measureText(name).width
    const bgWidth = textWidth + LABEL_PADDING_X * 2 * zoom
    const bgHeight = fontSize + LABEL_PADDING_Y * 2 * zoom
    const bgX = screenX - bgWidth / 2
    const bgY = screenY - bgHeight

    // Background
    ctx.fillStyle = isSelected 
      ? 'rgba(0, 127, 212, 0.9)' 
      : isActive 
        ? 'rgba(40, 44, 52, 0.85)' 
        : 'rgba(60, 60, 60, 0.7)'
    
    // Rounded rectangle
    const radius = 3 * zoom
    ctx.beginPath()
    ctx.moveTo(bgX + radius, bgY)
    ctx.lineTo(bgX + bgWidth - radius, bgY)
    ctx.quadraticCurveTo(bgX + bgWidth, bgY, bgX + bgWidth, bgY + radius)
    ctx.lineTo(bgX + bgWidth, bgY + bgHeight - radius)
    ctx.quadraticCurveTo(bgX + bgWidth, bgY + bgHeight, bgX + bgWidth - radius, bgY + bgHeight)
    ctx.lineTo(bgX + radius, bgY + bgHeight)
    ctx.quadraticCurveTo(bgX, bgY + bgHeight, bgX, bgY + bgHeight - radius)
    ctx.lineTo(bgX, bgY + radius)
    ctx.quadraticCurveTo(bgX, bgY, bgX + radius, bgY)
    ctx.closePath()
    ctx.fill()

    // Border
    if (isSelected) {
      ctx.strokeStyle = '#007fd4'
      ctx.lineWidth = 2
      ctx.stroke()
    }

    // Name text
    ctx.fillStyle = '#ffffff'
    ctx.fillText(name, screenX, screenY - LABEL_PADDING_Y * zoom)

    // Status indicator dot
    const dotRadius = 3 * zoom
    const dotX = screenX + textWidth / 2 + LABEL_PADDING_X * zoom + dotRadius + 2 * zoom
    const dotY = screenY - bgHeight / 2
    
    ctx.beginPath()
    ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2)
    ctx.fillStyle = isActive ? '#44bb66' : '#888888'
    ctx.fill()
    
    // Glow effect for active agents
    if (isActive) {
      ctx.beginPath()
      ctx.arc(dotX, dotY, dotRadius + 2 * zoom, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(68, 187, 102, 0.3)'
      ctx.fill()
    }
  }
}

// ── Render Full Frame ───────────────────────────────────────────

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  tileMap: TileTypeVal[][],
  furniture: FurnitureInstance[],
  characters: Character[],
  zoom: number,
  panX: number,
  panY: number,
  selectedAgentId: number | null,
  hoveredAgentId: number | null,
  tileColors?: Array<FloorColor | null>,
  cols?: number,
  rows?: number,
): void {
  const layoutCols = cols ?? (tileMap.length > 0 ? tileMap[0].length : 0)
  const layoutRows = rows ?? tileMap.length

  const mapW = layoutCols * TILE_SIZE * zoom
  const mapH = layoutRows * TILE_SIZE * zoom
  const offsetX = (canvasWidth - mapW) / 2 + panX
  const offsetY = (canvasHeight - mapH) / 2 + panY

  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  // Render layers in order
  renderTileGrid(ctx, tileMap, offsetX, offsetY, zoom, tileColors, layoutCols)
  renderScene(ctx, furniture, characters, offsetX, offsetY, zoom, selectedAgentId, hoveredAgentId)
  renderBubbles(ctx, characters, offsetX, offsetY, zoom)
  renderAgentLabels(ctx, characters, offsetX, offsetY, zoom, selectedAgentId)
}
