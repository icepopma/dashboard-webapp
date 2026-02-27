import type { SpriteData, FloorColor } from './types'

/** Convert HSB to RGB hex */
function hsbToHex(h: number, s: number, b: number): string {
  s /= 100
  b /= 100
  const k = (n: number) => (n + h / 60) % 6
  const f = (n: number) => b * (1 - s * Math.max(0, Math.min(k(n), 4 - k(n), 1)))
  const r = Math.round(255 * f(5))
  const g = Math.round(255 * f(3))
  const bl = Math.round(255 * f(1))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`
}

/** Parse hex color to RGB */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  if (!match) return null
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16),
  }
}

/** Convert RGB to HSB */
function rgbToHsb(r: number, g: number, b: number): { h: number; s: number; b: number } {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  let h = 0
  const s = max === 0 ? 0 : d / max
  const v = max

  if (d !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60
        break
      case g:
        h = ((b - r) / d + 2) * 60
        break
      case b:
        h = ((r - g) / d + 4) * 60
        break
    }
  }

  return { h, s: s * 100, b: v * 100 }
}

/** Apply contrast adjustment to RGB */
function adjustContrast(r: number, g: number, b: number, contrast: number): { r: number; g: number; b: number } {
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast))
  return {
    r: Math.max(0, Math.min(255, Math.round(factor * (r - 128) + 128))),
    g: Math.max(0, Math.min(255, Math.round(factor * (g - 128) + 128))),
    b: Math.max(0, Math.min(255, Math.round(factor * (b - 128) + 128))),
  }
}

/** Apply brightness adjustment to RGB */
function adjustBrightness(r: number, g: number, b: number, brightness: number): { r: number; g: number; b: number } {
  return {
    r: Math.max(0, Math.min(255, r + brightness * 2.55)),
    g: Math.max(0, Math.min(255, g + brightness * 2.55)),
    b: Math.max(0, Math.min(255, b + brightness * 2.55)),
  }
}

/** Apply color adjustments to a sprite */
export function adjustSprite(sprite: SpriteData, color: FloorColor): SpriteData {
  return sprite.map((row) =>
    row.map((cell) => {
      if (!cell || cell === '') return ''
      const rgb = hexToRgb(cell)
      if (!rgb) return cell

      // Apply contrast first
      let { r, g, b } = adjustContrast(rgb.r, rgb.g, rgb.b, color.c)

      // Apply brightness
      const bright = adjustBrightness(r, g, b, color.b)
      r = bright.r
      g = bright.g
      b = bright.b

      // Apply hue shift if specified
      if (color.h !== 0 || color.s !== 0) {
        const hsb = rgbToHsb(r, g, b)
        hsb.h = (hsb.h + color.h + 360) % 360
        hsb.s = Math.max(0, Math.min(100, hsb.s + color.s))
        const hex = hsbToHex(hsb.h, hsb.s, hsb.b)
        return hex
      }

      return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`
    }),
  )
}
