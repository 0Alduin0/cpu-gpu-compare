# Yapılacaklar

Açık işlerin tek listesi. Biten iş buradan silinir; ayrıntılı geçmiş ilgili README'de kalır
(`scripts/dataset/README.md`, `scripts/calibration/README.md`).

Son güncelleme: 2026-10-01.

## Endeksi olmayan parçalar (2026-10-01'de eklenen klasikler ve 2026 çıkışları)

Veritabanı "tüm zamanların popülerleri + bu yılın çıkışları" ile genişletildi (CPU 540, GPU 444;
ayrıntı `scripts/dataset/README.md`). Özellikleri tam ama endeksi boş olanlar; hiçbirine tahmini
katsayı girilmeyecek, ölçüm bulununca eklenecek:
- [ ] **Çekirdek dağılımı bilinmeyen hibritler:** Core Ultra 5 338H (Panther Lake, 12 çekirdek), Core 3 304
  (Wildcat Lake, 5 çekirdek). Intel spesifikasyonundan P/E dağılımı alınıp `cpuModel.js` `CORE_SPLIT`'e yazılacak.
- [ ] **Tümleşik GPU'lar:** Xe3 (Arc B390/B370, Arc G3, Panther/Wildcat Lake) ve Gen 7/7.5 (HD 4000, HD 4600)
  için katsayı yok; bağımsız Time Spy ölçümüyle hedef eklenebilir. Endeksi olup hedefi olmayan tümleşikler
  (HD 520/530/620/630, Vega 11, Arc 130T, Radeon 820M, 8065S) da aynı kaynaktan doğrulanabilir.
- [ ] **RTX PRO 5500 Blackwell:** kaynak L2 önbelleği yazınca `scrape.py --kind gpu --refresh all
  --only "RTX PRO 5500 Blackwell Workstation"`.

## Bilerek yapılmayanlar

- Eski CPU mikromimarileri (66 işlemci) endekssiz kalıyor (kullanıcı kararı, 2026-10-01): Core 2
  (Conroe/Kentsfield/Yorkfield; Wolfdale var), Nehalem/Westmere, Sandy Bridge, Broadwell, K8, K10,
  Bulldozer/Steamroller/Excavator. IPC kaynağımız bağımsız R23 ölçüm listesi; bu işlemciler orada
  arşivde ve değersiz. Tek tek işlemci sayfaları ya da başka bir testle köprü değerlendirildi, seçilmedi.
  Detay sayfası sebebini yazar ("IPC ölçümü yok").
- Detay sayfasındaki "İkisini karşılaştır" ve ana sayfadaki öne çıkan karşılaştırmalar mevcut
  karşılaştırma kümesini uyarısız değiştirir. Eylemin adı bunu söylediği için bırakıldı.

Kendiliğinden izlenenler (buraya taşımaya gerek yok):
- Kaynakta henüz olmayan parçalar: `scripts/dataset/missing-*.txt`, `--retry` ile yeniden denenir.
- Modelin bilinen sınırları ve hedefi olmayan GPU'lar (konsollar, Steam Deck): `scripts/calibration/README.md`.
