import { gpuList, gpuById, gpuRank, gpuRankedCount, referenceGpu, GPU_MODEL, GPU_ARCH } from '../data/gpuData'
import { GPU_GROUPS, translateValue } from '../data/labels'
import { formatNumber, formatIndex, formatRelease, cleanText } from '../data/format'
import { parseClockMhz, parseMemoryRateGbps, parseNum, parseTflops } from '../data/parse'

const n = (v, digits = 1, unit = '') => formatNumber(v, { digits, unit })

/** 512 MB gibi küçük bellekler "1 GB"a yuvarlanmasın; 1,5 GB ondalıklı kalsın. */
const vram = gb => (gb < 1 ? n(gb * 1024, 0, ' MB') : n(gb, 1, ' GB'))
const cache = mb => (mb < 1 ? n(mb * 1024, 0, ' KB') : n(mb, 1, ' MB'))

/** Ham metin alanı: Türkçeye çevrilir, çok satırlı değer tek satıra indirilir. */
const text = field => g => cleanText(translateValue(g.raw[field]))

/** Tümleşik GPU'nun ayrı belleği yok; boş hücre yerine bu yazılır. */
const shared = label => g => (g.integrated ? label : null)

/**
 * Karşılaştırma çizelgesi satırları. Verideki her alan burada ya da detay sayfasında görünür.
 * better: 'high' | 'low' — en iyi / en kötü işareti ve renkli fark; yoksa fark yazılmaz.
 * info: açıklama anahtarı (src/data/info.js); "i" düğmesinin metni.
 * fallback: değer yokken gösterilecek metin (sıralama ve karşılaştırma değeri null kalır).
 *
 * Shader, saat, önbellek gibi sayımlar mimariler arasında birebir kıyaslanamaz; yine de
 * yönleri belli (çok olan iyi) ve işaretlenir, tablonun notu bunu söyler (specNote).
 * Blok başına verilen önbellekler (L0, L1) ve yonga alanı yönsüzdür.
 */
const specs = [
  {
    title: 'Endeks',
    rows: [
      { label: 'Performans endeksi', info: 'perfIndex', get: g => g.perfIndex, format: v => formatIndex(v), better: 'high', key: true },
      { label: 'Endeks / watt', info: 'perfPerWatt', get: g => g.perfPerWatt, format: v => n(v, 1), better: 'high', hint: '100 W başına endeks puanı' },
      { label: 'Endeks / 100 $', info: 'perfPerDollar', get: g => g.perfPerDollar, format: v => n(v, 1), better: 'high', hint: 'Çıkış fiyatına göre; güncel fiyat değil' },
    ],
  },
  {
    title: 'Hesaplama',
    rows: [
      { label: 'FP32', info: 'FP32 (float)', get: g => g.fp32Tflops, format: v => n(v, 2, ' TFLOPS'), better: 'high' },
      { label: 'FP16', info: 'FP16 (half)', get: g => parseTflops(g.raw['FP16 (half)']), format: v => n(v, 2, ' TFLOPS'), better: 'high' },
      { label: 'FP64', info: 'FP64 (double)', get: g => parseTflops(g.raw['FP64 (double)']), format: v => n(v, 3, ' TFLOPS'), better: 'high' },
      { label: 'Shader birimi', info: 'Shading Units', get: g => g.shaders, format: v => n(v, 0), better: 'high' },
      { label: 'Hesaplama birimi (CU / Xe)', info: 'Compute Units', get: g => g.computeUnits, format: v => n(v, 0), better: 'high' },
      { label: 'Doku birimi (TMU)', info: 'TMUs', get: g => g.tmus, format: v => n(v, 0), better: 'high' },
      { label: 'Raster birimi (ROP)', info: 'ROPs', get: g => g.rops, format: v => n(v, 0), better: 'high' },
      { label: 'Işın izleme çekirdeği', info: 'RT Cores', get: g => g.rtCores, format: v => n(v, 0), better: 'high' },
      { label: 'Tensor / matris çekirdeği', info: 'Tensor Cores', get: g => g.tensorCores, format: v => n(v, 0), better: 'high' },
      { label: 'Doku doldurma', info: 'Texture Rate', get: g => g.textureRate, format: v => n(v, 1, ' GT/s'), better: 'high' },
      { label: 'Piksel doldurma', info: 'Pixel Rate', get: g => g.pixelRate, format: v => n(v, 1, ' GP/s'), better: 'high' },
    ],
  },
  {
    title: 'Saat',
    rows: [
      { label: 'Temel saat', info: 'Base Clock', get: g => g.gpuClock, format: v => n(v, 0, ' MHz'), better: 'high' },
      { label: 'Oyun saati', info: 'Game Clock', get: g => parseClockMhz(g.raw['Game Clock']), format: v => n(v, 0, ' MHz'), better: 'high' },
      { label: 'Boost saati', info: 'Boost Clock', get: g => g.boostClock, format: v => n(v, 0, ' MHz'), better: 'high' },
      {
        label: 'Bellek hızı',
        info: 'memoryRate',
        get: g => (g.integrated ? null : parseMemoryRateGbps(g.raw['Memory Clock'])),
        format: v => n(v, 1, ' Gbps'),
        better: 'high',
        fallback: shared('Sistem belleği'),
      },
    ],
  },
  {
    title: 'Bellek',
    rows: [
      { label: 'VRAM', info: 'Memory Size', get: g => g.memoryGb, format: vram, better: 'high', fallback: shared('Paylaşımlı') },
      { label: 'Bellek tipi', info: 'Memory Type', get: g => g.memoryType, format: v => v, fallback: shared('Sistem belleği') },
      { label: 'Veri yolu', info: 'Memory Bus', get: g => g.memoryBus, format: v => n(v, 0, ' bit'), better: 'high', fallback: shared('Sistem belleği') },
      { label: 'Bant genişliği', info: 'Bandwidth', get: g => g.memoryBandwidth, format: v => n(v, 1, ' GB/s'), better: 'high', fallback: shared('Sistem belleğine bağlı') },
      { label: 'L0 önbellek', info: 'L0 Cache', get: text('L0 Cache'), format: v => v },
      { label: 'L1 önbellek', info: 'L1 Cache', get: text('L1 Cache'), format: v => v },
      { label: 'L2 önbellek', info: 'L2 Cache', get: g => g.l2Cache, format: cache, better: 'high' },
      { label: 'L3 / Infinity Cache', info: 'L3 Cache', get: g => g.infinityCache, format: cache, better: 'high' },
    ],
  },
  {
    title: 'Yonga',
    rows: [
      { label: 'Mimari', info: 'Architecture', get: g => g.architecture, format: v => v },
      { label: 'Çip', info: 'GPU Name', get: g => g.chip, format: v => v },
      { label: 'Çip varyantı', info: 'GPU Variant', get: text('GPU Variant'), format: v => v },
      { label: 'Üretim süreci', info: 'Process Size', get: g => g.processSize, format: v => v },
      { label: 'Üretici fabrika', info: 'Foundry', get: g => g.raw['Foundry'] || null, format: v => v },
      { label: 'Transistör', info: 'Transistors', get: g => g.transistors, format: v => n(v, 0, ' milyon'), better: 'high' },
      { label: 'Transistör yoğunluğu', info: 'Density', get: g => parseNum(g.raw['Density']), format: v => n(v, 1, ' M/mm²'), better: 'high' },
      { label: 'Yonga alanı', info: 'Die Size', get: g => g.dieSize, format: v => n(v, 0, ' mm²') },
    ],
  },
  {
    title: 'Güç ve fiziksel',
    rows: [
      { label: 'TDP', info: 'TDP', get: g => g.tdp, format: v => n(v, 0, ' W'), better: 'low', fallback: shared('İşlemciyle ortak') },
      { label: 'Önerilen PSU', info: 'Suggested PSU', get: g => g.recommendedPsu, format: v => n(v, 0, ' W'), better: 'low' },
      { label: 'Güç konnektörü', info: 'Power Connectors', get: g => cleanText(translateValue(g.powerConnectors)), format: v => v },
      { label: 'Slot', info: 'Slot Width', get: g => g.slotWidth, format: translateValue },
      { label: 'Arayüz', info: 'Bus Interface', get: g => g.bus, format: translateValue },
      { label: 'Görüntü çıkışları', info: 'Outputs', get: text('Outputs'), format: v => v },
    ],
  },
  {
    title: 'API desteği',
    rows: [
      { label: 'DirectX', info: 'DirectX', get: text('DirectX'), format: v => v },
      { label: 'Vulkan', info: 'Vulkan', get: text('Vulkan'), format: v => v },
      { label: 'OpenGL', info: 'OpenGL', get: text('OpenGL'), format: v => v },
      { label: 'OpenCL', info: 'OpenCL', get: text('OpenCL'), format: v => v },
      { label: 'Shader Model', info: 'Shader Model', get: text('Shader Model'), format: v => v },
    ],
  },
  {
    title: 'Piyasa',
    rows: [
      { label: 'Çıkış', info: 'Release Date', get: g => g.releaseDate, format: v => formatRelease(v) },
      { label: 'Çıkış fiyatı', info: 'Launch Price', get: g => g.msrp, format: v => n(v, 0, ' $'), better: 'low' },
    ],
  },
]

/** Sıralama panosu sütunları. priority: dar ekranda hangi sütunların kalacağı. */
const columns = [
  { key: 'architecture', label: 'Mimari', info: 'Architecture', get: g => g.architecture, format: v => v, priority: 'lg', sort: 'text' },
  { key: 'memoryGb', label: 'VRAM', info: 'Memory Size', get: g => g.memoryGb, format: vram, priority: 'md', align: 'right', fallback: shared('Paylaşımlı') },
  { key: 'memoryBandwidth', label: 'Bant', info: 'Bandwidth', get: g => g.memoryBandwidth, format: v => n(v, 0, ' GB/s'), priority: 'xl', align: 'right', fallback: shared('Sisteme bağlı') },
  { key: 'tdp', label: 'TDP', info: 'TDP', get: g => g.tdp, format: v => n(v, 0, ' W'), priority: 'md', align: 'right', fallback: shared('CPU ile') },
  { key: 'releaseYear', label: 'Yıl', info: 'releaseYear', get: g => g.releaseYear, format: v => (v == null ? null : String(v)), priority: 'lg', align: 'right' },
  { key: 'msrp', label: 'Çıkış $', info: 'Launch Price', get: g => g.msrp, format: v => n(v, 0, ' $'), priority: 'xl', align: 'right' },
]

function options(get) {
  return [...new Set(gpuList.map(get).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), 'tr'))
}

const filters = [
  { key: 'maker', label: 'Üretici', get: g => g.manufacturer, options: options(g => g.manufacturer) },
  { key: 'segment', label: 'Segment', get: g => g.segment, options: options(g => g.segment) },
  {
    key: 'family',
    label: 'Mimari',
    get: g => (g.archFamily ? GPU_ARCH[g.archFamily].label : null),
    options: options(g => (g.archFamily ? GPU_ARCH[g.archFamily].label : null)),
  },
  {
    key: 'vram',
    label: 'En az VRAM',
    get: g => g.memoryGb,
    options: [4, 6, 8, 12, 16, 24],
    match: (v, opt) => v != null && v >= opt,
    formatOption: o => `${o} GB+`,
  },
]

export default {
  key: 'gpu',
  code: 'GPU',
  noun: 'ekran kartı',
  nounPlural: 'ekran kartları',
  list: gpuList,
  byId: gpuById,
  rank: gpuRank,
  rankedCount: gpuRankedCount,
  // Sıralama iki grupta: sunucu kartları tüketici kartlarıyla aynı listeye girmez.
  scopes: {
    main: { label: 'Masaüstü ve dizüstü', noun: 'ekran kartı' },
    server: {
      label: 'Veri merkezi',
      noun: 'sunucu kartı',
      lead:
        "Ekran çıkışı olmayan kartların endeksi, bulut oyun ve sanallaştırmada oyun kartı gibi kullanıldıklarında beklenen performansın tahminidir. Grafik API'si olmayan hesaplama çiplerine (A100, H100, MI300X…) endeks verilmez.",
    },
  },
  reference: referenceGpu,
  model: GPU_MODEL,
  paths: {
    compare: '/gpu-karsilastir',
    list: '/gpu-veritabani',
    detail: id => `/gpu-veritabani/${id}`,
  },
  axes: [{ key: 'perfIndex', label: 'Endeks', short: 'Endeks', title: 'Performans endeksi', by: 'performans endeksine göre', info: 'perfIndex' }],
  makerOf: g => g.manufacturer,
  searchText: g => `${g.name} ${g.chip ?? ''} ${g.architecture ?? ''}`.toLowerCase(),
  meta: g =>
    [g.architecture, g.memoryGb != null ? vram(g.memoryGb) : g.integrated ? 'Paylaşımlı bellek' : null, g.tdp != null ? `${g.tdp} W` : null]
      .filter(Boolean)
      .join(' · '),
  placeholder: 'Model ara — örn. RTX 4070, RX 7800',
  specs,
  specNote: 'shader, saat ve önbellek farklı mimariler arasında birebir kıyaslanamaz; asıl ölçü endeks',
  columns,
  filters,
  groups: GPU_GROUPS,
  examples: [
    ['GeForce RTX 4070 SUPER', 'Radeon RX 7800 XT'],
    ['GeForce RTX 4060', 'Radeon RX 7600', 'Arc B580'],
    ['GeForce RTX 5070 Ti', 'Radeon RX 9070 XT'],
  ],
}
