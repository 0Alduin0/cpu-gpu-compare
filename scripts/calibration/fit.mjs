/**
 * Model katsayılarını hedeflere yeniden oturtur ve önerilen değerleri yazar:
 *
 *   npm run calibration:fit                       # hepsi (her bölüm kendi varsayılan sabitleriyle)
 *   npm run calibration:fit -- gpu                # GPU mimari katsayıları (k)
 *   npm run calibration:fit -- gpu A B FIXED_TIME # + verilen global GPU sabitleri
 *   npm run calibration:fit -- ipc                # CPU mikromimari IPC değerleri
 *   npm run calibration:fit -- multi              # çok çekirdek sabitleri
 *   npm run calibration:fit -- multi MOBILE_POWER # yalnızca verilen sabit(ler)
 *   npm run calibration:fit -- gaming             # oyun sabitleri
 *
 * Dosyaları değiştirmez: önerilen değerleri src/data/gpuModel.js / cpuModel.js'e
 * (yuvarlayarak) yazıp npm run calibration ile doğrulayın. Hedefi "fit": false
 * olanlar sapma özetine girer, oturtmaya girmez.
 *
 * Yöntem: log uzayında en küçük kareler.
 *  - IPC kapalı biçimde (oranların geometrik ortalaması); GPU k'ları yinelemeli (sabit kare payı yüzünden).
 *  - Global sabitler Nelder-Mead ile. GPU'da her adımda k'lar yeniden çözülür;
 *    CPU çok çekirdekte ölçek serbesttir (R23 puanı endeksle aynı birimde değil).
 * Endeks, uygulamanın kendi fonksiyonlarıyla hesaplanır (computeIndex, computeRaw);
 * ikisi de katsayıları çağrı anında okuduğu için burada değiştirilen sabitler geçerli olur.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'vite'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..', '..')
const read = f => JSON.parse(readFileSync(join(here, f), 'utf8'))

const server = await createServer({ root, server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'silent' })
const gpu = await server.ssrLoadModule('/src/data/gpuData.js')
const cpu = await server.ssrLoadModule('/src/data/cpuData.js')
await server.close()

const mean = xs => xs.reduce((a, b) => a + b, 0) / xs.length
const pct = x => `%${(100 * (Math.exp(x) - 1)).toFixed(1)}`
const fmt = v => String(Number(v.toPrecision(4)))

/** Sapma özeti: ortalama ve medyan mutlak log sapma. */
function summary(rows) {
  const abs = rows.map(x => Math.abs(x.r)).sort((a, b) => a - b)
  return `ortalama ${pct(mean(abs))}, medyan ${pct(abs[abs.length >> 1])} (n=${rows.length})`
}

/** Nelder-Mead simpleks araması; f: vektör -> kayıp. */
function nelderMead(f, x0, { iters = 600, tol = 1e-10 } = {}) {
  const n = x0.length
  const at = x => ({ x, f: f(x) })
  let pts = [at(x0), ...x0.map((_, i) => at(x0.map((v, j) => (i === j ? v * 1.1 || 0.05 : v))))]
  for (let k = 0; k < iters; k++) {
    pts.sort((a, b) => a.f - b.f)
    if (pts[n].f - pts[0].f < tol) break
    const c = x0.map((_, j) => mean(pts.slice(0, n).map(p => p.x[j])))
    const along = t => at(c.map((v, j) => v + t * (pts[n].x[j] - v)))
    const r = along(-1)
    if (r.f < pts[0].f) {
      const e = along(-2)
      pts[n] = e.f < r.f ? e : r
    } else if (r.f < pts[n - 1].f) {
      pts[n] = r
    } else {
      const ct = along(r.f < pts[n].f ? -0.5 : 0.5)
      if (ct.f < Math.min(r.f, pts[n].f)) pts[n] = ct
      else pts = pts.map((p, i) => (i === 0 ? p : at(p.x.map((v, j) => pts[0].x[j] + 0.5 * (v - pts[0].x[j])))))
    }
  }
  return pts.sort((a, b) => a.f - b.f)[0]
}

/** Arama sınırları; dışına taşan değer sınıra çekilir. */
const BOUNDS = {
  A: [0.2, 1], B: [0, 0.8], FIXED_TIME: [0, 0.05],
  SMT_GAIN: [0, 0.6], DESKTOP_POWER: [1, 2.5], MOBILE_POWER: [0.5, 4], BOOST_CORE_POWER: [2, 60], COMPACT_CLOCK: [0.6, 1.2],
  MEM_TIME: [0, 1], WORKING_SET: [4, 200], MISS_SLOPE: [0.3, 6], GAME_THREADS: [1, 16], PLAIN_CCD_SHARE: [0, 1],
}

/** model[keys] sabitlerini residuals()'ın karesel ortalamasını en küçükleyecek şekilde arar. */
function fitParams(title, model, keys, residuals) {
  const x0 = keys.map(k => model[k])
  const apply = x =>
    keys.forEach((k, i) => {
      const [lo, hi] = BOUNDS[k] ?? [-Infinity, Infinity]
      model[k] = Math.min(hi, Math.max(lo, x[i]))
    })
  const loss = x => {
    apply(x)
    return mean(residuals().filter(r => r.fit !== false).map(r => r.r ** 2))
  }
  const before = summary(residuals())
  apply(nelderMead(loss, x0).x)
  const after = summary(residuals())
  console.log(`\n${title}\n  önce:  ${before}\n  sonra: ${after}`)
  keys.forEach((k, i) => console.log(`  ${k.padEnd(20)} ${fmt(x0[i]).padStart(8)} -> ${fmt(model[k])}`))
  return () => apply(x0)
}

// ── GPU ─────────────────────────────────────────────────────────────────────
const gpuTargets = Object.entries(read('targets-gpu.json').targets)
const gpuByName = new Map(gpu.gpuList.map(g => [g.name, g]))

function gpuResiduals() {
  const ref = gpu.computeIndex(gpu.referenceGpu).index
  return gpuTargets.flatMap(([name, t]) => {
    const g = gpuByName.get(name)
    const out = g && gpu.computeIndex(g)
    return out?.index
      ? [{ name, family: g.archFamily, fit: t.fit !== false, share: out.breakdown.gpuShare, r: Math.log(((out.index / ref) * 100) / t.value) }]
      : []
  })
}

/**
 * Her ailenin k'sı kendi üyelerinin ortalama log sapmasını sıfırlar; referansın ailesi (Ada = 1)
 * birimi taşır. Sabit kare payı yüzünden endeks k ile orantılı değil (esneklik = karenin ekran
 * kartına bağlı payı); adım bu payla ölçeklenip birkaç kez yinelenir.
 */
function solveK() {
  const refFamily = gpu.referenceGpu.archFamily
  for (let it = 0; it < 25; it++) {
    const rows = gpuResiduals().filter(x => x.fit)
    for (const [family, arch] of Object.entries(gpu.GPU_ARCH)) {
      const mine = rows.filter(x => x.family === family)
      if (family === refFamily || !mine.length) continue
      const step = -mean(mine.map(x => x.r)) / mean(mine.map(x => x.share))
      arch.k *= Math.exp(Math.max(-1, Math.min(1, step)))
    }
  }
}

function fitGpu(keys) {
  const k0 = Object.fromEntries(Object.entries(gpu.GPU_ARCH).map(([f, a]) => [f, a.k]))
  const counts = {}
  for (const x of gpuResiduals().filter(x => x.fit)) counts[x.family] = (counts[x.family] ?? 0) + 1
  let restore = () => {}
  if (keys.length) {
    restore = fitParams(`GPU global sabitleri (${keys.join(', ')}), k'lar her adımda yeniden çözülür`, gpu.GPU_MODEL, keys, () => {
      solveK()
      return gpuResiduals()
    })
  } else {
    const before = summary(gpuResiduals())
    solveK()
    console.log(`\nGPU mimari katsayıları (k)\n  önce:  ${before}\n  sonra: ${summary(gpuResiduals())}`)
  }
  for (const [family, arch] of Object.entries(gpu.GPU_ARCH)) {
    const note = counts[family] ? `n=${counts[family]}` : 'hedef yok, değişmedi'
    console.log(`  ${family.padEnd(20)} ${fmt(k0[family]).padStart(8)} -> ${fmt(arch.k).padEnd(8)} ${note}`)
  }
  restore()
  for (const [family, arch] of Object.entries(gpu.GPU_ARCH)) arch.k = k0[family]
}

// ── CPU ─────────────────────────────────────────────────────────────────────
const cpuTargets = read('targets-cpu.json')
const cpuByName = new Map(cpu.cpuList.map(c => [c.name, c]))
const withRaw = entries =>
  entries.flatMap(([name, t]) => {
    const c = cpuByName.get(name)
    const raw = c && cpu.computeRaw(c)
    return raw ? [{ name, c, raw, t }] : []
  })

function fitIpc() {
  // Tek çekirdek = IPC × boost: IPC ∝ geo-ort(R23 tek / boost GHz), Zen 3 = 1.
  const byUarch = new Map()
  for (const { c, t } of withRaw(Object.entries(cpuTargets.r23))) {
    const list = byUarch.get(c.uarch.name) ?? []
    list.push(Math.log(t[0] / c.boostClock))
    byUarch.set(c.uarch.name, list)
  }
  const zen3 = mean(byUarch.get('Zen 3'))
  console.log('\nCPU IPC (Cinebench R23 tek çekirdek / boost, Zen 3 = 1)')
  for (const [, name, ipc] of new Map(cpu.CPU_UARCH.map(u => [u[1], u])).values()) {
    const list = byUarch.get(name)
    const next = list ? fmt(Math.exp(mean(list) - zen3)) : '—'
    console.log(`  ${name.padEnd(20)} ${fmt(ipc).padStart(8)} -> ${next.padEnd(8)} ${list ? `n=${list.length}` : 'hedef yok'}`)
  }
}

const multiResiduals = () => {
  // Ölçek serbest: ortalama log oran çıkarılır.
  const rows = withRaw(Object.entries(cpuTargets.r23)).map(({ name, raw, t }) => ({ name, r: Math.log(raw.multi / t[1]) }))
  const s = mean(rows.map(x => x.r))
  return rows.map(x => ({ ...x, r: x.r - s }))
}

const gamingResiduals = () => {
  const ref = cpu.computeRaw(cpu.referenceCpu).gaming
  return withRaw(Object.entries(cpuTargets.games720)).map(({ name, raw, t }) => ({ name, r: Math.log(((raw.gaming / ref) * 100) / t) }))
}

// DESKTOP_POWER AMD'nin spesifikasyonu (PPT = 1,35 × TDP); oturtulmaz, istenirse adıyla verilir.
const MULTI_KEYS = ['SMT_GAIN', 'MOBILE_POWER', 'BOOST_CORE_POWER']
const GAMING_KEYS = ['MEM_TIME', 'WORKING_SET', 'MISS_SLOPE', 'GAME_THREADS']

function worst(rows, n = 6) {
  for (const x of [...rows].sort((a, b) => Math.abs(b.r) - Math.abs(a.r)).slice(0, n)) {
    console.log(`    ${x.name.padEnd(34)} ${x.r >= 0 ? '+' : ''}${Math.round(100 * (Math.exp(x.r) - 1))}%`)
  }
}

// ── Çalıştır ────────────────────────────────────────────────────────────────
const [section, ...keys] = process.argv.slice(2)
const sections = {
  gpu: () => fitGpu(keys),
  ipc: fitIpc,
  multi: () => {
    const restore = fitParams('CPU çok çekirdek (Cinebench R23, ölçek serbest)', cpu.CPU_MODEL, keys.length ? keys : MULTI_KEYS, multiResiduals)
    console.log('  en büyük sapmalar (önerilen sabitlerle):')
    worst(multiResiduals())
    restore()
  },
  gaming: () => {
    const restore = fitParams('CPU oyun (720p, Ryzen 5 5600 = 100)', cpu.CPU_MODEL, keys.length ? keys : GAMING_KEYS, gamingResiduals)
    restore()
  },
}
if (section && !sections[section]) {
  console.error(`Bilinmeyen bölüm: ${section}. Seçenekler: ${Object.keys(sections).join(', ')}`)
  process.exit(1)
}
// Bölümler birbirinden bağımsız: her biri modelin dosyadaki haliyle başlar.
if (section) sections[section]()
else for (const run of Object.values(sections)) run()
