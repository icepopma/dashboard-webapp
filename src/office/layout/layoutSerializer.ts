import { TileType, Direction } from '../types'
import { TILE_SIZE } from '../constants'
import type { OfficeLayout, PlacedFurniture, TileType as TileTypeVal, Seat, FurnitureInstance, FloorColor } from '../types'
import { getCatalogEntry } from '../sprites/spriteData'

/** Create a default office layout */
export function createDefaultLayout(): OfficeLayout {
  const cols = 20
  const rows = 11
  const tiles: TileTypeVal[] = []
  const tileColors: Array<FloorColor | null> = []

  // Create floor with wall border
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) {
        tiles.push(TileType.WALL)
        tileColors.push(null)
      } else {
        tiles.push(TileType.FLOOR_1)
        tileColors.push({ h: 35, s: 30, b: 15, c: 0 })
      }
    }
  }

  // Default furniture: 6 desks with chairs
  const furniture: PlacedFurniture[] = []
  
  // Create 6 workstations
  for (let i = 0; i < 6; i++) {
    const col = 2 + (i % 3) * 6
    const row = i < 3 ? 3 : 7
    
    // Desk (2x2)
    furniture.push({
      uid: `desk-${i}`,
      type: 'desk',
      col,
      row,
    })
    
    // Chair (in front of desk)
    furniture.push({
      uid: `chair-${i}`,
      type: 'chair',
      col: col + 1,
      row: row - 1,
    })
    
    // PC on desk
    furniture.push({
      uid: `pc-${i}`,
      type: 'pc',
      col: col + 1,
      row,
    })
  }

  // Add some decorations
  furniture.push({ uid: 'plant-1', type: 'plant', col: 17, row: 2 })
  furniture.push({ uid: 'plant-2', type: 'plant', col: 17, row: 8 })
  furniture.push({ uid: 'bookshelf-1', type: 'bookshelf', col: 17, row: 5 })
  furniture.push({ uid: 'cooler-1', type: 'cooler', col: 2, row: 9 })

  return {
    version: 1,
    cols,
    rows,
    tiles,
    furniture,
    tileColors,
  }
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
        facingDir = Direction.DOWN
      } else {
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
