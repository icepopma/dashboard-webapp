import type { SpriteData } from '../types'

const _ = '' // transparent

// ── Rest Area Furniture ─────────────────────────────────────────

/** Sofa: 32x24 (2x1.5 tiles) */
export const SOFA_SPRITE: SpriteData = (() => {
  const B = '#8B4513'   // Brown frame
  const D = '#6B3510'   // Dark brown
  const C = '#CC8844'   // Cushion
  const L = '#DDAA66'   // Light cushion
  return [
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, _],
    [_, B, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, B, _],
    [_, B, C, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, C, B, _],
    [_, B, C, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, C, B, _],
    [_, B, C, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, C, B, _],
    [_, B, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, B, _],
    [_, B, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, B, _],
    [_, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, _],
    [_, _, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  ]
})()

/** TV: 24x20 */
export const TV_SPRITE: SpriteData = (() => {
  const F = '#333333'   // Frame
  const S = '#111111'   // Screen border
  const B = '#4488CC'   // Screen blue
  const G = '#66AA66'   // Screen green glow
  const D = '#222222'   // Stand
  return [
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, _, _, _],
    [_, _, _, F, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, F, _, _, _],
    [_, _, _, F, S, B, B, B, B, B, B, B, B, B, B, B, B, B, B, S, F, _, _, _],
    [_, _, _, F, S, B, G, G, G, B, B, B, B, B, B, G, G, B, S, F, _, _, _],
    [_, _, _, F, S, B, G, G, G, B, B, B, B, B, B, G, G, B, S, F, _, _, _],
    [_, _, _, F, S, B, B, B, B, B, B, B, B, B, B, B, B, B, B, S, F, _, _, _],
    [_, _, _, F, S, B, B, B, B, B, B, B, B, B, B, B, B, B, B, S, F, _, _, _],
    [_, _, _, F, S, B, B, B, B, B, B, B, B, B, B, B, B, B, B, S, F, _, _, _],
    [_, _, _, F, S, B, B, B, B, B, B, B, B, B, B, B, B, B, B, S, F, _, _, _],
    [_, _, _, F, S, B, B, B, B, B, B, B, B, B, B, B, B, B, B, S, F, _, _, _],
    [_, _, _, F, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, F, _, _, _],
    [_, _, _, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, D, D, D, D, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, D, D, D, D, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, D, D, D, D, D, D, _, _, _, _, _, _, _, _],
  ]
})()

/** Bean bag chair: 16x16 */
export const BEANBAG_SPRITE: SpriteData = (() => {
  const P = '#9955AA'   // Purple
  const L = '#AA77BB'   // Light
  const D = '#773388'   // Dark
  return [
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, P, P, P, P, P, P, _, _, _, _, _],
    [_, _, _, _, P, L, L, L, L, L, L, P, _, _, _, _],
    [_, _, _, P, L, L, L, L, L, L, L, L, P, _, _, _],
    [_, _, _, P, L, L, L, L, L, L, L, L, P, _, _, _],
    [_, _, P, L, L, L, L, L, L, L, L, L, L, P, _, _],
    [_, _, P, L, L, L, L, L, L, L, L, L, L, P, _, _],
    [_, P, P, P, L, L, L, L, L, L, L, L, P, P, _, _],
    [_, P, D, D, P, P, P, P, P, P, P, P, D, P, _, _],
    [_, P, D, D, D, D, D, D, D, D, D, D, D, P, _, _],
    [_, P, D, D, D, D, D, D, D, D, D, D, D, P, _, _],
    [_, _, P, D, D, D, D, D, D, D, D, D, P, _, _, _],
    [_, _, _, P, P, P, P, P, P, P, P, P, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  ]
})()

// ── Coffee Area Furniture ───────────────────────────────────────

/** Coffee machine: 16x20 */
export const COFFEE_MACHINE_SPRITE: SpriteData = (() => {
  const G = '#444444'   // Gray body
  const D = '#333333'   // Dark
  const B = '#222222'   // Black
  const R = '#CC4444'   // Red light
  const C = '#8B4513'   // Coffee brown
  const S = '#666666'   // Silver
  return [
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, B, B, B, B, B, B, B, B, _, _, _, _],
    [_, _, _, B, G, G, G, G, G, G, G, G, B, _, _, _],
    [_, _, _, B, G, S, S, S, S, S, S, G, B, _, _, _],
    [_, _, _, B, G, S, S, S, S, S, S, G, B, _, _, _],
    [_, _, _, B, G, G, G, G, G, G, G, G, B, _, _, _],
    [_, _, _, B, G, G, G, G, G, G, G, G, B, _, _, _],
    [_, _, _, B, G, R, G, G, G, G, G, G, B, _, _, _],
    [_, _, _, B, G, G, G, G, G, G, G, G, B, _, _, _],
    [_, _, _, B, G, G, G, G, G, G, G, G, B, _, _, _],
    [_, _, _, B, D, D, D, D, D, D, D, D, B, _, _, _],
    [_, _, _, B, _, _, _, _, _, _, _, _, B, _, _, _],
    [_, _, _, B, _, _, _, _, _, _, _, _, B, _, _, _],
    [_, _, _, B, _, _, _, C, C, C, _, _, B, _, _, _],
    [_, _, _, B, B, B, B, B, B, B, B, B, B, _, _, _],
    [_, _, _, _, D, D, D, D, D, D, D, D, _, _, _, _],
    [_, _, _, _, D, D, D, D, D, D, D, D, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  ]
})()

/** Dining table: 32x20 (2x1.25 tiles) */
export const DINING_TABLE_SPRITE: SpriteData = (() => {
  const W = '#8B6914'   // Wood
  const D = '#6B4E0A'   // Dark
  const L = '#A07828'   // Light
  return [
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, _, _],
    [_, _, W, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, W, _, _],
    [_, _, W, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, W, _, _],
    [_, _, W, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, W, _, _],
    [_, _, W, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, W, _, _],
    [_, _, W, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, W, _, _],
    [_, _, W, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, W, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  ]
})()

/** Fridge: 16x32 */
export const FRIDGE_SPRITE: SpriteData = (() => {
  const S = '#CCDDEE'   // Silver
  const D = '#AABBCC'   // Dark silver
  const H = '#888888'   // Handle
  const B = '#666666'   // Border
  return [
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, B, B, B, B, B, B, B, B, B, B, B, B, B, B, _],
    [_, B, S, S, S, S, S, S, S, S, S, S, S, S, B, _],
    [_, B, S, S, S, S, S, S, S, S, S, S, S, S, B, _],
    [_, B, S, S, S, S, S, S, S, S, S, S, S, S, B, _],
    [_, B, S, S, S, S, S, S, H, S, S, S, S, S, B, _],
    [_, B, S, S, S, S, S, S, H, S, S, S, S, S, B, _],
    [_, B, D, D, D, D, D, D, D, D, D, D, D, D, B, _],
    [_, B, S, S, S, S, S, S, S, S, S, S, S, S, B, _],
    [_, B, S, S, S, S, S, S, S, S, S, S, S, S, B, _],
    [_, B, S, S, S, S, S, S, S, S, S, S, S, S, B, _],
    [_, B, S, S, S, S, S, S, S, S, S, S, S, S, B, _],
    [_, B, S, S, S, S, S, S, S, S, S, S, S, S, B, _],
    [_, B, S, S, S, S, S, S, S, S, S, S, S, S, B, _],
    [_, B, S, S, S, S, S, S, S, S, S, S, S, S, B, _],
    [_, B, S, S, S, S, S, S, S, S, S, S, S, S, B, _],
    [_, B, S, S, S, S, S, S, S, S, S, S, S, S, B, _],
    [_, B, S, S, S, S, S, S, H, S, S, S, S, S, B, _],
    [_, B, S, S, S, S, S, S, H, S, S, S, S, S, B, _],
    [_, B, D, D, D, D, D, D, D, D, D, D, D, D, B, _],
    [_, B, S, S, S, S, S, S, S, S, S, S, S, S, B, _],
    [_, B, S, S, S, S, S, S, S, S, S, S, S, S, B, _],
    [_, B, S, S, S, S, S, S, S, S, S, S, S, S, B, _],
    [_, B, S, S, S, S, S, S, S, S, S, S, S, S, B, _],
    [_, B, B, B, B, B, B, B, B, B, B, B, B, B, B, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  ]
})()

/** Microwave: 16x16 */
export const MICROWAVE_SPRITE: SpriteData = (() => {
  const G = '#444444'   // Gray
  const D = '#333333'   // Dark
  const B = '#222222'   // Black
  const S = '#5588AA'   // Screen
  const L = '#44AA44'   // Green light
  return [
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, B, B, B, B, B, B, B, B, B, B, B, B, _, _],
    [_, _, B, G, G, G, G, G, G, G, G, G, G, B, _, _],
    [_, _, B, G, D, D, D, D, D, D, D, D, G, B, _, _],
    [_, _, B, G, D, S, S, S, S, S, S, D, G, B, _, _],
    [_, _, B, G, D, S, S, S, S, S, S, D, G, B, _, _],
    [_, _, B, G, D, S, S, S, S, S, S, D, G, B, _, _],
    [_, _, B, G, D, S, S, S, S, S, S, D, G, B, _, _],
    [_, _, B, G, D, D, D, D, D, D, D, D, G, B, _, _],
    [_, _, B, G, G, G, G, L, G, G, G, G, G, B, _, _],
    [_, _, B, B, B, B, B, B, B, B, B, B, B, B, _, _],
    [_, _, _, D, D, D, D, D, D, D, D, D, D, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  ]
})()

// ── Gym Furniture ───────────────────────────────────────────────

/** Treadmill: 24x16 */
export const TREADMILL_SPRITE: SpriteData = (() => {
  const G = '#444444'   // Gray frame
  const D = '#333333'   // Dark
  const B = '#222222'   // Black belt
  const S = '#666666'   // Silver
  const R = '#CC4444'   // Red button
  return [
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, G, G, G, G, G, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, G, G, S, S, S, G, G, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, G, G, S, R, S, G, G, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, G, G, G, G, G, G, G, _, _, _, _, _, _, _, _, _, _],
    [_, _, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, _, _, _],
    [_, _, G, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, G, _, _, _],
    [_, _, G, D, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, D, G, _, _, _],
    [_, _, G, D, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, D, G, _, _, _],
    [_, _, G, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, G, _, _, _],
    [_, _, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, _, _, _],
    [_, _, _, _, _, _, G, G, G, G, G, G, G, G, G, G, G, G, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  ]
})()

/** Dumbbell rack: 24x16 */
export const DUMBBELL_RACK_SPRITE: SpriteData = (() => {
  const G = '#555555'   // Gray rack
  const D = '#333333'   // Dark
  const W = '#888888'   // Weights
  const B = '#444444'   // Bar
  return [
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, _, _, _],
    [_, _, G, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, G, _, _, _],
    [_, _, G, _, W, W, _, W, W, _, W, W, _, W, W, _, W, W, _, _, G, _, _, _],
    [_, _, G, _, B, B, _, B, B, _, B, B, _, B, B, _, B, B, _, _, G, _, _, _],
    [_, _, G, _, W, W, _, W, W, _, W, W, _, W, W, _, W, W, _, _, G, _, _, _],
    [_, _, G, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, G, _, _, _],
    [_, _, G, _, W, W, _, W, W, _, W, W, _, W, W, _, W, W, _, _, G, _, _, _],
    [_, _, G, _, B, B, _, B, B, _, B, B, _, B, B, _, B, B, _, _, G, _, _, _],
    [_, _, G, _, W, W, _, W, W, _, W, W, _, W, W, _, W, W, _, _, G, _, _, _],
    [_, _, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, _, _, _],
    [_, _, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  ]
})()

/** Yoga mat: 24x8 */
export const YOGA_MAT_SPRITE: SpriteData = (() => {
  const P = '#77AA55'   // Green mat
  const L = '#88BB66'   // Light
  const D = '#669944'   // Dark
  return [
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, _, _, _],
    [_, _, P, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, P, _, _, _],
    [_, _, P, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, P, _, _, _],
    [_, _, P, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, P, _, _, _],
    [_, _, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  ]
})()

/** Whiteboard (for task board): 32x20 */
export const WHITEBOARD_SPRITE: SpriteData = (() => {
  const F = '#8B4513'   // Frame
  const W = '#FFFFFF'   // White
  const B = '#EEEEEE'   // Border
  return [
    [_, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, _],
    [_, F, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, F, _],
    [_, F, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, F, _],
    [_, F, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, F, _],
    [_, F, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, F, _],
    [_, F, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, F, _],
    [_, F, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, F, _],
    [_, F, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, F, _],
    [_, F, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, F, _],
    [_, F, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, F, _],
    [_, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  ]
})()
