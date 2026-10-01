# Veri çekici

`scrape.py`, `popular-gpus.txt` / `popular-cpus.txt` listelerindeki parçaları kaynak GPU/CPU veritabanlarından çekip `data/gpu_database.json` ve `data/cpu_database.json` dosyalarına ekler.

Kaynak adresi depoda tutulmaz: `PCPARTS_SOURCE` ortam değişkeni ya da `scripts/dataset/kaynak.local.txt` (tek satır adres, `.gitignore`'da). İkisi de yoksa çekici başlamaz.

## Kullanım

```bash
py -m pip install pydoll-python             # bir kez; Chrome kurulu olmalı

py scripts/dataset/scrape.py                # listelerin tamamı (gpu + cpu)
py scripts/dataset/scrape.py --kind cpu     # tek tür
py scripts/dataset/scrape.py --target 300   # tür başına toplam 300 kayıtta dur
py scripts/dataset/scrape.py --retry        # yalnızca eksikler listesini tekrar dene
py scripts/dataset/scrape.py --dry-run      # sadece isim eşleştirme, dosyaya yazmaz
py scripts/dataset/scrape.py --limit 5      # en fazla 5 yeni kayıt (deneme için)
py scripts/dataset/scrape.py --kind gpu --refresh old   # mevcut kayıtları yenile (aşağıda)

npm run sync-counts                         # her çalıştırmadan sonra
npm run calibration                         # veri değiştiyse endeks sapmasına bak
```

Diğer seçenekler: `--delay MIN MAX` (istekler arası bekleme, varsayılan 3–6 sn), `--headless`, `--profile`.

`--target` varsayılanı 0 (listenin tamamı). Bir üst sınır, listenin sonundaki hâlâ satılan masaüstü parçalarını eski dizüstü çipleri lehine dışarıda bırakıyordu.

### Yenileme (`--refresh old|all`)
Yeni parça eklemek yerine mevcut kayıtları kaynaktan yeniden çeker. `old`: `Foundry` alanı olmayanlar (ilk çekicinin kayıtları), `all`: hepsi. `--only "Ad"` ile tek kayıt. Kimlik ve kayıt sırası korunur, sayfada artık olmayan eski alanlar (`Launch Price` gibi) silinmez. Endeksin kullandığı bir alan değişirse log'a eski → yeni yazılır; sonra `npm run calibration`.

## Dosyalar

| Dosya | Ne işe yarar |
|---|---|
| `popular-gpus.txt`, `popular-cpus.txt` | **Kaynak.** Öncelik sırasına göre parça listesi. İsimler kaynaktaki adla birebir yazılır. |
| `missing-gpus.txt`, `missing-cpus.txt` | Çekilemeyenlerin **raporu** (isim + sebep + tarih). Her çalıştırmada yeniden yazılır; çekilen satır kendiliğinden silinir, liste boşsa dosya silinir. Elle düzenlemeyin; isim düzeltmesi popular listede yapılır. |
| `scrape.py` | Çekici. |
| `kaynak.local.txt` | Kaynak adresi (yerel, depoya girmez). |
| `%LOCALAPPDATA%\pcparts-scraper-profile\` | Chrome profili (bot kontrolü çerezi) ve arama önbelleği (`search-cache-*.json`). Silinirse sadece ilk çalıştırma yavaşlar. |

## Nasıl çalışıyor

### Bot kontrolü
Kaynak site ilk istekte tarayıcıda bir proof-of-work hesaplatıyor; istek sıklığı artarsa sürükle-bırak doğrulamasına yükseliyor. Gerçek bir Chrome ilk adımı kendisi birkaç saniyede geçer; bu yüzden doğrulama çözücü yok. Tarayıcı [pydoll](https://pypi.org/project/pydoll-python/) ile sürülür (WebDriver yok, CDP üzerinden) ve tüm istekler **sayfanın içinden `fetch`** ile yapılır; çerez ve oturum tarayıcıda kalır. Kontrol yeniden istenirse script sayfaya gidip bekler. Sürükle-bırak çıkarsa script durur ve açık Chrome penceresinde elle yapılmasını bekler (10 dk). 3–6 sn aralıkla yüzlerce istekte kontrol yükselmedi.

### İsim → sayfa
- Arama `?q=...&ajax` bir JSON döndürür, içinde HTML tablo vardır. Sayfa başına 100 satır gelir. Sıra: CPU'da yeniden eskiye, GPU'da eskiden yeniye.
- Arama **kelime bazlıdır**: "Ryzen 5 9600" tüm Ryzen 5'leri getirir. Bu yüzden tam ad önce en fazla 4 sayfa aranır, bulunamazsa yalnızca model numarasıyla (`9600`, `i3-10100F`) tekrar aranır.
- Eşleşme her zaman **tam ad** üzerinden yapılır. `X Mobile` yedeği yalnızca tam ad kaynakta yoksa devreye girer (yalnızca mobil hali olan iGPU'lar için; ör. `Iris Xe Graphics G7 96EU`) ve log'a yazılır.
- Her arama ~100 satır döndürdüğü için sonuçlar önbelleğe alınır; isimlerin çoğu önceki aramalardan çözülür.
- Sitenin filtre bağlantıları bilerek gizlenmiş (bot tuzağı); kullanılmaz, yalnızca normal arama.

### Sayfa → kayıt
- GPU sayfaları `section.details > dl > dt/dd`, CPU sayfaları `section.details > table > th/td` yapısında. HTML tarayıcıda `DOMParser` ile ayrıştırılır; `<br>` satır sonu olur (`"2518 MHz\n20.1 Gbps effective"`).
- Sayfa başlığı beklenen isimle eşleşmezse kayıt atlanır.
- Yalnızca `KEEP` listesindeki alanlar saklanır: mevcut kayıtlardaki alanlar + `src/data/labels.js`'deki `GPU_GROUPS` / `CPU_GROUPS`. Listede olmayan her alan detay sayfasında "Diğer" grubuna düşeceği için (`Part#`, `tCaseMax`...) dışarıda bırakılır.
- Normalleştirmeler (uygulama ve mevcut veri eski biçimi bekliyor):
  - `FP16` / `FP32` / `FP64` → `FP16 (half)` / `FP32 (float)` / `FP64 (double)`. Aynı etiket "Matrix Performance" bölümünde de geçtiği için **bölüm başlığıyla** eşlenir; performans endeksi FP32'ye dayanıyor.
  - `RDNA 4` → `RDNA 4.0`, `GCN 5` → `GCN 5.0` (`gpuData.js` içindeki `ARCH_FAMILY` eski adları bekliyor).
  - `18.9 billion` → `18,900 million` (`src/kinds/gpu.js` milyon bekliyor).
- Alt sınır: 2006 çıkış yılı (GPU ve CPU; 2026-10-01'e kadar GPU 2016, CPU 2017). Öncelik tüm zamanların en popüler ve bilinen parçaları; listeler bunu sıra olarak taşır.
- Kimlik: `gpu{n}{nvidia|amd|intel|other}`, n = mevcut en büyük + 1. Üretici, arama satırındaki `vendor-*` sınıfından gelir; eski ATI markalı Radeon'lar `vendor-ati` ile geliyor ve AMD sayılıyor.
- Çıktı biçimi mevcut dosyayla aynı: 4 boşluk girinti, CRLF, `ensure_ascii=False`, sonda satır sonu yok. Her kayıttan sonra dosya yazılır; çalışma yarıda kesilse de kaldığı yerden devam eder.

## Çalıştırma kayıtları

### 2026-09-30

| | Önce | Sonra | Eksik |
|---|---|---|---|
| GPU | 99 | 328 (+229) | 2 |
| CPU | 100 | 355 (+255) | 8 |

- Listelerin tamamı çekildi (`--target 0`). 300'de kesince CPU listesinin sonundaki hâlâ satılan masaüstü işlemciler (i5-13500/14500, i7-14700F, i9-14900F...) dışarıda kalıyor, onların yerine 2017 dizüstü çipleri giriyordu.
- Mevcut verideki 197 alanda bozuk `mm²` (`mm` + U+FFFD) düzeltildi. Eski çekicinin encoding hatasıydı.
- Listelerde kaynağın adlandırmasına uymayan 15 isim düzeltildi (aşağıdaki "Tuzaklar"a bakın).
- Doğrulama: mevcut 10 kayıt yeniden çekilip alan alan karşılaştırıldı. CPU birebir tuttu. GPU'daki farklar kaynağın kendi güncellemeleri (Shader Model 6.9, düzeltilmiş çıkış tarihleri, L2 önbellek).

### 2026-10-01

- `--refresh old`: ilk çekiciden kalan 99 GPU kaydının hepsi yenilendi, ad değişen ya da kaybolan alan yok. Artık her kayıtta `Foundry`, `Tensor Cores`, `L1 Cache` var. Endeksi etkileyen değişiklikler: Radeon 780M boost 2700 → 2900 MHz, Radeon 8060S L3 64 → 32 MB, GT 730 bellek 2 GB → 1 GB.
- Eklenenler: `GeForce MX450 30.5W 10Gbps` (GDDR6'lı tam güç sürümü), `Athlon 3000G (FH)`, Threadripper PRO 7995WX / 3995WX / 3975WX (çok çekirdek kalibrasyonu için).
- Listeden çıkarılanlar: `Radeon Vega 7` (kaynakta yok), `Core i3-10100F` (yok; `i3-10100` aynı çip), `Ryzen 5 5600H` (yok; `5600HS` var). Veri yalnızca kaynaktan; türetilmiş kayıt eklenmedi.
- Eski kartlar ve konsollar saat hızını `GPU Clock` / `Shader Clock` etiketiyle veriyor; bu alanlar `KEEP`'e eklendi.
- Kaynakta yanlış olan ve `src/data/cpuData.js` `DATA_FIXES` içinde düzeltilenler: Core i5-10600KF TDP 95 → 125 W (Intel spesifikasyonu), Ryzen 5 8500G segment Mobile → Desktop (AM5). Alder Lake-N'de (N100, N200, i3-N305) temel frekans yerine yazılan 100 MHz referans saati boş sayılıyor.

### 2026-10-01 (2): tüm zamanların popülerleri ve 2026 çıkışları

| | Önce | Sonra | Eksik |
|---|---|---|---|
| GPU | 329 | 444 (+115) | 0 |
| CPU | 359 | 540 (+181) | 5 |

- Öncelik değişti (kullanıcı kararı): tüm zamanların en popüler ve bilinen parçaları + bu yılın çıkışları. Yıl alt sınırı 2006'ya indi.
- Aday listeleri: bir oyuncu donanım anketi (Ağustos 2026, ilk ~100 GPU), bir CPU popülerlik listesi (son 90 gün), bilinen klasikler (Core 2, Sandy Bridge, Phenom II, FX, GeForce 8800–GTX 700, Radeon HD 4000–R9 300…) ve kaynak aramasından 2025–2026 çıkışları. Adlar kaynak kataloğuyla birebir eşlendi; listelerde `Kademe 1b/1c/1d` bölümleri.
- Kaynakta olmadığı için atlananlar: i5-7200U, i5-10310U, i7-6700HQ, i7-4720HQ, i5-6200U/6300U, i7-6500U/7500U, Ryzen 5 7430U, Ryzen 7 7445HS, Core Ultra 5 335, Core Ultra 7 365, GeForce RTX 3050 6 GB Mobile.
- Hata düzeltmesi: ATI markalı eski Radeon'ların (HD 4000/5000) üreticisi boş kalıyordu; çekicide `ati → amd`, sekiz kayıt düzeltildi.
- `GeForce 9800 GTX` aranınca `9800 GTX+` geldi (eşleme anahtarı `+`'yı atıyor); 55 nm sürümü, bırakıldı.
- Endeks kapsamı: tüm veride CPU 474/540, GPU 425/444. Endekssizler: ölçümü olmayan eski CPU mikromimarileri (66), Panther Lake 12 çekirdek (338H) ve Core 3 304 (çekirdek dağılımı bilinmiyor), Xe3 ve Gen 7/7.5 tümleşik GPU'lar, L2 verisi eksik RTX PRO 5500, grafik API'si olmayan RTX Spark N1X.

## Tuzaklar

- **Kaynağın adlandırması tutarsız.** Listeye yazmadan önce sitede bakın:
  - Masaüstü RTX PRO kartları `RTX PRO 5000 Blackwell Workstation`; düz ad yok, mobil sürümü var.
  - Mobil Ada iş istasyonu: `RTX 2000 Mobile Ada Generation` (`... Ada Generation Mobile` değil).
  - OEM kartlar: `Radeon RX 5500 OEM`, `RX 5300 OEM`, `RX 6300 OEM`.
  - `GeForce RTX 3050 Mobile Refresh 6 GB`, `Ryzen 5 1600AF` (boşluksuz), `B200 SXM6`, `Instinct MI300X` ("Radeon" yok).
  - TDP varyantına bölünmüş olanlar: `GeForce MX450 12W / 30.5W 8Gbps / 30.5W 10Gbps`, `Athlon 3000G (FB) / (FH)`, `Core 2 Quad Q6600 (95W)`, `Phenom II X4 965 BE (125W)`.
- **Soket adları kaynakta kısa**: TR4 → `SP3r2`, sTRX4 → `TRX4`, sWRX8 → `WRX8`, sTR5 → `sTR5`. `cpuData.js` Threadripper'ı soketten tanıyor; yeni bir HEDT soketi gelirse oradaki desene eklenmeli.
- **pydoll'un `tab.request` katmanı UTF-8'i bozuyor** (`²` → `�`). Bu yüzden istekler `execute_script` içinde `fetch` ile yapılıyor; bunu değiştirmeyin.
- Windows'ta Python `write_text` satır sonlarını CRLF yapar; proje kaynak dosyaları LF, JSON veri dosyaları CRLF. Git Bash'in `grep`'i CR'yi gizler, satır sonunu kontrol ederken Python ile byte sayın.
- **Yeni bir hibrit kod adı çekilirse** `src/data/cpuModel.js` `CORE_SPLIT`'e eklenmeli; tabloda olmayan HT'siz hibrite endeks verilmez.

Açık işler kök dizindeki [`YAPILACAKLAR.md`](../../YAPILACAKLAR.md) dosyasında.
