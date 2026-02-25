// ─────────────────────────────────────────────────────────────────
// Furniture Catalog
// ─────────────────────────────────────────────────────────────────

import type { FurnitureCatalogEntry, FurnitureInstance } from '../types'
import { DESK_SPRITE, CHAIR_SPRITE, PC_SPRITE, PLANT_SPRITE, BOOKSHELF_SPRITE, SOFA_SPRITE, COFFEE_TABLE_SPRITE, LAMP_SPRITE, COOLER_SPRITE } from '../sprites/spriteData'
import { TILE_SIZE } from '../constants'

export const FURNITURE_CATALOG: FurnitureCatalogEntry[] = [
  {
    type: 'desk',
    label: 'Desk',
    footprintW: 2,
    footprintH: 2,
    sprite: DESK_SPRITE,
    isDesk: true,
    isChair: false,
  },
  {
    type: 'chair',
    label: 'Chair',
    footprintW: 1,
    footprintH: 1,
    sprite: CHAIR_SPRITE,
    isDesk: false,
    isChair: true,
  },
  {
    type: 'pc',
    label: 'PC',
    footprintW: 1,
    footprintH: 1,
    sprite: PC_SPRITE,
    isDesk: false,
    isChair: false,
  },
  {
    type: 'plant',
    label: 'Plant',
    footprintW: 1,
    footprintH: 1,
    sprite: PLANT_SPRITE,
    isDesk: false,
    isChair: false,
  },
  {
    type: 'bookshelf',
    label: 'Bookshelf',
    footprintW: 1,
    footprintH: 2,
    sprite: BOOKSHELF_SPRITE,
    isDesk: false,
    isChair: false,
  },
  {
    type: 'sofa',
    label: 'Sofa',
    footprintW: 2,
    footprintH: 1,
    sprite: SOFA_SPRITE,
    isDesk: false,
    isChair: false,
  },
  {
    type: 'coffee_table',
    label: 'Coffee Table',
    footprintW: 2,
    footprintH: 1,
    sprite: COFFEE_TABLE_SPRITE,
    isDesk: false,
    isChair: false,
  },
  {
    type: 'lamp',
    label: 'Lamp',
    footprintW: 1,
    footprintH: 1,
    sprite: LAMP_SPRITE,
    isDesk: false,
    isChair: false,
  },
  {
    type: 'cooler',
    label: 'Water Cooler',
    footprintW: 1,
    footprintH: 1,
    sprite: COOLER_SPRITE,
    isDesk: false,
    isChair: false,
  },
]

// Get furniture by type
export function getFurnitureByType(type: string): FurnitureCatalogEntry | undefined {
  return FURNITURE_CATALOG.find(f => f.type === type)
}

// Create furniture instance
export function createFurnitureInstance(
  type: string,
  col: number,
  row: number,
  uid: string,
): FurnitureInstance | null {
  const entry = getFurnitureByType(type)
  if (!entry) return null

  return {
    sprite: entry.sprite,
    x: col * TILE_SIZE,
    y: row * TILE_SIZE,
    zY: (row + entry.footprintH) * TILE_SIZE,
    col,
    row,
    type,
    uid,
  }
}

// Default office furniture layout
export function createDefaultFurniture(): FurnitureInstance[] {
  const furniture: FurnitureInstance[] = []
  let uidCounter = 1

  // Work stations (4 desks with chairs and PCs)
  const deskPositions = [
    { col: 2, row: 3 },
    { col: 6, row: 3 },
    { col: 10, row: 3 },
    { col: 14, row: 3 },
  ]

  deskPositions.forEach(pos => {
    // Desk
    furniture.push({
      sprite: DESK_SPRITE,
      x: pos.col * TILE_SIZE,
      y: pos.row * TILE_SIZE,
      zY: (pos.row + 2) * TILE_SIZE,
      col: pos.col,
      row: pos.row,
      type: 'desk',
      uid: `desk-${uidCounter++}`,
    })

    // Chair (below desk)
    furniture.push({
      sprite: CHAIR_SPRITE,
      x: (pos.col + 0.5) * TILE_SIZE,
      y: (pos.row + 2.5) * TILE_SIZE,
      zY: (pos.row + 3.5) * TILE_SIZE,
      col: pos.col,
      row: pos.row + 2,
      type: 'chair',
      uid: `chair-${uidCounter++}`,
    })

    // PC (on desk)
    furniture.push({
      sprite: PC_SPRITE,
      x: (pos.col + 1) * TILE_SIZE,
      y: (pos.row + 0.5) * TILE_SIZE,
      zY: (pos.row + 2) * TILE_SIZE,
      col: pos.col + 1,
      row: pos.row,
      type: 'pc',
      uid: `pc-${uidCounter++}`,
    })
  })

  // Plants
  const plantPositions = [
    { col: 1, row: 1 },
    { col: 18, row: 1 },
    { col: 1, row: 9 },
  ]

  plantPositions.forEach(pos => {
    furniture.push({
      sprite: PLANT_SPRITE,
      x: pos.col * TILE_SIZE,
      y: pos.row * TILE_SIZE,
      zY: (pos.row + 1) * TILE_SIZE,
      col: pos.col,
      row: pos.row,
      type: 'plant',
      uid: `plant-${uidCounter++}`,
    })
  })

  // Coffee area
  furniture.push({
    sprite: COFFEE_TABLE_SPRITE,
    x: 6 * TILE_SIZE,
    y: 7 * TILE_SIZE,
    zY: 8 * TILE_SIZE,
    col: 6,
    row: 7,
    type: 'coffee_table',
    uid: `coffee_table-1`,
  })

  // Sofa
  furniture.push({
    sprite: SOFA_SPRITE,
    x: 10 * TILE_SIZE,
    y: 7 * TILE_SIZE,
    zY: 8 * TILE_SIZE,
    col: 10,
    row: 7,
    type: 'sofa',
    uid: `sofa-1`,
  })

  return furniture
}
