// ─────────────────────────────────────────────────────────────────
// Tile Map - Office layout
// ─────────────────────────────────────────────────────────────────

import { TileType, type TileType as TT } from '../types'
import { DEFAULT_COLS, DEFAULT_ROWS, TILE_SIZE } from '../constants'

// Generate default office layout
export function createDefaultTileMap(cols: number = DEFAULT_COLS, rows: number = DEFAULT_ROWS): TT[][] {
  const map: TT[][] = []

  for (let r = 0; r < rows; r++) {
    const row: TT[] = []
    for (let c = 0; c < cols; c++) {
      // Walls on edges
      if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) {
        row.push(TileType.WALL)
      } else {
        // Floor pattern
        row.push(((r + c) % 2 === 0) ? TileType.FLOOR_1 : TileType.FLOOR_2)
      }
    }
    map.push(row)
  }

  return map
}

// Check if tile is walkable
export function isWalkable(col: number, row: number, tiles: TT[][]): boolean {
  if (row < 0 || row >= tiles.length) return false
  if (col < 0 || col >= tiles[row].length) return false
  const tile = tiles[row][col]
  return tile !== TileType.WALL && tile !== TileType.VOID
}

// Get walkable tiles
export function getWalkableTiles(tiles: TT[][]): Array<{ col: number; row: number }> {
  const result: Array<{ col: number; row: number }> = []
  for (let r = 0; r < tiles.length; r++) {
    for (let c = 0; c < tiles[r].length; c++) {
      if (isWalkable(c, r, tiles)) {
        result.push({ col: c, row: r })
      }
    }
  }
  return result
}

// BFS pathfinding
export function findPath(
  start: { col: number; row: number },
  end: { col: number; row: number },
  tiles: TT[][],
  blocked: Set<string> = new Set(),
): Array<{ col: number; row: number }> {
  if (!isWalkable(end.col, end.row, tiles)) return []
  if (start.col === end.col && start.row === end.row) return [start]

  const key = (c: number, r: number) => `${c},${r}`
  const visited = new Set<string>()
  const queue: Array<{ col: number; row: number; path: Array<{ col: number; row: number }> }> = [
    { col: start.col, row: start.row, path: [start] }
  ]

  visited.add(key(start.col, start.row))

  const directions = [
    { dc: 0, dr: -1 }, // up
    { dc: 0, dr: 1 },  // down
    { dc: -1, dr: 0 }, // left
    { dc: 1, dr: 0 },  // right
  ]

  while (queue.length > 0) {
    const current = queue.shift()!

    for (const dir of directions) {
      const nc = current.col + dir.dc
      const nr = current.row + dir.dr
      const k = key(nc, nr)

      if (visited.has(k)) continue
      if (blocked.has(k)) continue
      if (!isWalkable(nc, nr, tiles)) continue

      const newPath = [...current.path, { col: nc, row: nr }]
      
      if (nc === end.col && nr === end.row) {
        return newPath
      }

      visited.add(k)
      queue.push({ col: nc, row: nr, path: newPath })
    }
  }

  return [] // No path found
}

// Pixel to tile conversion
export function pixelToTile(px: number, py: number): { col: number; row: number } {
  return {
    col: Math.floor(px / TILE_SIZE),
    row: Math.floor(py / TILE_SIZE),
  }
}

// Tile to pixel conversion
export function tileToPixel(col: number, row: number): { x: number; y: number } {
  return {
    x: col * TILE_SIZE,
    y: row * TILE_SIZE,
  }
}
