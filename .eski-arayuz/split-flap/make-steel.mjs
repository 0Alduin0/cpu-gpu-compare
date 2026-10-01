/**
 * Fırçalanmış çelik dokusu üretir: public/steel.png
 *
 * Gri tonlamalı, %50 gri etrafında değişen, her iki yönde dikişsiz döşenen bir
 * doku. CSS'te `background-blend-mode: overlay` ile taban renginin üstüne
 * bindirilir; böylece tek dosya hem sayfa zemininde hem pano çerçevesinde
 * farklı çelik tonlarıyla kullanılır.
 *
 * Deterministik: aynı SEED her zaman aynı dosyayı üretir.
 * Çalıştır: node scripts/make-steel.mjs
 * Yeniden üretince dosyaya gömülü kaynak notu (PNG tEXt) silinir; impeccable
 * kullanılıyorsa `impeccable embed-prompt public/steel.png --prompt-file ...`
 * ile tekrar göm.
 */
import { writeFileSync } from 'node:fs'
import { deflateSync, crc32 } from 'node:zlib'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const W = 256
const H = 256
const SEED = 1966

let state = SEED
const rand = () => {
  // mulberry32
  state |= 0
  state = (state + 0x6d2b79f5) | 0
  let t = Math.imul(state ^ (state >>> 15), 1 | state)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

/** Dairesel kutu bulanıklığı: kenarlar birbirine bağlanır, döşeme dikişsiz kalır. */
function circularBlur(arr, radius) {
  const n = arr.length
  const out = new Float64Array(n)
  for (let i = 0; i < n; i++) {
    let s = 0
    for (let k = -radius; k <= radius; k++) s += arr[(i + k + n) % n]
    out[i] = s / (2 * radius + 1)
  }
  return out
}

// 1) Satır tonu: fırça izleri 1-3 px kalınlığında yatay şeritler.
const rowRaw = Float64Array.from({ length: H }, () => rand() * 2 - 1)
const rowFine = circularBlur(rowRaw, 1)
const rowWide = circularBlur(Float64Array.from({ length: H }, () => rand() * 2 - 1), 6)

// 2) Satır boyunca lif: ince tanecik yatayda uzun bulanıklıkla çekilir.
const img = new Float64Array(W * H)
for (let y = 0; y < H; y++) {
  const grain = circularBlur(Float64Array.from({ length: W }, () => rand() * 2 - 1), 14)
  const phase = rand() * Math.PI * 2
  for (let x = 0; x < W; x++) {
    const sweep = Math.sin((2 * Math.PI * x) / W + phase) * 0.35
    img[y * W + x] = rowFine[y] * 0.55 + rowWide[y] * 0.9 + grain[x] * 2.2 + sweep * rowFine[y]
  }
}

// 3) %50 gri etrafına ölçekle (overlay'de 128 = değişim yok).
let max = 0
for (const v of img) max = Math.max(max, Math.abs(v))
const AMPLITUDE = 26
const pixels = Buffer.alloc((W + 1) * H)
for (let y = 0; y < H; y++) {
  pixels[y * (W + 1)] = 0 // filtre: yok
  for (let x = 0; x < W; x++) {
    const v = 128 + (img[y * W + x] / max) * AMPLITUDE
    pixels[y * (W + 1) + 1 + x] = Math.max(0, Math.min(255, Math.round(v)))
  }
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body) >>> 0)
  return Buffer.concat([len, body, crc])
}

const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(W, 0)
ihdr.writeUInt32BE(H, 4)
ihdr[8] = 8 // bit derinliği
ihdr[9] = 0 // renk tipi: gri
ihdr[10] = 0
ihdr[11] = 0
ihdr[12] = 0

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(pixels, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
])

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'public', 'steel.png')
writeFileSync(out, png)
console.log(`steel.png yazıldı: ${W}x${H}, ${(png.length / 1024).toFixed(1)} KB`)
