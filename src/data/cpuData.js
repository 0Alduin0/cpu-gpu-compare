import cpuDatabase from '../../data/cpu_database.json'
import { parseCacheMb, parseClockGhz, parseInt10, parseRounded, parseYear, parseNum } from './parse'
import { rankParts } from './rank'

import {
  CPU_MODEL,
  CPU_UARCH,
  REFERENCE_CPU_NAME,
  ECORE,
  CORE_SPLIT,
  CORE_SPLIT_BY_NAME,
  CCX_L3,
  CCX_L3_BY_CODENAME,
  VCACHE_L3,
  VCACHE_CLOCK,
} from './cpuModel'

export { CPU_MODEL, CPU_UARCH, REFERENCE_CPU_NAME }

function getBrand(name) {
  const n = (name || '').toLowerCase()
  if (/ryzen|athlon|threadripper|epyc|^fx/.test(n)) return 'AMD'
  if (/core|intel|pentium|celeron|xeon|processor n/.test(n)) return 'Intel'
  return null
}

const MARKET_TR = { Desktop: 'Masaüstü', Mobile: 'Mobil', 'Server/Workstation': 'Sunucu / İş istasyonu' }

/** HEDT soketleri (Threadripper, X299): veride "Desktop", ama iş istasyonu sınıfı. */
const HEDT_SOCKET = /sTR|TRX|SP3|WRX|2066/

/**
 * Kaynak verideki doğrulanmış hatalar. Kayıt eşlenmeden önce düzeltilir; detay
 * sayfasındaki ham değer de düzeltilmiş halidir ve çekici veriyi yeniden yazsa da kalır.
 */
const DATA_FIXES = {
  // Intel spesifikasyonu: 125 W (10600K ile aynı); kaynak veri 95 W yazıyor.
  'Core i5-10600KF': { TDP: '125 W' },
  // AM5 masaüstü APU'su; kaynak veri "Mobile" yazıyor, masaüstü güç çarpanı uygulanmıyordu.
  'Ryzen 5 8500G': { Market: 'Desktop' },
}

function fixRecord(db) {
  const rec = { ...db, ...DATA_FIXES[db.name] }
  // Alder Lake-N (N100, N200, i3-N305): kaynak veri temel frekans yerine referans saatini
  // (100 MHz) yazıyor; "0,1 GHz" göstermektense boş bırakılır.
  const base = parseClockGhz(rec['Frequency'])
  if (base != null && base < 0.4) delete rec['Frequency']
  return rec
}

function uarchOf(db) {
  const key = `${db['Codename']} ${db['Generation']}`
  for (const [re, name, ipc] of CPU_UARCH) {
    if (re.test(db['Codename'] || '') || re.test(key)) return { name, ipc }
  }
  return null
}

function mapCpu(db) {
  const baseClock = parseClockGhz(db['Frequency'])
  const boostClock = parseClockGhz(db['Turbo Clock'] || db['Boost Clock']) ?? baseClock
  const cores = parseInt10(db['# of Cores'])
  const igpu = db['Integrated Graphics']
  const market = db['Market'] || null
  const hedt = market === 'Desktop' && HEDT_SOCKET.test(db['Socket'] ?? '')
  return {
    id: db.id,
    name: db.name,
    brand: getBrand(db.name),
    series: (db['Generation'] || '').split('\n')[0] || null,
    codename: db['Codename'] || null,
    market,
    segment: hedt ? 'İş istasyonu (HEDT)' : (MARKET_TR[market] ?? market),
    // Xeon, EPYC, Threadripper ve X299 ayrı sıralanır (bkz. rank.js).
    server: market === 'Server/Workstation' || hedt,
    cores,
    threads: parseInt10(db['# of Threads']) ?? cores,
    baseClock,
    boostClock,
    tdp: parseRounded(db['TDP']),
    socket: db['Socket'] || null,
    process: db['Process Size'] || null,
    foundry: db['Foundry'] || null,
    l2Cache: parseCacheMb(db['Cache L2']),
    l3Cache: parseCacheMb(db['Cache L3']),
    memoryType: db['Memory Support'] || null,
    maxMemorySpeed: parseRounded(db['Rated Speed']),
    memoryBandwidth: parseNum(db['Memory Bandwidth']),
    unlocked: db['Multiplier Unlocked'] === 'Yes',
    integratedGraphics: !igpu || igpu === 'N/A' ? null : igpu,
    releaseDate: db['Release Date'] || null,
    releaseYear: parseYear(db['Release Date']),
    uarch: uarchOf(db),
    raw: db,
  }
}

/**
 * Bir CCD/CCX'te kare süresi: çekirdek süresi + bellek bekleme süresi (bkz. CPU_MODEL).
 * Çekirdek süresi iş–yol sınırıyla: ana iş parçacığının süresi ya da oyunun toplam işinin
 * (GAME_THREADS ana iş parçacığı kadar) eşzamanlı şeritlere bölünmüşü, hangisi uzunsa.
 */
function frameTime(ipc, clock, l3, lanes) {
  const { MEM_TIME, WORKING_SET, MISS_SLOPE, GAME_THREADS } = CPU_MODEL
  const thread = 1 / (ipc * clock)
  const queue = Math.max(1, GAME_THREADS / lanes)
  const core = thread * queue
  const miss = 1 / (1 + Math.pow(l3 / WORKING_SET, MISS_SLOPE))
  return { clock, l3, thread, queue, core, miss, memory: MEM_TIME * miss, total: core + MEM_TIME * miss }
}

/**
 * Oyun: oyunun iş parçacıklarının çalıştığı çekirdek kümesinin (CCX/CCD) kare süresi.
 * Çift CCD'li X3D'de işin PLAIN_CCD_SHARE kadarı V-Cache'siz CCD'de kalır.
 */
function gamingTime(c, ua, lanes) {
  const x3d = /X3D/i.test(c.name)
  const ccxL3 = CCX_L3_BY_CODENAME[c.codename] ?? CCX_L3[ua.name] ?? Infinity
  const l3 = c.l3Cache ?? 0
  if (!x3d) return { x3d, ccds: [frameTime(ua.ipc, c.boostClock, Math.min(l3, ccxL3), lanes)], plainShare: 0 }
  const vcache = frameTime(ua.ipc, VCACHE_CLOCK[c.name] ?? c.boostClock, VCACHE_L3, lanes)
  // İkinci CCD'nin L3'ü toplamdan kalan; V-Cache'ten küçükse V-Cache'siz CCD (7950X3D: 128 − 96 = 32 MB).
  const rest = l3 - VCACHE_L3
  if (rest <= 0 || rest >= VCACHE_L3) return { x3d, ccds: [vcache], plainShare: 0 }
  const plain = frameTime(ua.ipc, c.boostClock, rest, lanes)
  return { x3d, ccds: [vcache, plain], plainShare: CPU_MODEL.PLAIN_CCD_SHARE }
}

/**
 * Ham (ölçeksiz) eksen değerleri ve hesap dökümü. Katsayıları çağrı anında okur;
 * scripts/calibration/fit.mjs bu sayede sabitleri değiştirip yeniden hesaplar.
 */
export function computeRaw(c) {
  const ua = c.uarch
  if (!ua || !c.boostClock || !c.cores || !c.tdp) return null
  const { SMT_GAIN, DESKTOP_POWER, MOBILE_POWER, BOOST_CORE_POWER, COMPACT_CLOCK } = CPU_MODEL

  let pCores = c.cores
  let eCores = 0
  const split = CORE_SPLIT_BY_NAME[c.name] ?? CORE_SPLIT[c.codename]?.[c.cores]
  if (split) [pCores, eCores] = split
  else if (ECORE[ua.name]) {
    if (c.threads > c.cores) {
      pCores = c.threads - c.cores
      eCores = c.cores - pCores
    }
    // Dağılım bilinmiyor: hepsini P saymak endeksi şişirir, hiç vermemek daha dürüst.
    else return null
  }
  // Intel'de E-çekirdek ayrı mimari; AMD'nin kompakt çekirdeği aynı IPC, düşük saat.
  const compact = eCores > 0 && !ECORE[ua.name]
  const [eIpc, eClock] = compact ? [ua.ipc, COMPACT_CLOCK] : (ECORE[ua.name] ?? [0, 0])
  // HT'li thread'ler önce P çekirdeklere düşer; AMD'de kompakt çekirdeklerde de SMT var.
  const ht = c.threads - c.cores
  const smtP = 1 + SMT_GAIN * Math.min(1, ht / pCores)
  const smtE = eCores ? 1 + SMT_GAIN * Math.min(1, Math.max(0, (ht - pCores) / eCores)) : 1
  // FX serisinde iki çekirdek bir FPU'yu paylaşır (CMT).
  const cmt = ua.name === 'Piledriver' ? 0.8 : 1

  // Çekirdek başına düşen güçten tüm-çekirdek saati (P ∝ f³). Threadripper'da PPT = TDP
  // (AM4/AM5'teki gibi TDP'nin üstüne çıkmaz). Soketler: TR4 (veride "SP3r2"), sTRX4
  // ("TRX4"), sWRX8 ("WRX8"), sTR5. E-çekirdek gücün yarısını çeker.
  const threadripper = /sTR|TRX|SP3|WRX/.test(c.socket ?? '')
  const powerRatio = threadripper ? 1 : c.market === 'Mobile' ? MOBILE_POWER : DESKTOP_POWER
  const watts = c.tdp * powerRatio
  const fullCores = pCores + 0.5 * eCores
  const wattsPerCore = watts / fullCores
  // Temel frekans taban: Intel hibritlerinde hariç (P-çekirdek tabanı, E yüklüyken tutmaz;
  // veride Meteor Lake için 3,8 GHz gibi gerçek dışı değerler var).
  const floor = ECORE[ua.name] && eCores ? 0 : (c.baseClock ?? 0)
  const powerClock = c.boostClock * Math.min(1, Math.cbrt(wattsPerCore / BOOST_CORE_POWER))
  const allCore = Math.max(floor, powerClock)

  const single = ua.ipc * c.boostClock
  const multi = (pCores * ua.ipc * allCore * smtP + eCores * eIpc * allCore * eClock * smtE) * cmt

  // Oyunun eşzamanlı şeritleri: P-çekirdek (SMT'yle), E/kompakt çekirdek P'ye göre hızıyla.
  const lanes = (pCores * smtP + (eCores ? eCores * smtE * (eIpc * eClock) / ua.ipc : 0)) * cmt
  const game = gamingTime(c, ua, lanes)
  const [first, second] = game.ccds
  const frame = second ? (1 - game.plainShare) * first.total + game.plainShare * second.total : first.total
  const gaming = 1 / frame

  return {
    single,
    multi,
    gaming,
    breakdown: {
      uarch: ua.name,
      ipc: ua.ipc,
      pCores,
      eCores,
      compact,
      eIpc: eCores ? eIpc : null,
      eClock: eCores ? eClock : null,
      boost: c.boostClock,
      single,
      multi,
      gaming,
      smt: smtP,
      smtE,
      cmt,
      fullCores,
      watts,
      wattsPerCore,
      powerRatio,
      allCore,
      atFloor: floor > powerClock,
      lanes,
      x3d: game.x3d,
      ccds: game.ccds,
      plainShare: game.plainShare,
      frame,
    },
  }
}

const mapped = Array.isArray(cpuDatabase) ? cpuDatabase.map(fixRecord).map(mapCpu) : []
const withRaw = mapped.map(c => ({ c, raw: computeRaw(c) }))
const refRaw = withRaw.find(x => x.c.name === REFERENCE_CPU_NAME)?.raw

const round1 = n => Math.round(n * 10) / 10

export const cpuList = withRaw.map(({ c, raw }) => {
  if (!raw || !refRaw) {
    return { ...c, singleIndex: null, multiIndex: null, gamingIndex: null, perfIndex: null, breakdown: null }
  }
  const single = (raw.single / refRaw.single) * 100
  const multi = (raw.multi / refRaw.multi) * 100
  const gaming = (raw.gaming / refRaw.gaming) * 100
  const { WEIGHTS } = CPU_MODEL
  const overall = Math.exp(
    WEIGHTS.single * Math.log(single) + WEIGHTS.multi * Math.log(multi) + WEIGHTS.gaming * Math.log(gaming),
  )
  return {
    ...c,
    singleIndex: round1(single),
    multiIndex: round1(multi),
    gamingIndex: round1(gaming),
    perfIndex: round1(overall),
    perfPerWatt: c.tdp ? round1((overall / c.tdp) * 100) : null,
    breakdown: raw.breakdown,
  }
})

export const referenceCpu = cpuList.find(c => c.name === REFERENCE_CPU_NAME) ?? null
export const cpuById = new Map(cpuList.map(c => [c.id, c]))

export const { rank: cpuRank, count: cpuRankedCount } = rankParts(cpuList)
