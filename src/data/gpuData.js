import gpuDatabase from '../../data/gpu_database.json'
import {
  parseNum,
  parseCacheMb,
  parseBandwidthGbs,
  parseTflops,
  parseMemorySizeMb,
  parseClockMhz,
  parseInt10,
  parseRounded,
  parseYear,
} from './parse'

import { formatNumber } from './format'
import { rankParts } from './rank'
import { GPU_MODEL, GPU_ARCH, REFERENCE_GPU_NAME } from './gpuModel'

export { GPU_MODEL, GPU_ARCH, REFERENCE_GPU_NAME }

const ARCH_FAMILY = {
  'Blackwell 2.0': 'blackwell', 'Ada Lovelace': 'ada', 'Ampere': 'ampere', 'Turing': 'turing',
  'Volta': 'volta', 'Pascal': 'pascal', 'Maxwell 2.0': 'maxwell', 'Maxwell': 'maxwell', 'Fermi': 'fermi',
  'Fermi 2.0': 'fermi', 'Tesla 2.0': 'tesla', Tesla: 'tesla', Kepler: 'kepler', 'Kepler 2.0': 'kepler', 'RDNA 4.0': 'rdna4', 'RDNA 3.0': 'rdna3',
  'RDNA 3.5': 'rdna3', 'RDNA 2.0': 'rdna2', 'RDNA 1.0': 'rdna1', 'GCN 5.0': 'gcn5',
  'GCN 5.1': 'gcn5', 'GCN 4.0': 'gcn4', 'GCN 3.0': 'gcn3', 'GCN 2.0': 'gcn2', 'GCN 1.0': 'gcn1',
  TeraScale: 'terascale1', 'TeraScale 2': 'terascale2', 'TeraScale 3': 'terascale3', 'Xe-HPG': 'xe', 'Xe2-HPG': 'xe2',
  // Tümleşik Intel: Xe-LPG(+) Alchemist'in, Xe2-LPG Battlemage'ın tümleşik sürümü.
  'Xe-LPG': 'xe', 'Xe-LPG+': 'xe', 'Xe2-LPG': 'xe2', 'Xe-LP': 'xelp',
  // Gen 9 (Skylake) ve Gen 9.5 (Kaby/Coffee Lake) aynı EU mimarisi; 9.5 yalnızca medya bloğunu yeniler.
  'Generation 11.0': 'gen11', 'Generation 9.5': 'gen9', 'Generation 9.0': 'gen9',
}

// Hopper, Blackwell (B200) ve CDNA 3 bilerek yok: grafik API'si olmayan hesaplama
// çipleri, bkz. computeIndex.

/**
 * Tümleşik GPU'ların bant genişliği veride "System Dependent". Çipe göre
 * platformun resmi desteklediği DDR bellek, çift kanal varsayılır; bellek
 * yalnızca lehimli olan platformlarda o bellek. Varsayım dökümde gösterilir.
 */
const DDR4_2133 = { gbs: 34.1, note: 'DDR4-2133 çift kanal varsayıldı' }
const DDR4_2400 = { gbs: 38.4, note: 'DDR4-2400 çift kanal varsayıldı' }
const DDR4_2666 = { gbs: 42.7, note: 'DDR4-2666 çift kanal varsayıldı' }
const DDR4_2933 = { gbs: 46.9, note: 'DDR4-2933 çift kanal varsayıldı' }
const DDR4_3200 = { gbs: 51.2, note: 'DDR4-3200 çift kanal varsayıldı' }
const DDR5_4800 = { gbs: 76.8, note: 'DDR5-4800 çift kanal varsayıldı' }
const DDR5_5600 = { gbs: 89.6, note: 'DDR5-5600 çift kanal varsayıldı' }
const IGPU_MEMORY = {
  'Skylake GT2': DDR4_2133,
  'Kaby Lake GT2': DDR4_2400,
  'Coffee Lake GT1': DDR4_2400,
  'Coffee Lake GT2': DDR4_2666,
  'Gemini Lake GT1': DDR4_2400,
  'Gemini Lake GT1.5': DDR4_2400,
  'Ice Lake GT2': DDR4_3200,
  'Tiger Lake GT2': DDR4_3200,
  'Rocket Lake': DDR4_3200,
  'Alder Lake': DDR5_4800,
  'Meteor Lake-H': DDR5_5600,
  'Arrow Lake-H': DDR5_5600,
  'Lunar Lake': { gbs: 136.5, note: 'Paket üstü LPDDR5X-8533, 128 bit' },
  'Raven': DDR4_2933,
  'Raven-M': DDR4_2400,
  'Picasso': DDR4_2400,
  'Mendocino': { gbs: 44, note: 'LPDDR5-5500, 64 bit varsayıldı' },
  'Rembrandt': DDR5_4800,
  'Phoenix': DDR5_5600,
  'Phoenix2': DDR5_5600,
  'Strix Point': DDR5_5600,
  'Krackan Point': DDR5_5600,
  'Krackan Point 2': DDR5_5600,
  'Strix Halo': { gbs: 256, note: 'LPDDR5X-8000, 256 bit varsayıldı' },
  'Gorgon Halo': { gbs: 273, note: 'LPDDR5X-8533, 256 bit varsayıldı' },
}

/** Üretici id'nin sonunda (gpu184nvidia); ad kalıbı A100, Iris, UHD gibi adları kaçırıyordu. */
const VENDOR = { nvidia: 'NVIDIA', amd: 'AMD', intel: 'Intel' }
function getManufacturer(id) {
  return VENDOR[/(nvidia|amd|intel)$/.exec(id || '')?.[1]] ?? null
}

function getSegment(db) {
  const name = db.name
  if (db['Memory Size'] === 'System Shared') return 'Tümleşik'
  // L40S'in çıkışları var ama varsayılan olarak kapalı; yine de bir sunucu kartı.
  if (db['Outputs'] === 'No outputs' || /^L40/.test(name)) return 'Veri merkezi'
  if (/Playstation|Xbox|Steam Deck|Switch/i.test(name)) return 'Konsol'
  // RX 6600S / 7700S gibi "S" modelleri de dizüstü (ince tasarım sürümleri).
  if (/mobile|laptop|max-q|^GeForce MX|^Arc A\d+M$|^Radeon RX \d{4}[MS]\b/i.test(name)) return 'Mobil'
  if (/RTX PRO|Quadro|Radeon (AI )?Pro|Arc Pro|^RTX A\d|Ada Generation|^T\d{3,4}\b/i.test(name)) return 'İş istasyonu'
  return 'Masaüstü'
}

/**
 * Gemini Lake (Pentium Silver, Celeron; 6–10 W Atom SoC) Core işlemcilerdeki UHD 600
 * serisiyle aynı Gen 9.5 mimarisi, ama güç bütçesi çok dar: tek katsayı Core'ları
 * düşük, Gemini Lake'i yüksek gösteriyordu.
 */
function archFamilyOf(db) {
  if (/^Gemini Lake/.test(db['GPU Name'] ?? '')) return 'gen9lp'
  return ARCH_FAMILY[db['Architecture']] ?? null
}

/**
 * Tek kartta iki GPU (SLI/CrossFire köprüsü kart üstünde). Kaynak verinin özellikleri tek
 * GPU'nun değerlerini verir; endeks de tek GPU'nunkidir, çünkü güncel oyunlar çoklu GPU'yu
 * desteklemiyor (NVIDIA 2021'de yeni SLI profillerini bıraktı).
 */
const MULTI_GPU = /^GeForce GTX (295|590|690)$|TITAN Z|^Radeon HD (5970|6990|7990)$|^Radeon R9 295X2$|Pro Duo/

function mapGpu(db) {
  const memorySize = parseMemorySizeMb(db['Memory Size'])
  const integrated = db['Memory Size'] === 'System Shared'
  // Tümleşik GPU'da veri TDP'si işlemci paketinin (680M 50 W, 780M 15 W): watt başına
  // puan ve TDP karşılaştırması anlamsız olur, boş bırakılır. Ham değer detayda kalır.
  const tdp = integrated ? null : parseRounded(db['TDP'])
  const archFamily = archFamilyOf(db)
  const segment = getSegment(db)
  return {
    id: db.id,
    name: db.name,
    manufacturer: getManufacturer(db.id),
    segment,
    // Sunucu kartları ayrı sıralanır (bkz. rank.js).
    server: segment === 'Veri merkezi',
    integrated,
    noOutputs: db['Outputs'] === 'No outputs',
    multiGpu: MULTI_GPU.test(db.name),
    // A100, H100, B200, MI300X: DirectX de Vulkan da yok, grafik hattı kırpık.
    noGraphicsApi: db['DirectX'] === 'N/A' && db['Vulkan'] === 'N/A',
    chip: db['GPU Name'] || null,
    architecture: db['Architecture'] || null,
    archFamily,
    releaseDate: db['Release Date'] || null,
    releaseYear: parseYear(db['Release Date']),
    bus: db['Bus Interface'] || null,
    memorySize,
    memoryGb: memorySize != null ? Math.round((memorySize / 1024) * 10) / 10 : null,
    memoryType: db['Memory Type'] && db['Memory Type'] !== 'System Shared' ? db['Memory Type'] : null,
    memoryBus: parseRounded(db['Memory Bus']),
    memoryBandwidth: parseBandwidthGbs(db['Bandwidth']),
    assumedBandwidth: integrated ? (IGPU_MEMORY[db['GPU Name']] ?? null) : null,
    // Eski kartlarda ve konsollarda kaynak veri tek bir "GPU Clock" veriyor.
    gpuClock: parseClockMhz(db['Base Clock']) ?? parseClockMhz(db['GPU Clock']),
    boostClock: parseClockMhz(db['Boost Clock']) ?? parseClockMhz(db['Game Clock']),
    shaders: parseInt10(db['Shading Units']),
    tmus: parseInt10(db['TMUs']),
    rops: parseInt10(db['ROPs']),
    rtCores: parseInt10(db['RT Cores']),
    tensorCores: parseInt10(db['Tensor Cores']) ?? parseInt10(db['Matrix Cores']),
    computeUnits: parseInt10(db['Compute Units']),
    l2Cache: parseCacheMb(db['L2 Cache']),
    infinityCache: parseNum(db['L3 Cache']),
    pixelRate: parseNum(db['Pixel Rate']),
    textureRate: parseNum(db['Texture Rate']),
    processSize: db['Process Size'] || null,
    transistors: parseNum(db['Transistors']),
    dieSize: parseNum(db['Die Size']),
    tdp,
    recommendedPsu: parseRounded(db['Suggested PSU']),
    msrp: parseRounded(db['Launch Price']),
    fp32Tflops: parseTflops(db['FP32 (float)']),
    slotWidth: db['Slot Width'] || null,
    powerConnectors: db['Power Connectors'] || null,
    raw: db,
  }
}

/**
 * Endeksi ve hesap dökümünü üretir. Endeks yoksa sebebi `noIndexReason`'da.
 * Katsayıları çağrı anında okur; scripts/calibration/fit.mjs bu sayede yeniden hesaplar.
 */
export function computeIndex(g) {
  const none = reason => ({ index: null, breakdown: null, noIndexReason: reason })
  // Çıkışı olmayan ama grafik API'li kartlar (T4, A10, L4) bulut oyun ve sanallaştırmada
  // oyun kartı gibi çalışır; endeks alır, sunucu sıralamasında kalır. Saf hesaplama
  // çiplerinde (A100, H100, MI300X) oyun performansı tanımsız.
  if (g.noGraphicsApi) return none('Grafik API desteği olmayan hesaplama çipi (DirectX ve Vulkan yok); oyun endeksi hesaplanmaz.')
  const arch = g.archFamily ? GPU_ARCH[g.archFamily] : null
  if (!arch) return none(`${g.architecture ?? 'Bilinmeyen'} mimarisi için model katsayısı yok.`)
  const bw = g.memoryBandwidth ?? g.assumedBandwidth?.gbs ?? null
  if (!g.fp32Tflops || !bw) return none('FP32 ya da bant genişliği verisi eksik.')
  if (!g.integrated && g.l2Cache == null) return none('L2 önbellek verisi eksik; etkin bant genişliği hesaplanamaz.')

  const { A, B, WORKING_SET, MISS_SLOPE, FIXED_TIME } = GPU_MODEL
  // Kaynak veri RDNA 3'te FP32'yi çift komutla (dual-issue) sayıyor, RDNA 3.5'te saymıyor
  // (780M: 768 × 2 × 2,7 GHz × 2; 890M: 1024 × 2 × 2,9 GHz). Aynı sayıma getirilir.
  const dualIssue = g.architecture === 'RDNA 3.5'
  const fp32 = g.fp32Tflops * (dualIssue ? 2 : 1)
  // Önbellek bellek trafiğini azaltır: etkin bant genişliği = bant genişliği / ıskalama.
  const cacheMb = (g.l2Cache ?? 0) + (g.infinityCache ?? 0)
  const miss = 1 / (1 + Math.pow(cacheMb / WORKING_SET, MISS_SLOPE))
  const effectiveBandwidth = bw / miss
  const compute = Math.pow(fp32, A)
  const memory = Math.pow(effectiveBandwidth, B)
  const throughput = arch.k * compute * memory
  const frame = 1 / throughput + FIXED_TIME
  return {
    index: 1 / frame,
    noIndexReason: null,
    breakdown: {
      archLabel: arch.label,
      archK: arch.k,
      fp32,
      fp32Note: dualIssue ? `Veride ${formatNumber(g.fp32Tflops, { digits: 2, unit: ' TFLOPS' })}; RDNA 3 ile aynı sayım için ×2 (çift komut)` : null,
      bandwidth: bw,
      bandwidthAssumed: g.assumedBandwidth?.note ?? null,
      cacheMb,
      miss,
      effectiveBandwidth,
      compute,
      memory,
      throughput,
      gpuTime: 1 / throughput,
      frame,
      // Endeksin k'ya göre esnekliği: karenin ekran kartına bağlı payı (fit.mjs k'ları çözerken kullanır).
      gpuShare: 1 / throughput / frame,
    },
  }
}

const mapped = Array.isArray(gpuDatabase) ? gpuDatabase.map(mapGpu) : []
const withIndex = mapped.map(g => ({ ...g, ...computeIndex(g) }))

const refRaw = withIndex.find(g => g.name === REFERENCE_GPU_NAME)?.index ?? 1
const round1 = n => Math.round(n * 10) / 10

export const gpuList = withIndex.map(g => {
  const perfIndex = g.index != null ? round1((g.index / refRaw) * 100) : null
  // Konsolda TDP ve fiyat tüm cihazın; GPU'ya bölmek yanıltır.
  const isConsole = g.segment === 'Konsol'
  return {
    ...g,
    perfIndex,
    perfPerWatt: perfIndex != null && g.tdp && !isConsole ? round1((perfIndex / g.tdp) * 100) : null,
    perfPerDollar: perfIndex != null && g.msrp && !isConsole ? round1((perfIndex / g.msrp) * 100) : null,
  }
})

export const referenceGpu = gpuList.find(g => g.name === REFERENCE_GPU_NAME) ?? null
export const gpuById = new Map(gpuList.map(g => [g.id, g]))

export const { rank: gpuRank, count: gpuRankedCount } = rankParts(gpuList)
