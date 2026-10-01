/** Türkçe sayı biçimi. Eksikse null döner; boş hücreyi arayüz çizer. */
export function formatNumber(value, { digits = 1, unit = '', fixed = false } = {}) {
  if (value == null || typeof value !== 'number' || !Number.isFinite(value)) return null
  const s = value.toLocaleString('tr-TR', { maximumFractionDigits: digits, minimumFractionDigits: fixed ? digits : 0 })
  return unit ? `${s}${unit}` : s
}

/** Endeks: 3 anlamlı hane yeter; 100'ün üstünde ondalık gürültüdür. */
export function formatIndex(value) {
  if (value == null) return null
  return value.toLocaleString('tr-TR', { maximumFractionDigits: value >= 100 ? 0 : 1 })
}

/** İki endeks arasındaki fark, yüzde. Baz parçaya göre. */
export function percentDelta(value, base) {
  if (value == null || base == null || base === 0) return null
  return (value / base - 1) * 100
}

/**
 * digits: %10'un altındaki farklarda ondalık hane. Endeks farkı tam sayı kalır
 * (tahmin, ondalık kesinlik iddia etmez); ölçülmüş spesifikasyonda 1 hane anlamlı.
 */
export function formatDelta(delta, digits = 0) {
  if (delta == null) return null
  const abs = Math.abs(delta)
  const d = abs < 10 ? digits : 0
  const shown = Math.round(abs * 10 ** d) / 10 ** d
  if (shown === 0) return '±%0'
  // Türkçede yüzde işareti sayının önünde yazılır.
  return `${delta > 0 ? '+' : '−'}%${shown.toLocaleString('tr-TR', { maximumFractionDigits: d })}`
}

/** "Apr 4th, 2022" ve "Jan 2022" -> "Nis 2022" / "Oca 2022"; "2022" olduğu gibi. */
const MONTHS = { Jan: 'Oca', Feb: 'Şub', Mar: 'Mar', Apr: 'Nis', May: 'May', Jun: 'Haz', Jul: 'Tem', Aug: 'Ağu', Sep: 'Eyl', Oct: 'Eki', Nov: 'Kas', Dec: 'Ara' }
export function formatRelease(str) {
  if (!str) return null
  const s = String(str)
  if (/never released/i.test(s)) return 'Piyasaya çıkmadı'
  const m = s.match(/([A-Z][a-z]{2})[a-z]*\s+(?:\d{1,2}(?:st|nd|rd|th)?,\s*)?(\d{4})/)
  if (m && MONTHS[m[1]]) return `${MONTHS[m[1]]} ${m[2]}`
  const y = s.match(/(19|20)\d{2}/)
  return y ? y[0] : null
}

/**
 * Arama anahtarı: Türkçe klavyeden gelen "İ" / "ı" "i" sayılır ("İ5-12400F"), boşluk ve tire
 * yok sayılır; "rtx4070", "RTX 4070" ve "rtx-4070" aynı parçayı bulur.
 */
export function searchKey(str) {
  return String(str ?? '')
    .replace(/[İı]/g, 'i')
    .toLowerCase()
    .replace(/[\s_-]+/g, '')
}

/** Sorgunun her kelimesi (searchKey ile) anahtarın içinde geçiyor mu. Boş sorgu her şeyi kabul eder. */
export function queryTokens(query) {
  return String(query ?? '')
    .trim()
    .split(/\s+/)
    .map(searchKey)
    .filter(Boolean)
}

/** Veritabanındaki çok satırlı serbest metin: "Gen 4, 20 Lanes\n(CPU only)" */
export function cleanText(str) {
  if (str == null || str === '' || str === 'N/A') return null
  return String(str).replace(/\s*\n\s*/g, ' · ')
}
