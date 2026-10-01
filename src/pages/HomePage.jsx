import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Delta, Panel, ScoreBar, Swatch, seriesColor } from '../components/ui'
import Icon from '../components/Icon'
import PartSearch from '../components/PartSearch'
import gpuKind from '../kinds/gpu'
import cpuKind from '../kinds/cpu'
import { useCompare } from '../state/compare'
import { formatIndex, percentDelta } from '../data/format'

const SOURCES = [{ kind: gpuKind }, { kind: cpuKind }]

/** Elle seçilmiş örnek eşleşmeler (kullanım verisi değil). */
const MATCHUPS = [
  [gpuKind, 'GeForce RTX 4070 SUPER', 'Radeon RX 7800 XT'],
  [gpuKind, 'GeForce RTX 5070 Ti', 'Radeon RX 9070 XT'],
  [gpuKind, 'GeForce RTX 4060', 'Radeon RX 7600'],
  [cpuKind, 'Ryzen 7 7800X3D', 'Core i9-14900K'],
  [cpuKind, 'Ryzen 5 5600', 'Core i5-12400F'],
]
  .map(([kind, a, b]) => {
    const pa = kind.list.find(x => x.name === a)
    const pb = kind.list.find(x => x.name === b)
    if (!pa || !pb) return null
    // Güçlü olan üstte; fark her zaman "üstteki, alttakinden şu kadar güçlü" okunur.
    return pa.perfIndex >= pb.perfIndex ? { kind, a: pa, b: pb } : { kind, a: pb, b: pa }
  })
  .filter(Boolean)

/** Aynı türdeki bütün eşleşmeler tek ölçekte: çubuklar satırlar arasında da karşılaştırılabilir. */
const SCALE = Object.fromEntries(
  [gpuKind, cpuKind].map(kind => [
    kind.key,
    Math.max(100, ...MATCHUPS.filter(m => m.kind === kind).map(m => m.a.perfIndex)) * 1.06,
  ]),
)

function FeaturedMatchups() {
  const navigate = useNavigate()
  const gpuCompare = useCompare('gpu', gpuKind.byId)
  const cpuCompare = useCompare('cpu', cpuKind.byId)
  const open = m => {
    const target = m.kind.key === 'gpu' ? gpuCompare : cpuCompare
    target.set([m.a.id, m.b.id])
    navigate(m.kind.paths.compare)
  }

  return (
    <Panel
      title="Öne çıkan karşılaştırmalar"
      meta="Fark: üstteki parçanın alttakine göre tahmini üstünlüğü · çizgi: referans 100"
      bodyClassName="p-2"
    >
      <ul>
        {MATCHUPS.map(m => (
          <li key={`${m.a.id}-${m.b.id}`}>
            <button
              type="button"
              onClick={() => open(m)}
              className="grid w-full grid-cols-[minmax(0,1fr)_4rem] items-center gap-x-4 rounded-lg px-3 py-3 text-left transition-colors hover:bg-surface-2"
            >
              <span className="min-w-0 space-y-2.5">
                {[m.a, m.b].map((p, i) => (
                  <span key={p.id} className="grid grid-cols-[minmax(0,1fr)_2.5rem] items-center gap-x-3 gap-y-1.5 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)_2.5rem]">
                    <span className="flex min-w-0 items-start gap-2 text-sm leading-snug">
                      <Swatch color={seriesColor(i)} className="mt-1" />
                      <span className="font-medium">{p.name}</span>
                    </span>
                    <ScoreBar
                      value={p.perfIndex}
                      max={SCALE[m.kind.key]}
                      color={seriesColor(i)}
                      reference={100}
                      className="col-span-2 row-start-2 sm:col-span-1 sm:row-start-auto"
                    />
                    <span className="col-start-2 row-start-1 text-right text-sm font-semibold tnum sm:col-start-auto sm:row-start-auto">
                      {formatIndex(p.perfIndex)}
                    </span>
                  </span>
                ))}
              </span>
              <span className="flex flex-col items-end gap-1">
                <span className="badge">{m.kind.code}</span>
                <Delta value={percentDelta(m.a.perfIndex, m.b.perfIndex)} className="text-sm" />
                <span className="sr-only">: üstteki parça tahminen bu kadar güçlü</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

/** Ana sayfa tablolarının eksenleri. GPU'da verim görünümleri de var (mevcut veriden türetilir). */
const TOP_AXES = {
  gpu: [
    { key: 'perfIndex', label: 'Endeks', reference: 100 },
    { key: 'perfPerWatt', label: 'Watt başına', note: '100 W başına endeks' },
    { key: 'perfPerDollar', label: 'Fiyat başına', note: '100 $ çıkış fiyatı başına endeks' },
  ],
  cpu: [
    { key: 'perfIndex', label: 'Genel', reference: 100 },
    { key: 'gamingIndex', label: 'Oyun', reference: 100 },
    { key: 'singleIndex', label: 'Tek çekirdek', reference: 100 },
    { key: 'multiIndex', label: 'Çok çekirdek', reference: 100 },
  ],
}

function TopTable({ kind, title }) {
  const axes = TOP_AXES[kind.key]
  const [axisKey, setAxisKey] = useState(axes[0].key)
  const axis = axes.find(a => a.key === axisKey)
  const rows = useMemo(
    () =>
      kind.list
        .filter(x => x.segment === 'Masaüstü' && x[axis.key] != null)
        .sort((a, b) => b[axis.key] - a[axis.key])
        .slice(0, 10),
    [kind, axis],
  )
  const max = (rows[0]?.[axis.key] ?? 100) * 1.04

  return (
    <Panel
      title={title}
      meta={`Masaüstü · ${axis.note ?? `${kind.reference?.name} = 100`} · tahmini`}
      actions={
        <Link to={kind.paths.list} className="btn btn-ghost">
          Tümü
          <Icon name="arrowRight" size={16} />
        </Link>
      }
      className="flex flex-col"
      bodyClassName="flex-1 p-0"
    >
      <div className="border-b border-line px-4 py-3 sm:px-5">
        <div className="segmented flex w-full" role="group" aria-label="Sıralama ekseni">
          {axes.map(a => (
            <button key={a.key} type="button" className="flex-1 !px-2" aria-pressed={a.key === axis.key} onClick={() => setAxisKey(a.key)}>
              {a.label}
            </button>
          ))}
        </div>
      </div>
      <table className="data-table">
        <caption className="sr-only">
          {title}, ilk 10 (sıralama: {axis.label.toLocaleLowerCase('tr-TR')})
        </caption>
        <thead>
          <tr>
            <th scope="col" className="w-10 !pl-4 text-right sm:!pl-5">#</th>
            <th scope="col">Model</th>
            <th scope="col" className="hidden w-[34%] sm:table-cell"><span className="sr-only">Çubuk</span></th>
            <th scope="col" className="w-16 !pr-4 text-right sm:!pr-5">{axis.label}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p, i) => (
            <tr key={p.id}>
              <td className="num !pl-4 text-ink-3 sm:!pl-5">{i + 1}</td>
              <td>
                <Link to={kind.paths.detail(p.id)} className="font-medium hover:text-accent-text">{p.name}</Link>
                {/* Dar ekranda çubuk adın altında: imza dar ekranda da kalır. */}
                <ScoreBar value={p[axis.key]} max={max} reference={axis.reference} className="mt-2 sm:hidden" />
              </td>
              <td className="hidden sm:table-cell">
                <ScoreBar value={p[axis.key]} max={max} reference={axis.reference} />
              </td>
              <td className="num !pr-4 font-semibold sm:!pr-5">{formatIndex(p[axis.key])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  return (
    <main id="main" className="mx-auto max-w-[1280px] px-4 sm:px-6">
      <section aria-labelledby="hero-title" className="grid gap-10 pb-12 pt-12 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-14">
        <div>
          <h1 id="hero-title" className="text-[2.25rem] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-5xl">
            Hangi parça daha güçlü?
          </h1>
          <p className="mt-4 max-w-[52ch] text-base text-ink-2 sm:text-lg">
            {gpuKind.list.length} ekran kartı ve {cpuKind.list.length} işlemciyi yan yana koy: üstte sıra ve fark, altta her
            teknik değer. Performans endeksi tahminidir ve nasıl hesaplandığı her parçada açık.
          </p>
          <div className="mt-7 max-w-[34rem]">
            <PartSearch
              sources={SOURCES}
              size="lg"
              placeholder="GPU ya da CPU ara"
              onChoose={(item, kind) => navigate(kind.paths.detail(item.id))}
            />
            <p className="mt-2 text-[0.8125rem] text-ink-3">Örnek: RTX 4070, RX 7800, 7800X3D, i5-12400F</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/gpu-karsilastir" className="btn btn-primary">
              GPU karşılaştır
              <Icon name="arrowRight" size={16} />
            </Link>
            <Link to="/cpu-karsilastir" className="btn btn-secondary">
              CPU karşılaştır
            </Link>
          </div>
        </div>
        <FeaturedMatchups />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <TopTable kind={gpuKind} title="En iyi 10 ekran kartı" />
        <TopTable kind={cpuKind} title="En iyi 10 işlemci" />
      </div>

      <section aria-labelledby="scale-title" className="panel mt-6 grid gap-6 p-5 sm:p-6 md:grid-cols-[1.3fr_repeat(3,minmax(0,1fr))] md:items-center">
        <div>
          <h2 id="scale-title" className="panel-title">Endeks nasıl okunur</h2>
          <p className="mt-1 text-sm text-ink-2">Tüm parçalar sabit bir referansa göre: 150, referanstan yaklaşık %50 güçlü demek.</p>
        </div>
        <div>
          <p className="label">GPU referansı</p>
          <p className="mt-1 font-semibold">{gpuKind.reference?.name} = 100</p>
        </div>
        <div>
          <p className="label">CPU referansı</p>
          <p className="mt-1 font-semibold">{cpuKind.reference?.name} = 100</p>
        </div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="label">Kapsam</p>
            <p className="mt-1 font-semibold">
              {gpuKind.list.length} GPU · {cpuKind.list.length} CPU
            </p>
          </div>
          <Link to="/yontem" className="btn btn-ghost flex-none">
            Yöntem
            <Icon name="arrowRight" size={16} />
          </Link>
        </div>
      </section>
    </main>
  )
}
