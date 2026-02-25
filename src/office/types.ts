// ─────────────────────────────────────────────────────────────────
// Office Types - Based on Pixel Agents
// ─────────────────────────────────────────────────────────────────

import { TILE_SIZE } from './constants'

// Tile Types
export const TileType = {
  WALL: 0,
  FLOOR_1: 1,
  FLOOR_2: 2,
  FLOOR_3: 3,
  FLOOR_4: 4,
  VOID: 8,
} as const
export type TileType = (typeof TileType)[keyof typeof TileType]

// Character State
export const CharacterState = {
  IDLE: 'idle',
  WALK: 'walk',
  TYPE: 'type',
  READ: 'read',
} as const
export type CharacterState = (typeof CharacterState)[keyof typeof CharacterState]

// Direction
export const Direction = {
  DOWN: 0,
  LEFT: 1,
  RIGHT: 2,
  UP: 3,
} as const
export type Direction = (typeof Direction)[keyof typeof Direction]

// Sprite Data: 2D array of hex colors ('' = transparent)
export type SpriteData = string[][]

// Floor Color for colorization
export interface FloorColor {
  h: number  // Hue: 0-360
  s: number  // Saturation: 0-100
  b: number  // Brightness: -100 to 100
  c: number  // Contrast: -100 to 100
}

// Furniture Instance for rendering
export interface FurnitureInstance {
  sprite: SpriteData
  x: number      // Pixel x (top-left)
  y: number      // Pixel y (top-left)
  zY: number     // Y value for depth sorting
  col: number    // Grid column
  row: number    // Grid row
  type: string   // Furniture type
  uid: string    // Unique ID
}

// Seat definition
export interface Seat {
  uid: string
  seatCol: number
  seatRow: number
  facingDir: Direction
  assigned: boolean
}

// Character definition
export interface Character {
  id: number
  name: string
  role: string
  state: CharacterState
  dir: Direction
  x: number           // Pixel position
  y: number
  tileCol: number     // Current tile column
  tileRow: number     // Current tile row
  path: Array<{ col: number; row: number }>  // Remaining path
  moveProgress: number  // 0-1 lerp between tiles
  currentTool: string | null
  palette: number     // Palette index (0-5)
  hueShift: number    // Hue shift in degrees
  frame: number       // Animation frame index
  frameTimer: number  // Time accumulator
  wanderTimer: number
  wanderCount: number
  wanderLimit: number
  isActive: boolean
  seatId: string | null
  bubbleType: 'permission' | 'waiting' | 'chat' | null
  bubbleTimer: number
  bubbleMessage: string | null
  seatTimer: number
  task: string | null
}

// Palette colors
export interface CharPalette {
  skin: string
  shirt: string
  pants: string
  hair: string
  shoes: string
}

// Furniture catalog entry
export interface FurnitureCatalogEntry {
  type: string
  label: string
  footprintW: number  // Width in tiles
  footprintH: number  // Height in tiles
  sprite: SpriteData
  isDesk: boolean
  isChair: boolean
}

// Office layout
export interface OfficeLayout {
  version: 1
  cols: number
  rows: number
  tiles: TileType[][]
  furniture: PlacedFurniture[]
}

export interface PlacedFurniture {
  uid: string
  type: string
  col: number
  row: number
}

// Point type
export interface Point {
  col: number
  row: number
}
