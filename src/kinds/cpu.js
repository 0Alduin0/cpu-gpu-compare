import { cpuList, cpuById, cpuRank, cpuRankedCount, referenceCpu, CPU_MODEL } from '../data/cpuData'
import { CPU_GROUPS, translateValue } from '../data/labels'
import { formatNumber, formatIndex, formatRelease, cleanText } from '../data/format'
import { parseNum } from '../data/parse'

const n = (v, digits = 1, unit = '') => formatNumber(v, { digits, unit })

/** Ham metin alanı: Türkçeye çevrilir, çok satırlı değer tek satıra indirilir. */
const text = field => c => cleanText(translateValue(c.raw[field]))

/**
 * Karşılaştırma çizelgesi satırları. Verideki her alan burada ya da detay sayfasında görünür.
 * better: 'high' | 'low' — en iyi / en kötü işareti ve renkli fark; yoksa fark yazılmaz.
 * info: açıklama anahtarı (src/data/info.js); "i" düğmesinin metni.
 *
 * Frekans mikromimariler arasında birebir kıyaslanamaz; yine de yüksek olan iyi
 * sayılır ve tablonun notu bunu söyler (specNote).
 */
const specs = [
  {
    title: 'Endeks',
    rows: [
      { label: 'Genel endeks', info: 'perfIndex', get: c => c.perfIndex, format: v => formatIndex(v), better: 'high', key: true },
      { label: 'Oyun', info: 'gamingIndex', get: c => c.gamingIndex, format: v => formatIndex(v), better: 'high' },
      { label: 'Tek çekirdek', info: 'singleIndex', get: c => c.singleIndex, format: v => formatIndex(v), better: 'high' },
      { label: 'Çok çekirdek', info: 'multiIndex', get: c => c.multiIndex, format: v => formatIndex(v), better: 'high' },
      { label: 'Genel / watt', info: 'perfPerWatt', get: c => c.perfPerWatt, format: v => n(v, 1), better: 'high', hint: '100 W TDP başına genel endeks' },
    ],
  },
  {
    title: 'Çekirdek ve frekans',
    rows: [
      { label: 'Mikromimari', info: 'uarch', get: c => c.uarch?.name, format: v => v },
      { label: 'Çekirdek', info: '# of Cores', get: c => c.cores, format: v => n(v, 0), better: 'high' },
      { label: 'Thread', info: '# of Threads', get: c => c.threads, format: v => n(v, 0), better: 'high' },
      { label: 'Temel frekans', info: 'Frequency', get: c => c.baseClock, format: v => n(v, 2, ' GHz'), better: 'high' },
      { label: 'Boost frekans', info: 'Turbo Clock', get: c => c.boostClock, format: v => n(v, 2, ' GHz'), better: 'high' },
      { label: 'Referans saati (BCLK)', info: 'Base Clock', get: text('Base Clock'), format: v => v },
      { label: 'Çarpan', info: 'Multiplier', get: text('Multiplier'), format: v => v },
      { label: 'Çarpan kilidi', info: 'Multiplier Unlocked', get: c => (c.unlocked ? 'Açık' : 'Kilitli'), format: v => v },
    ],
  },
  {
    title: 'Önbellek',
    rows: [
      { label: 'L1', info: 'Cache L1', get: text('Cache L1'), format: v => v },
      { label: 'L2', info: 'Cache L2', get: text('Cache L2'), format: v => v },
      { label: 'L3', info: 'Cache L3', get: c => c.l3Cache, format: v => n(v, 0, ' MB'), better: 'high' },
    ],
  },
  {
    title: 'Bellek',
    rows: [
      { label: 'Bellek tipi', info: 'Memory Support', get: c => cleanText(translateValue(c.memoryType)), format: v => v },
      { label: 'Kanal', info: 'Memory Bus', get: text('Memory Bus'), format: v => v },
      { label: 'Nominal hız', info: 'Rated Speed', get: c => c.maxMemorySpeed, format: v => n(v, 0, ' MT/s'), better: 'high' },
      { label: 'Bant genişliği', info: 'Memory Bandwidth', get: c => c.memoryBandwidth, format: v => n(v, 1, ' GB/s'), better: 'high' },
      { label: 'Azami bellek', info: 'Memory Capacity', get: c => parseNum(c.raw['Memory Capacity']), format: v => n(v, 0, ' GB'), better: 'high' },
      { label: 'ECC bellek', info: 'ECC Memory', get: text('ECC Memory'), format: v => v },
    ],
  },
  {
    title: 'Platform',
    rows: [
      { label: 'Soket', info: 'Socket', get: c => c.socket, format: v => v },
      { label: 'Kod adı', info: 'Codename', get: c => c.codename, format: v => v },
      { label: 'Seri', info: 'series', get: c => c.series, format: v => v },
      { label: 'Segment', info: 'segment', get: c => c.segment, format: v => v },
      { label: 'Üretim süreci', info: 'Process Size', get: c => c.process, format: v => v },
      { label: 'Üretici fabrika', info: 'Foundry', get: c => c.foundry, format: v => v },
      { label: 'PCI-Express', info: 'PCI-Express', get: text('PCI-Express'), format: v => v },
      { label: 'Tümleşik grafik', info: 'Integrated Graphics', get: c => c.integratedGraphics, format: translateValue },
      { label: 'Çıkış', info: 'Release Date', get: c => c.releaseDate, format: v => formatRelease(v) },
    ],
  },
  {
    title: 'Güç',
    rows: [
      { label: 'TDP', info: 'TDP', get: c => c.tdp, format: v => n(v, 0, ' W'), better: 'low' },
      { label: 'Ayarlanabilir TDP', info: 'Configurable TDP', get: text('Configurable TDP'), format: v => v },
      { label: 'Azami güç', info: 'Max Power', get: text('Max Power'), format: v => v },
    ],
  },
]

const columns = [
  { key: 'socket', label: 'Soket', info: 'Socket', get: c => c.socket?.replace(/^(AMD|Intel) Socket /, ''), format: v => v, priority: 'xl', sort: 'text' },
  { key: 'cores', label: 'Ç / T', info: '# of Cores', get: c => c.cores, format: (v, c) => (v == null ? null : `${v} / ${c.threads}`), priority: 'md', align: 'right' },
  { key: 'boostClock', label: 'Boost', info: 'Turbo Clock', get: c => c.boostClock, format: v => n(v, 1, ' GHz'), priority: 'lg', align: 'right' },
  { key: 'tdp', label: 'TDP', info: 'TDP', get: c => c.tdp, format: v => n(v, 0, ' W'), priority: 'lg', align: 'right' },
  { key: 'releaseYear', label: 'Yıl', info: 'releaseYear', get: c => c.releaseYear, format: v => (v == null ? null : String(v)), priority: 'xl', align: 'right' },
  { key: 'gamingIndex', label: 'Oyun', info: 'gamingIndex', get: c => c.gamingIndex, format: v => n(v, 0), priority: 'md', align: 'right', index: true },
  { key: 'multiIndex', label: 'Çok ç.', info: 'multiIndex', get: c => c.multiIndex, format: v => n(v, 0), priority: 'lg', align: 'right', index: true },
]

function options(get) {
  return [...new Set(cpuList.map(get).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), 'tr'))
}

const filters = [
  { key: 'maker', label: 'Üretici', get: c => c.brand, options: options(c => c.brand) },
  { key: 'segment', label: 'Segment', get: c => c.segment, options: options(c => c.segment) },
  { key: 'socket', label: 'Soket', get: c => c.socket?.replace(/^(AMD|Intel) Socket /, ''), options: options(c => c.socket?.replace(/^(AMD|Intel) Socket /, '')) },
  { key: 'uarch', label: 'Mikromimari', get: c => c.uarch?.name, options: options(c => c.uarch?.name) },
]

export default {
  key: 'cpu',
  code: 'CPU',
  noun: 'işlemci',
  nounPlural: 'işlemciler',
  list: cpuList,
  byId: cpuById,
  rank: cpuRank,
  rankedCount: cpuRankedCount,
  // Sıralama iki grupta: sunucu ve HEDT (Threadripper, X299) masaüstü ve dizüstüyle aynı listeye girmez.
  scopes: {
    main: { label: 'Masaüstü ve dizüstü', noun: 'işlemci' },
    server: { label: 'Sunucu / iş istasyonu', noun: 'iş istasyonu ve sunucu işlemcisi' },
  },
  reference: referenceCpu,
  model: CPU_MODEL,
  paths: {
    compare: '/cpu-karsilastir',
    list: '/cpu-veritabani',
    detail: id => `/cpu-veritabani/${id}`,
  },
  // title: başlıkta, by: "-e göre" cümlesinde (Türkçede ek değişir: "genel endekse", "oyun endeksine").
  axes: [
    { key: 'perfIndex', label: 'Genel', short: 'Genel', title: 'Genel endeks', by: 'genel endekse göre', info: 'perfIndex' },
    { key: 'gamingIndex', label: 'Oyun', short: 'Oyun', title: 'Oyun endeksi', by: 'oyun endeksine göre', info: 'gamingIndex' },
    { key: 'singleIndex', label: 'Tek çekirdek', short: 'Tek ç.', title: 'Tek çekirdek endeksi', by: 'tek çekirdek endeksine göre', info: 'singleIndex' },
    { key: 'multiIndex', label: 'Çok çekirdek', short: 'Çok ç.', title: 'Çok çekirdek endeksi', by: 'çok çekirdek endeksine göre', info: 'multiIndex' },
  ],
  makerOf: c => c.brand,
  searchText: c => `${c.name} ${c.codename ?? ''} ${c.series ?? ''} ${c.uarch?.name ?? ''}`.toLowerCase(),
  meta: c => [c.uarch?.name, c.cores != null ? `${c.cores}Ç / ${c.threads}T` : null, c.tdp != null ? `${c.tdp} W` : null].filter(Boolean).join(' · '),
  placeholder: 'Model ara — örn. 7800X3D, i5-12400F',
  specs,
  specNote: 'frekans farklı mikromimariler arasında birebir kıyaslanamaz; asıl ölçü endeks',
  columns,
  filters,
  groups: CPU_GROUPS,
  examples: [
    ['Ryzen 7 7800X3D', 'Core i9-14900K'],
    ['Ryzen 5 5600', 'Core i5-12400F', 'Ryzen 5 7600'],
    ['Ryzen 7 9800X3D', 'Core Ultra 9 285K'],
  ],
}
