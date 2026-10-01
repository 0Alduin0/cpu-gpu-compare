/**
 * CPU performans endeksleri (tahmini). Üç eksen, hepsi REFERENCE_CPU = 100:
 *
 *  - Tek çekirdek:  IPC(mikromimari) × boost saati
 *  - Çok çekirdek:  Σ çekirdek × IPC × tüm-çekirdek saati × SMT
 *                   (P ve E/kompakt çekirdekler ayrı; tüm-çekirdek saati çekirdek
 *                   başına düşen güçten, dinamik güç yasasıyla)
 *  - Oyun:          1 / kare süresi; kare süresi = çekirdek süresi + bellek bekleme süresi
 *
 * Genel endeks üçünün ağırlıklı geometrik ortalamasıdır (oyun %40, diğerleri %30).
 * Ölçüme uydurulmuş düzeltme çarpanı yok: her sabit ya bir ölçüm ya da bir mekanizmanın
 * fiziksel bir büyüklüğü (aşağıda yanlarında yazılı).
 *
 * Kalibrasyon (2026-10-01; yeniden oturtmak için npm run calibration:fit):
 *  - IPC ve çok çekirdek: 200 işlemcinin Cinebench R23 sonuçları (bağımsız ölçümlerin
 *    ortalamaları; 32–96 çekirdekli üç Threadripper PRO dahil). Sapma: tek çekirdek
 *    ≈ %3, çok çekirdek ≈ %10; çok çekirdekteki fark çoğunlukla dizüstü/OEM güç ayarından.
 *  - Oyun: bağımsız 720p oyun testleri (48 işlemci). Sapma ≈ %4. Oturtmaya girmeyen
 *    ikinci bir test setinde (Ryzen 5 5600 incelemesi, 24 işlemci) ≈ %6.
 */
export const CPU_MODEL = {
  SMT_GAIN: 0.26, // SMT/HT'nin çekirdek başına ek verimi (Cinebench R23)
  // Çok çekirdek: dinamik güç P = C·V²·f, gerilim saatle orantılı (V ∝ f) → P ∝ f³.
  //   tüm-çekirdek saati = boost × min(1, (çekirdek başına güç / BOOST_CORE_POWER)^(1/3)),
  //   en az temel frekans. Sürekli güç: masaüstünde TDP × DESKTOP_POWER, dizüstünde
  //   TDP × MOBILE_POWER, Threadripper'da TDP (PPT = TDP).
  DESKTOP_POWER: 1.35, // AMD PPT = 1,35 × TDP (AMD spesifikasyonu); Intel masaüstüne oturtunca da 1,36
  MOBILE_POWER: 2, // dizüstü üreticilerinin R23 boyunca tuttuğu güç / TDP (oturtuldu; 15 W'lık çipler 25–30 W'ta)
  BOOST_CORE_POWER: 13, // W; bir çekirdeğin tüm çekirdekler yüklüyken boost saatini tutmak için çektiği güç (oturtuldu)
  COMPACT_CLOCK: 1, // AMD Zen 4c/5c: aynı IPC; güç sınırlı tüm-çekirdek yükte saat farkı kalmıyor
  // Oyun: kare süresi = çekirdek süresi + bellek bekleme süresi.
  //   çekirdek süresi = 1 / (IPC × saat)
  //   bellek süresi   = MEM_TIME × ıskalama,  ıskalama = 1 / (1 + (L3 / WORKING_SET)^MISS_SLOPE)
  // Iskalama eğrisi, çalışma kümesi WORKING_SET MB olan bir yükün L3'te bulamadığı veri payı.
  MEM_TIME: 0.072, // L3'ü hiç tutmayan bir işlemcinin bellek bekleme süresi (çekirdek süresiyle aynı birimde)
  WORKING_SET: 40, // MB
  MISS_SLOPE: 2.25,
  // Oyunun bir karedeki toplam işi, ana iş parçacığının işi cinsinden. Eşzamanlı şerit
  // (P-çekirdek × SMT + E-çekirdek × göreli hız) bundan azsa iş kuyruğa girer:
  // çekirdek süresi × GAME_THREADS / şerit (iş–yol sınırı, Brent).
  GAME_THREADS: 5.5,
  // Çift CCD'li X3D'de oyunun işinin V-Cache'siz CCD'de kalan payı (çekirdek park etme
  // kusursuz değil). Aynı incelemede, aynı oyunlarla (9950X3D2 incelemesi, 720p):
  // 9950X3D2 (iki CCD'de V-Cache) 100, 9950X3D 95,0, 9950X 85,5 →
  // pay = (1/95 − 1/100) / (1/85,5 − 1/100) = 0,31. Modelden bağımsız bir ölçüm.
  PLAIN_CCD_SHARE: 0.31,
  WEIGHTS: { single: 0.3, multi: 0.3, gaming: 0.4 },
}

export const REFERENCE_CPU_NAME = 'Ryzen 5 5600'

/**
 * [kod adı deseni, mikromimari, IPC] — ilk eşleşen kazanır. IPC = Cinebench R23
 * tek çekirdek / boost GHz, Zen 3 = 1,00. Core 2, Ivy Bridge, Haswell ve
 * Piledriver'da ölçüm yok; bilinen nesil farklarıyla komşularından türetildi.
 */
export const CPU_UARCH = [
  [/Wolfdale/i, 'Core 2', 0.44],
  [/Ivy Bridge/i, 'Ivy Bridge', 0.66],
  [/Haswell|Crystalwell/i, 'Haswell', 0.72],
  [/Skylake|Kaby Lake|Coffee Lake|Comet Lake|Whiskey Lake|Cascade Lake/i, 'Skylake', 0.78],
  [/Ice Lake/i, 'Sunny Cove', 0.91],
  [/Rocket Lake/i, 'Cypress Cove', 0.95],
  [/Tiger Lake/i, 'Willow Cove', 0.97],
  [/Gemini Lake/i, 'Goldmont Plus', 0.5],
  [/Jasper Lake|Elkhart Lake/i, 'Tremont', 0.56],
  [/Vishera/i, 'Piledriver', 0.43],
  [/Summit Ridge|Raven Ridge|Dali/i, 'Zen', 0.75],
  [/^Zen$|Pinnacle Ridge|Picasso|Colfax/i, 'Zen+', 0.76],
  [/Matisse|Renoir|Lucienne|Mendocino|Castle Peak/i, 'Zen 2', 0.89],
  [/Rembrandt/i, 'Zen 3+', 0.98],
  [/Vermeer|Cezanne|Barcelo/i, 'Zen 3', 1.0],
  [/Raphael|Phoenix|Hawk Point|Dragon Range|Storm Peak/i, 'Zen 4', 1.08],
  [/Granite Ridge|Strix|Krackan|Gorgon|Shimada|Fire Range/i, 'Zen 5', 1.22],
  // Alder Lake-N yalnızca E-çekirdekli; Gracemont satırına düşer.
  [/Alder Lake(?!-N)/i, 'Golden Cove', 1.15],
  [/Raptor Lake/i, 'Raptor Cove', 1.15],
  [/Meteor Lake/i, 'Redwood Cove', 1.1],
  [/Arrow Lake|Lunar Lake/i, 'Lion Cove', 1.22],
  [/Panther Lake|Wildcat Lake/i, 'Cougar Cove', 1.33],
  [/Twin Lake|Alder Lake-N|Gracemont/i, 'Gracemont', 0.74],
]

/** Hibrit Intel: E-çekirdek [IPC, tüm-çekirdek saatine oran] (Gracemont, Crestmont, Skymont). */
const ECORE = {
  'Golden Cove': [0.74, 0.81],
  'Raptor Cove': [0.74, 0.81],
  'Redwood Cove': [0.79, 0.8],
  'Lion Cove': [1.1, 0.88],
  'Cougar Cove': [1.1, 0.88],
}

/**
 * Çekirdek dağılımı thread sayısından çıkarılamayanlar: kod adı -> { çekirdek: [P, E] }.
 * Intel'de HT'siz hibritler (LP-E çekirdekler E sayılır; burada olmayan HT'siz
 * hibrite endeks verilmez), AMD'de Zen 4c/5c kompakt çekirdekli olanlar.
 */
const CORE_SPLIT = {
  'Arrow Lake-S': { 24: [8, 16], 20: [8, 12], 14: [6, 8], 10: [6, 4] },
  'Arrow Lake-HX': { 24: [8, 16], 20: [8, 12] },
  'Arrow Lake Refresh': { 24: [8, 16], 18: [6, 12] },
  'Arrow Lake-HX Refresh': { 24: [8, 16], 20: [8, 12] },
  'Arrow Lake-H': { 16: [6, 10], 14: [4, 10] },
  'Lunar Lake': { 8: [4, 4] },
  'Panther Lake': { 16: [4, 12] },
  // 2 Cougar Cove + 4 LP-E (Darkmont)
  'Wildcat Lake': { 6: [2, 4] },
  'Strix Point': { 12: [4, 8], 10: [4, 6] },
  'Krackan Point': { 8: [4, 4], 6: [3, 3] },
  // Strix Point (12, 10 çekirdek) ve Krackan Point (8, 6) yenilemesi
  'Gorgon Point': { 12: [4, 8], 10: [4, 6], 8: [4, 4], 6: [3, 3] },
  'Phoenix2': { 6: [2, 4], 4: [1, 3] },
}
/** Kod adı dağılımı belirlemeyenler (Hawk Point'te hem 6 tam hem 2+4 kompakt var). */
const CORE_SPLIT_BY_NAME = {
  'Ryzen 5 220': [2, 4],
}

/**
 * Oyun: bir çekirdek kümesinin (AMD'de CCX) paylaştığı L3, MB. Oyunun iş parçacıkları
 * bir kümede çalışır, diğer kümenin L3'ünü kullanamaz; işlemcinin L3'ü bundan küçükse o.
 * Intel'de ve Piledriver'da L3 tüm çekirdeklerce paylaşılır (sınır yok).
 * Zen/Zen+: 4 çekirdeklik CCX, 8 MB; Zen 2: 16 MB; Zen 3 ve sonrası: 8 çekirdeklik CCD, 32 MB.
 */
const CCX_L3 = { Zen: 8, 'Zen+': 8, 'Zen 2': 16, 'Zen 3': 32, 'Zen 3+': 16, 'Zen 4': 32, 'Zen 5': 32 }
/** Renoir ve Lucienne: iki CCX, her biri 4 MB (veride toplam 8 MB). */
const CCX_L3_BY_CODENAME = { Renoir: 4, Lucienne: 4 }
/** 3D V-Cache'li CCD'nin L3'ü: 32 MB + 64 MB yığın. */
const VCACHE_L3 = 96
/**
 * Çift CCD'li X3D'de V-Cache'li CCD'nin ölçülmüş saati; verideki boost diğer CCD'nin.
 * 7950X3D incelemesinin saat ölçümü: V-Cache'li CCD 1–8 iş parçacığında 5,25 GHz.
 * Burada olmayanlarda boost kullanılır; 9950X3D, 9900X3D ve 7900X3D'de V-Cache'li CCD'nin
 * tek çekirdek saati ölçülmemiş.
 */
const VCACHE_CLOCK = { 'Ryzen 9 7950X3D': 5.25 }

export { ECORE, CORE_SPLIT, CORE_SPLIT_BY_NAME, CCX_L3, CCX_L3_BY_CODENAME, VCACHE_L3, VCACHE_CLOCK }
