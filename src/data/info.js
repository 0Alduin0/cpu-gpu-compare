/**
 * Her bilginin yanındaki "i" düğmesinin açıklamaları: ne olduğu, ne işe yaradığı.
 * Anahtar ham verideki alan adı ("L1 Cache") ya da hesaplanan alanın adı
 * ("perfIndex"). Aynı alan türe göre farklı anlama gelebilir (CPU'da "Base Clock"
 * referans saatidir), bu yüzden önce türe özel tabloya bakılır.
 */
const COMMON = {
  'Architecture': 'Yonganın tasarım nesli. Aynı sayıda birimden nesiller arasında farklı performans çıkar; endeks bu farkı mimari katsayısıyla hesaba katar.',
  'Foundry': 'Yongayı üreten fabrika (TSMC, Samsung, Intel). Üretim teknolojisi verimi ve güç tüketimini etkiler.',
  'Process Size': 'Üretim sürecinin adı (nm). Daha küçük süreç genelde aynı güçte daha çok transistör ve daha düşük tüketim demektir; firmalar arasında rakamlar birebir kıyaslanamaz.',
  'Transistors': 'Yongadaki transistör sayısı. Yonganın karmaşıklığını ve kabaca kapasitesini gösterir.',
  'Density': 'Milimetrekare başına transistör. Üretim sürecinin ne kadar sıkı kullanıldığını gösterir.',
  'Die Size': 'Silikon yonganın alanı. Büyük yonga daha çok birim taşır ama daha pahalı üretilir.',
  'Release Date': 'Parçanın piyasaya çıktığı tarih.',
  'Launch Price': 'Çıkış günündeki önerilen liste fiyatı (ABD doları, vergisiz). Bugünkü piyasa fiyatı değildir.',
  'Market': 'Hedef segment: masaüstü, dizüstü ya da sunucu / iş istasyonu.',
  segment: 'Parçanın sınıfı: masaüstü, dizüstü, tümleşik, iş istasyonu, sunucu ya da konsol.',
  perfPerWatt: '100 W TDP başına endeks puanı; verimlilik ölçüsü. Yüksek olan aynı güçle daha çok iş çıkarır.',
  releaseYear: 'Piyasaya çıkış yılı.',
}

const GPU = {
  perfIndex: 'Teknik özelliklerden hesaplanan tahmini oyun performansı. GeForce RTX 4060 = 100; 150, yaklaşık %50 daha güçlü demektir. Benchmark değil, tahmindir.',
  perfPerDollar: 'Çıkış fiyatının 100 doları başına endeks puanı. Güncel fiyat değil, çıkış fiyatı kullanılır.',
  'GPU Name': 'Kartın kullandığı grafik yongasının kod adı (ör. AD107). Aynı yongayı kullanan kartlar aynı temel yapıyı paylaşır.',
  'GPU Variant': 'Yonganın bu kartta kullanılan sürümü ve parça kodu; aynı yongada kaç birimin açık olduğunu ayırt eder.',
  'Bus Interface': 'Kartın anakarta bağlandığı PCIe sürümü ve hat sayısı. x8 ya da x4 kartlar eski PCIe 3.0 yuvasında biraz performans kaybedebilir.',
  'Base Clock': 'Yük altında garanti edilen en düşük çekirdek saati.',
  'GPU Clock': 'Çekirdek saati. Eski kartlarda ve konsollarda ayrı temel / boost saati yoktur.',
  'Shader Clock': "Eski NVIDIA kartlarında shader'ların çalıştığı ayrı saat (çekirdek saatinin iki katı).",
  'Game Clock': "AMD'nin oyunlarda tipik olarak tutulduğunu söylediği saat; temel ile boost saati arasındadır.",
  'Boost Clock': 'Güç ve sıcaklık izin verdikçe çıkılan tipik en yüksek çekirdek saati. Aynı mimaride yüksek saat daha fazla performans demektir.',
  'Memory Clock': 'Bellek yongalarının saati ve efektif veri hızı (Gbps). Veri yolu genişliğiyle çarpılınca bant genişliğini verir.',
  memoryRate: 'Bellek yongalarının pin başına efektif veri hızı. Veri yolu genişliğiyle çarpılınca bant genişliğini verir.',
  'Memory Size': 'Kartın kendi belleği (VRAM). Yüksek çözünürlük ve doku ayarları için yeterli VRAM gerekir; az kalırsa takılma ve bulanık dokular görülür.',
  'Memory Type': 'Bellek teknolojisi (GDDR6, GDDR6X, GDDR7, HBM). Yeni nesil daha yüksek veri hızı sunar.',
  'Memory Bus': 'Bellekle yonga arasındaki veri yolunun genişliği (bit). Geniş yol, aynı bellek hızında daha fazla bant genişliği demektir.',
  'Bandwidth': 'Saniyede bellekten okunup yazılabilen veri miktarı. Yüksek çözünürlükte performansı belirleyen ana etkenlerden; endeksin girdisidir.',
  'Shading Units': 'Paralel hesap yapan çekirdek sayısı (NVIDIA\'da CUDA, AMD\'de stream işlemcisi). Aynı mimaride çok olan daha güçlüdür; farklı mimariler arasında birebir kıyaslanamaz.',
  'TMUs': 'Doku birimleri: yüzeylere doku kaplar. Doku doldurma hızını belirler.',
  'ROPs': 'Raster çıkış birimleri: son pikselleri ekrana yazar, kenar yumuşatma yapar. Yüksek çözünürlükte önem kazanır.',
  'Compute Units': "AMD'de CU, Intel'de Xe çekirdeği: shader'ların gruplandığı blok. Her blok sabit sayıda shader içerir.",
  'Tensor Cores': 'Yapay zekâ ve matris hesaplarına özel çekirdekler (AMD\'de matris çekirdeği). DLSS / FSR 4 gibi yapay zekâ ölçeklemede kullanılır; endekse girmez.',
  'Matrix Cores': "Yapay zekâ ve matris hesaplarına özel çekirdekler (NVIDIA'da tensor çekirdeği). Yapay zekâ ölçekleme ve iş yüklerinde kullanılır; endekse girmez.",
  'RT Cores': 'Işın izlemeyi hızlandıran özel birimler. Işın izlemeli oyunlarda performansı belirler; endekse girmez.',
  'L0 Cache': 'Shader dizisine en yakın, en küçük ve en hızlı önbellek (AMD RDNA). Değer dizi başınadır.',
  'L1 Cache': 'Her hesaplama bloğunun (SM / CU) kendi önbelleği; sık kullanılan veriyi belleğe gitmeden sağlar. Değer blok başınadır, mimariler arasında birebir kıyaslanamaz.',
  'L2 Cache': 'Bütün yonganın paylaştığı önbellek. Büyük L2 bellek trafiğini azaltır; yeni kartlarda dar veri yolunu telafi etmek için büyütüldü.',
  'L3 Cache': "AMD'nin Infinity Cache'i: büyük, yonga içi son seviye önbellek. Dar veri yoluna rağmen yüksek efektif bant genişliği sağlar.",
  'Pixel Rate': 'Saniyede çizilebilen piksel (ROP × saat). Teorik üst sınırdır.',
  'Texture Rate': 'Saniyede işlenebilen doku öğesi (TMU × saat). Teorik üst sınırdır.',
  'FP16 (half)': 'Yarım hassasiyetli (16 bit) teorik hesap gücü. Yapay zekâ ve bazı efektlerde kullanılır; parantezdeki oran FP32\'ye göredir.',
  'FP32 (float)': 'Tek hassasiyetli (32 bit) teorik hesap gücü; oyunların asıl kullandığı ölçü. Endeksin ana girdisi, ama mimariler arasında birebir kıyaslanamaz.',
  'FP64 (double)': 'Çift hassasiyetli (64 bit) hesap gücü. Bilimsel hesaplamada önemli, oyunlarda kullanılmaz.',
  'Slot Width': 'Kasada kapladığı genişleme yuvası sayısı. Küçük kasalarda ve yan yana takılan kartlarda önemlidir.',
  'TDP': 'Kartın tasarlandığı tipik güç tüketimi. Güç kaynağı ve kasa soğutması seçimini belirler.',
  'Suggested PSU': 'Üreticinin bu kart için önerdiği en düşük güç kaynağı gücü; sistemin geri kalanını da hesaba katar.',
  'Outputs': 'Monitör bağlantıları. Yüksek çözünürlük ve yenileme hızı için HDMI 2.1 ya da yeni DisplayPort gerekir.',
  'Power Connectors': 'Kartın güç kaynağından istediği ek güç kabloları (8-pin, 16-pin 12V-2x6). Güç kaynağınızda bu konnektörler olmalı.',
  'DirectX': 'Desteklenen DirectX sürümü. 12 Ultimate; ışın izleme, mesh shader gibi yeni oyun özelliklerini kapsar.',
  'OpenGL': 'Desteklenen OpenGL sürümü; eski oyunlar ve bazı profesyonel programlar kullanır.',
  'OpenCL': 'Desteklenen OpenCL sürümü; genel amaçlı hesaplama yapan programlar (render, video) kullanır.',
  'Vulkan': 'Desteklenen Vulkan sürümü; birçok yeni oyun ve Linux / Steam Deck oyunları kullanır.',
  'Shader Model': 'Desteklenen shader programlama modeli. Yeni oyunlar belirli bir en düşük sürüm isteyebilir.',
}

const CPU = {
  perfIndex: 'Tek çekirdek, çok çekirdek ve oyun endekslerinin ağırlıklı ortalaması (%30 / %30 / %40). Ryzen 5 5600 = 100. Benchmark değil, tahmindir.',
  gamingIndex: 'Tahmini oyun performansı (işlemcinin darboğaz olduğu 720p koşulları). Kare süresinden hesaplanır: çekirdeğin hesaplama süresi (IPC, frekans, çekirdek sayısı) ile önbellekte bulunamayan verinin bellekten gelme süresi (L3 boyutu).',
  singleIndex: 'Tahmini tek çekirdek performansı: saat başına iş (IPC) × boost frekansı. Günlük kullanımda ve oyunlarda belirleyicidir.',
  multiIndex: 'Tahmini çok çekirdek performansı (Cinebench R23\'e oturtuldu). Render, derleme, video kodlama gibi işlerde belirleyicidir.',
  perfPerWatt: '100 W TDP başına genel endeks puanı; verimlilik ölçüsü.',
  uarch: 'Çekirdek tasarımı (Zen 4, Raptor Cove…). Saat başına yapılan işi (IPC) belirler.',
  series: 'Ürün serisi (Ryzen 7, Core i5…).',
  'Socket': 'İşlemcinin takıldığı anakart yuvası. Anakartla aynı soket olmalı; ileride yükseltme seçeneklerini de belirler.',
  'Codename': 'İşlemci ailesinin kod adı (Raptor Lake, Granite Ridge…).',
  'Generation': 'Ürün serisi ve mikromimari nesli.',
  'TDP': 'Üreticinin belirttiği taban güç. Masaüstünde yük altında genelde daha fazlası çekilir; soğutucu seçimini belirler.',
  'Frequency': 'Temel frekans: bütün çekirdekler yükteyken garanti edilen saat.',
  'Turbo Clock': 'Bir ya da birkaç çekirdeğin çıkabildiği en yüksek saat. Tek çekirdek performansını belirleyen ana etkenlerden.',
  'Boost Clock': 'Bir ya da birkaç çekirdeğin çıkabildiği en yüksek saat.',
  'Base Clock': 'Referans saat (BCLK). Çarpanla çarpılınca çekirdek frekansını verir; neredeyse her zaman 100 MHz.',
  'Multiplier': 'Çarpan: çekirdek frekansı = referans saat (BCLK) × çarpan.',
  'Multiplier Unlocked': 'Açıksa (Intel K, AMD Ryzen) çarpan yükseltilerek hız aşırtma yapılabilir; uygun anakart gerekir.',
  '# of Cores': 'Fiziksel çekirdek sayısı. Çok çekirdekli işlerde (render, derleme) performansı belirler.',
  '# of Threads': 'Aynı anda yürütülebilen iş parçacığı. SMT / Hyper-Threading çekirdek başına ikinci bir iş parçacığı ekler.',
  'Cache L1': 'Çekirdeğin en küçük ve en hızlı önbelleği; değer çekirdek başınadır.',
  'Cache L2': 'Çekirdek başına (Intel E-çekirdeklerde modül başına) orta seviye önbellek.',
  'Cache L3': 'Çekirdeklerin paylaştığı büyük önbellek. Oyunlarda önemli: X3D işlemcilerin farkı büyük L3\'ten gelir.',
  'Memory Support': 'Desteklenen bellek tipi (DDR4, DDR5). Anakart ve RAM bununla uyumlu olmalı.',
  'Rated Speed': 'Resmî olarak desteklenen bellek hızı. XMP / EXPO profiliyle daha hızlı bellek çoğu zaman çalışır.',
  'Memory Bus': 'Bellek kanalı sayısı. Çift kanal için iki (ya da dört) RAM modülü takılmalı; tek kanal belirgin performans kaybettirir.',
  'Memory Bandwidth': 'Resmî bellek hızı ve kanal sayısından hesaplanan teorik bellek bant genişliği.',
  'Memory Capacity': 'Desteklenen en yüksek bellek miktarı.',
  'ECC Memory': 'Hata düzelten (ECC) bellek desteği. Sunucu ve iş istasyonlarında veri bütünlüğü için önemlidir; anakart da desteklemeli.',
  'PCI-Express': 'İşlemcinin doğrudan sağladığı PCIe sürümü ve hat sayısı; ekran kartı ve NVMe SSD\'ler bu hatları kullanır.',
  'Integrated Graphics': 'İşlemcideki tümleşik grafik birimi. Ekran kartı olmadan görüntü verir; yoksa (F modelleri) ayrı ekran kartı şarttır.',
  'Configurable TDP': 'Dizüstü üreticisinin seçebildiği güç aralığı; aynı işlemci farklı cihazlarda farklı performans verebilir.',
  'Max Power': 'Kısa süreli izin verilen en yüksek güç (PL2 / PPT).',
}

const TABLES = { gpu: GPU, cpu: CPU }

/** Alanın açıklaması; yoksa null (düğme gösterilmez). */
export function infoFor(kind, key) {
  if (!key) return null
  return TABLES[kind]?.[key] ?? COMMON[key] ?? null
}
