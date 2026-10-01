/**
 * Ortak ayristirma yardimcilari.
 * Kaynak veri serbest metin oldugu icin birim (GFLOPS/TFLOPS, MB/GB)
 * her zaman ayni degil; burasi birimi de dikkate alarak normalize eder.
 */

/** Metinden ilk sayiyi cikarir. "1,388.8 GFLOPS" -> 1388.8 */
export function parseNum(str) {
  if (str == null || str === '') return null
  const s = String(str).replace(/,/g, '')
  const m = s.match(/(-?\d+\.?\d*)/)
  return m ? parseFloat(m[1]) : null
}

/**
 * FP32 degerini her zaman TFLOPS olarak dondurur.
 * Veritabaninda eski kartlar GFLOPS ile yazili (orn. GTX 750 Ti "1,388.8 GFLOPS").
 * Birim okunmazsa sayi 1000'den buyukse GFLOPS kabul edilir.
 */
export function parseTflops(str) {
  if (!str) return null
  const s = String(str)
  const n = parseNum(s)
  if (n == null) return null
  if (/TFLOPS/i.test(s)) return n
  if (/GFLOPS/i.test(s)) return n / 1000
  if (/MFLOPS/i.test(s)) return n / 1000000
  return n > 1000 ? n / 1000 : n
}

/**
 * Bant genisligini her zaman GB/s olarak dondurur.
 * Ust segment kartlar TB/s ile yazili (orn. RTX 4090 "1.01 TB/s"); birim
 * dikkate alinmazsa bu kartlar 1000 kat dusuk gorunur.
 */
export function parseBandwidthGbs(str) {
  if (!str) return null
  const s = String(str)
  const n = parseNum(s)
  if (n == null) return null
  if (/TB\/s/i.test(s)) return Math.round(n * 1000 * 10) / 10
  if (/MB\/s/i.test(s)) return Math.round((n / 1000) * 10) / 10
  return n
}

/** Bellek boyutunu MB olarak dondurur. */
export function parseMemorySizeMb(str) {
  if (!str) return null
  const s = String(str)
  const gb = s.match(/(\d+\.?\d*)\s*GB/i)
  if (gb) return Math.round(parseFloat(gb[1]) * 1024)
  const mb = s.match(/(\d+\.?\d*)\s*MB/i)
  if (mb) return Math.round(parseFloat(mb[1]))
  return null
}

/**
 * Onbellek boyutunu MB olarak dondurur. "32 MB (shared)" -> 32, "512 KB (per core)" -> 0.5.
 * Eski GPU'larin L2'si KB ile yazili ("1536 KB"); birim okunmazsa 1024 kat buyuk gorunur.
 */
export function parseCacheMb(str) {
  if (!str) return null
  const s = String(str)
  const n = parseNum(s)
  if (n == null) return null
  // Yuvarlanmaz: 32 KB = 0,03125 MB; iki haneye yuvarlanınca geri çevrilen değer "31 KB" oluyordu.
  if (/KB/i.test(s)) return n / 1024
  if (/GB/i.test(s)) return n * 1024
  return n
}

/** Bellegin efektif veri hizi, Gbps: "2518 MHz\n20.1 Gbps effective" -> 20.1, "800 Mbps effective" -> 0.8 */
export function parseMemoryRateGbps(str) {
  if (!str) return null
  const s = String(str)
  const gbps = s.match(/([\d.]+)\s*Gbps/i)
  if (gbps) return parseFloat(gbps[1])
  const mbps = s.match(/([\d.]+)\s*Mbps/i)
  return mbps ? parseFloat(mbps[1]) / 1000 : null
}

/** Saat hizini MHz olarak dondurur (GHz yazilmissa cevirir). */
export function parseClockMhz(str) {
  if (!str) return null
  const s = String(str)
  const n = parseNum(s)
  if (n == null) return null
  if (/GHz/i.test(s)) return Math.round(n * 1000)
  return Math.round(n)
}

/** Saat hizini GHz olarak dondurur (MHz yazilmissa cevirir). */
export function parseClockGhz(str) {
  if (!str) return null
  const s = String(str)
  const n = parseNum(s)
  if (n == null) return null
  if (/MHz/i.test(s)) return Math.round((n / 1000) * 100) / 100
  return Math.round(n * 100) / 100
}

/** Tam sayi alanlari icin (cekirdek, shader, ROP...). Yoksa null. */
export function parseInt10(str) {
  if (str == null || str === '') return null
  const n = parseInt(String(str).replace(/,/g, ''), 10)
  return Number.isNaN(n) ? null : n
}

/** Yuvarlanmis sayi (TDP, PSU, fiyat, bant genisligi...). */
export function parseRounded(str) {
  const n = parseNum(str)
  return n == null ? null : Math.round(n)
}

/** "Apr 4th, 2022" -> 2022 */
export function parseYear(str) {
  if (!str) return null
  const m = String(str).match(/(19|20)\d{2}/)
  return m ? parseInt(m[0], 10) : null
}

/**
 * Sayiyi Turkce bicimde gosterir; null ise tire.
 * Birim yalnizca sayisal degerlere eklenir - metin alanlarina ("GDDR6", "AMD")
 * birim eklemek yanlis bilgi uretir.
 */
export function fmt(value, unit = '') {
  if (value === null || value === undefined || value === '') return '–'
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return '–'
    return `${value.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}${unit}`
  }
  if (typeof value === 'boolean') return value ? 'Var' : 'Yok'
  return String(value)
}
