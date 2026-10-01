/**
 * Performans endeksini kaynakli olcumlerle karsilastirir: npm run calibration
 *
 * Hedefler targets-gpu.json ve targets-cpu.json dosyalarinda (kaynaklar icinde yazili).
 * Model (src/data/*Model.js) ya da veri degistiginde calistirin; sapma buyurse
 * katsayilari npm run calibration:fit ile yeniden oturtun (bkz. README.md).
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'vite'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..', '..')
const read = f => JSON.parse(readFileSync(join(here, f), 'utf8'))

// Uygulamanin kendi modulleri (JSON importlari, uzantisiz yollar) Vite uzerinden yuklenir.
const server = await createServer({ root, server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'silent' })
const { gpuList } = await server.ssrLoadModule('/src/data/gpuData.js')
const { cpuList } = await server.ssrLoadModule('/src/data/cpuData.js')
await server.close()

const logs = xs => xs.map(Math.log)
const mean = xs => xs.reduce((a, b) => a + b, 0) / xs.length
const pct = x => `%${(100 * (Math.exp(x) - 1)).toFixed(1)}`
const signed = r => `${r >= 1 ? '+' : ''}${Math.round(100 * (r - 1))}%`

/** rows: [{ name, model, target }] -> ozet ve en buyuk sapmalar. */
function report(title, rows, { free = false, worst = 8 } = {}) {
  // free: olcek serbest (hedef baska birimde); oranlarin geometrik ortalamasina bolunur.
  const scale = free ? Math.exp(mean(logs(rows.map(r => r.model / r.target)))) : 1
  const ratios = rows.map(r => ({ ...r, ratio: r.model / (r.target * scale) }))
  // Özet oturtmaya girenler üzerinden; "fit": false hedefler listede görünür ama ortalamaya girmez.
  const abs = logs(ratios.filter(r => r.fit !== false).map(r => r.ratio)).map(Math.abs).sort((a, b) => a - b)
  const out = rows.length - abs.length
  console.log(`\n${title}: n=${abs.length}${out ? ` (+${out} fit dışı)` : ''}  ortalama sapma ${pct(mean(abs))}  medyan ${pct(abs[abs.length >> 1])}  >%15: ${abs.filter(x => x > Math.log(1.15)).length}`)
  for (const r of ratios.sort((a, b) => Math.abs(Math.log(b.ratio)) - Math.abs(Math.log(a.ratio))).slice(0, worst)) {
    console.log(`  ${r.name.padEnd(36)} ${signed(r.ratio).padStart(5)}  (model ${r.model}, hedef ${(r.target * scale).toFixed(1)})${r.fit === false ? '  fit dışı' : ''}`)
  }
}

const gpuTargets = read('targets-gpu.json').targets
const gpuBy = new Map(gpuList.map(g => [g.name, g]))
const gpuRows = Object.entries(gpuTargets)
  .filter(([name]) => gpuBy.get(name)?.perfIndex != null)
  .map(([name, t]) => ({ name, model: gpuBy.get(name).perfIndex, target: t.value, source: t.source, fit: t.fit }))
report('GPU endeksi', gpuRows)
const noTarget = gpuList.filter(g => g.perfIndex != null && !gpuTargets[g.name]).map(g => g.name)
console.log(`  hedefi olmayan endeksli GPU (${noTarget.length}): ${noTarget.join(', ')}`)

const cpuTargets = read('targets-cpu.json')
const cpuBy = new Map(cpuList.map(c => [c.name, c]))
const r23 = Object.entries(cpuTargets.r23).filter(([name]) => cpuBy.get(name)?.perfIndex != null)
report('CPU tek cekirdek (Cinebench R23)', r23.map(([name, [s]]) => ({ name, model: cpuBy.get(name).singleIndex, target: s })), { free: true })
report('CPU cok cekirdek (Cinebench R23)', r23.map(([name, [, m]]) => ({ name, model: cpuBy.get(name).multiIndex, target: m })), { free: true })
const gameRows = set =>
  Object.entries(set)
    .filter(([name]) => cpuBy.get(name)?.perfIndex != null)
    .map(([name, t]) => ({ name, model: cpuBy.get(name).gamingIndex, target: t }))
report('CPU oyun (720p)', gameRows(cpuTargets.games720))
// Oturtmaya girmeyen doğrulama seti: farklı inceleme, oyunlar ve ekran kartı (RTX 3080).
report('CPU oyun dogrulama (Ryzen 5 5600 incelemesi, 720p, RTX 3080; oturtma disi)', gameRows(cpuTargets.games720_5600))
