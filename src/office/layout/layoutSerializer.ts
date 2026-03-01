import { TileType, Direction } from '../types'
import { TILE_SIZE } from '../constants'
import type { OfficeLayout, PlacedFurniture, TileType as TileTypeVal, Seat, FurnitureInstance, FloorColor } from '../types'
import { getCatalogEntry } from '../sprites/spriteData'
import { createMultiAreaLayout, AREA_DEFINITIONS, getAreaAt, getRandomPositionInArea } from './multiAreaLayout'

// Re-export multi-area layout functions
export { createMultiAreaLayout, AREA_DEFINITIONS, getAreaAt, getRandomPositionInArea }
export type { AreaDefinition } from './multiAreaLayout'

/** Create a default office layout (now uses multi-area) */
export function createDefaultLayout(): OfficeLayout {
  return createMultiAreaLayout()
}

/** Convert layout to 2D tile map */
export function layoutToTileMap(layout: OfficeLayout): TileTypeVal[][] {
  const map: TileTypeVal[][] = []
  for (let r = 0; r < layout.rows; r++) {
    const row: TileTypeVal[] = []
    for (let c = 0; c < layout.cols; c++) {
      row.push(layout.tiles[r * layout.cols + c] ?? TileType.FLOOR_1)
    }
    map.push(row)
  }
  return map
}

/** Get furniture instances for rendering */
export function layoutToFurnitureInstances(furniture: PlacedFurniture[]): FurnitureInstance[] {
  return furniture.map((f) => {
    const entry = getCatalogEntry(f.type)
    const sprite = entry?.sprite || []
    return {
      sprite,
      x: f.col * TILE_SIZE,
      y: f.row * TILE_SIZE,
      zY: (f.row + (entry?.footprintH || 1)) * TILE_SIZE,
    }
  })
}

/** Extract seats (chairs) from furniture */
export function layoutToSeats(furniture: PlacedFurniture[]): Map<string, Seat> {
  const seats = new Map<string, Seat>()
  
  // Find all chairs
  const chairs = furniture.filter((f) => f.type === 'chair')
  
  for (const chair of chairs) {
    // Determine facing direction based on nearby desk
    let facingDir: Direction = Direction.UP // default
    
    // Look for adjacent desk
    const desk = furniture.find((f) => {
      if (f.type !== 'desk') return false
      const entry = getCatalogEntry('desk')
      const w = entry?.footprintW || 2
      const h = entry?.footprintH || 2
      // Check if chair is adjacent to desk
      return (
        (chair.col >= f.col - 1 && chair.col <= f.col + w) &&
        (chair.row === f.row - 1 || chair.row === f.row + h)
      )
    })
    
    if (desk) {
      // Face toward the desk
      if (chair.row < desk.row) {
        // Chair is above desk, face DOWN
        facingDir = Direction.DOWN
      } else {
        // Chair is below desk, face UP (toward desk)
        facingDir = Direction.UP
      }
    }
    
    seats.set(chair.uid, {
      uid: chair.uid,
      seatCol: chair.col,
      seatRow: chair.row,
      facingDir,
      assigned: false,
    })
  }
  
  return seats
}

/** Get blocked tiles from furniture */
export function getBlockedTiles(furniture: PlacedFurniture[]): Set<string> {
  const blocked = new Set<string>()
  
  for (const f of furniture) {
    const entry = getCatalogEntry(f.type)
    if (!entry) continue
    
    // Skip chairs (they're walkable for the agent assigned to them)
    if (f.type === 'chair') continue
    
    const w = entry.footprintW
    const h = entry.footprintH
    
    for (let dr = 0; dr < h; dr++) {
      for (let dc = 0; dc < w; dc++) {
        blocked.add(`${f.col + dc},${f.row + dr}`)
      }
    }
  }
  
  return blocked
}

/** Serialize layout to JSON */
export function serializeLayout(layout: OfficeLayout): string {
  return JSON.stringify(layout, null, 2)
}

/** Deserialize layout from JSON */
export function deserializeLayout(json: string): OfficeLayout | null {
  try {
    const layout = JSON.parse(json) as OfficeLayout
    if (layout.version !== 1) return null
    return layout
  } catch {
    return null
  }
}
