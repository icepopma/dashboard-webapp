// ─────────────────────────────────────────────────────────────────
// Renderer - Canvas 2D rendering for office
// ─────────────────────────────────────────────────────────────────

import { TILE_SIZE } from '../constants'
import type { SpriteData, Character, FurnitureInstance, TileType, Point } from '../types'
import { getCachedSprite, getOutlineSprite } from '../sprites/spriteCache'
import { getCharacterSprite, CHARACTER_PALETTES, BUBBLE_CHAT_SPRITE, BUBBLE_WAITING_SPRITE, BUBBLE_PERMISSION_SPRITE } from '../sprites/spriteData'

export interface RenderOptions {
  zoom: number
  offsetX: number
  offsetY: number
  selectedCharId: number | null
  hoveredCharId: number | null
}

export class Renderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private options: RenderOptions

  constructor(canvas: HTMLCanvasElement, options: RenderOptions) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.ctx.imageSmoothingEnabled = false
    this.options = options
  }

  updateOptions(options: Partial<RenderOptions>): void {
    this.options = { ...this.options, ...options }
  }

  clear(): void {
    this.ctx.fillStyle = '#1a1a2e'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  // Draw floor tiles
  drawFloor(tiles: TileType[][], colors: string[] = ['#2d3748', '#374151', '#3f4f63', '#4a5568']): void {
    const { zoom, offsetX, offsetY } = this.options
    const ctx = this.ctx

    for (let row = 0; row < tiles.length; row++) {
      for (let col = 0; col < tiles[row].length; col++) {
        const tile = tiles[row][col]
        if (tile === 0 || tile === 8) continue // WALL or VOID

        const x = col * TILE_SIZE * zoom + offsetX
        const y = row * TILE_SIZE * zoom + offsetY
        
        // Checkerboard pattern
        const colorIndex = ((row + col) % 2)
        ctx.fillStyle = colors[colorIndex] || colors[0]
        ctx.fillRect(x, y, TILE_SIZE * zoom, TILE_SIZE * zoom)
      }
    }
  }

  // Draw walls
  drawWalls(tiles: TileType[][], wallColor: string = '#4a5568'): void {
    const { zoom, offsetX, offsetY } = this.options
    const ctx = this.ctx

    for (let row = 0; row < tiles.length; row++) {
      for (let col = 0; col < tiles[row].length; col++) {
        if (tiles[row][col] !== 0) continue // Not wall

        const x = col * TILE_SIZE * zoom + offsetX
        const y = row * TILE_SIZE * zoom + offsetY

        ctx.fillStyle = wallColor
        ctx.fillRect(x, y, TILE_SIZE * zoom, TILE_SIZE * zoom)

        // Add subtle edge highlight
        ctx.fillStyle = 'rgba(255,255,255,0.1)'
        ctx.fillRect(x, y, TILE_SIZE * zoom, 2 * zoom)
        ctx.fillRect(x, y, 2 * zoom, TILE_SIZE * zoom)
      }
    }
  }

  // Draw furniture
  drawFurniture(furniture: FurnitureInstance[]): void {
    const { zoom, offsetX, offsetY } = this.options

    furniture.forEach(f => {
      const x = f.x * zoom + offsetX
      const y = f.y * zoom + offsetY
      const cached = getCachedSprite(f.sprite, zoom)
      this.ctx.drawImage(cached, x, y)
    })
  }

  // Draw character
  drawCharacter(char: Character): void {
    const { zoom, offsetX, offsetY, selectedCharId, hoveredCharId } = this.options
    const ctx = this.ctx

    const palette = CHARACTER_PALETTES[char.palette % CHARACTER_PALETTES.length]
    const sprite = getCharacterSprite(char, palette)

    const x = char.x * zoom + offsetX
    const y = char.y * zoom + offsetY

    // Draw outline if selected or hovered
    if (selectedCharId === char.id || hoveredCharId === char.id) {
      const outlineSprite = getOutlineSprite(sprite)
      const outlineCached = getCachedSprite(outlineSprite, zoom)
      ctx.globalAlpha = selectedCharId === char.id ? 1.0 : 0.5
      ctx.drawImage(outlineCached, x - zoom, y - zoom)
      ctx.globalAlpha = 1.0
    }

    // Draw character sprite
    const cached = getCachedSprite(sprite, zoom)
    ctx.drawImage(cached, x, y)

    // Draw name label
    const nameWidth = ctx.measureText(char.name).width + 12
    ctx.fillStyle = 'rgba(0,0,0,0.8)'
    ctx.fillRect(x + 8 * zoom - nameWidth / 2, y + 24 * zoom, nameWidth, 14)
    ctx.fillStyle = '#ffffff'
    ctx.font = `${10 * zoom}px monospace`
    ctx.textAlign = 'center'
    ctx.fillText(char.name, x + 8 * zoom, y + 24 * zoom + 10)
    ctx.textAlign = 'left'

    // Draw status indicator
    const statusColor = char.isActive ? '#22c55e' : '#eab308'
    ctx.beginPath()
    ctx.arc(x + 22 * zoom, y + 5 * zoom, 4 * zoom, 0, Math.PI * 2)
    ctx.fillStyle = statusColor
    ctx.fill()

    // Draw task bubble
    if (char.task && char.isActive) {
      const bubbleWidth = Math.min(char.task.length * 6 + 20, 100) * zoom
      ctx.fillStyle = 'rgba(34, 197, 94, 0.95)'
      ctx.beginPath()
      ctx.roundRect(x + 8 * zoom - bubbleWidth / 2, y - 35 * zoom, bubbleWidth, 20 * zoom, 4 * zoom)
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.font = `${9 * zoom}px monospace`
      ctx.textAlign = 'center'
      const displayTask = char.task.length > 12 ? char.task.slice(0, 12) + '...' : char.task
      ctx.fillText(displayTask, x + 8 * zoom, y - 22 * zoom)
      ctx.textAlign = 'left'
    }

    // Draw chat bubble
    if (char.bubbleMessage && char.bubbleType) {
      const bubbleSprite = char.bubbleType === 'waiting' ? BUBBLE_WAITING_SPRITE 
                        : char.bubbleType === 'permission' ? BUBBLE_PERMISSION_SPRITE 
                        : BUBBLE_CHAT_SPRITE
      
      const bubbleCached = getCachedSprite(bubbleSprite, zoom)
      const bx = x + 8 * zoom - (bubbleSprite[0]?.length || 11) * zoom / 2
      const by = y - 60 * zoom
      ctx.drawImage(bubbleCached, bx, by)
    }
  }

  // Draw all characters sorted by Y
  drawCharacters(characters: Character[]): void {
    // Sort by Y for depth
    const sorted = [...characters].sort((a, b) => a.y - b.y)
    sorted.forEach(char => this.drawCharacter(char))
  }

  // Combined render
  render(
    tiles: TileType[][],
    furniture: FurnitureInstance[],
    characters: Character[],
  ): void {
    this.clear()
    this.drawFloor(tiles)
    this.drawWalls(tiles)

    // Combine furniture and characters for depth sorting
    const combined: Array<{ type: 'f' | 'c', y: number, data: any }> = [
      ...furniture.map(f => ({ type: 'f' as const, y: f.zY, data: f })),
      ...characters.map(c => ({ type: 'c' as const, y: c.y + 24, data: c })),
    ]

    // Sort by Y
    combined.sort((a, b) => a.y - b.y)

    // Draw in order
    combined.forEach(item => {
      if (item.type === 'f') {
        this.drawFurniture([item.data])
      } else {
        this.drawCharacter(item.data)
      }
    })
  }
}
