---
name: PC Benchmark
description: Türkçe CPU/GPU spesifikasyon karşılaştırma panosu; fırçalanmış çelik kasada split-flap kalkış tablosu.
colors:
  amber: "#ffb000"
  amber-hot: "#ffc233"
  amber-ink: "#1a1200"
  signal: "#ff5a4e"
  paint: "#edece7"
  paint-dim: "#a9aba6"
  flap: "#0c0d0f"
  flap-top: "#141518"
  flap-edge: "#2b2f34"
  steel-950: "#121416"
  steel-900: "#181b1e"
  steel-850: "#1e2124"
  steel-800: "#25292d"
  steel-700: "#343a40"
  steel-600: "#4a5057"
  steel-400: "#989fa6"
  steel-300: "#aab0b6"
  steel-200: "#c9cdd1"
  steel-field: "#303336"
  steel-bezel: "#56595e"
typography:
  display:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "4.75rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "normal"
  headline:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 500
    lineHeight: 1
  title:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: "1.25rem"
    letterSpacing: "0.16em"
  data:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.06em"
    fontFeature: "tnum"
  body:
    fontFamily: "Barlow Semi Condensed, Arial Narrow, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: "1rem"
    letterSpacing: "0.14em"
rounded:
  cell: "1px"
  strip: "2px"
  control: "3px"
  board: "4px"
  lamp: "999px"
spacing:
  table-gap-x: "3px"
  table-gap-y: "4px"
  board-body: "16px"
  board-gap: "20px"
  gutter: "24px"
components:
  button-amber:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.amber-ink}"
    typography: "{typography.title}"
    rounded: "{rounded.control}"
    padding: "0 18px"
    height: "44px"
  button-amber-hover:
    backgroundColor: "{colors.amber-hot}"
  button-steel:
    backgroundColor: "{colors.steel-850}"
    textColor: "{colors.paint}"
    rounded: "{rounded.control}"
    padding: "0 18px"
    height: "44px"
  button-steel-hover:
    backgroundColor: "{colors.steel-800}"
  button-quiet:
    textColor: "{colors.steel-300}"
    rounded: "{rounded.control}"
    padding: "0 10px"
    height: "36px"
  field:
    backgroundColor: "{colors.flap}"
    textColor: "{colors.paint}"
    typography: "{typography.data}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "44px"
  segmented-active:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.amber-ink}"
    rounded: "{rounded.strip}"
    height: "36px"
  strip:
    backgroundColor: "{colors.flap}"
    textColor: "{colors.paint}"
    typography: "{typography.data}"
    rounded: "{rounded.strip}"
    padding: "5.6px 10px"
    height: "36px"
  board:
    backgroundColor: "{colors.steel-950}"
    textColor: "{colors.paint}"
    rounded: "{rounded.board}"
    padding: "16px"
---

# Design System: PC Benchmark

## Overview

**Creative North Star: "Kalkış Panosu"**

Karşılaştırma bir gar kalkış panosu gibi okunur. Parçalar endekse göre sıralı satırlardır; sütunlar asla yer değiştirmez; bir değer değiştiğinde yalnızca etkilenen hücreler harf harf döner. Sayfa zemini ve pano çerçeveleri fırçalanmış çeliktir (`public/steel.png`, taban rengine `overlay` ile biner); veri, ortasından menteşe çizgisiyle bölünmüş mat siyah flap hücrelerinde beyaz boya harfle durur.

Yoğunluk yüksektir ve bu kasıtlıdır: pano tablo gibi davranır, kart ızgarası gibi değil. Her bölüm cetvelli bir pano çerçevesidir (başlık şeridi + gövde). Renk az ve anlamlıdır: kehribar "seçili / en iyi / birincil eylem", sinyal kırmızısı "en düşük / hata"; geri kalan her şey çelik ve boya. Reddedilen kategori varsayılanı: koyu lacivert zemin, mor/mavi neon gradyan, ikonlu kart ızgarası.

Hareket tek bir imzadan ibarettir: flap kaskadı. Sıralama, filtre, baz parça veya seçim değişince hücreler kademeli döner; `prefers-reduced-motion` altında anında değişir; ekran okuyucu yalnızca son değeri duyar.

**Key Characteristics:**
- Fırçalanmış çelik zemin ve çelik bezel içinde gömülü siyah pano yüzü.
- Veri her zaman flap hücresinde veya flap şeridinde; menteşe çizgisi yapıdır, süs değil.
- Tek aile: Barlow Condensed (pano, başlık, veri, etiket) + Barlow Semi Condensed (düz metin).
- Kehribar ve sinyal kırmızısı yalnızca durum taşır; anlam asla yalnız renkle verilmez (sıra numarası, lamba, ok ikonu, etiket).
- Eksik veri tasarlanmış boş flap hücresidir, çıplak tire değil.

## Colors

Isı taşımayan çelik ve kömür nötrler üstünde iki sinyal rengi: sıcak kehribar ve sinyal kırmızısı.

### Primary
- **Pano Kehribarı** (`amber`): seçili durum, birincil eylem (`btn-amber`), aktif segment, aktif gezinme alt çizgisi, satırın en iyi değeri, 1. sıra, lamba, odak halkası, metin seçimi ve imleç rengi. Üzerindeki metin daima **Kehribar Mürekkebi** (`amber-ink`).
- **Sıcak Kehribar** (`amber-hot`): kehribar düğmenin kenarı ve hover durumu; kehribar bağlantıların hover rengi.

### Tertiary
- **Sinyal Kırmızısı** (`signal`): satırın en düşük değeri, baz parçaya göre negatif fark (−%0,5 altı), 404 göstergesi, karşılaştırmadan çıkarma düğmesinin hover rengi. Her zaman `sortDown` ok ikonu veya metinle birlikte.

### Neutral
- **Beyaz Boya** (`paint`): flap harfleri, birincil metin, düğme metni.
- **Soluk Boya** (`paint-dim`): ikincil flap tonu (1. dışındaki sıra numaraları, nötr fark).
- **Flap Siyahı** (`flap`) / **Üst Yaprak** (`flap-top`): flap hücresinin alt ve üst yaprağı; `field` ve `segmented` zemini de `flap`.
- **Çelik Rampası** (`steel-950` … `steel-200`): `steel-950` pano yüzü ve html zemini; `steel-900` açılır liste seçenekleri ve scrollbar izi; `steel-850`/`steel-800` çelik düğme ve pano başlık cetveli, sönük gösterge hücresi; `steel-700` alan kenarı, sönük lamba; `steel-600` çelik düğme kenarı, flap pimleri, dikey ayraçlar; `steel-400` placeholder; `steel-300` etiketler ve yardımcı metin; `steel-200` giriş paragrafları ve pasif gezinme.
- **Çelik Zemin** (`steel-field`) / **Çelik Bezel** (`steel-bezel`): doku bindirilen taban tonları; biri sayfa zemini ve çelik şeritler (başlık, alt bilgi, sabit çubuk), diğeri pano çerçevesi.

### Named Rules
**The Lamba Rule.** Kehribar yalnızca "seçili, en iyi, birincil eylem, odak" anlamına gelir. Dekoratif kehribar yoktur; bir ekranda kehribarın neyi işaret ettiği her zaman söylenebilmelidir.

**The Çift Kanal Rule.** En iyi/en düşük değer renk + işaretle verilir: kehribar lamba (`.lamp`) en iyiyi, kırmızı `sortDown` oku en düşüğü gösterir ve bir lejant bunu yazıyla açıklar. Kategoriler (GPU/CPU, sıra) etiket ve sıra numarasıyla ayrılır.

## Typography

**Display Font:** Barlow Condensed (with Arial Narrow, sans-serif) — 400/500/600
**Body Font:** Barlow Semi Condensed (with Arial Narrow, sans-serif) — 400/600
**Label/Mono Font:** Barlow Condensed, `tabular-nums` ile

**Character:** Dar, mühendislik tabelası gibi bir grotesk; pano harfleri büyük harf ve açık harf aralığıyla, düz metin aynı ailenin yarı-dar kesimiyle sakin ve okunur.

### Hierarchy
- **Display** (500, 2.25rem → 2.75rem ≥420px → 4rem ≥640px → 4.75rem ≥1280px, line-height 1): yalnızca ana sayfa başlığı, `FlapWords` + pimli flap hücrelerinde. 404'te aynı dil 3rem → 5rem.
- **Headline** (500, 1.75rem → 2.5rem ≥640px, line-height 1): sayfa başlığı (`PageTitle`), flap hücrelerinde.
- **Title** (600, 1.0625rem, 0.16em, büyük harf): pano başlık şeridi (`.board-title`), alt bilgide marka.
- **Data** (500, 1.0625rem, 0.06em, tabular-nums): flap şeridi, form alanı. Dar ekranda tablo şeridi 0.9375rem.
- **Body** (400, 1rem, line-height 1.55): düz metin. Giriş paragrafı 1.125rem `steel-200`, 52–62ch; yardımcı metin 0.875rem `steel-300`. Uzun metin en fazla 68–80ch.
- **Label** (600, 0.75rem, 0.14em, büyük harf, `steel-300`): alan ve gösterge etiketleri (Endeks, Fark, Sırala, Model), tablo sütun başlıkları, veri damgası, breadcrumb.

Düğme ve gezinme metni 0.9375rem / 600 / 0.14em büyük harf; segment düğmesi 0.875rem / 0.12em.

### Named Rules
**The Türkçe Büyük Harf Rule.** Türkçe metin `toLocaleUpperCase('tr-TR')` ile büyütülür (i → İ); model adları `lang="en"` taşır ve İngilizce büyütülür. Flap bileşenleri bunu kendisi yapar.

**The Rakam Hizası Rule.** Karşılaştırılan her sayı `tabular-nums` ile ve sağa hizalı durur; endeksler sabit hücre sayısına sola boşlukla tamamlanır (`padStart`).

## Layout

Tek kolon kap: `max-width: 1440px`, yan boşluk 16px (≥640px'te 24px). Panolar arasında 20px (`gap-5`) ızgara. Ana sayfada kahraman panosu ile canlı eşleşme `1.45fr / 1fr`, altında iki sıralama panosu `1fr 1fr` (≥1024px); daha dar ekranda hepsi yığılır. Pano gövdesi 12px, ≥640px'te 16px iç boşluk; tam döküm tablosu 6px/12px.

Pano tabloları ayrık hücrelidir: `border-spacing: 3px 4px` (≥640px altında `2px 3px`); her hücre kendi flap şerididir, satır çizgisi yoktur. Geniş karşılaştırma tablosu dar ekranda yatay kaydırılır ve bunu bir etiketle söyler. Veritabanı sayfasında seçim varken ekranın altına sabit bir çelik şerit çubuğu çıkar.

Kesme noktaları Tailwind varsayılanlarıdır (640 / 768 / 1024 / 1280px); başlık tipi için 400px ve 420px ara adımları kullanılır.

## Elevation & Depth

Yüzen yüzey yoktur: kart gölgesi, bulanık drop-shadow, gradyan dolgu kullanılmaz. Derinlik fiziksel malzemeden gelir: çelik bezel içine gömülü siyah yüz, flap hücresinin iki yaprağı ve menteşe boşluğu. Tüm gölgeler bu malzemeyi tarif eden, 0–3px'lik iç ve kenar gölgeleridir.

### Shadow Vocabulary
- **Gömme yüz** (`box-shadow: inset 0 0 0 1px #050506, inset 0 2px 3px rgb(0 0 0 / 0.55), 0 0 0 1px rgb(0 0 0 / 0.6), 0 1px 0 1px rgb(255 255 255 / 0.05)`): yalnızca `.board`.
- **Flap yaprağı** (`box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.05), inset 0 -1px 0 rgb(0 0 0 / 0.6)`): flap hücresi; şeritte 0.04 / 0.55.
- **Menteşe** (`box-shadow: 0 max(1px, 0.03em) max(1px, 0.05em) rgb(0 0 0 / 0.7)`): flap ortasındaki siyah çizginin alt yaprağa düşen gölgesi.
- **Şerit kenarı** (`box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.06)`): başlık, alt bilgi, sabit çubuğun üst parıltısı.
- **Lamba halesi** (`box-shadow: 0 0 0 2px rgb(255 176 0 / 0.18)`): yanık lamba.

### Named Rules
**The Gömülü Rule.** Yüzeyler yükselmez, gömülür. Yeni bir kap `.board` bezelini kullanır; kendi gölgesini icat etmez.

**The İki Yaprak Rule.** Flap hücresi ve şeridi daima `flap-top` üst yarı / `flap` alt yarı sert geçişli dolgu ve ortada 1px siyah menteşe çizgisi taşır. Bu, dünyanın kendi yapısıdır; "gradyan yok" kuralının istisnası değil, tanımıdır.

## Shapes

Köşeler neredeyse keskin, endüstriyel: gösterge hücresi 1px, flap şeridi ve segment düğmesi 2px, düğme/alan/segment kabı 3px, pano 4px. Flap hücresi harf boyutuna bağlı `0.07em` (sıkı hücrede `0.05em`). Tek yuvarlak biçim lambadır (999px). Pano çerçevesi 7px kalınlıkta çelik bezeldir. İkonlar 20×20 viewBox, 1.75 kontur, yuvarlak uç ve birleşim; yalnızca SVG.

## Components

### Buttons
Çelik tuş ve kehribar tuş: sağlam, büyük harf, basınca 1px iner.
- **Shape:** hafif yuvarlatılmış (3px), yükseklik 44px, yatay 18px.
- **Primary (`btn-amber`):** `amber` zemin, `amber-ink` metin, 1px `amber-hot` kenar; hover'da zemin `amber-hot`. Ekran başına tek birincil eylem.
- **Secondary (`btn-steel`):** `steel-850` zemin, `paint` metin, 1px `steel-600` kenar; hover'da `steel-800` zemin ve `steel-400` kenar.
- **Quiet (`btn-quiet`):** şeffaf, `steel-300` metin, 36px yükseklik; hover'da `paint` metin ve `steel-700` kenar. Pano başlığındaki eylemler ve "Tüm pano / Yöntem" bağlantıları.
- **Hover / Focus:** renk geçişleri 160ms, basış 120ms `--ease-out`; odak 2px kehribar outline, 2px offset. Devre dışı: %45 opaklık.
- **Toggle:** `aria-pressed` taşıyan çelik düğme içinde lamba (`lamp` / `lamp-off`) durumu gösterir.

### Segmented Control
`flap` zeminli, 1px `steel-700` kenarlı 3px kap, 2px iç boşluk; düğmeler 36px, 0.875rem büyük harf `steel-300`. Seçili segment (`aria-pressed="true"`) `amber` zemin, `amber-ink` metin. Sıralama ekseni seçimi için.

### Inputs / Fields
- **Style:** `flap` zemin, 1px `steel-700` kenar, 3px köşe, 44px (arama kutusunda 56px, 1.125rem), pano yazı tipiyle 1.0625rem. Placeholder büyük harf `steel-400`.
- **Focus:** kenar `amber`; hover'da `steel-600`. İmleç kehribar.
- **Select:** aynı alan, büyük harf 0.9375rem, sağda 1.75 konturlu SVG chevron.
- **Arama:** ARIA combobox + listbox; sonuçlar alanın altında en fazla 22rem yükseklikte liste.

### Navigation
Sticky, 64px yüksekliğinde çelik şerit başlık. Marka `FlapText` sıkı hücrelerde. Gezinme öğeleri pano yazı tipinde 0.9375rem / 600 / 0.14em büyük harf, pasif `steel-200`, aktif `paint` ve altında 2px kehribar çizgi. GPU/CPU grupları `board-label` kod etiketiyle ve dikey `steel-600` ayraçla ayrılır; seçili parça sayısı kehribar tek flap hücresinde. ≥1280px'te başlıkta veri damgası (parça sayısı · kaynak · "endeks tahminidir"). 1024px altında çelik "Menü" düğmesi, açılınca başlığın altında çelik şerit panel; Escape ve rota değişimi kapatır.

### Board (Pano)
Her bölümün kabı. Çelik bezel (7px) içinde `steel-950` yüz; başlık şeridi en az 48px, `steel-800` alt cetvel, solda `board-title` + `board-label` meta, sağda eylemler. İçinde kart yoktur; alt bölümler `steel-800` 1px cetvelle ayrılır.

### Flap Cell ve Flap Strip (imza)
- **FlapText / FlapWords:** her karakter ayrı `.flap` hücresi (0.78em × 1.12em, sıkı hücrede 0.6em). Büyük göstergelerde (`pins`) yanlarda `steel-600` pimler. Metin `sr-only` kopya olarak ekran okuyucuya verilir, hücreler `aria-hidden`.
- **Kaskad:** değişen her konum 2–4 ara karakterden geçer; adım 55ms, konumlar arası gecikme 28ms, her dönüşte `flap-fold` (90ms, −88° rotateX + parlama). Reduced-motion'da anında hedef.
- **Strip:** tablo hücresinde tek parça flap şeridi, en az 36px, 1.0625rem tabular. Değer değişince `strip-fold` (260ms, satır başına `--flip-delay` ile kademeli). Boş değer: tasarlanmış boş şerit + "veri yok" ekran okuyucu metni.
- **Tonlar:** `amber` (en iyi / 1. / baz), `signal` (en düşük / negatif fark), `dim` (ikincil).

### Cell Gauge ve Lamp
- **CellGauge:** sabit sayıda 12px yüksek, 2px aralıklı, 1px köşeli hücre; yanık `paint` veya `amber`, sönük `steel-800`. Yalnızca göz içindir (`aria-hidden`); sayı her zaman yanında yazılı.
- **Lamp:** 8px kehribar nokta, 2px hale; `lamp-off` `steel-700`, halesiz. "Karşılaştırmada / en iyi / açık" durumu.

### Estimate Note
Endeks gösteren her panoda tek satır `steel-300` not: tahmini olduğu, referans parça = 100, tipik sapma ve "Yöntem" bağlantısı.

## Do's and Don'ts

### Do:
- **Do** her veriyi flap hücresi (`FlapText`) veya flap şeridi (`Strip`) içinde göster; sayılar `tabular-nums` ve sağa hizalı.
- **Do** her yeni bölümü `Board` bezeli içine koy; alt bölümleri 1px `steel-800` cetvelle ayır.
- **Do** kehribarı yalnızca seçili / en iyi / birincil eylem / odak için kullan ve üzerindeki metni `amber-ink` yap.
- **Do** en iyi ve en düşük değeri renk + işaret (lamba, `sortDown` oku) + lejantla ver.
- **Do** eksik veriyi boş flap şeridiyle göster ve ekran okuyucuya "veri yok" de.
- **Do** her hareketi `prefers-reduced-motion` altında kapat; kaskad anında hedefe gitsin.
- **Do** ikonları 20×20 viewBox, 1.75 konturlu SVG setinden (`Icon.jsx`) al.

### Don't:
- **Don't** koyu lacivert zemin, mor/mavi neon gradyan veya ikonlu kart ızgarası kullanma.
- **Don't** yüzen kart gölgesi veya bulanık drop-shadow ekleme; derinlik bezel ve flap yapraklarından gelir.
- **Don't** kehribarı veya sinyal kırmızısını süs için kullanma; renk tek başına anlam taşımasın.
- **Don't** veri hücrelerinde çıplak tire, sıfır veya tahmini dolgu gösterme.
- **Don't** Barlow Condensed / Barlow Semi Condensed dışında yazı ailesi ekleme.
- **Don't** değer değişince sütun sırasını veya tablo düzenini oynatma; yalnızca hücreler döner.
