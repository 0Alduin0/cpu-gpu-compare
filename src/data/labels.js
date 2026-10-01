/** Ham verideki alan adlarının Türkçe karşılıkları. */
export const FIELD_LABELS = {
  // Ortak
  'Architecture': 'Mimari',
  'Process Size': 'Üretim süreci',
  'Transistors': 'Transistör sayısı',
  'Density': 'Transistör yoğunluğu',
  'Die Size': 'Yonga alanı',
  'Release Date': 'Çıkış tarihi',
  'Launch Price': 'Çıkış fiyatı',
  'Foundry': 'Üretici fabrika',
  'Codename': 'Kod adı',
  'Generation': 'Nesil',
  'Market': 'Segment',
  'TDP': 'TDP',

  // GPU
  'GPU Name': 'GPU çipi',
  'GPU Variant': 'Çip varyantı',
  'Bus Interface': 'Veri yolu arayüzü',
  'Base Clock': 'Temel saat',
  'Game Clock': 'Oyun saati',
  'GPU Clock': 'GPU saati',
  'Shader Clock': 'Shader saati',
  'Boost Clock': 'Boost saati',
  'Memory Clock': 'Bellek saati',
  'Memory Size': 'Bellek boyutu',
  'Memory Type': 'Bellek tipi',
  'Memory Bus': 'Bellek veri yolu',
  'Bandwidth': 'Bant genişliği',
  'Shading Units': 'Shader birimi',
  'TMUs': 'Doku birimi (TMU)',
  'ROPs': 'Raster birimi (ROP)',
  'Compute Units': 'Hesaplama birimi (CU)',
  'Matrix Cores': 'Matris çekirdeği',
  'RT Cores': 'Işın izleme çekirdeği',
  'Tensor Cores': 'Tensor çekirdeği',
  'L0 Cache': 'L0 önbellek',
  'L1 Cache': 'L1 önbellek',
  'L2 Cache': 'L2 önbellek',
  'L3 Cache': 'L3 önbellek (Infinity Cache)',
  'Pixel Rate': 'Piksel doldurma hızı',
  'Texture Rate': 'Doku doldurma hızı',
  'FP16 (half)': 'FP16 (yarım hassasiyet)',
  'FP32 (float)': 'FP32 (tek hassasiyet)',
  'FP64 (double)': 'FP64 (çift hassasiyet)',
  'Slot Width': 'Slot genişliği',
  'Suggested PSU': 'Önerilen güç kaynağı',
  'Outputs': 'Görüntü çıkışları',
  'Power Connectors': 'Güç konnektörleri',
  'DirectX': 'DirectX',
  'OpenGL': 'OpenGL',
  'OpenCL': 'OpenCL',
  'Vulkan': 'Vulkan',
  'Shader Model': 'Shader Model',

  // CPU
  'Socket': 'Soket',
  'Frequency': 'Temel frekans',
  'Turbo Clock': 'Turbo frekans',
  'Multiplier': 'Çarpan',
  'Multiplier Unlocked': 'Çarpan kilidi açık',
  'Memory Support': 'Bellek desteği',
  'Rated Speed': 'Nominal bellek hızı',
  'ECC Memory': 'ECC bellek',
  'PCI-Express': 'PCI-Express',
  '# of Cores': 'Çekirdek sayısı',
  '# of Threads': 'Thread sayısı',
  'Integrated Graphics': 'Tümleşik grafik',
  'Cache L1': 'L1 önbellek',
  'Cache L2': 'L2 önbellek',
  'Cache L3': 'L3 önbellek',
  'Memory Bandwidth': 'Bellek bant genişliği',
  'Configurable TDP': 'Ayarlanabilir TDP',
  'Max Power': 'Azami güç',
  'Memory Capacity': 'Azami bellek',
}

/** Ham değerlerde sık geçen İngilizce ifadelerin çevirisi. */
const VALUE_WORDS = [
  [/\(per core\)/gi, '(çekirdek başına)'],
  [/\(shared\)/gi, '(paylaşımlı)'],
  [/\(CPU only\)/gi, '(yalnızca CPU)'],
  [/\(per module\)/gi, '(modül başına)'],
  [/\(per EU\)/gi, '(EU başına)'],
  [/per WGP\b/gi, 'WGP başına'],
  // Maxwell'de SM'nin adı SMM; "per SM" kuralı "SM başınaM" üretiyordu.
  [/per (SMM?)\b/gi, '$1 başına'],
  [/per CU\b/gi, 'CU başına'],
  [/per Xe-core/gi, 'Xe çekirdeği başına'],
  [/per Array\b/gi, 'shader dizisi başına'],
  [/\bmillion\b/gi, 'milyon'],
  [/effective/gi, 'efektif'],
  [/Dual-channel/gi, 'Çift kanal'],
  [/Quad-channel/gi, 'Dört kanal'],
  [/Octa-channel|Eight-channel/gi, 'Sekiz kanal'],
  [/Single-channel/gi, 'Tek kanal'],
  [/Single-slot/gi, 'Tek slot'],
  [/Dual-slot/gi, 'Çift slot'],
  [/Triple-slot/gi, 'Üç slot'],
  [/Quad-slot/gi, 'Dört slot'],
  [/\bLanes\b/g, 'hat'],
  [/^Yes$/i, 'Evet'],
  [/^No$/i, 'Hayır'],
  [/^None$/i, 'Yok'],
  [/up to /gi, 'en fazla '],
  [/^Desktop$/, 'Masaüstü'],
  [/^Mobile$/, 'Mobil'],
  [/^Server\/Workstation$/, 'Sunucu / İş istasyonu'],
  [/^System Shared$/i, 'Sistem belleği (paylaşımlı)'],
  [/^System Dependent$/i, 'Sistem belleğine bağlı'],
  [/^Portable Device Dependent$/i, 'Cihaza bağlı'],
  [/Motherboard Dependent|Depends on motherboard/gi, 'Anakarta bağlı'],
  [/On certain motherboards \(Chipset feature\)/gi, 'Bazı anakartlarda (yonga seti özelliği)'],
  [/^No outputs$/i, 'Yok (hesaplama kartı)'],
  [/^Not supported$/i, 'Desteklenmiyor'],
  [/^Never Released$/i, 'Piyasaya çıkmadı'],
  // Tümleşik GPU'nun slotu ve veri yolu ("IGP", "Ring Bus"); sunucu kartlarının modül biçimi.
  [/^IGP$/i, 'Tümleşik'],
  [/Ring Bus/gi, 'Halka veri yolu'],
  [/\b(MXM|OAM|SXM\d*) Module\b/g, '$1 modülü'],
]

/**
 * İngilizce sayı biçimini Türkçeye çevirir: binlik virgül → nokta,
 * birimli ondalık nokta → virgül ("1,388.8 GFLOPS" → "1.388,8 GFLOPS").
 * Birimsiz sürüm numaralarına ("PCIe 4.0", "OpenGL 4.6") dokunmaz.
 */
const UNIT = String.raw`(?=\s?(?:GHz|MHz|Gbps|GB\/s|TB\/s|TFLOPS|GFLOPS|GPixel\/s|GTexel\/s|MB|KB|GB|mm²|M \/|W|V|nm|x)(?![A-Za-z0-9]))`
function toTurkishNumbers(s) {
  // Gecici binlik ayraci: metinde gecmeyen bir karakter (NUL).
  const THOUSANDS = '\u0000'
  let out = s
  let prev
  do {
    prev = out
    out = out.replace(/(\d),(\d{3})(?!\d)/g, `$1${THOUSANDS}$2`)
  } while (out !== prev)
  out = out.replace(new RegExp(String.raw`(\d)\.(\d+)` + UNIT, 'g'), '$1,$2')
  return out.split(THOUSANDS).join('.')
}

/** Değeri olmayan alanlar: boş gösterilir. */
const EMPTY_VALUES = /^(N\/A|—|-|unknown)$/i

export function translateValue(str) {
  if (str == null) return null
  // Çok satırlı değerde boş satırlar atılır ("unknown\nDepends on motherboard").
  const lines = String(str)
    .split('\n')
    .filter(line => !EMPTY_VALUES.test(line.trim()))
  if (!lines.length) return null
  let s = toTurkishNumbers(lines.join('\n'))
  for (const [re, tr] of VALUE_WORDS) s = s.replace(re, tr)
  return s
}

/** Aynı alan adının türe göre farklı anlamı: CPU'da "Base Clock" referans saatidir (BCLK). */
const KIND_LABELS = {
  cpu: { 'Base Clock': 'Referans saati (BCLK)', 'Boost Clock': 'Boost frekans', 'Memory Bus': 'Bellek kanalı' },
}

export function labelFor(key, kind) {
  return KIND_LABELS[kind]?.[key] || FIELD_LABELS[key] || key
}

/** Detay sayfasında ham alanların grupları. */
export const GPU_GROUPS = [
  { title: 'Genel', keys: ['GPU Name', 'GPU Variant', 'Architecture', 'Release Date', 'Launch Price', 'Foundry'] },
  { title: 'Yonga', keys: ['Process Size', 'Transistors', 'Density', 'Die Size', 'Compute Units', 'Shading Units', 'TMUs', 'ROPs', 'RT Cores', 'Tensor Cores', 'Matrix Cores'] },
  { title: 'Saat hızları', keys: ['Base Clock', 'GPU Clock', 'Game Clock', 'Boost Clock', 'Shader Clock', 'Memory Clock'] },
  { title: 'Bellek', keys: ['Memory Size', 'Memory Type', 'Memory Bus', 'Bandwidth', 'L0 Cache', 'L1 Cache', 'L2 Cache', 'L3 Cache'] },
  { title: 'Teorik performans', keys: ['Pixel Rate', 'Texture Rate', 'FP16 (half)', 'FP32 (float)', 'FP64 (double)'] },
  { title: 'Güç ve fiziksel', keys: ['TDP', 'Suggested PSU', 'Slot Width', 'Power Connectors', 'Outputs', 'Bus Interface'] },
  { title: 'API desteği', keys: ['DirectX', 'OpenGL', 'OpenCL', 'Vulkan', 'Shader Model'] },
]

export const CPU_GROUPS = [
  { title: 'Genel', keys: ['Socket', 'Codename', 'Generation', 'Market', 'Release Date', 'Foundry', 'Process Size'] },
  { title: 'Çekirdek ve frekans', keys: ['# of Cores', '# of Threads', 'Frequency', 'Turbo Clock', 'Base Clock', 'Multiplier', 'Multiplier Unlocked'] },
  { title: 'Önbellek', keys: ['Cache L1', 'Cache L2', 'Cache L3'] },
  { title: 'Bellek', keys: ['Memory Support', 'Rated Speed', 'Memory Bus', 'Memory Bandwidth', 'Memory Capacity', 'ECC Memory'] },
  { title: 'Güç ve platform', keys: ['TDP', 'Configurable TDP', 'Max Power', 'Integrated Graphics', 'PCI-Express'] },
]
