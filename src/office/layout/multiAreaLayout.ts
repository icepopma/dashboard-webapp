import { TileType, Direction } from '../types'
import { TILE_SIZE } from '../constants'
import type { OfficeLayout, PlacedFurniture, TileType as TileTypeVal, Seat, FurnitureInstance, FloorColor } from '../types'
import { getCatalogEntry } from '../sprites/spriteData'

/**
 * Multi-Area Office Layout
 * 
 * Layout structure (42x16 tiles):
 * ┌────────────────────┬────────────┬────────────┐
 * │                    │            │            │
 * │   办公区 (16x10)   │ 休息室 (8) │ 咖啡间 (8) │
 * │                    │            │            │
 * ├────────────────────┴────────────┴────────────┤
 * │                                               │
 * │         健身房 (10x6) - spans bottom          │
 * │                                               │
 * └───────────────────────────────────────────────┘
 */

export interface AreaDefinition {
  name: string
  label: string
  startCol: number
  startRow: number
  cols: number
  rows: number
  type: 'office' | 'rest' | 'coffee' | 'gym'
}

export const AREA_DEFINITIONS: AreaDefinition[] = [
  { name: 'office', label: '办公区', startCol: 1, startRow: 1, cols: 16, rows: 10, type: 'office' },
  { name: 'rest', label: '休息室', startCol: 18, startRow: 1, cols: 8, rows: 8, type: 'rest' },
  { name: 'coffee', label: '咖啡间', startCol: 27, startRow: 1, cols: 8, rows: 6, type: 'coffee' },
  { name: 'gym', label: '健身房', startCol: 18, startRow: 10, cols: 10, rows: 5, type: 'gym' },
]

/** Create a multi-area office layout */
export function createMultiAreaLayout(): OfficeLayout {
  const cols = 36
  const rows = 16
  const tiles: TileTypeVal[] = []
  const tileColors: Array<FloorColor | null> = []

  // Create floor with wall border
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Outer walls
      if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) {
        tiles.push(TileType.WALL)
        tileColors.push(null)
        continue
      }

      // Internal walls - create room divisions
      const isOfficeWall = c === 17 && r >= 1 && r <= 10
      const isRestCoffeeWall = c === 26 && r >= 1 && r <= 6
      const isGymWall = r === 9 && c >= 18 && c <= 35
      
      // Add doorways (remove wall tiles at specific positions)
      const isDoorway1 = c === 17 && r === 5  // Door between office and rest area
      const isDoorway2 = c === 26 && r === 3  // Door between rest and coffee
      const isDoorway3 = r === 9 && c === 22  // Door to gym
      
      if ((isOfficeWall || isRestCoffeeWall || isGymWall) && !isDoorway1 && !isDoorway2 && !isDoorway3) {
        tiles.push(TileType.WALL)
        tileColors.push(null)
        continue
      }

      // Floor tiles with area-specific colors
      tiles.push(TileType.FLOOR_1)
      
      // Different floor colors for each area
      let color: FloorColor
      if (c >= 1 && c <= 16 && r >= 1 && r <= 10) {
        // Office area - neutral gray
        color = { h: 220, s: 10, b: 15, c: 0 }
      } else if (c >= 18 && c <= 25 && r >= 1 && r <= 8) {
        // Rest area - warm tones
        color = { h: 30, s: 40, b: 20, c: 0 }
      } else if (c >= 27 && c <= 34 && r >= 1 && r <= 6) {
        // Coffee area - cafe brown
        color = { h: 25, s: 50, b: 15, c: 0 }
      } else if (c >= 18 && c <= 35 && r >= 10 && r <= 14) {
        // Gym area - energetic green
        color = { h: 120, s: 30, b: 15, c: 0 }
      } else {
        color = { h: 35, s: 30, b: 15, c: 0 }
      }
      tileColors.push(color)
    }
  }

  const furniture: PlacedFurniture[] = []

  // ── Office Area (6 workstations with PC) ───────────────────────
  // Spread out more to accommodate larger desks
  for (let i = 0; i < 6; i++) {
    const col = 1 + (i % 3) * 5
    const row = i < 3 ? 3 : 7
    
    // Desk with PC (combined) - 3x2 tiles
    furniture.push({
      uid: `desk-pc-${i}`,
      type: 'desk_pc',
      col,
      row,
    })
    
    // Chair (in front of desk, below it so agent faces UP toward desk)
    furniture.push({
      uid: `chair-${i}`,
      type: 'chair',
      col: col + 1,
      row: row + 1,  // 紧贴桌子
    })
  }

  // Task board (whiteboard) on office wall
  furniture.push({
    uid: 'task-board',
    type: 'whiteboard',
    col: 13,
    row: 1,
  })

  // Office decorations
  furniture.push({ uid: 'plant-office-1', type: 'plant', col: 1, row: 1 })
  furniture.push({ uid: 'plant-office-2', type: 'plant', col: 15, row: 9 })
  furniture.push({ uid: 'cooler-office', type: 'cooler', col: 1, row: 5 })

  // ── Rest Area ──────────────────────────────────────────────────
  // Large sofa
  furniture.push({
    uid: 'sofa-1',
    type: 'sofa',
    col: 18,
    row: 2,
  })

  // TV on wall
  furniture.push({
    uid: 'tv-1',
    type: 'tv',
    col: 22,
    row: 1,
  })

  // Bean bag chairs
  furniture.push({
    uid: 'beanbag-1',
    type: 'beanbag',
    col: 19,
    row: 5,
  })
  furniture.push({
    uid: 'beanbag-2',
    type: 'beanbag',
    col: 22,
    row: 5,
  })

  // Bookshelf
  furniture.push({
    uid: 'bookshelf-rest',
    type: 'bookshelf',
    col: 25,
    row: 4,
  })

  // ── Coffee Area ────────────────────────────────────────────────
  // Coffee machine
  furniture.push({
    uid: 'coffee-machine',
    type: 'coffee_machine',
    col: 27,
    row: 1,
  })

  // Dining table
  furniture.push({
    uid: 'dining-table',
    type: 'dining_table',
    col: 29,
    row: 2,
  })

  // Fridge
  furniture.push({
    uid: 'fridge',
    type: 'fridge',
    col: 33,
    row: 1,
  })

  // Microwave
  furniture.push({
    uid: 'microwave',
    type: 'microwave',
    col: 27,
    row: 4,
  })

  // ── Gym Area ───────────────────────────────────────────────────
  // Treadmills
  furniture.push({
    uid: 'treadmill-1',
    type: 'treadmill',
    col: 18,
    row: 11,
  })
  furniture.push({
    uid: 'treadmill-2',
    type: 'treadmill',
    col: 22,
    row: 11,
  })

  // Dumbbell rack
  furniture.push({
    uid: 'dumbbell-rack',
    type: 'dumbbell_rack',
    col: 26,
    row: 11,
  })

  // Yoga mats
  furniture.push({
    uid: 'yoga-mat-1',
    type: 'yoga_mat',
    col: 18,
    row: 13,
  })
  furniture.push({
    uid: 'yoga-mat-2',
    type: 'yoga_mat',
    col: 21,
    row: 13,
  })
  furniture.push({
    uid: 'yoga-mat-3',
    type: 'yoga_mat',
    col: 24,
    row: 13,
  })

  return {
    version: 1,
    cols,
    rows,
    tiles,
    furniture,
    tileColors,
  }
}

/** Get the area type for a given tile position */
export function getAreaAt(col: number, row: number): AreaDefinition | null {
  for (const area of AREA_DEFINITIONS) {
    if (
      col >= area.startCol &&
      col < area.startCol + area.cols &&
      row >= area.startRow &&
      row < area.startRow + area.rows
    ) {
      return area
    }
  }
  return null
}

/** Get random walkable position in a specific area */
export function getRandomPositionInArea(
  areaName: string,
  tileMap: TileTypeVal[][],
  blockedTiles: Set<string>,
): { col: number; row: number } | null {
  const area = AREA_DEFINITIONS.find(a => a.name === areaName)
  if (!area) return null

  const positions: { col: number; row: number }[] = []
  
  for (let r = area.startRow; r < area.startRow + area.rows; r++) {
    for (let c = area.startCol; c < area.startCol + area.cols; c++) {
      if (r >= 0 && r < tileMap.length && c >= 0 && c < tileMap[0].length) {
        const tile = tileMap[r][c]
        if (tile !== TileType.WALL && tile !== TileType.VOID) {
          const key = `${c},${r}`
          if (!blockedTiles.has(key)) {
            positions.push({ col: c, row: r })
          }
        }
      }
    }
  }

  if (positions.length === 0) return null
  return positions[Math.floor(Math.random() * positions.length)]
}
