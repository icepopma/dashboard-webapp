// ─────────────────────────────────────────────────────────────────
// Characters - Character system with AI behavior
// ─────────────────────────────────────────────────────────────────

import type { Character, TileType } from '../types'
import { WALK_SPEED_PX_PER_SEC, WALK_FRAME_DURATION_SEC, TYPE_FRAME_DURATION_SEC, TILE_SIZE } from '../constants'
import { findPath } from '../layout/tileMap'

// Create default characters
export function createDefaultCharacters(): Character[] {
  const agents = [
    { name: 'Pop', role: 'Chief of Staff', palette: 0 },
    { name: 'Codex', role: 'Engineer', palette: 1 },
    { name: 'Quill', role: 'Writer', palette: 2 },
    { name: 'Echo', role: 'Social Media', palette: 3 },
    { name: 'Scout', role: 'Analyst', palette: 4 },
    { name: 'Pixel', role: 'Designer', palette: 5 },
  ]

  // Initial positions (near desks)
  const positions = [
    { col: 3, row: 6 },
    { col: 7, row: 6 },
    { col: 11, row: 6 },
    { col: 15, row: 6 },
    { col: 5, row: 8 },
    { col: 13, row: 8 },
  ]

  return agents.map((agent, idx) => ({
    id: idx + 1,
    name: agent.name,
    role: agent.role,
    state: idx < 4 ? 'type' : 'idle', // 前4个正在打字
    dir: 0 as const, // DOWN
    x: positions[idx].col * TILE_SIZE,
    y: positions[idx].row * TILE_SIZE,
    tileCol: positions[idx].col,
    tileRow: positions[idx].row,
    path: [],
    moveProgress: 0,
    palette: agent.palette,
    hueShift: 0,
    frame: 0,
    frameTimer: 0,
    wanderTimer: Math.random() * 5,
    wanderCount: 0,
    wanderLimit: 3,
    isActive: idx < 4, // First 4 are working
    seatId: `seat-${idx + 1}`,
    bubbleType: null,
    bubbleMessage: null,
    bubbleTimer: 0,
    seatTimer: 0,
    currentTool: 'pc',
    task: idx < 4 ? ['优化 Dashboard', '构建 API', '撰写文档', '发布内容'][idx] : null,
  }))
}

// Update character state
export function updateCharacter(
  char: Character,
  dt: number,
  tiles: TileType[][],
  blockedTiles: Set<string>,
): Character {
  let newState = { ...char }

  switch (char.state) {
    case 'walk':
      newState = updateWalking(newState, dt, tiles, blockedTiles)
      break
    case 'type':
    case 'read':
      newState = updateTyping(newState, dt)
      break
    case 'idle':
    default:
      newState = updateIdle(newState, dt)
      break
  }

  // Update bubble timer
  if (newState.bubbleMessage && newState.bubbleTimer > 0) {
    newState.bubbleTimer -= dt
    if (newState.bubbleTimer <= 0) {
      newState.bubbleMessage = null
      newState.bubbleType = null
    }
  }

  return newState
}

function updateWalking(
  char: Character,
  dt: number,
  tiles: TileType[][],
  blockedTiles: Set<string>,
): Character {
  const newState = { ...char }

  // Update frame
  newState.frameTimer += dt
  if (newState.frameTimer >= WALK_FRAME_DURATION_SEC) {
    newState.frameTimer = 0
    newState.frame = (newState.frame + 1) % 4
  }

  // Move along path
  if (char.path.length > 0) {
    const target = char.path[0]
    const targetX = target.col * TILE_SIZE
    const targetY = target.row * TILE_SIZE

    const dx = targetX - char.x
    const dy = targetY - char.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < 2) {
      // Reached target
      newState.x = targetX
      newState.y = targetY
      newState.tileCol = target.col
      newState.tileRow = target.row
      newState.path = char.path.slice(1)

      if (newState.path.length === 0) {
        // Path complete
        if (char.isActive) {
          newState.state = 'type'
        } else {
          newState.state = 'idle'
        }
        newState.frame = 0
        newState.frameTimer = 0
      }
    } else {
      // Move towards target
      const speed = WALK_SPEED_PX_PER_SEC * dt
      const moveX = (dx / dist) * Math.min(speed, dist)
      const moveY = (dy / dist) * Math.min(speed, dist)

      newState.x = char.x + moveX
      newState.y = char.y + moveY

      // Update direction
      if (Math.abs(dy) > Math.abs(dx)) {
        newState.dir = dy > 0 ? 0 : 3 // DOWN or UP
      } else {
        newState.dir = dx > 0 ? 2 : 1 // RIGHT or LEFT
      }
    }
  } else {
    // No path, switch to idle
    newState.state = 'idle'
  }

  return newState
}

function updateTyping(char: Character, dt: number): Character {
  const newState = { ...char }

  // Update frame
  newState.frameTimer += dt
  if (newState.frameTimer >= TYPE_FRAME_DURATION_SEC) {
    newState.frameTimer = 0
    newState.frame = (newState.frame + 1) % 2
  }

  return newState
}

function updateIdle(char: Character, dt: number): Character {
  const newState = { ...char }

  // Random wandering
  newState.wanderTimer -= dt
  if (newState.wanderTimer <= 0 && newState.wanderCount < newState.wanderLimit) {
    // Decide to wander
    newState.wanderTimer = 5 + Math.random() * 10
    newState.wanderCount++
  }

  return newState
}

// Send character to target
export function sendCharacterTo(
  char: Character,
  targetCol: number,
  targetRow: number,
  tiles: TileType[][],
  blocked: Set<string>,
): Character {
  const path = findPath(
    { col: char.tileCol, row: char.tileRow },
    { col: targetCol, row: targetRow },
    tiles,
    blocked,
  )

  if (path.length > 0) {
    return {
      ...char,
      path: path.slice(1), // Skip start position
      state: 'walk',
      frame: 0,
      frameTimer: 0,
      wanderCount: 0,
    }
  }

  return char
}

// Start working
export function startWorking(char: Character, task: string): Character {
  return {
    ...char,
    isActive: true,
    task,
    state: 'type',
    frame: 0,
    frameTimer: 0,
  }
}

// Stop working
export function stopWorking(char: Character): Character {
  return {
    ...char,
    isActive: false,
    task: null,
    state: 'idle',
    frame: 0,
    frameTimer: 0,
  }
}

// Show chat bubble
export function showChatBubble(char: Character, message: string): Character {
  return {
    ...char,
    bubbleType: 'chat',
    bubbleMessage: message,
    bubbleTimer: 3, // 3 seconds
  }
}

// Update all characters
export function updateAllCharacters(
  characters: Character[],
  dt: number,
  tiles: TileType[][],
): Character[] {
  // Build blocked set from current character positions
  const blocked = new Set<string>()
  characters.forEach(c => {
    blocked.add(`${c.tileCol},${c.tileRow}`)
  })

  return characters.map(char => {
    // Remove self from blocked
    const selfKey = `${char.tileCol},${char.tileRow}`
    blocked.delete(selfKey)
    
    const updated = updateCharacter(char, dt, tiles, blocked)
    
    // Add back to blocked
    blocked.add(selfKey)
    
    return updated
  })
}

// Move all to zone
export function moveAllToZone(
  characters: Character[],
  zone: 'work' | 'coffee' | 'meeting' | 'rest',
  tiles: TileType[][],
): Character[] {
  const zonePositions = {
    work: [
      { col: 3, row: 6 },
      { col: 7, row: 6 },
      { col: 11, row: 6 },
      { col: 15, row: 6 },
      { col: 5, row: 8 },
      { col: 13, row: 8 },
    ],
    coffee: [
      { col: 7, row: 8 },
      { col: 8, row: 8 },
      { col: 9, row: 8 },
      { col: 7, row: 9 },
      { col: 8, row: 9 },
      { col: 9, row: 9 },
    ],
    meeting: [
      { col: 10, row: 4 },
      { col: 11, row: 4 },
      { col: 12, row: 4 },
      { col: 10, row: 5 },
      { col: 11, row: 5 },
      { col: 12, row: 5 },
    ],
    rest: [
      { col: 11, row: 8 },
      { col: 12, row: 8 },
      { col: 13, row: 8 },
      { col: 11, row: 9 },
      { col: 12, row: 9 },
      { col: 13, row: 9 },
    ],
  }

  const positions = zonePositions[zone]
  const blocked = new Set<string>()

  return characters.map((char, idx) => {
    const pos = positions[idx % positions.length]
    blocked.delete(`${char.tileCol},${char.tileRow}`)
    
    const updated = sendCharacterTo(char, pos.col, pos.row, tiles, blocked)
    
    if (zone === 'work') {
      updated.isActive = true
      if (!updated.task) {
        updated.task = '工作中...'
      }
    } else {
      updated.isActive = false
      updated.task = null
    }
    
    blocked.add(`${pos.col},${pos.row}`)
    return updated
  })
}
