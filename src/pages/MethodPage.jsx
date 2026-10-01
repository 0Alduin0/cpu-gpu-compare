import { Link } from 'react-router-dom'
import { PageHeader, Panel, ScoreBar } from '../components/ui'
import { GPU_ARCH, GPU_MODEL, REFERENCE_GPU_NAME } from '../data/gpuModel'
import { CPU_MODEL, CPU_UARCH, REFERENCE_CPU_NAME } from '../data/cpuModel'
import { formatNumber } from '../data/format'

const f = (v, d = 2) => formatNumber(v, { digits: d, fixed: true })

function Prose({ children }) {
  return <div className="max-w-[68ch] space-y-4 text-[0.9375rem] leading-relaxed text-ink-2 [&_strong]:font-semibold [&_strong]:text-ink">{children}</div>
}

function Formula({ children, label }) {
  return (
    <figure className="my-5">
      <div className="overflow-x-auto rounded-lg border border-line bg-surface-2 px-4 py-3.5 text-[0.9375rem] font-medium whitespace-nowrap text-ink tnum">
        {children}
      </div>
      {label && <figcaption className="mt-2 text-[0.8125rem] text-ink-3">{label}</figcaption>}
    </figure>
  )
}

function CoefficientTable({ caption, rows, refValue, columns }) {
  const max = Math.max(...rows.map(r => r.value))
  return (
    <div className="relative mt-5 overflow-x-auto rounded-lg border border-line">
      <table className="data-table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th scope="col" className="!pl-4">{columns[0]}</th>
            <th scope="col" className="hidden w-[40%] sm:table-cell"><span className="sr-only">Çubuk</span></th>
            <th scope="col" className="text-right">{columns[1]}</th>
            {columns[2] && <th scope="col" className="!pr-4 text-right">{columns[2]}</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.label} className={r.value === refValue ? '[&>*]:bg-accent-soft' : ''}>
              <th scope="row" className="!pl-4 text-sm !font-medium !text-ink">{r.label}</th>
              <td className="hidden sm:table-cell">
                <ScoreBar value={r.value} max={max} />
              </td>
              <td className="num">{r.display}</td>
              {columns[2] && <td className="num !pr-4 text-ink-2">{r.relative}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const SECTIONS = [
  ['nedir', 'Endeks nedir'],
  ['gpu', 'GPU endeksi'],
  ['cpu', 'CPU endeksi'],
  ['sinirlar', 'Sınırlar'],
]

export default function MethodPage() {
  const ada = GPU_ARCH.ada.k
  const archRows = Object.values(GPU_ARCH)
    .sort((a, b) => b.k - a.k)
    .map(a => ({ label: a.label, value: a.k, display: f(a.k, 3) }))
  const uarchRows = [...new Map(CPU_UARCH.map(([, name, ipc]) => [name, ipc])).entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, ipc]) => ({ label: name, value: ipc, display: f(ipc) }))

  return (
    <main id="main" className="mx-auto max-w-[1280px] px-4 sm:px-6">
      <PageHeader
        title="Yöntem"
        lead="Performans endeksinin nasıl hesaplandığı, neyi ölçtüğü ve neyi ölçmediği. Tüm katsayılar burada; hiçbiri gizli değil."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="min-w-0 space-y-6">
          <Panel title="Endeks nedir, ne değildir" id="nedir">
            <Prose>
              <p>
                Endeks, bir parçanın teknik özelliklerinden hesaplanan <strong>tahmini göreli performanstır</strong>.
                Bu sitede hiçbir parça test edilmedi; rakamlar benchmark sonucu değildir. Amaç, iki parça arasındaki
                farkın büyüklüğünü doğru sırada ve makul oranda göstermektir.
              </p>
              <p>
                Ölçek sabit bir referansa bağlıdır: GPU'da <strong>{REFERENCE_GPU_NAME} = 100</strong>, CPU'da{' '}
                <strong>{REFERENCE_CPU_NAME} = 100</strong>. Endeksi 150 olan bir kart, referanstan yaklaşık %50 daha
                güçlü tahmin ediliyor demektir. Veritabanına yeni bir amiral gemisi eklense de mevcut değerler kaymaz.
              </p>
              <p>
                Katsayılar bağımsız ölçümlere oturtuldu. GPU'da 2006'dan bu yana çıkmış 403 kart için bağımsız göreli performans
                ölçümleri (tümleşik GPU'larda 3DMark Time Spy ortalamaları) kullanıldı; endeks bu
                değerlerden ortalama %4 sapıyor. CPU'da tek ve çok çekirdek eksenleri 200 işlemcinin Cinebench R23
                sonuçlarına, oyun ekseni 720p oyun testlerine (48 işlemci) oturtuldu;
                sapma tek çekirdekte ~%3, çok çekirdekte ~%10 (dizüstü güç ayarları farklı), oyunda ~%4. Oyun modeli,
                oturtmada kullanılmayan ikinci bir 720p test setinde (24 işlemci) ~%6 sapıyor. Genel sıralama
                ve farkın büyüklüğü güvenilir bir fikir verir, ama tek bir oyunda ya da uygulamada gerçek fark belirgin
                biçimde farklı olabilir.
              </p>
            </Prose>
          </Panel>

          <Panel title="GPU endeksi" id="gpu">
            <Prose>
              <p>
                Bir oyun karesinin bir kısmı hesaplama gücüne, bir kısmı bellek bant genişliğine takılır. Model bu iki
                kaynağı, her birinin üssünü karedeki <strong>zaman payı</strong> alarak çarpar: bir kartı başka bir karta
                taşırken süre, bant genişliği oranının bellek payı kadar, hesap oranının hesap payı kadar üssüyle ölçeklenir.
                Bu, GPU'lar arası süre tahmininde kullanılan yöntemdir (Habitat, USENIX ATC 2021; roofline modeli, Williams
                ve diğ. 2009). Payların toplamı 1'den küçüktür: büyük GPU'lar oyunun işiyle tam dolmaz.
              </p>
            </Prose>
            <Formula
              label={`k: mimari verimi · ıskalama = 1 / (1 + (önbellek / ${f(GPU_MODEL.WORKING_SET, 0)} MB)^${f(GPU_MODEL.MISS_SLOPE)}), önbellek = L2 + Infinity Cache · sabit pay ${formatNumber(GPU_MODEL.FIXED_TIME, { digits: 4, fixed: true })}: işlemci ve sürücü`}
            >
              Endeks ∝ 1 ÷ [ 1 / (k × FP32<sup>{f(GPU_MODEL.A)}</sup> × (bant genişliği / ıskalama)<sup>{f(GPU_MODEL.B)}</sup>) + sabit pay ]
            </Formula>
            <Prose>
              <p>
                Büyük önbellek bellek trafiğini azaltır; bu yüzden bant genişliği <strong>etkin</strong> değeriyle, ıskalama
                oranına bölünerek girer. Üreticiler de aynı hesabı yapıyor: NVIDIA, RTX 4060 Ti'nin 32 MB L2'sinin bellek
                trafiğini yarıya indirdiğini, AMD 128 MB Infinity Cache'in 4K'da %58 isabet ettiğini söylüyor. Karenin bir
                kısmı ekran kartından bağımsızdır (işlemci, sürücü); en büyük kartlar bu sınıra yaklaşır.
              </p>
              <p>
                Nominal TFLOPS mimariler arasında aynı anlama gelmez. Ampere ve sonrası her shader'ı iki FP32 işlemi
                yapabilir sayar, oysa oyunlarda bu kapasitenin bir kısmı kullanılır. Mimari katsayısı bu farkı taşır.
              </p>
            </Prose>
            <CoefficientTable caption="GPU mimari katsayıları" rows={archRows} refValue={ada} columns={['Mimari', 'k (Ada = 1)']} />
          </Panel>

          <Panel title="CPU endeksi" id="cpu">
            <Prose>
              <p>İşlemci için üç ayrı eksen hesaplanır; hangisinin önemli olduğu kullanıma bağlıdır.</p>
            </Prose>
            <Formula label="IPC: saat başına yapılan iş, Zen 3 = 1,00">Tek çekirdek = IPC × boost frekansı</Formula>
            <Formula
              label={`SMT/HT çekirdek başına +%${Math.round(CPU_MODEL.SMT_GAIN * 100)} · tüm-çekirdek frekansı = boost × (çekirdek başına güç ÷ ${f(CPU_MODEL.BOOST_CORE_POWER, 0)} W)^⅓, en çok boost, en az temel frekans`}
            >
              Çok çekirdek = Σ (çekirdek × IPC × tüm-çekirdek frekansı × SMT)
            </Formula>
            <Formula
              label={`Iskalama = 1 / (1 + (L3 / ${f(CPU_MODEL.WORKING_SET, 0)} MB)^${f(CPU_MODEL.MISS_SLOPE)}) · L3: oyunun çalıştığı çekirdek kümesinin önbelleği · şerit: P-çekirdek × SMT + E-çekirdek × göreli hız`}
            >
              Oyun ∝ 1 ÷ [ 1 / (IPC × boost) × max(1, {f(CPU_MODEL.GAME_THREADS, 1)} / şerit) + {f(CPU_MODEL.MEM_TIME, 3)} × ıskalama ]
            </Formula>
            <Prose>
              <p>
                <strong>Çok çekirdek.</strong> Dinamik güç gerilimin karesi ve frekansla büyür (CMOS güç denklemi
                P = C·V²·f); gerilim de frekansla birlikte yükseldiği için güç frekansın küpüyle artar. Tersinden: çekirdek başına düşen güç sekizde bire
                inince frekans yarıya iner. Sürekli güç masaüstünde TDP × {f(CPU_MODEL.DESKTOP_POWER)} (AMD'nin PPT
                tanımı; Intel masaüstü ölçümleri de aynı oranı veriyor), dizüstünde TDP × {f(CPU_MODEL.MOBILE_POWER, 1)} (dizüstü
                ölçümlerine oturtulan oran: üreticiler işlemciyi uzun yükte TDP'nin üstünde tutuyor), Threadripper'da TDP. Intel'in hibrit işlemcilerinde P ve
                E çekirdekler ayrı IPC ve frekansla sayılır; E-çekirdek P'nin yarısı kadar güç çeker. AMD'nin Zen 4c/5c
                kompakt çekirdekleri aynı IPC'yle sayılır.
              </p>
              <p>
                <strong>Oyun.</strong> Bir karenin süresi iki parçadan oluşur: çekirdeğin hesaplama süresi ve
                önbellekte bulunamayan verinin bellekten gelmesini bekleme süresi (Hennessy ve Patterson'ın bellek
                bekleme modeli). Bekleme, oyunun çalışma kümesinin
                L3'e sığmayan payıyla orantılıdır; AMD'de oyun tek bir çekirdek kümesinin (CCX/CCD) L3'ünü görür, X3D
                işlemcilerde bu 96 MB'tır. Oyunun bir karedeki toplam işi ana iş parçacığının yaklaşık{' '}
                {f(CPU_MODEL.GAME_THREADS, 1)} katıdır; eşzamanlı çalışabilen şerit bundan azsa iş sıraya girer (Brent'in iş–yol sınırı). V-Cache'i
                tek CCD'de olan işlemcilerde (7950X3D, 9950X3D) oyunun işinin %{Math.round(CPU_MODEL.PLAIN_CCD_SHARE * 100)}'i
                V-Cache'siz CCD'de kalır: bu pay, iki CCD'sinde de V-Cache olan 9950X3D2'nin aynı testlerdeki farkından
                ölçüldü.
              </p>
              <p>
                <strong>Genel endeks</strong> üç eksenin ağırlıklı geometrik ortalamasıdır: oyun %{CPU_MODEL.WEIGHTS.gaming * 100},
                tek çekirdek %{CPU_MODEL.WEIGHTS.single * 100}, çok çekirdek %{CPU_MODEL.WEIGHTS.multi * 100}.
              </p>
            </Prose>
            <CoefficientTable caption="Mikromimari IPC değerleri" rows={uarchRows} refValue={1} columns={['Mikromimari', 'IPC']} />
          </Panel>

          <Panel title="Sınırlar" id="sinirlar">
            <Prose>
              <ul className="list-disc space-y-2 pl-5 marker:text-ink-3">
                <li>Işın izleme, DLSS/FSR gibi ölçekleme teknolojileri ve kare üretimi modele dahil değildir.</li>
                <li>Sürücü olgunluğu ve oyun başına optimizasyon farkları hesaba katılmaz.</li>
                <li>
                  Dizüstü ve mini PC'lerde güç limiti üreticiye göre değişir; işlemci endeksi ölçümlerin ortalamasını
                  (TDP × {f(CPU_MODEL.MOBILE_POWER, 1)}) varsayar, ekran kartı endeksi tipik bir yapılandırmayı.
                </li>
                <li>
                  Tümleşik GPU'larda bant genişliği sistem belleğine bağlıdır; platformun desteklediği DDR bellek çift
                  kanal varsayılır ve değer parça sayfasında yazılıdır. Tümleşik GPU'lara ayrı çarpan uygulanmaz;
                  verideki TDP işlemci paketinindir, kullanılmaz. Güç bütçesi işlemciyle paylaşıldığı için GPU saati
                  düşer; bu modelde yok. AMD'nin tümleşikleri (780M, 890M) bu yüzden %20 civarı yüksek çıkıyor.
                  VRAM miktarı modelde yok; ölçümler 8 GB altı kartlarda belirgin bir ceza göstermiyor.
                </li>
                <li>
                  Sunucu ve iş istasyonu parçaları (veri merkezi kartları, Xeon, Threadripper) ayrı sıralanır; masaüstü
                  ve dizüstü sıralamasına karışmaz. Ekran çıkışı olmayan ama grafik API'si olan kartların (T4, L4, A10) endeksi, bulut
                  oyun ve sanallaştırmada oyun kartı gibi kullanıldıklarında beklenen performanstır. Grafik API'si olmayan
                  hesaplama çiplerine (A100, H100, MI300X…) endeks verilmez.
                </li>
                <li>
                  Çok çekirdek endeksinin güç yasası tek bir çekirdek gücü sabitiyle bütün üretim süreçlerine uygulanır;
                  boost frekansı yüksek, gücü düşük Intel U serisi dizüstü işlemcileri (8.–11. nesil) %30–55, 96
                  çekirdekli Threadripper PRO 7995WX %22 yüksek çıkıyor.
                </li>
                <li>
                  Oyun endeksinde platformun bellek gecikmesi yok (veride tutarlı bir kaynağı yok): Arrow Lake (285K) +%8,
                  Zen+ (2700X) +%10 yüksek; Skylake türevi Intel'ler (8.–10. nesil) bağımsız ölçümde %10 civarı düşük
                  çıkıyor. Çekirdek sayısının etkisi 4 çekirdekli işlemcilerden ölçüldü; 2 çekirdekliler için ölçüm yok.
                </li>
                <li>
                  Endeks yalnızca ölçümü olan mimarilere verilir. 2017 öncesi bazı işlemci mikromimarileri (Core 2,
                  Nehalem, Sandy Bridge, Broadwell, Phenom, FX-8150 ve A serisi APU'lar) ile Intel'in Xe3 ve HD 4000/4600
                  tümleşik grafikleri için ölçüm yok; bu parçaların özellikleri tam, endeksleri boş. Çift GPU'lu kartların
                  (GTX 690, HD 7990…) endeksi tek GPU'nundur; güncel oyunlar SLI/CrossFire'ı desteklemiyor.
                </li>
                <li>Çıkış fiyatları dolar cinsinden ve çıkış tarihindeki liste fiyatıdır; bugünkü fiyat değildir.</li>
              </ul>
            </Prose>
          </Panel>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <nav aria-label="Bu sayfada">
            <p className="label mb-2">Bu sayfada</p>
            <ul className="space-y-0.5 border-l border-line">
              {SECTIONS.map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`} className="-ml-px flex min-h-8 items-center border-l border-transparent pl-3 text-sm text-ink-2 hover:border-ink-3 hover:text-ink">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <p className="mt-6 text-[0.8125rem] leading-relaxed text-ink-3">
            Kalibrasyon: bağımsız göreli performans ölçümleri ve 720p oyun testleri, Cinebench R23 ve 3DMark Time
            Spy ortalamaları. Bir parçanın hesabını adım adım görmek için{' '}
            <Link to="/gpu-veritabani" className="text-accent-text hover:underline">sıralamadan</Link> parça sayfasını aç.
          </p>
        </aside>
      </div>
    </main>
  )
}
