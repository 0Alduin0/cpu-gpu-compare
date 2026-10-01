/**
 * GPU performans endeksi (tahmini).
 *
 *   iş hızı  = k_mimari × FP32^A × etkin bant genişliği^B
 *   etkin bant genişliği = bant genişliği / ıskalama(L2 + Infinity Cache)
 *   kare süresi = 1 / iş hızı + FIXED_TIME,   endeks ∝ 1 / kare süresi
 *
 * Biçim literatürden:
 *  - Çarpımsal ölçekleme: Habitat (Yu ve diğ., USENIX ATC 2021) bir işin süresini GPU'lar
 *    arasında (bant genişliği oranı)^γ × (hesap oranı)^(1−γ) ile taşır; γ işin belleğe bağlı
 *    zaman payı (roofline, Williams ve diğ. 2009). A ve B oyun yükünün hesaba ve belleğe bağlı
 *    payları. A + B < 1: büyük GPU'lar oyunun işiyle tam dolmaz (Habitat'taki dalga terimi).
 *  - Etkin bant genişliği: NVIDIA ve AMD'nin kendi kavramı (RTX 4060 Ti'de 32 MB L2 bellek
 *    trafiğini yarıya indirir; RX 6000'de 128 MB Infinity Cache 4K'da %58 isabet). Iskalama
 *    eğrisi CPU'daki gibi çalışma kümesi eğrisi: 1 / (1 + (önbellek / WORKING_SET)^MISS_SLOPE).
 *  - FIXED_TIME: karenin ekran kartından bağımsız kısmı (işlemci, sürücü). Ölçümler en hızlı
 *    işlemcilerle yapılsa da en büyük kartlar bu sınıra yaklaşır.
 *  - k_mimari: nominal TFLOPS'un oyundaki karşılığı mimariden mimariye farklı (Ampere ve sonrası
 *    çift FP32 sayımı gibi). Ada = 1.
 *
 * Tümleşik GPU'lar için ayrı çarpan yok; Infinity Cache'i olmayan RDNA tümleşiklerinin farkı
 * etkin bant genişliğinden gelir. Verideki TDP işlemci paketinin, kullanılmaz.
 *
 * Kalibrasyon (2026-10-01), 403 GPU (2006–2026); ortalama sapma ≈ %3,7, medyan ≈ %2,7
 * (yeniden oturtmak için: npm run calibration:fit -- gpu A B WORKING_SET MISS_SLOPE FIXED_TIME):
 *  - Ayrı kartlar: kaynak GPU veritabanının göreli performans değerleri.
 *    Ekran çıkışı olmayan sunucu kartları (T4, L4, A10, V100, P100, P40) dahil.
 *    Çift GPU'lu kartlar oturtma dışı: ölçüm SLI/CrossFire'lı, endeks tek GPU'nun.
 *  - Tümleşik GPU'lar: bağımsız 3DMark Time Spy grafik ortalamaları, göreli
 *    performans ölçeğine çevrilerek (ortak 134 kartla oturtulan üstel ilişki).
 *    Intel'de ×0,81: oyun ölçümleri Arc kartlarını Time Spy'ın
 *    gösterdiğinden bu kadar düşük buluyor (A310, A380, A350M, A370M, A550M).
 */
export const GPU_MODEL = {
  A: 0.58, // oyun yükünün hesaba bağlı payı (FP32 esnekliği)
  B: 0.27, // belleğe bağlı payı (etkin bant genişliği esnekliği)
  WORKING_SET: 17, // MB; önbellek bu boyuttayken bellek trafiğinin yarısı önbellekten karşılanır
  MISS_SLOPE: 0.54,
  FIXED_TIME: 0.0035, // kare başına ekran kartından bağımsız süre (iş hızıyla aynı birimde; RTX 4060'ta karenin ~%9'u)
}

export const REFERENCE_GPU_NAME = 'GeForce RTX 4060'

/** Mimari ailesi → nominal FP32'nin oyundaki verimi, Ada = 1 (endeks yine RTX 4060 = 100'e bölünür). */
export const GPU_ARCH = {
  blackwell: { label: 'Blackwell', k: 0.975 },
  ada: { label: 'Ada Lovelace', k: 1 },
  ampere: { label: 'Ampere', k: 0.948 },
  turing: { label: 'Turing', k: 1.148 },
  // GV100 bir hesaplama çipi: FLOPS ve HBM2 bant genişliği oyuna Turing kadar yansımıyor.
  volta: { label: 'Volta', k: 0.988 },
  pascal: { label: 'Pascal', k: 1.026 },
  maxwell: { label: 'Maxwell', k: 0.975 },
  kepler: { label: 'Kepler', k: 0.799 },
  fermi: { label: 'Fermi', k: 0.867 },
  // G80/G92 (8800 GT…) ve GT200/GT218 (GTX 280, GeForce 210)
  tesla: { label: 'Tesla', k: 0.936 },
  rdna4: { label: 'RDNA 4', k: 0.93 },
  rdna3: { label: 'RDNA 3', k: 0.7 },
  rdna2: { label: 'RDNA 2', k: 0.982 },
  rdna1: { label: 'RDNA 1', k: 0.985 },
  gcn5: { label: 'GCN 5 (Vega)', k: 0.749 },
  gcn4: { label: 'GCN 4 (Polaris)', k: 0.821 },
  gcn3: { label: 'GCN 3 (Tonga, Fiji)', k: 0.728 },
  gcn2: { label: 'GCN 2 (Hawaii, Bonaire)', k: 0.736 },
  gcn1: { label: 'GCN 1 (Tahiti, Pitcairn)', k: 0.722 },
  terascale3: { label: 'TeraScale 3 (Cayman)', k: 0.626 },
  terascale2: { label: 'TeraScale 2 (Evergreen)', k: 0.569 },
  terascale1: { label: 'TeraScale (RV770)', k: 0.554 },
  xe2: { label: 'Xe2 (Battlemage)', k: 0.936 },
  xe: { label: 'Xe (Alchemist)', k: 0.756 },
  // Yalnızca tümleşik Intel mimarileri.
  xelp: { label: 'Xe-LP (Iris Xe)', k: 0.763 },
  // Tek ölçüm: Iris Plus G7 (Time Spy, 23 cihaz).
  gen11: { label: 'Gen 11 (Ice Lake)', k: 0.662 },
  // UHD 610, 620, 630 (Time Spy); Skylake'in Gen 9'u da bu aileden.
  gen9: { label: 'Gen 9 / 9.5 (Core)', k: 0.719 },
  // Gemini Lake'teki Gen 9.5 (Pentium Silver, Celeron): 6–10 W paylaşımlı güç bütçesi.
  gen9lp: { label: 'Gen 9.5 (Gemini Lake)', k: 0.527 },
}
