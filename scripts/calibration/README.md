# Endeks kalibrasyonu

```bash
npm run calibration                      # modeli hedeflerle karşılaştırır, en büyük sapmaları listeler
npm run calibration:fit                  # katsayıları yeniden oturtur, önerilen değerleri yazar
npm run calibration:fit -- gpu           # yalnızca bir bölüm: gpu | ipc | multi | gaming
npm run calibration:fit -- multi MOBILE_POWER   # yalnızca verilen sabit(ler)
```

`fit.mjs` dosyaları değiştirmez: önerilen değerleri `src/data/gpuModel.js` / `cpuModel.js`'e yuvarlayarak yazın, sonra `npm run calibration` ile doğrulayın.

2026-10-01 durumu:

| Eksen | Hedef | n | Ortalama sapma | Medyan |
|---|---|---|---|---|
| GPU | Kaynak veritabanının göreli performans listeleri; tümleşiklerde 3DMark Time Spy | 403 (+9 fit dışı) | %3,7 | %2,7 |
| CPU tek çekirdek | Cinebench R23 (bağımsız ölçümlerin ortalaması) | 200 | %2,6 | %1,8 |
| CPU çok çekirdek | Cinebench R23 (bağımsız ölçümlerin ortalaması) | 200 | %10,5 | %7,7 |
| CPU oyun | 720p inceleme testleri (9800X3D incelemesi + 9850X3D/9950X3D), RTX 4090/5090 | 48 | %3,9 | %3,7 |
| CPU oyun, doğrulama (oturtma dışı) | Ryzen 5 5600 incelemesi, 720p, RTX 3080 | 24 | %6,0 | %6,0 |

Yama çarpanları kaldırılmadan önce (aynı hedeflerle): GPU %3,3 / %2,0 (%15 üstü 7; şimdi 6), CPU çok çekirdek %8,6, oyun %3,1, oyun doğrulama %11,4.

Daha önceki (elle ayarlanmış) model: GPU %8,3; CPU tek çekirdek ~%8, çok çekirdek ~%19 (başka bir benchmark'a karşı), oyun %5,6.

## Kaynaklar

**GPU — `targets-gpu.json`**
- Kaynak GPU veritabanı: her kart sayfasındaki göreli performans listesi aynı masaüstü kartlarını o karta göre verir; kartın RTX 4060 ölçeğindeki değeri, listedeki hedefi olan kartlar üzerinden (30–300% aralığı) geometrik ortalamayla bulunur. Doğrulama: RTX 4060'ın kendi listesinden hesap 100,0 çıkıyor. RTX 4060 sayfası 178 masaüstü kartı doğrudan verir.
  - Ekran çıkışı olmayan sunucu kartları (Tesla T4, L4, A10, V100, P100, P40) da bu yöntemle; her biri 74–85 kartla, dağılım %1'in altında.
  - GeForce 210 30–300% aralığına giren kart olmadığı için GT 1030 ve GTX 550 Ti'ye göre (ikisi de 0,9).
- Kaynakta göreli performansı olmayan tümleşik GPU'lar (Intel, RDNA 3.5) ve tutarsız görünen AMD iGPU'lar (760M ≈ 780M diyor) için bağımsız bir ölçüm listesindeki Time Spy Graphics ortalaması. İki kaynakta ortak 134 kartla: göreli performans ≈ e^-3.122 × TS^0.819 (TS < 6000). Intel'de ×0,81 (oyun ölçümleri Arc A310/A380/A350M/A370M/A550M'yi Time Spy'dan bu kadar düşük buluyor).
  - UHD 620 (88 cihaz), UHD 630 (10), Iris Plus G7 (23) kart sayfalarındaki cihaz sonuçlarının ortalaması.
- 2026-10-01: veritabanına eklenen 95 ayrı kart (2006–2016 klasikleri: Tesla G80/G92 ve GT200, Fermi, Kepler, TeraScale 1/2/3, GCN 1/2/3; 2025–2026 çıkışları) aynı yöntemle. Kart sayfası başına 30–80 çapa, dağılım %0,6–2,4. GT 710 ve HD 5670 listelerinde %30–300 aralığında hedefli kart olmadığı için iki adımlı zincirle (önce aynı turda bulunan kartlar çapa oldu).
- `"fit": false`: raporlanır ama oturtmaya ve özetteki ortalamaya girmez. Radeon 8040S (tek cihaz), UHD 605 (iki cihaz arasında %60 fark), çift GPU'lu kartlar (GTX 295/590/690, HD 5970/6990/7990, R9 295X2: göreli performans ölçümü SLI/CrossFire'lı, özellik sayfası ve endeks tek GPU'nun; model %26–46 düşük).
- Hedefi olmayanlar: konsollar (PS5, PS5 Pro, Xbox Series X/S) ve Steam Deck. Kapalı platformlarda PC benchmark'ı koşulamıyor; kaynakta göreli performans listesi yok. Bulunan tek "Steam Deck 8CU" ölçümü aslında ROG Xbox Ally'nin (Z2 A, daha yüksek güç) sonucu, alınmadı.

**CPU — `targets-cpu.json`**
- `r23`: bağımsız bir işlemci benchmark listesi (masaüstü dahil, arşiv dahil). Ryzen 5 5600 listede yok; karşılaştırma ölçekten bağımsız (oranların geometrik ortalamasına bölünür).
  - Threadripper PRO 3975WX / 3995WX (arşiv, kart sayfası) ve 7995WX (liste): 32 / 64 / 96 çekirdek. Bu üç işlemci yalnızca bu ölçümler için veritabanına eklendi. 1950X ve 29xx için R23 yok; diğer Threadripper'ların ölçümü bulunamadı.
- `games720`: Ryzen 7 9800X3D incelemesinin 1280x720 oyun göreli performans grafiği (RTX 4090). Ryzen 5 5600 bu grafikte yok; 5800X3D 10th Anniversary incelemesindeki 5600 / 5800X3D ve 5600 / 5800X oranlarıyla 60,3 olarak bağlandı.
  - 9850X3D (168,1) ve 9950X3D (155,9): aynı kaynağın 9950X3D, 9850X3D ve 9950X3D2 incelemelerinin 720p grafikleri (RTX 5090), 9800X3D'ye oranla, 9800X3D = 165,8 üzerinden. Birden fazla incelemede geçenlerde oranların geometrik ortalaması (9950X3D 0,936 / 0,942 / 0,942; 9850X3D 1,014 / 1,014). İnceleme sayfaları başsız tarayıcıya 403 veriyor; görünür Chrome ve `scrape.py`'nin profiliyle açılıyor.
  - Aynı 9950X3D2 grafiği çift CCD'li X3D'nin V-Cache'siz CCD payını verir (`PLAIN_CCD_SHARE`): 9950X3D2 100, 9950X3D 95,0, 9950X 85,5 → (1/95 − 1/100) / (1/85,5 − 1/100) = 0,31.
  - 7950X3D'nin V-Cache'li CCD saati (5,25 GHz, 1–8 iş parçacığı): 7950X3D incelemesinin saat ölçümü.
- `games720_5600`: oturtmaya girmeyen doğrulama seti. Aynı kaynağın Ryzen 5 5600 incelemesi (2022), 720p, RTX 3080; değerler doğrudan 5600 = 100. Daha yavaş ekran kartı yüzünden 5600'ün üstü sıkışık; en çok düşük uç (4–6 çekirdek, küçük L3) için anlamlı. Veritabanında olmayanlar (6700K, i3-12300, 11700KF) alınmadı.
  - Athlon 3000G incelemesi (2019, RTX 2080 Ti) de bakıldı ama ölçeği hedeflerle tutarsız (3600 / 2700X = 1,09; hedeflerde 1,26), alınmadı.
- Başka bir genel benchmark da denendi ama çok çekirdekte çekirdek sayısıyla doğrusal ölçeklenmiyor (4 thread'de model/benchmark 1,06, 64+ thread'de 1,84); bu eksen için hedef alınmadı.

## Yeniden oturtma (`fit.mjs`)

Log uzayında en küçük kareler; endeks uygulamanın kendi fonksiyonlarıyla (`computeIndex`, `computeRaw`) hesaplanır.
- **gpu**: `endeks ∝ 1 / (1 / (k × FP32^A × (BW / ıskalama)^B) + FIXED_TIME)`. k'lar yinelemeli: her adımda ailenin ortalama log sapması, karenin ekran kartına bağlı payına bölünerek düzeltilir (sabit pay yüzünden endeks k ile orantılı değil); Ada = 1 birimi taşır. Global sabitler (A, B, WORKING_SET, MISS_SLOPE, FIXED_TIME) verilirse Nelder-Mead, her adımda k'lar yeniden çözülür. 2026-10-01'de beşi birlikte oturtulup yuvarlandı; yuvarlanmış değerler optimumda (yeniden oturtma %3,8'i değiştirmiyor).
- **ipc**: IPC = geo-ort(R23 tek / boost GHz), Zen 3 = 1.
- **multi**: SMT_GAIN, MOBILE_POWER, BOOST_CORE_POWER (Nelder-Mead, ölçek serbest). DESKTOP_POWER AMD'nin spesifikasyonu (PPT = 1,35 × TDP), varsayılan olarak oturtulmaz. SMT_GAIN oturtmada 0,18'e kayıyor ama sapma yalnızca %10,5 → %10,1 iniyor; Cinebench'te ölçülen 0,26 bırakıldı. E-çekirdek [IPC, saat] (Gracemont/Crestmont/Skymont) ve COMPACT_CLOCK betikte yok; 2026-09-30'da ayrıca oturtuldu.
- **gaming**: MEM_TIME, WORKING_SET, MISS_SLOPE, GAME_THREADS. PLAIN_CCD_SHARE ölçüm (yukarıda), varsayılan olarak oturtulmaz.

### 2026-10-01 değişiklikleri
- Yeni hedefler: 6 sunucu kartı, GeForce 210, MX450, UHD 620/630/605, Iris Plus G7, 3 Threadripper PRO. Mevcut ailelerin k'ları yeni hedeflerle %0,3'ten az oynadı, değiştirilmedi.
- Gen 9.5 ikiye ayrıldı: Core işlemcilerdeki UHD 610/620/630 (`gen9`, k 3,148) ve Gemini Lake'teki UHD 600/605 (`gen9lp`, k 2,271). Aynı mimari, ama 6–10 W'lık Atom SoC'ler tek katsayıyla Core'ları %14 düşük, Gemini Lake'i %29 yüksek gösteriyordu.
- Gen 11 (Iris Plus G7) 3,524 → 2,969 ve Tesla (GeForce 210) 4,518 → 3,905; ikisi de önceden ölçümsüzdü.
- Çok çekirdek ölçeklenme kaybı: `× min(1, 16 / tam çekirdek)^0,19` (E-çekirdek yarım). Threadripper PRO sapmaları +%22 / +%32 / +%48'den −%2 / −%7 / +%6'ya indi; 16 çekirdeğe kadar işlemciler etkilenmez. Diğer çok çekirdek sabitleriyle birlikte oturtulduğunda da 0,187 çıkıyor ve ortalama sapma iyileşmiyor; bu yüzden yalnızca bu sabit değişti.
- Hata düzeltmesi: Threadripper sokette tanınıyordu ama desen `sWRX` arıyordu; veride `WRX8` yazıyor. 3975WX/3995WX'e masaüstü güç çarpanı (TDP × 1,5) uygulanıyordu.
- RDNA 3'ün mevcut k'sı, 8040S dışarıda bırakılınca yeniden elde ediliyor (3,941 ↔ 3,936). Önceki oturtma da onu dışarıda bırakmış; hedefe `"fit": false` olarak işlendi.

### 2026-10-01 (2): CPU'da yama çarpanları kaldırıldı
Ölçüme uydurulmuş düzeltme çarpanları yerine mekanizma. Kalan her sabit ya bir ölçüm (IPC, SMT, AMD PPT, V-Cache'siz CCD payı) ya da bir mekanizmanın fiziksel büyüklüğü (çalışma kümesi, çekirdek gücü).
- **Oyun**: `oyun = 1 / (ana iş parçacığı süresi × max(1, GAME_THREADS / şerit) + MEM_TIME × ıskalama)`, `ıskalama = 1 / (1 + (L3 / WORKING_SET)^MISS_SLOPE)`. L3, oyunun çalıştığı çekirdek kümesininki (`CCX_L3`: Zen/Zen+ 8 MB, Zen 2 16 MB, Zen 3/4/5 32 MB, Zen 3+ 16 MB, Renoir/Lucienne 4 MB; X3D 96 MB; Intel'de tüm L3). Şerit = P × SMT + E × (E-IPC × E-saat / P-IPC). Çift CCD'li X3D'de iki CCD'nin kare süresi %69 / %31 ağırlıkla.
  - Kaldırılanlar: `DUAL_CCD_X3D` 0,89, `GAMING_LATENCY` (Lion Cove 0,88, Zen 5 0,90), `CACHE_EXP`, `CORE_EXP`, HT 0,3 / E 0,5 etkin çekirdek ağırlıkları, L3'ün 36 MB'ta kesilmesi.
  - GAME_THREADS 4 çekirdekli hedeflerden ölçülüyor (3300X, 12100F, 14100): oturtma 5,45 veriyor, sapmayı %4,2'den %3,9'a indiriyor. Olmadan 2 çekirdekliler %30–80 şişiyordu (Core 2 Duo 17,7 → 32,4).
  - Denenip alınmayanlar: sabit kare payı (ekran kartı sınırı; oturtmada 0'a gidiyor), bellek bant genişliği (nominal; %4,2 → %4,0, bir parametre daha), DDR4/DDR5 ayrımı (%3,8), oturtmayla ortak doğrulama seti (ana set %4,5'e kötüleşiyor).
- **Çok çekirdek**: `tüm-çekirdek saati = max(temel, boost × min(1, (W/çekirdek / BOOST_CORE_POWER)^(1/3)))` (P = C·V²·f, V ∝ f). Sürekli güç masaüstünde TDP × 1,35, dizüstünde TDP × 2,0, Threadripper'da TDP.
  - Kaldırılanlar: `DESKTOP_POWER` 1,5, `CLOCK_MIN/MAX` + `WATT_LOW/HIGH` parçalı saat eğrisi, `SCALE_CORES` / `SCALE_EXP` (Threadripper ölçeklenme kaybı).
  - Denenip alınmayanlar: temel frekansı TDP'deki tüm-çekirdek saati sayan çapa (%24; dizüstü temel frekansları en kötü yük için, gerçek saatin çok altında), gerilimde sabit pay (V = V₀ + a·f; oturtmada V₀ → 0), çekirdek dışı güç (bellek kanalı başına W ya da Threadripper IO yongası; oturtmada 0'a gidiyor), çekirdek başına statik (sızıntı) güç (Le Sueur & Heiser'in P = C·f·V² + P_statik'i; oturtmada 0'a gidiyor), serbest üs (0,18 çıkıyor, %9,4; fiziksel değil). Intel masaüstüne ayrı oran oturtulunca 1,36, AMD'ninkiyle aynı; tek oran kullanıldı.

### 2026-10-01 (3): GPU'da yama çarpanları kaldırıldı
- Yeni biçim: `iş hızı = k × FP32^0,58 × (BW / ıskalama)^0,27`, `ıskalama = 1 / (1 + ((L2 + Infinity Cache) / 17 MB)^0,54)`, `kare süresi = 1 / iş hızı + 0,0035`. Çarpımsal biçim Habitat'ın (USENIX ATC 2021) GPU'lar arası ölçeklemesi; üsler hesaba/belleğe bağlı zaman payları. Etkin bant genişliği NVIDIA ve AMD'nin kendi kavramı. Sabit pay, karenin ekran kartından bağımsız kısmı (RTX 4060'ta %9, 4090'da ~%29).
- Kaldırılanlar: `SATURATION_TFLOPS`/`SATURATION_EXP` (yerini sabit pay aldı), `IGPU` 0,93, `NO_INFINITY_CACHE` 0,82 (yerini etkin bant genişliği aldı), VRAM üssü `C` (0,05; ölçümler 8 GB altında ceza göstermiyor). k'lar Ada = 1 biriminde yeniden çözüldü.
- Sonuç: %3,3 / %2,0 → %3,8 / %2,7; %15 üstü 7 → 6. Fark neredeyse tamamen AMD tümleşiklerinde (eski modelde ×0,82 çarpanı onları düzeltiyordu).
- Denenip alınmayanlar:
  - toplamsal kare süresi (saatle ölçeklenen iş + 1/(k·FP32) + bellek/BW): %5,0, %15 üstü 17;
  - Habitat'ın kart başına γ'sı (roofline sırt noktasından): %6,05. Formül derin öğrenme çekirdekleri için; oyunlarda tutmuyor;
  - paylar toplamı 1 kısıtı: %5,3;
  - VRAM taşma terimi, piksel/doku doldurma terimi, hesap–bellek örtüşmesi (p-norm): oturtmada 0'a ya da fiziksel olmayan değere gidiyor.
- Etkin bant genişliği eğrisi üreticilerle tutarlı: 32 MB'ta ıskalama 0,41 (NVIDIA "yarıya"), 128 MB'ta 0,25 (AMD 1080p–1440p'de 4K'daki 0,42'den düşük diyor).

### 2026-10-01 (4): eski GPU mimarileri
- Yeni aileler: Kepler (k 0,799), GCN 1 / 2 / 3 (0,722 / 0,736 / 0,728), TeraScale 1 / 2 / 3 (0,554 / 0,569 / 0,626). G80/G92 (kaynakta "Tesla") mevcut Tesla ailesine (GT200, GT218) katıldı; Gen 9.0 (Skylake HD 520/530) Gen 9.5 ile aynı EU mimarisi olduğu için `gen9`'a.
- Sonuç: oturtmaya giren 403 kartta %3,7 / %2,7; önceki 317 hedefte %3,7 (yeni k'larla aynı), yeni 88 kartta %3,6 ve hiçbiri %15'i aşmıyor. Aynı model 2006–2016 kartlarına aile başına tek katsayıyla genelleşiyor.
- L2 önbellek verisi olmayan ayrı karta endeks verilmez (etkin bant genişliği hesaplanamaz). Şu an yalnızca RTX PRO 5500 Blackwell (kaynak henüz yazmamış).

## Literatür ve üretici kaynakları (2026-10-01 taraması)

Modelin biçimini dayandırdığımız ya da karşılaştırdığımız çalışmalar:
- **CPU oyun = çekirdek süresi + bellek bekleme**: Hennessy & Patterson'ın ders kitabı formülü (süre = komut × (temel CPI + ıskalama/komut × ıskalama cezası) × çevrim süresi). Bekleme süresi ns cinsinden sabit, saatle ölçeklenmez.
- **Iskalama eğrisi**: önbellek ıskalamasının güç yasası (Hartstein ve diğ., "On the Nature of Cache Miss Behavior: Is It √2?", JILP 2008): ıskalama ∝ C^−α, α = 0,3–0,7; çalışma kümesi önbelleğe sığınca doyar. Bizim eğrinin yerel eğimi 16–32 MB'ta 0,25–0,85 (literatür aralığı); X3D boyutlarında doyma bölgesi. AMD'nin Infinity Cache verisi de doyuyor: 128 MB, 1080p'de 64 MB'a göre "ciddi azalan getiri"de, 4K'da %58 isabet.
- **GAME_THREADS**: iş–yol sınırı (Brent). Ölçülen masaüstü iş parçacığı paralelliği: oyunlarda ~2 (Blake ve diğ., ISCA 2010), 2019'da masaüstü uygulamalarında ortalama 3,1 (Feng ve diğ., ISPASS 2019). Bizim 5,5 (2024 oyunları) aynı mertebede, daha yüksek.
- **Güç–saat**: P = C·f·V² + P_statik (Le Sueur & Heiser, HotPower 2010). Gerilim penceresi dar (ör. 0,9–1,35 V'ta 0,8–2,7 GHz) ve statik güç büyük; V ∝ f yalnızca üst bölgede geçerli. Küp kök yasasının dizüstünde zayıf kalmasının nedeni bu. Intel'in TDP tanımı "temel frekans, tüm çekirdekler, Intel'in yüksek karmaşıklıklı yükü"; Cinebench daha hafif olduğu için temel frekans çapası tutmadı. AMD: PPT = 1,35 × TDP, süresiz tutulur (Intel'in PL2'si Tau sonunda PL1'e düşer).
- **GPU çarpımsal biçim**: Habitat (Yu ve diğ., USENIX ATC 2021) GPU'lar arası süreyi `(BW_o/BW_d)^γ × (birim_o·saat_o / birim_d·saat_d)^(1−γ)` ile ölçekliyor; γ = belleğe bağlılık, roofline'daki (Williams, Waterman, Patterson, CACM 2009) sırt noktasına uzaklıktan. Yani eski modeldeki A/B üsleri keyfi değil, zamanın hesap/bellek sınırlı payları (esneklik). A + B = 0,82 < 1: ~%18 ikisiyle de ölçeklenmiyor.
- **Etkin bant genişliği**: NVIDIA RTX 4060 Ti için 288 GB/s'yi 32 MB L2 ile "etkin 554 GB/s" sayıyor (trafik yarıya iniyor); AMD 128 MB Infinity Cache'te 4K'da %58 isabet. Etkin BW = BW / ıskalama(L2 + IC).
- Doğruluk karşılaştırması: özelliklerden tahmin akademide de çalışılıyor. Intel CPU özelliklerinden SPEC'te %5, ikinci bir genel benchmark'ta %11 (Wang ve diğ., TACO 2019, DNN); Habitat GPU'lar arası %11,8; Hong & Kim analitik GPU modeli uygulamalarda %13,3 (ISCA 2009). Bizim hatalarımız aynı tür ölçümlere oturtulduğu için doğrudan kıyaslanmaz, ama mertebe olarak iyi.

## Bilinen sınırlar

- Çok çekirdekte tek bir çekirdek gücü sabiti (13 W) bütün üretim süreçlerine uygulanıyor. Yüksek boost'lu, düşük güçlü Intel U serisi (8.–11. nesil) %30–55 yüksek (10510U +%54, 8550U +%36, 1165G7 +%33). Threadripper PRO 3975WX / 3995WX / 7995WX −%7 / +%4 / +%22; ölçümü olmayan 9980X ve 9995WX'te doğrulanmadı.
- Dizüstü işlemcilerde çok çekirdek, üreticinin güç ayarına göre ±%30 oynar; model ortalama oranı (TDP × 2,0) kullanır.
- Oyunda platformun bellek gecikmesi yok (tutarlı bir kaynağı yok; tahmini sayı girilmedi): Arrow Lake (285K +%8), Zen+ (2700X +%10) yüksek; Raptor Lake orta sınıfı (13600K, 14600K, 13700K) −%7; X3D'ler (7800X3D, 5800X3D) −%8/−%9. Doğrulama setinde Skylake türevi Intel'ler (i3-9100F −%18, 9400F, 10400F, 10700K, 10900K −%11/−%12) düşük.
- GAME_THREADS en az 4 çekirdekli işlemcilerden ölçüldü; 2 çekirdekliler için ölçüm yok.
- GPU'da tümleşiklerin paylaşılan güç bütçesi (GPU saatinin düşmesi) modelde yok: Radeon 890M +%22, 780M +%20, 680M +%9.
- Arc A750/A770 +%15/+%14, A310 −%8: Alchemist büyük çipte ölçeklenmiyor; tek k ile taşınamıyor.
- TeraScale 1 ve 3'ün k'sı ikişer karta dayanıyor (HD 4850/4870, HD 6950/6970); Fermi'de GTX 570/580 −%11.
- Endeksi olmayan GPU'lar: Xe3 (Panther Lake / Wildcat Lake tümleşikleri) ve Gen 7 / 7.5 (HD 4000, HD 4600) için ölçüm yok; çift GPU'lu kartlar tek GPU olarak.
- Radeon 8040S hedefi (tek cihaz) güvenilir değil; model +%58 sapıyor.
- Gemini Lake'in katsayısı tek güvenilir ölçüme (UHD 600) dayanıyor; fit dışı UHD 605 hedefinden +%10 sapıyor.
- UHD 610 +%15: Coffee Lake GT1, Gen 9.5 katsayısı ağırlıkla UHD 620/630'dan.
