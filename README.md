# PC Parts

İşlemci ve ekran kartlarını yan yana karşılaştıran, tamamen Türkçe bir donanım karşılaştırma sitesi. 540 işlemci ve 444 ekran kartının teknik özelliklerini tek yerde toplar; her parçaya teknik özelliklerinden hesaplanan, yöntemi açık bir **tahmini performans endeksi** verir.

## Özellikler

- **Karşılaştırma:** aynı türden en fazla 5 parça yan yana; her satırda en iyi / en kötü değer işaretli, seçilen baz parçaya göre farklar yüzde olarak.
- **Sıralama:** endekse ya da herhangi bir sütuna göre sıralama; üretici, segment, soket, mimari ve VRAM filtreleri, arama. Görünüm adreste saklanır, paylaşılabilir.
- **Parça sayfası:** tüm teknik özellikler, endeksin adım adım hesabı ve sıralamadaki yakın rakipler.
- **Yöntem sayfası:** formüller, bütün katsayılar, kalibrasyon doğruluğu ve modelin sınırları.
- Her bilginin yanında kısa açıklama, açık ve koyu tema, mobil uyumlu ve klavyeyle gezinilebilir arayüz.

## Performans endeksi

Endeks bir **tahmindir**, benchmark değildir. Sabit bir referansa göre ifade edilir: GPU'da **GeForce RTX 4060 = 100**, CPU'da **Ryzen 5 5600 = 100**. Endeksi 150 olan bir parça referanstan yaklaşık %50 daha güçlü tahmin ediliyor demektir.

- **GPU:** `iş hızı = k × FP32^A × (bant genişliği / ıskalama)^B`, `endeks ∝ 1 / (1 / iş hızı + sabit pay)`. Üsler oyun yükünün hesaba ve belleğe bağlı zaman payları, önbellek bant genişliğini etkin olarak büyütür, `k` mimarinin FP32 verimidir.
- **CPU:** üç eksen.
  - Tek çekirdek = IPC × boost frekansı.
  - Çok çekirdek: tüm-çekirdek saati çekirdek başına düşen güçten hesaplanır (P ∝ f³).
  - Oyun = 1 / (çekirdek süresi + bellek bekleme süresi): oyunun çalıştığı çekirdek kümesinin L3'ü ve çekirdek sayısı hesaba katılır.

  Genel endeks üç eksenin ağırlıklı geometrik ortalamasıdır.

Katsayılar bağımsız ölçümlere oturtulur; ölçüme uydurulmuş düzeltme çarpanı kullanılmaz:

| Eksen | Ölçüm sayısı | Ortalama sapma |
|---|---|---|
| GPU | 403 kart | %3,7 |
| CPU tek çekirdek | 200 işlemci | %2,6 |
| CPU çok çekirdek | 200 işlemci | %10,5 |
| CPU oyun | 48 işlemci (+24 oturtma dışı doğrulama: %6,0) | %3,9 |

Ölçümü olmayan mimarilere endeks verilmez; bu parçaların özellikleri tam, endeksleri boştur. Ayrıntı: `/yontem` sayfası ve [`scripts/calibration/README.md`](scripts/calibration/README.md).

## Kurulum

Node.js 20.19+ ya da 22.12+ gerekir (Vite 7).

```bash
npm install
npm run dev        # geliştirme sunucusu
npm run build      # üretim derlemesi -> dist/
npm run preview    # derlemeyi yerelde sun
npm run lint
```

Site tamamen statiktir (backend yok). `dist/` herhangi bir statik barındırmaya konabilir. Uygulama istemci tarafı yönlendirme kullandığı için sunucunun bilinmeyen yolları `index.html`'e yönlendirmesi gerekir.

### Diğer komutlar

| Komut | Ne yapar |
|---|---|
| `npm run sync-counts` | Veri dosyaları değişince başlık ve alt bilgideki parça sayılarını günceller. |
| `npm run calibration` | Endeksi ölçüm hedefleriyle karşılaştırır, en büyük sapmaları listeler. |
| `npm run calibration:fit` | Model katsayılarını hedeflere yeniden oturtur, önerilen değerleri yazar (dosyaları değiştirmez). |

## Veri

- `data/gpu_database.json`, `data/cpu_database.json`: ham teknik özellikler. `src/data/parse.js` birimleri normalize eder (GFLOPS/TFLOPS, GB/s–TB/s, MB/GB).
- `scripts/dataset/scrape.py`: yeni parça çeken Python betiği (`pydoll` ve Chrome gerekir). Kaynak adresi depoda yoktur; `PCPARTS_SOURCE` ortam değişkeniyle ya da `scripts/dataset/kaynak.local.txt` dosyasıyla verilir. Ayrıntı: [`scripts/dataset/README.md`](scripts/dataset/README.md).
- `src/data/cpuData.js` `DATA_FIXES`: kaynak verideki doğrulanmış hatalar, gerekçesiyle.

## Proje yapısı

```
src/
  pages/        Ana sayfa, karşılaştırma, sıralama, parça, yöntem, 404
  components/   Ortak arayüz parçaları (Panel, ScoreBar, Delta, InfoTip…)
  kinds/        Parça türü yapılandırması: karşılaştırma satırları, sütunlar, filtreler
  data/         Veri eşleme, endeks modeli (cpuModel/gpuModel), sıralama, açıklamalar
  state/        Karşılaştırma kümesi ve tema
data/           Ham teknik özellikler (JSON)
scripts/
  calibration/  Ölçüm hedefleri, sapma raporu ve katsayı oturtma
  dataset/      Veri çekici ve parça listeleri
```

- `src/kinds/gpu.js`, `src/kinds/cpu.js`: sayfalar geneldir, tür route seviyesinde enjekte edilir (`src/App.jsx`); GPU sayfası CPU verisini indirmez.
- `src/data/rank.js`: sunucu ve iş istasyonu parçaları (veri merkezi kartları, Xeon, Threadripper, X299) kendi aralarında sıralanır; sıralama sayfasında `?grup=sunucu`.
- Sıralama sayfasının durumu adreste tutulur (`?grup=sunucu&ara=ryzen&socket=AM5&sirala=boostClock&yon=artan`); parça sayfasından geri dönünce aynı görünüm ve kaydırma konumu gelir.
- `src/data/info.js`: her bilginin yanındaki "i" düğmesinin açıklamaları. Yeni bir alan eklenince buraya da yazılmalı.
- `src/state/compare.jsx`: karşılaştırma kümesi (tür başına en fazla 5 parça, sekme ömrü boyunca saklanır).

Tasarım sistemi: [`DESIGN.md`](DESIGN.md). Ürün kararları: [`PRODUCT.md`](PRODUCT.md). Açık işler: [`YAPILACAKLAR.md`](YAPILACAKLAR.md).

## Teknolojiler

React 19, Vite 7, Tailwind CSS 4, React Router 7, Geist yazı tipi.

## Lisans

[MIT](LICENSE)
