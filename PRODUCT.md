# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

İki katmanlı kitle, aynı arayüzde:

- **Sistem toplayan oyuncu / alıcı** — Türkçe konuşan, bütçe içinde CPU veya GPU seçmeye çalışan kullanıcı. Sorusu "hangisi daha iyi, ne kadar daha iyi?". Hızlı, net bir karar ister; jargonu azaltılmış özet okur.
- **Donanım meraklısı** — TMU/ROP, önbellek, bant genişliği, FP32 gibi ham spesifikasyonları inceleyen, donanım veritabanlarını zaten tanıyan kullanıcı. Tam veriyi, birimleriyle, eksiksiz görmek ister.

Arayüz ikisine birden hizmet eder: üstte karar/özet, altında tam teknik döküm.

## Product Purpose

CPU ve GPU'ları yan yana (en fazla 5 parça) karşılaştırmak, veritabanında parça bulmak ve tek bir parçanın tüm teknik özelliklerini okumak. Başarı: kullanıcı iki-üç parça arasındaki farkı birkaç saniyede kavrar ve isterse her rakamın arkasındaki ham spesifikasyona iner.

## Positioning

Tamamen Türkçe, spesifikasyon tabanlı bir karşılaştırma aracı. Performans endeksi gerçek benchmark değildir; mimari verimlilik katsayılarıyla düzeltilmiş, sabit bir referans parçaya göre ifade edilen, yöntemi açıkça yayımlanan bir tahmindir. Rakiplerin kara kutu puanlarının aksine hesap şeffaftır.

## Operating Context

- Kullanıcı genellikle bir alışveriş kararının ortasında: sekmelerde fiyat siteleri açık, iki-üç aday arasında gidip geliyor.
- Masaüstü ve mobilde eşit kullanım beklenir; karşılaştırma tablosu dar ekranda da okunabilir olmalı.
- Veri İngilizce bir kaynaktan gelir; alan adları ve birimler Türkçeleştirilerek gösterilir.
- Sitede veri kaynağının adı geçmez (kullanıcı kararı, 2026-10-01): başlık, alt bilgi, ana sayfa ve Yöntem sayfası kaynağı adıyla anmaz. Geliştirici belgeleri ve çekici kaynağı yazmaya devam eder.

## Capabilities and Constraints

- **Mevcut özellikler (korunur):** CPU karşılaştırma, GPU karşılaştırma (en fazla 5 parça), CPU veritabanı listesi, GPU veritabanı listesi, CPU ve GPU detay sayfaları, 404.
- **Eklenecek:** Veritabanı listelerinde sütuna göre sıralama ve filtreleme (marka, segment, soket, mimari, yıl vb.).
- **Performans endeksi yeniden tasarlanacak:** maksimuma normalize etmek yerine sabit referansa göre yüzde; mimari/mikromimari verimlilik katsayıları; GPU'da hesaplama ve bellek bant genişliğinin çarpımsal (geometrik) birleşimi; CPU'da tek çekirdek, çok çekirdek ve oyun eksenleri, SMT ve güç limiti (TDP) etkisi dahil. Her yerde "tahmini" olarak etiketlenir ve yöntemi okunabilir olur.
- **Stack:** React 19, Vite 7, Tailwind CSS 4, React Router 7. Statik SPA; backend yok.
- **Veri:** `data/cpu_database.json` (100 CPU), `data/gpu_database.json` (99 GPU). Serbest metin alanlar, birimler tutarsız (GFLOPS/TFLOPS, GB/s-TB/s); `src/data/parse.js` normalize eder.
- **Kapsam dışı:** fiyat takibi, kullanıcı hesabı, darboğaz hesaplayıcı, gerçek benchmark sonuçları.

## Brand Commitments

- **Ad:** "PC Benchmark" (mevcut ad; değiştirilmedi).
- **Görsel çıta (kullanıcı kararı, 2026-09-24):** modern ve okunması kolay; kategori standardı kusursuz işçilikle. Yanında duracağı ürünler: kategorisinin en iyi ödeme altyapısı, donanım inceleme ve geliştirici aracı arayüzleri. Deneysel / tematik dünyalar (split-flap pano denendi ve reddedildi) yerine bu çizgi korunur.
- **Tema:** açık ve koyu birlikte; varsayılan cihaz ayarı, elle geçiş düğmesi.

## Evidence on Hand

- Kaynak veritabanından çekilmiş spesifikasyon verisi (yukarıdaki iki JSON dosyası).
- Veride **olmayan** ve uydurulmayacak şeyler: gerçek oyun FPS değerleri, Cinebench/3DMark puanları, güncel fiyatlar (yalnızca GPU'larda çıkış fiyatı "Launch Price" var), kullanıcı yorumları, marka logoları/ürün fotoğrafları.

## Product Principles

1. **Her rakamın kaynağı görünür.** Türetilmiş bir değer (endeks, fark yüzdesi) ham spesifikasyona bir adımda iner.
2. **Karar önce, döküm sonra.** Özet ve fark üstte; tam tablo altta, kaybolmadan erişilebilir.
3. **Tahmin tahmin olarak söylenir.** Endeks asla benchmark gibi sunulmaz; yöntemi yayımlanır.
4. **Eksik veri eksik görünür.** Veri yoksa boş gösterilir ve ekran okuyucuya "veri yok" denir; asla sıfır ya da tahmini dolgu.
5. **Türkçe, doğru terimle.** Yerleşik teknik terimler (TDP, FP32, ROP) korunur, açıklaması eklenir.

## Accessibility & Inclusion

WCAG 2.2 AA hedefi: klavyeyle tam gezinme, görünür odak, renk tek başına anlam taşımaz (en iyi/en kötü değerler renk + işaretle), tablolar ekran okuyucuda satır/sütun başlıklarıyla okunur, `prefers-reduced-motion` desteklenir.
