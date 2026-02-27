import type { SpriteData } from '../types'

const spriteCanvasCache = new Map<string, HTMLCanvasElement>()

/** Convert SpriteData to a cached canvas at a given zoom level */
export function getCachedSprite(sprite: SpriteData, zoom: number): HTMLCanvasElement {
  const key = `${sprite.length}-${sprite[0]?.length || 0}-${zoom}-${hashSprite(sprite)}`
  const cached = spriteCanvasCache.get(key)
  if (cached) return cached

  const height = sprite.length
  const width = sprite[0]?.length || 0
  const canvas = document.createElement('canvas')
  canvas.width = width * zoom
  canvas.height = height * zoom
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = false

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const color = sprite[y][x]
      if (color && color !== '') {
        ctx.fillStyle = color
        ctx.fillRect(x * zoom, y * zoom, zoom, zoom)
      }
    }
  }

  spriteCanvasCache.set(key, canvas)
  return canvas
}

/** Get outline sprite (white version for selection highlight) */
export function getOutlineSprite(sprite: SpriteData): SpriteData {
  return sprite.map((row) =>
    row.map((cell) => {
      if (cell && cell !== '') return '#FFFFFF'
      return ''
    }),
  )
}

function hashSprite(sprite: SpriteData): string {
  // Simple hash based on first and last rows and some samples
  const h = sprite.length
  const w = sprite[0]?.length || 0
  const samples: string[] = []
  if (h > 0) samples.push(sprite[0].join(','))
  if (h > 1) samples.push(sprite[h - 1].join(','))
  if (h > 2 && w > 2) samples.push(sprite[Math.floor(h / 2)][Math.floor(w / 2)])
  return samples.join('|').slice(0, 100)
}

export function clearCache(): void {
  spriteCanvasCache.clear()
}
