---
name: PC Benchmark
description: Türkçe CPU/GPU spesifikasyon karşılaştırma sitesi; sakin nötr yüzeyler, tek indigo vurgu ve referans çizgili puan çubukları.
colors:
  bg: "#f7f7f8"
  surface: "#ffffff"
  surface-2: "#f4f4f6"
  surface-3: "#ececf0"
  line: "#e4e4e8"
  line-strong: "#cfcfd6"
  ink: "#0f0f12"
  ink-2: "#4b4b55"
  ink-3: "#6b6b76"
  accent: "#4f46e5"
  accent-hover: "#4338ca"
  accent-ink: "#ffffff"
  accent-soft: "#eef0ff"
  accent-text: "#4338ca"
  good: "#0f8a0f"
  critical: "#d03b3b"
  track: "#ececf0"
  ref-line: "#9a9aa5"
  series-1: "#2a78d6"
  series-2: "#eb6834"
  series-3: "#1baf7a"
  series-4: "#eda100"
  series-5: "#e87ba4"
  single: "#2a78d6"
  bg-dark: "#0b0b0d"
  surface-dark: "#141417"
  surface-2-dark: "#1a1a1e"
  surface-3-dark: "#232328"
  line-dark: "#26262c"
  line-strong-dark: "#36363d"
  ink-dark: "#f4f4f5"
  ink-2-dark: "#b8b8c0"
  ink-3-dark: "#8e8e98"
  accent-dark: "#818cf8"
  accent-hover-dark: "#a5b4fc"
  accent-ink-dark: "#0f0f1a"
  accent-soft-dark: "rgb(129 140 248 / 0.14)"
  accent-text-dark: "#a5b4fc"
  good-dark: "#2fbf4a"
  critical-dark: "#f06a6a"
  track-dark: "#232328"
  ref-line-dark: "#6f6f79"
  series-1-dark: "#3987e5"
  series-2-dark: "#d95926"
  series-3-dark: "#199e70"
  series-4-dark: "#c98500"
  series-5-dark: "#d55181"
  single-dark: "#3987e5"
typography:
  display:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.005em"
  body:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
  body-table:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    fontFeature: "tnum"
  label:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.3
  caption:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
  figure:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    fontFeature: "tnum"
rounded:
  swatch: "3px"
  sm: "6px"
  md: "8px"
  segmented: "9px"
  panel: "10px"
  floating: "12px"
  pill: "999px"
spacing:
  hairline: "1px"
  xs: "4px"
  sm: "8px"
  cell: "10px 12px"
  md: "16px"
  panel-pad: "20px"
  section: "24px"
  gutter-mobile: "16px"
  gutter: "24px"
  container: "1280px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  button-secondary-hover:
    backgroundColor: "{colors.surface-2}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.md}"
    padding: "0 10px"
    height: "36px"
  button-ghost-hover:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
  button-icon:
    rounded: "{rounded.md}"
    size: "36px"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "40px"
  segmented:
    backgroundColor: "{colors.surface-2}"
    rounded: "{rounded.segmented}"
    padding: "3px"
  segmented-item:
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "32px"
  segmented-item-active:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
  badge:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink-2}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: "0 8px"
    height: "22px"
  badge-accent:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent-text}"
    rounded: "{rounded.pill}"
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.panel}"
  panel-head:
    typography: "{typography.title}"
    padding: "12px 20px"
    height: "52px"
  data-table-header:
    textColor: "{colors.ink-3}"
    typography: "{typography.caption}"
    padding: "10px 12px"
  data-table-cell:
    typography: "{typography.body-table}"
    padding: "10px 12px"
  bar-track:
    backgroundColor: "{colors.track}"
    rounded: "{rounded.pill}"
    height: "8px"
  bar-fill:
    backgroundColor: "{colors.single}"
  nav-item:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.sm}"
    padding: "0 10px"
    height: "36px"
  nav-item-active:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
  popover:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.panel}"
    padding: "4px"
  compare-bar:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.floating}"
    padding: "10px 10px 10px 16px"
---

# Design System: PC Benchmark

## Overview

**Creative North Star: "Sakin Ölçüm Masası"**

PC Benchmark bir veri ürünüdür ve öyle görünür: nötr gri zemin, kıl çizgisi kenarlıklı beyaz (koyu temada kömür) paneller, tek bir indigo vurgu ve her endeksi referans 100 çizgisiyle gösteren yatay puan çubukları. Çıta kategori standardıdır (iyi ödeme altyapısı, donanım inceleme ve geliştirici aracı arayüzleri); özgünlük tematik kostümden değil, rakamların hizasından, çubukların dürüstlüğünden ve iki temada da aynı disiplinden gelir. Önceki split-flap dünyası kullanıcı tarafından reddedildi; tematik kostüm (split-flap, neon oyuncu estetiği) bu sistemde yer almaz.

Yoğunluk orta-yüksektir: karar katmanı (puan çubukları, fark) üstte, döküm katmanı (tam spesifikasyon tablosu) altta. Tipografi tek aile Geist ile, cümle düzeninde, büyük harfsiz; tablo rakamları her yerde tabular. Derinlik gölgeyle değil tonla ve 1px çizgiyle kurulur; gölge yalnızca gerçekten sayfanın üstünde yüzen iki katmanda vardır. Hareket yalnızca durum geçişi (150 ms) ve çubuk uzunluğu (250 ms) içindir; `prefers-reduced-motion` altında ikisi de kapanır.

Açık ve koyu tema eşittir. Varsayılan cihaz ayarıdır; başlıktaki düğme seçimi `data-theme` özniteliğine yazar ve `pcb.theme` anahtarıyla `localStorage`'da saklar. `index.html` içindeki satır içi betik kayıtlı tercihi boyamadan önce uygular, böylece yanlış tema parlaması olmaz. Bileşenler yalnızca rollere (`--bg`, `--surface`, `--text`...) yazılır; hiçbir bileşen tema başına ayrı değer taşımaz.

**Key Characteristics:**
- Tek aile Geist Variable; başlıklar 600, gövde 400, tablolarda `tnum`.
- Nötr zemin + beyaz/kömür panel + 1px kıl çizgisi; cam, bulanıklık, doku yok.
- Tek indigo vurgu: birincil eylem, seçim durumu, odak, baz parça, satır içi bağlantı.
- Referans 100 çizgili yatay puan çubuğu imza öğedir.
- Karşılaştırma renkleri parçaya bağlı 5 kategorik slot; renk sırayı değil kimliği izler.
- İki tema eşit; varsayılan cihaz ayarı, elle geçiş.
- Raster görsel yok; logo, favicon ve ikonlar SVG.

## Colors

Soğuk, hafif mavimsi nötr gri skala üzerine tek bir indigo vurgu; veri renkleri ayrı bir katmandır ve arayüz rengiyle karışmaz. Frontmatter'daki anahtarlar Tailwind yardımcı adlarıdır (`bg-line`, `text-ink-2`...); karşılıkları `src/index.css` içindeki CSS değişkenleridir (`line` = `--border`, `line-strong` = `--border-strong`, `ink` = `--text`, `ink-2` = `--text-2`, `ink-3` = `--text-3`; diğerleri aynı adla). `-dark` son ekli anahtarlar aynı rolün koyu tema değeridir; kodda ayrı değişken değil, aynı değişkenin `:root[data-theme="dark"]` ve `@media (prefers-color-scheme: dark) :root:not([data-theme="light"])` altındaki değeridir.

### Primary
- **Mürekkep İndigosu** (`accent`, açık #4f46e5 / koyu #818cf8): birincil düğme dolgusu, odak halkası (`:focus-visible` 2px + 2px ofset), metin imleci, seçim vurgusu, "Yalnızca farklar" anahtarının açık hali, logo karesi.
- **Derin İndigo** (`accent-hover`, açık #4338ca / koyu #a5b4fc): birincil düğmenin üzerine gelme hali. Koyu temada vurgu açılarak ilerler, kararmaz.
- **İndigo Metni** (`accent-text`, açık #4338ca / koyu #a5b4fc): satır içi bağlantılar ("Nasıl hesaplanır?", başlıktaki "tahmini endeks"), bağlantıların hover rengi, baz parça ve eklenmiş parça ikon düğmesinin etkin rengi, vurgulu rozet metni.
- **İndigo Buğusu** (`accent-soft`, açık #eef0ff / koyu `rgb(129 140 248 / 0.14)`): vurgulu rozet zemini (seçim sayısı, "Baz", "Ekli"), sıralama tablosunda karşılaştırmaya eklenmiş satırın zemini, alan odağındaki 3px halka.
- **Vurgu Üstü Mürekkep** (`accent-ink`, açık #ffffff / koyu #0f0f1a): indigo dolgunun üzerindeki metin ve logo çubukları.

### Secondary
- **Durum Yeşili** (`good`, açık #0f8a0f / koyu #2fbf4a): pozitif fark (`Delta`) ve satırın en iyi değerini işaretleyen yukarı ok. Her zaman yön ikonu ile birlikte.
- **Durum Kırmızısı** (`critical`, açık #d03b3b / koyu #f06a6a): kötü yöndeki fark, satırın en kötü değerini işaretleyen aşağı ok, "çıkar" ikon düğmesinin hover rengi.

### Tertiary
Veri görselleştirme katmanı; arayüz öğesine asla uygulanmaz.
- **Kategorik slotlar** (`series-1` mavi, `series-2` turuncu, `series-3` yeşil, `series-4` amber, `series-5` pembe; açık ve koyu değerleri frontmatter'da): karşılaştırılan en fazla 5 parçanın kimlik rengi. `seriesColor(slot)` → `var(--series-N)`. Renk hem puan çubuğunda hem `Swatch` karesinde (10px, 3px köşe) hem tablo sütun başlığında aynıdır.
- **Tek Seri Mavisi** (`single`, açık #2a78d6 / koyu #3987e5): tek serili çubuklar (ilk-10 tabloları, sıralama tablosu, detay sayfası puan satırları). `ScoreBar`'ın varsayılan rengi.
- **Çubuk Yatağı** (`track`, açık #ececf0 / koyu #232328): puan çubuğunun boş kısmı.
- **Referans Çizgisi** (`ref-line`, açık #9a9aa5 / koyu #6f6f79): 100 referans işaretinin 1px dikey çizgisi.

### Neutral
- **Kâğıt Gri Zemin** (`bg`, açık #f7f7f8 / koyu #0b0b0d): sayfa zemini, yapışkan başlığın katı zemini, `theme-color` meta değeri.
- **Panel Yüzeyi** (`surface`, açık #ffffff / koyu #141417): panel, açılır liste, alan, ikincil düğme, yüzen karşılaştırma çubuğu.
- **İç Yüzey** (`surface-2`, açık #f4f4f6 / koyu #1a1a1e): hover zemini (satır, düğme, gezinme), etkin gezinme öğesi, segment anahtarı yatağı, spesifikasyon grup başlığı satırı, formül toplam satırı.
- **Derin İç Yüzey** (`surface-3`, açık #ececf0 / koyu #232328): kapalı anahtar yatağı, yükleme iskeleti.
- **Kıl Çizgisi** (`line`, açık #e4e4e8 / koyu #26262c): panel kenarı, panel başlığı ayırıcısı, tablo satır çizgileri, başlık ve altbilgi çizgisi.
- **Güçlü Çizgi** (`line-strong`, açık #cfcfd6 / koyu #36363d): alan ve ikincil düğme kenarı, boş durum kesik çerçevesi, kaydırma çubuğu.
- **Mürekkep** (`ink`, açık #0f0f12 / koyu #f4f4f5): başlıklar, parça adları, rakamlar.
- **İkincil Mürekkep** (`ink-2`, açık #4b4b55 / koyu #b8b8c0): açıklama cümleleri, gezinme metni, spesifikasyon satır etiketleri.
- **Üçüncül Mürekkep** (`ink-3`, açık #6b6b76 / koyu #8e8e98): meta satırları, tablo başlıkları, `label`, placeholder, sıra numarası, "—" boş değer.

### Named Rules
**The Tek Vurgu Kuralı.** İndigo yalnızca eylem ve durum taşır: birincil eylem, seçim durumu (seçim sayısı rozetleri, eklenmiş satır, baz parça), odak ve satır içi bağlantı. Süs, başlık rengi veya veri rengi olarak kullanılmaz; veri çubukları asla indigo değildir.

**The Parçaya Bağlı Renk Kuralı.** Karşılaştırmadaki renk slotu parçaya eklenirken atanır (`src/state/compare.jsx`, boştaki en düşük slot) ve parça çıkarılana kadar değişmez. Sıralama ekseni veya baz parça değişince renkler yer değiştirmez; renk sırayı değil kimliği izler.

**The Etiketli Değer Kuralı.** Açık temada 3 slot #ffffff üzerinde 3:1'in altında kalır; bu yüzden her çubuğun yanında sayısal değer her zaman metin olarak yazılır. Çubuk yalnızca göz içindir (`aria-hidden`), bilgi metindedir.

**The İşaretli Durum Kuralı.** Durum rengi tek başına anlam taşımaz: fark her zaman işaretle (`+%8`) ve sıra listesinde yön ikonuyla, en iyi/en kötü spesifikasyon değeri ok ikonuyla gösterilir. "Düşük olan iyi" satırlarda (TDP, PSU, fiyat) işaret ile iyilik ters düşer; satır etiketi bunu metinle söyler, ekran okuyucu "daha iyi / daha kötü" duyar. Değer metni metin renginde kalır; yalnızca ikon (ve `Delta`'da fark metni) durum rengini alır.

## Typography

**Display Font:** Geist Variable (`@fontsource-variable/geist`, ui-sans-serif, system-ui, sans-serif yedekli)
**Body Font:** Geist Variable
**Label/Mono Font:** ayrı aile yok; rakamlar Geist'in `tabular-nums` özelliğiyle hizalanır.

**Character:** Tek aile, ağırlık ve boyutla hiyerarşi kuran nötr bir grotesk. Başlıklarda negatif harf aralığı sıkılık verir; gövde 15px ve 1.55 satır yüksekliğiyle rahat okunur.

### Hierarchy
- **Display** (600, 2.25rem → 640px üstünde 3rem, 1.08, -0.035em): yalnızca ana sayfa başlığı "Hangi parça daha güçlü?".
- **Headline** (600, 1.75rem → 640px üstünde 2rem, 1.25, -0.02em): `PageHeader` sayfa başlığı (karşılaştır, sıralama, detay, yöntem). 404 başlığı 1.875rem → 2.25rem.
- **Title** (600, 0.9375rem, 1.3, -0.005em): panel başlığı; `panel-title` her panelin h2'sidir.
- **Body** (400, 0.9375rem, 1.55): gövde. Sayfa girişi (`lead`) 1rem, ana sayfada 1.125rem; açıklama satırları 52ch–68ch ile sınırlı, not satırları 80ch.
- **Body-table** (400, 0.875rem, `tnum`): `data-table` hücreleri; sayısal sütunlar sağa hizalı.
- **Label** (500, 0.8125rem, 1.3, `ink-3`): form etiketleri ve anahtar-değer çiftlerinin anahtarı. Panel meta satırları ve notlar da 0.8125rem, 400.
- **Caption** (500, 0.75rem, `ink-3`): tablo sütun başlıkları, rozetler (550), açılır liste başlığı.
- **Figure** (600, `tnum`): endeks rakamları; tablo içinde 0.875rem, karşılaştırma sıra listesinde 1.125rem, detay sayfasındaki ana endeks 1.5rem ve -0.02em.

Ara ağırlık 550 düğme ve rozet metninde kullanılır (Geist değişken olduğu için).

### Named Rules
**The Cümle Düzeni Kuralı.** Her başlık, etiket, düğme ve sütun başlığı cümle düzenindedir. Büyük harf dönüşümü ve geniş harf aralığı yoktur.

**The Tablo Rakamı Kuralı.** Karşılaştırılan her rakam `tnum` ile yazılır (`.tnum` veya `.data-table .num`); sütunlardaki rakamlar basamak basamak hizalanır.

## Layout

Kapsayıcı en fazla 1280px, kenar boşluğu mobilde 16px, 640px üstünde 24px; başlık, içerik ve altbilgi aynı kapsayıcıyı paylaşır. Yapışkan başlık 56px yüksekliğindedir; masaüstü gezinme 1024px'te (`lg`) açılır, altında menü düğmesi başlığın altında tam genişlik bir gezinme bölmesi açar. Veri damgası ("688 parça · tahmini endeks") 1280px'te (`xl`) görünür, mobil menüde tekrarlanır.

Dikey ritim 24px'tir (`space-y-6`, ızgara `gap-6`): paneller arası ve sayfa blokları arası hep bu değer. Sayfa başlığı üstte 32px/48px, altta 24px/32px boşluk alır. Panel gövdesi 16px, 640px üstünde 20px iç boşluk kullanır; tablo hücreleri 10px × 12px, kenar hücreler 16px/20px ile panel başlığına hizalanır.

Ana sayfa `lg` üstünde iki sütundur (sol: başlık, arama, eylemler; sağ: öne çıkan karşılaştırmalar paneli), altında GPU ve CPU ilk-10 tabloları yan yana. Karşılaştırma sıra listesi `md` üstünde 6 sütunlu bir ızgaradır (sıra, parça, çubuk, endeks, baza göre, eylemler); altında çubuk parça adının altına iner, değer ve fark sağda kalır. Geniş tablolar yatay kayar; özellik sütunu `sticky left-0` ile sabit kalır. Sıralama tablosunda sütunlar önceliğe göre kırılım noktalarında gizlenir. Yöntem sayfası `lg` üstünde 15rem'lik sağ içindekiler sütunu kullanır.

## Elevation & Depth

Sistem düzdür: derinlik tonla (zemin `bg` → panel `surface` → iç yüzey `surface-2`) ve 1px çizgiyle kurulur. Yükseltme gölgesi (`--shadow-pop`) yalnızca sayfanın üstünde gerçekten yüzen iki katmanda kullanılır: parça aramanın açılır listesi ve sıralama sayfasındaki yüzen karşılaştırma çubuğu. Kontrollerde yükseltme değil temas anlamında iki mikro gölge vardır: ikincil düğme ve segment anahtarının seçili öğesi.

### Shadow Vocabulary
- **Açılır katman** (`box-shadow: var(--shadow-pop)`; açık `0 12px 32px -8px rgb(15 15 18 / 0.18), 0 2px 6px -2px rgb(15 15 18 / 0.08)`, koyu `0 16px 40px -8px rgb(0 0 0 / 0.6), 0 2px 8px -2px rgb(0 0 0 / 0.4)`): arama açılır listesi, yüzen karşılaştırma çubuğu.
- **Düğme teması** (`box-shadow: 0 1px 1px rgb(0 0 0 / 0.04)`): ikincil düğmenin taban çizgisi.
- **Seçili segment** (`box-shadow: 0 1px 2px rgb(0 0 0 / 0.08), 0 0 0 1px var(--border)`): segment anahtarında basılı öğe.

### Named Rules
**The Düz Zemin Kuralı.** Paneller, kartlar ve tablolar gölgesizdir; ayrım 1px `line` ile yapılır. Gölge yalnızca açılır katmanlarda ve yüzen karşılaştırma çubuğunda bulunur.

**The Katı Başlık Kuralı.** Yapışkan başlık `bg` rengiyle katıdır ve alt kenarında 1px çizgi taşır. Cam efekti, `backdrop-filter`, bulanıklık ve yarı saydam zemin kullanılmaz.

## Shapes

Yumuşak ama sıkı köşeler: kontroller 8px (düğme, alan, iç kutular), paneller ve açılır liste 10px, yüzen karşılaştırma çubuğu 12px; içteki küçük öğeler 6px (segment öğesi, gezinme öğesi, liste seçeneği) ve segment yatağı 9px, böylece iç içe köşeler eş merkezli kalır. Rozetler, puan çubuğu ve anahtar tam hap (999px); renk anahtarı karesi 3px. Puan çubuğu dolgusunun sol ucu düz, sağ ucu yuvarlaktır (`0 999px 999px 0`), çünkü değer soldan büyür. Kenarlıklar her yerde 1px; kesikli çizgi yalnızca boş durumlarda ("Henüz parça eklenmedi", "N parça daha ekleyebilirsin"). Logo 26px kare (7px köşe) içinde yükselen üç çubuktur; favicon aynı SVG'dir.

## Components

### Buttons
Sakin, yoğun ve net; 40px yükseklik, 550 ağırlık, ikonla 8px aralık.
- **Shape:** hafif yuvarlak (8px).
- **Primary:** `accent` dolgu, `accent-ink` metin, 0 16px iç boşluk. Sayfa başına tek birincil eylem (ana sayfada "GPU karşılaştır", yüzen çubukta "Karşılaştır", detayda "Karşılaştırmaya ekle").
- **Hover / Focus:** hover `accent-hover`; arka plan, kenar, renk ve gölge 150ms ease-out geçer. Odak global `:focus-visible` halkasıdır (2px `accent`, 2px ofset). Devre dışı: %45 opaklık, `not-allowed`.
- **Secondary:** `surface` zemin, `line-strong` kenar, mikro temas gölgesi; hover `surface-2`. Birincilin yanındaki eşdeğer eylem ve eklenmiş parçanın durum düğmesi.
- **Ghost:** 36px, 0 10px, `ink-2` metin, şeffaf; hover `surface-2` ve `ink`. Panel başlığı eylemleri ("Tümü", "Temizle"), sayfa başlığındaki çapraz bağlantı.
- **Icon:** ghost + 36px kare; tema düğmesi, menü, baz yap, çıkar, tabloya ekle. Etkin durumda (`aria-pressed`) ikon `accent-text` alır.

### Chips
- **Style:** hap rozet, 22px, 0.75rem/550; nötr sürüm `surface-2` zemin, `line` kenar, `ink-2` metin (tür kodu "GPU"/"CPU").
- **State:** vurgulu sürüm `accent-soft` zemin, `accent-text` metin, kenarsız; yalnızca seçim durumu için (gezinmedeki seçim sayısı, "Baz", "Ekli").

### Cards / Containers
- **Corner Style:** 10px.
- **Background:** `surface`.
- **Shadow Strategy:** yok (Düz Zemin Kuralı).
- **Border:** 1px `line`.
- **Internal Padding:** başlık satırı en az 52px, 12px × 20px, altında 1px ayırıcı; başlık solda (title + isteğe bağlı 0.8125rem meta satırı), eylemler sağda. Gövde 16px/20px; tablo içeren panellerde 0.

### Inputs / Fields
- **Style:** 40px (ana sayfa aramasında 48px ve 1rem), `surface` zemin, 1px `line-strong` kenar, 8px köşe, 0 12px; arama ikonu solda 12px'te, metin 40px'ten başlar. `select` için 1.75 çizgili SVG ok sağda.
- **Focus:** kenar `accent` olur ve 3px `accent-soft` halka belirir (outline yerine). Hover'da kenar `ink-3`.
- **Error / Disabled:** alanlarda hata durumu yok; açılır listede kullanılamaz seçenek %45 opaklık ve `not-allowed`.

### Navigation
- **Style:** yapışkan, 56px, katı `bg` zemin, alt 1px çizgi. Solda logo + ad (0.9375rem/600), ardından 5 bağlantı (0.875rem/500, 36px, 6px köşe). Varsayılan `ink-2`, hover ve etkin `surface-2` zemin + `ink`. Karşılaştırma bağlantıları seçili parça sayısını vurgulu rozetle gösterir. Sağda veri damgası, tema düğmesi (ay/güneş ikonu) ve `lg` altında menü düğmesi; mobil bölme `surface` zeminde dikey liste, Escape ve rota değişimiyle kapanır.
- **Footer:** üstte 1px çizgi, ad + tek paragraf kaynak/tahmin notu (0.8125rem, `ink-3`) ve iki sütunlu bağlantı listesi (`ink-2`, hover `ink`).

### Segmented Control
`surface-2` yatak, 1px `line`, 3px iç boşluk, 9px köşe; öğeler 32px, 0.8125rem/500, `ink-2`. Seçili öğe (`aria-pressed="true"`) `surface` zemin, `ink` metin ve seçili segment gölgesi. Sıralama ekseni ve ilk-10 tablo ekseni için.

### Data Table
Tam genişlik, çökük kenarlık, 0.875rem. Başlıklar 0.75rem/500 `ink-3`, satırlar 1px `line` ile ayrılır, son satır çizgisiz, hover `surface-2`. Sayısal sütun sağa hizalı ve `tnum`. Sıralanabilir başlıklar `sort-btn` (hover/etkin `ink`, yön ikonu). Karşılaştırma tablosunda grup başlıkları `surface-2` zeminli 0.75rem/600 satırlardır; satırın en iyi değeri kalın + yeşil yukarı ok, en kötüsü kırmızı aşağı ok; ekran okuyucu "(en iyi)" / "(en kötü)" duyar. Baz parça dışında, yönü (`better`) olan her sayısal hücrenin altında baza göre fark (`Delta`, ikonsuz, 0.75rem; %10 altında bir ondalık) iyi/kötü renginde yazar; yalnızca eşitlik (±%0) `ink-3`. Shader, saat, önbellek gibi mimariler arasında birebir kıyaslanamayan sayımlar da yön alır; tablo notu (`specNote`) bunu söyler. Yönü olmayan satırda (yonga alanı) fark yazılmaz: nötr gri yüzde kullanıcıya yarım kalmış görünüyordu. Baz sütun başlığı "Baz" rozeti taşır; hücreler iki satırlı olduğu için üste hizalıdır. Eksik veri `ink-3` "—" ve ekran okuyucuya "veri yok".

### Puan Çubuğu (imza)
8px yükseklikte hap yatak (`track`), soldan `scaleX` ile büyüyen dolgu, 100 referansında yatağın 3px üstüne ve altına taşan 1px `ref-line` işareti. Tek seride `single`, karşılaştırmada parçanın slot rengi. Aynı görünümdeki tüm çubuklar tek ölçeği paylaşır (ör. en yüksek değerin 1.06 katı), satırlar arası karşılaştırılabilir. Eksen, baz veya seçim değişince dolgu 250ms `cubic-bezier(0.16, 1, 0.3, 1)` ile yeni uzunluğa kayar; azaltılmış harekette anında. Detay sayfasındaki ana endeks satırında çubuk 10px'tir.

### Açılır Liste ve Yüzen Çubuk
Parça araması ARIA 1.2 combobox'tır: `surface` zemin, 1px `line`, 10px köşe, 4px iç boşluk, `shadow-pop`; seçenekler 6px köşe, etkin seçenek `surface-2`; en fazla 8 sonuç, tür rozeti ve sağda endeks ya da "Ekli" rozeti. Yüzen karşılaştırma çubuğu sayfanın altında 16px yukarıda, en fazla 44rem, 12px köşe, `shadow-pop`; "N/5 seçili" ve birincil "Karşılaştır" düğmesi taşır.

### Bilgi Düğmesi (InfoTip)
Her bilginin (karşılaştırma satırı, detaydaki alan, puan satırı, sıralama sütunu) yanında 14px `info` ikonu: `ink-3`, hover/odakta `ink`, 24px dokunma alanı (negatif kenar boşluğuyla satırı büyütmez), imleç `help`. Üzerine gelince, odaklanınca ya da dokununca kısa açıklama açılır: `surface` zemin, `line` kenar, 8px köşe, `shadow-pop`, 0.8125rem/1.45 `ink-2`, en fazla 18rem. Açıklama gövdeye çizilir (portal) çünkü tablolar yatay kaydırılan kapsayıcıda; düğmenin solundan başlar, altta yer yoksa üstte açılır; kaydırma, yeniden boyutlandırma ve Escape kapatır. Metinler `src/data/info.js`'te: ne olduğu + ne işe yaradığı, bir iki cümle; aynı alan türe göre farklıysa (CPU'da "Base Clock" = BCLK) türe özel metin. Ekran okuyucu metni düğmenin tanımı (`aria-describedby`) olarak duyar.

### Tahmin Notu
`EstimateNote` her endeks gösteren sayfanın altında 0.8125rem `ink-3` tek paragraftır: endeksin tahmin olduğu, benchmark olmadığı, referans parça ve "Nasıl hesaplanır?" bağlantısı.

**The Tahmini Etiket Kuralı.** Endeks gösterilen her yerde "tahmini" sözcüğü görünür (panel meta satırı, veri damgası, tahmin notu). Ölçülmemiş bir hata payı hiçbir yerde sayısal olarak gösterilmez.

## Do's and Don'ts

### Do:
- **Do** bileşenleri yalnızca rollere yaz (`var(--surface)`, `bg-surface`, `text-ink-2`); yeni bir renk gerekiyorsa önce iki temada da rolü tanımla.
- **Do** her paneli 10px köşe, 1px `line` kenar ve `surface` zeminle kur; başlığı `panel-title`, meta satırını 0.8125rem `ink-3` ile yaz.
- **Do** her endeksi referans 100 çizgili puan çubuğuyla ve yanında `tnum` rakamla göster; aynı görünümdeki çubuklara tek ölçek ver.
- **Do** karşılaştırmada rengi `seriesColor(compare.slotOf(id))` ile parçaya bağla; tek serili çubuklarda `--single` kullan.
- **Do** farkı ve en iyi/en kötü değeri yön ikonu + durum rengiyle işaretle; değer metnini metin renginde bırak.
- **Do** indigoyu eylem ve seçim durumu için sakla: birincil düğme, satır içi bağlantı, seçim sayısı rozeti, baz parça, odak.
- **Do** her yeni hareketi `prefers-reduced-motion: reduce` altında kapat; durum geçişlerinde 150ms ease-out kullan.
- **Do** eksik veriyi `ink-3` "—" ve ekran okuyucuya "veri yok" olarak göster.
- **Do** endeks gösteren her yüzeye "tahmini" etiketini ve yöntem bağlantısını koy.

### Don't:
- **Don't** tematik kostüme dönme: split-flap pano, neon oyuncu estetiği ve süs amaçlı kart ızgarası reddedildi.
- **Don't** cam efekti, `backdrop-filter`, bulanıklık veya yarı saydam yapışkan başlık kullanma.
- **Don't** panellere, tablolara veya kartlara gölge verme; `--shadow-pop` yalnızca açılır katmanlar ve yüzen karşılaştırma çubuğu içindir.
- **Don't** karşılaştırma rengini sıraya göre ata ya da eksen değişince renkleri yeniden dağıt.
- **Don't** durumu yalnızca renkle anlat veya en iyi değerin metnini yeşile boya.
- **Don't** veri çubuklarını indigo yapma; indigo veri değil eylemdir.
- **Don't** büyük harf dönüşümü, geniş harf aralığı veya ikinci bir yazı ailesi ekleme.
- **Don't** ölçülmemiş bir hata payını (±%X gibi) sayısal olarak gösterme.
- **Don't** raster görsel, ürün fotoğrafı veya marka logosu ekleme; ikonlar 1.75 çizgili SVG setinden (`Icon.jsx`) gelir.
