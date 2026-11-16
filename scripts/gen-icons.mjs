/**
 * Генератор PWA-иконок «ТопТақта» на чистом Node (без canvas/резких зависимостей).
 * Рисует: скруглённый терракотовый квадрат + кремовый ромб-орнамент (ою-өрнек).
 * Антиалиасинг — суперсэмплингом, вывод — валидный PNG (zlib из stdlib).
 */
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'public', 'icons')

const CREAM = [247, 242, 232]
const TERRA = [191, 78, 36]

/* ── PNG-обвязка ─────────────────────────────────────────────── */

const crcTable = []
for (let n = 0; n < 256; n++) {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  crcTable[n] = c >>> 0
}

function crc32(buf) {
  let c = 0xffffffff
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const t = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])))
  return Buffer.concat([len, t, data, crc])
}

function encodePNG(width, height, rgba) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // RGBA
  const raw = Buffer.alloc((width * 4 + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0 // filter: none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4)
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

/* ── Геометрия ───────────────────────────────────────────────── */

/** скруглённый квадрат (корректная проверка через центральную зону) */
function insideRounded(x, y, size, r) {
  if (x < 0 || y < 0 || x >= size || y >= size) return false
  const min = r
  const max = size - r
  if (x >= min && x <= max) return true // вертикальная центральная зона
  if (y >= min && y <= max) return true // горизонтальная центральная зона
  const dx = x < min ? x - min : x - max
  const dy = y < min ? y - min : y - max
  return dx * dx + dy * dy <= r * r
}

function insideDiamond(x, y, cx, cy, r) {
  const dx = Math.abs(x - cx)
  const dy = Math.abs(y - cy)
  return dx + dy <= r
}

function insideCircle(x, y, cx, cy, r) {
  const dx = x - cx
  const dy = y - cy
  return dx * dx + dy * dy <= r * r
}

/** Ромб с контуром толщиной sw */
function inOutlineDiamond(x, y, cx, cy, r, sw) {
  return insideDiamond(x, y, cx, cy, r + sw / 2) && !insideDiamond(x, y, cx, cy, r - sw / 2)
}

/* ── Рендер одной иконки ─────────────────────────────────────── */

const SS = 3 // суперсэмплинг

function render(size, { maskable = false } = {}) {
  const hi = size * SS
  const img = Buffer.alloc(hi * hi * 4)

  // дизайн задан в координатах 64×64
  const s = hi / 64
  const radius = maskable ? 0 : 15 * s
  const sw = 3 * s

  // безопасная зона для maskable — рисуем компактнее
  const cx1 = maskable ? 32 * s : 21 * s
  const cx2 = maskable ? 34 * s : 41 * s
  const r1 = (maskable ? 9 : 12) * s
  const r2 = (maskable ? 6.5 : 8) * s
  const dotA = maskable ? 46 * s : 54 * s
  const dotB = maskable ? 18 * s : 5 * s
  const dotR = 3 * s
  const midY = 32 * s

  for (let y = 0; y < hi; y++) {
    for (let x = 0; x < hi; x++) {
      const px = x + 0.5
      const py = y + 0.5
      const bg = insideRounded(px, py, hi, radius)
      if (!bg) continue // прозрачный угол
      const orn =
        inOutlineDiamond(px, py, cx1, midY, r1, sw) ||
        inOutlineDiamond(px, py, cx2, midY, r2, sw) ||
        insideCircle(px, py, dotA, midY, dotR) ||
        insideCircle(px, py, dotB, midY, dotR)
      const col = orn ? CREAM : TERRA
      const i = (y * hi + x) * 4
      img[i] = col[0]
      img[i + 1] = col[1]
      img[i + 2] = col[2]
      img[i + 3] = 255
    }
  }

  // усреднение SS×SS → target
  const out = Buffer.alloc(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0
      let g = 0
      let b = 0
      let a = 0
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const i = ((y * SS + sy) * hi + (x * SS + sx)) * 4
          const al = img[i + 3] / 255
          r += img[i] * al
          g += img[i + 1] * al
          b += img[i + 2] * al
          a += al
        }
      }
      const n = SS * SS
      const o = (y * size + x) * 4
      if (a > 0) {
        out[o] = Math.round(r / a)
        out[o + 1] = Math.round(g / a)
        out[o + 2] = Math.round(b / a)
      }
      out[o + 3] = Math.round((a / n) * 255)
    }
  }
  return encodePNG(size, size, out)
}

mkdirSync(OUT, { recursive: true })
writeFileSync(join(OUT, 'icon-192.png'), render(192))
writeFileSync(join(OUT, 'icon-512.png'), render(512))
writeFileSync(join(OUT, 'icon-maskable-512.png'), render(512, { maskable: true }))
console.log('icons written to', OUT)
