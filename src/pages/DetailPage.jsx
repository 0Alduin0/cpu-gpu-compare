import { Fragment, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Delta, EstimateNote, InfoTip, PageHeader, Panel, ScoreBar, Value } from '../components/ui'
import { infoFor } from '../data/info'
import Icon from '../components/Icon'
import { MAX_COMPARE, useCompare } from '../state/compare'
import { formatIndex, formatNumber, formatRelease, percentDelta } from '../data/format'
import { labelFor, translateValue } from '../data/labels'
import NotFoundPage from './NotFoundPage'

const f = (v, digits = 2) => formatNumber(v, { digits, fixed: true })

/** Puan satırı: etiket, referans 100 çizgili çubuk, değer. */
function ScoreRow({ label, value, max, strong, info }) {
  return (
    <div className="grid grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)_3.5rem] items-center gap-4 sm:grid-cols-[9rem_minmax(0,1fr)_4rem]">
      <span className={strong ? 'font-semibold' : 'text-sm text-ink-2'}>
        {label}
        <InfoTip text={info} label={label} />
      </span>
      <ScoreBar value={value} max={max} reference={100} className={strong ? 'h-2.5' : ''} />
      <span className={`text-right font-semibold tnum ${strong ? 'text-2xl tracking-[-0.02em]' : 'text-base'}`}>
        <Value>{formatIndex(value)}</Value>
      </span>
    </div>
  )
}

/** Formül satırı: adım | girdi | ara sonuç. */
function StepRow({ step, input, factor, note, total }) {
  return (
    <tr className={total ? '[&>*]:bg-surface-2' : ''}>
      <th scope="row" className="!whitespace-normal !pl-4 text-[0.8125rem] !font-normal !text-ink-2 sm:!pl-5">
        <span className={total ? 'font-semibold text-ink' : ''}>{step}</span>
        {note && <span className="block text-xs text-ink-3">{note}</span>}
        {input != null && <span className="mt-0.5 block text-xs text-ink-3 tnum sm:hidden">{input}</span>}
      </th>
      <td className="hidden text-[0.8125rem] text-ink-2 tnum sm:table-cell">{input}</td>
      <td className={`num !pr-4 sm:!pr-5 ${total ? 'text-base font-semibold' : ''}`}>{factor}</td>
    </tr>
  )
}

function FormulaTable({ caption, children }) {
  return (
    <table className="data-table table-fixed">
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr>
          <th scope="col" className="!pl-4 sm:w-[42%] sm:!pl-5">Adım</th>
          <th scope="col" className="hidden sm:table-cell">Girdi</th>
          <th scope="col" className="w-28 !pr-4 text-right sm:!pr-5">Ara sonuç</th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  )
}

function GpuBreakdown({ item, kind }) {
  const b = item.breakdown
  const m = kind.model
  if (!b) return <p className="p-5 text-sm text-ink-2">Bu kart için endeks hesaplanmadı. {item.noIndexReason}</p>
  const ref = kind.reference
  return (
    <>
      {item.multiGpu && (
        <p className="border-b border-line px-4 py-3 text-[0.8125rem] text-ink-2 sm:px-5">
          Çift GPU'lu kart: endeks tek GPU'nun performansıdır. Güncel oyunlar SLI/CrossFire'ı desteklemediği
          için ikinci GPU çoğu oyunda kullanılmaz; destekleyen eski oyunlarda kart belirgin şekilde daha hızlıdır.
        </p>
      )}
      {item.noOutputs && (
        <p className="border-b border-line px-4 py-3 text-[0.8125rem] text-ink-2 sm:px-5">
          Ekran çıkışı yok: endeks, kart bulut oyun ya da sanallaştırmada oyun kartı gibi kullanıldığında beklenen
          performansın tahminidir. Pasif soğutmalı sunucu kartları boost saatini her zaman tutamaz.
        </p>
      )}
      <FormulaTable caption="GPU endeks hesabı">
      <StepRow step="Mimari katsayısı" input={b.archLabel} factor={f(b.archK, 3)} note="Nominal FP32'nin oyundaki verimi, Ada = 1" />
      <StepRow step={`× FP32^${f(m.A)}`} input={`${f(b.fp32)} TFLOPS`} factor={f(b.compute)} note={b.fp32Note ?? 'Oyun yükünün hesaba bağlı payı'} />
      <StepRow
        step="Etkin bant genişliği"
        input={`${formatNumber(b.bandwidth, { digits: 1 })} GB/s ÷ ıskalama %${f(b.miss * 100, 0)}`}
        factor={`${formatNumber(b.effectiveBandwidth, { digits: 0 })} GB/s`}
        note={[`${formatNumber(b.cacheMb, { digits: 1 })} MB önbellek (L2${item.infinityCache ? ' + Infinity Cache' : ''}) bellek trafiğini azaltır`, b.bandwidthAssumed].filter(Boolean).join(' · ')}
      />
      <StepRow step={`× Etkin bant genişliği^${f(m.B)}`} input="Oyun yükünün belleğe bağlı payı" factor={f(b.memory)} />
      <StepRow step="= İş hızı" input={`${f(b.archK, 3)} × ${f(b.compute)} × ${f(b.memory)}`} factor={f(b.throughput)} />
      <StepRow
        step="Kare süresi"
        input={`1 ÷ ${f(b.throughput)} + ${formatNumber(m.FIXED_TIME, { digits: 4, fixed: true })}`}
        factor={formatNumber(b.frame, { digits: 4, fixed: true })}
        note={`Sabit pay: işlemci ve sürücü, ekran kartından bağımsız; kare süresindeki payı %${f((1 - b.gpuShare) * 100, 0)}`}
      />
      <StepRow
        step={`= Endeks (${ref?.name} = 100)`}
        input={`${formatNumber(ref?.breakdown?.frame, { digits: 4, fixed: true })} ÷ ${formatNumber(b.frame, { digits: 4, fixed: true })} × 100`}
        factor={formatIndex(item.perfIndex)}
        total
      />
      </FormulaTable>
    </>
  )
}

function CpuBreakdown({ item, kind }) {
  const b = item.breakdown
  const rb = kind.reference?.breakdown
  const m = kind.model
  if (!b || !rb) {
    const reason = !item.uarch
      ? `${item.codename ?? 'Bu işlemcinin'} mikromimarisi için IPC ölçümü yok; tahmini değer girilmiyor.`
      : !item.boostClock || !item.cores || !item.tdp
        ? 'Frekans, çekirdek ya da TDP verisi eksik.'
        : 'Hibrit işlemcinin P/E çekirdek dağılımı bilinmiyor.'
    return <p className="p-5 text-sm text-ink-2">Bu işlemci için endeks hesaplanamadı: {reason}</p>
  }
  const pPart = `${b.pCores} P × IPC ${f(b.ipc)} × ${f(b.allCore)} GHz${b.smt > 1 ? ` × SMT ${f(b.smt)}` : ''}`
  const ePart = b.eCores
    ? ` + ${b.eCores} ${b.compact ? 'kompakt' : 'E'} × IPC ${f(b.eIpc)} × ${f(b.allCore * b.eClock)} GHz${b.smtE > 1 ? ` × SMT ${f(b.smtE)}` : ''}`
    : ''
  const section = title => (
    <tr>
      <th colSpan={3} scope="colgroup" className="bg-surface-2 !py-2 !pl-4 text-xs !font-semibold !text-ink-2 sm:!pl-5">{title}</th>
    </tr>
  )
  return (
    <>
      <FormulaTable caption="CPU endeks hesabı">
        {section('Tek çekirdek')}
        <StepRow step="IPC (Zen 3 = 1)" input={b.uarch} factor={f(b.ipc)} />
        <StepRow step="× Boost frekansı" input={`${f(b.boost)} GHz`} factor={f(b.single)} />
        <StepRow step="= Tek çekirdek endeksi" input={`${f(b.single)} ÷ ${f(rb.single)} × 100`} factor={formatIndex(item.singleIndex)} total />
        {section('Çok çekirdek')}
        <StepRow
          step="Sürekli güç"
          input={`${f(item.tdp, 0)} W TDP × ${f(b.powerRatio)}`}
          factor={`${f(b.watts, 0)} W`}
          note={
            b.powerRatio === m.MOBILE_POWER
              ? 'Dizüstü üreticilerinin uzun yükte tuttuğu güç (oturtuldu)'
              : b.powerRatio === m.DESKTOP_POWER
                ? item.brand === 'Intel'
                  ? "Masaüstü: AMD'nin PPT oranı; Intel masaüstü ölçümleri de aynı oranı veriyor"
                  : 'Masaüstü: AMD PPT = 1,35 × TDP'
                : 'Threadripper: PPT = TDP'
          }
        />
        <StepRow
          step="Tüm-çekirdek frekansı"
          input={`${f(b.wattsPerCore, 1)} W / çekirdek${b.eCores ? ' (E-çekirdek yarım)' : ''}`}
          factor={`${f(b.allCore)} GHz`}
          note={
            b.atFloor
              ? 'Güç yasası temel frekansın altında kalıyor; temel frekans alt sınır'
              : `boost × (W/çekirdek ÷ ${f(m.BOOST_CORE_POWER, 0)} W)^⅓, en çok boost (P ∝ f³)`
          }
        />
        <StepRow step="Çekirdek toplamı" input={pPart + ePart} factor={f(b.multi / b.cmt)} />
        {b.cmt < 1 && <StepRow step="× Paylaşımlı FPU (CMT)" input="Modül başına tek FPU" factor={f(b.cmt)} />}
        <StepRow step="= Çok çekirdek endeksi" input={`${f(b.multi)} ÷ ${f(rb.multi)} × 100`} factor={formatIndex(item.multiIndex)} total />
        {section('Oyun: kare süresi')}
        {b.ccds.map((ccd, i) => {
          const dual = b.ccds.length > 1
          const step = dual ? `${i === 0 ? "V-Cache'li" : "V-Cache'siz"} CCD: ana iş parçacığı` : 'Ana iş parçacığı'
          return (
            <Fragment key={i}>
              <StepRow step={step} input={`1 ÷ (IPC ${f(b.ipc)} × ${f(ccd.clock)} GHz)`} factor={f(ccd.thread, 3)} />
              <StepRow
                step="× Çekirdek yeterliliği"
                input={
                  ccd.queue > 1
                    ? `${f(m.GAME_THREADS, 1)} iş parçacığı işi ÷ ${f(b.lanes, 1)} şerit`
                    : `${f(b.lanes, 1)} şerit ≥ ${f(m.GAME_THREADS, 1)} iş parçacığı işi`
                }
                factor={f(ccd.queue)}
                note={i === 0 ? 'Şerit: P-çekirdek × SMT + E-çekirdek × göreli hız' : undefined}
              />
              <StepRow
                step="+ Bellek bekleme"
                input={`${f(m.MEM_TIME, 3)} × ıskalama %${f(ccd.miss * 100, 0)}`}
                factor={f(ccd.memory, 3)}
                note={`${f(ccd.l3, 0)} MB L3${i === 0 && b.x3d ? ' (3D V-Cache)' : ''}; oyunun çalıştığı CCX/CCD'nin önbelleği`}
              />
              <StepRow step="= Kare süresi" input={`${f(ccd.core, 3)} + ${f(ccd.memory, 3)}`} factor={f(ccd.total, 3)} />
            </Fragment>
          )
        })}
        {b.ccds.length > 1 && (
          <StepRow
            step="Ağırlıklı kare süresi"
            input={`%${f((1 - b.plainShare) * 100, 0)} × ${f(b.ccds[0].total, 3)} + %${f(b.plainShare * 100, 0)} × ${f(b.ccds[1].total, 3)}`}
            factor={f(b.frame, 3)}
            note={`Oyunun işinin %${f(b.plainShare * 100, 0)}'i V-Cache'siz CCD'de kalır (9950X3D2 ölçümü)`}
          />
        )}
        <StepRow step="= Oyun endeksi" input={`${f(rb.frame, 3)} ÷ ${f(b.frame, 3)} × 100`} factor={formatIndex(item.gamingIndex)} total />
      </FormulaTable>
      <p className="border-t border-line px-4 py-3 text-[0.8125rem] text-ink-2 sm:px-5">
        Genel endeks = tek çekirdek<sup>{f(kind.model.WEIGHTS.single, 1)}</sup> × çok çekirdek<sup>{f(kind.model.WEIGHTS.multi, 1)}</sup> × oyun
        <sup>{f(kind.model.WEIGHTS.gaming, 1)}</sup> ={' '}
        <span className="font-semibold text-ink tnum">{formatIndex(item.perfIndex)}</span>
      </p>
    </>
  )
}

function Neighbours({ item, kind, compare }) {
  const navigate = useNavigate()
  const primary = kind.axes[0].key
  // Sunucu parçaları kendi grubunda sıralı (bkz. rank.js); komşular da aynı gruptan.
  const ranked = [...kind.list]
    .filter(x => x[primary] != null && !!x.server === !!item.server)
    .sort((a, b) => b[primary] - a[primary])
  const at = ranked.findIndex(x => x.id === item.id)
  if (at < 0) return null
  const around = ranked.slice(Math.max(0, at - 2), at + 3)
  return (
    <Panel title="Yakın rakipler" meta="Endeks sıralamasında ±2 sıra" bodyClassName="p-0">
      <table className="data-table">
        <caption className="sr-only">Endeks sıralamasında {item.name} çevresindeki parçalar</caption>
        <thead>
          <tr>
            <th scope="col" className="w-10 !pl-4 text-right sm:!pl-5">#</th>
            <th scope="col">Model</th>
            <th scope="col" className="text-right">Endeks</th>
            <th scope="col" className="text-right">Fark</th>
            <th scope="col" className="hidden w-12 sm:table-cell"><span className="sr-only">Karşılaştır</span></th>
          </tr>
        </thead>
        <tbody>
          {around.map(n => {
            const self = n.id === item.id
            return (
              <tr key={n.id} aria-current={self ? 'true' : undefined} className={self ? '[&>td]:bg-accent-soft' : ''}>
                <td className="num !pl-4 text-ink-3 sm:!pl-5">{kind.rank.get(n.id)}</td>
                <td>
                  {self ? (
                    <span className="font-semibold">{n.name}</span>
                  ) : (
                    <Link to={kind.paths.detail(n.id)} className="font-medium hover:text-accent-text">{n.name}</Link>
                  )}
                </td>
                <td className="num font-semibold">{formatIndex(n[primary])}</td>
                <td className="num text-sm">{self ? <span className="text-ink-3">Bu parça</span> : <Delta value={percentDelta(n[primary], item[primary])} />}</td>
                <td className="hidden !py-1 !pr-3 sm:table-cell">
                  {!self && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon"
                      aria-label={`${item.name} ile ${n.name} karşılaştır`}
                      title="İkisini karşılaştır"
                      onClick={() => {
                        compare.set([item.id, n.id])
                        navigate(kind.paths.compare)
                      }}
                    >
                      <Icon name="swap" size={18} />
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Panel>
  )
}

function SpecGroups({ item, kind }) {
  const raw = item.raw
  const grouped = new Set(kind.groups.flatMap(g => g.keys))
  const rest = Object.keys(raw).filter(k => k !== 'id' && k !== 'name' && !grouped.has(k))
  const groups = [...kind.groups, ...(rest.length ? [{ title: 'Diğer', keys: rest }] : [])]
    .map(g => ({ ...g, keys: g.keys.filter(k => raw[k] != null && raw[k] !== '') }))
    .filter(g => g.keys.length)

  return (
    <div className="gap-6 lg:columns-2 [&>*]:mb-6 [&>*]:break-inside-avoid">
      {groups.map(g => (
        <Panel key={g.title} title={g.title} bodyClassName="p-0">
          <dl className="divide-y divide-line">
            {g.keys.map(k => {
              const value = k === 'Release Date' ? formatRelease(raw[k]) : translateValue(raw[k])
              return (
                <div key={k} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-4 px-4 py-2.5 text-sm sm:px-5">
                  <dt className="text-ink-2">
                    {labelFor(k, kind.key)}
                    <InfoTip text={infoFor(kind.key, k)} label={labelFor(k, kind.key)} />
                  </dt>
                  <dd className="whitespace-pre-line font-medium tnum">
                    <Value>{value}</Value>
                  </dd>
                </div>
              )
            })}
          </dl>
        </Panel>
      ))}
    </div>
  )
}

export default function DetailPage({ kind }) {
  const { id } = useParams()
  const compare = useCompare(kind.key, kind.byId)
  const item = kind.byId.get(id)
  // Sekme başlığı parçanın adı (yoksa NotFoundPage kendi başlığını yazar).
  useEffect(() => {
    if (item) document.title = `${item.name} · PC Benchmark`
  }, [item])
  if (!item) return <NotFoundPage message={`Bu kimlikle bir ${kind.noun} bulunamadı.`} />

  const inSet = compare.has(item.id)
  const rank = kind.rank.get(item.id)
  const scopeKey = item.server ? 'server' : 'main'
  const listPath = item.server ? `${kind.paths.list}?grup=sunucu` : kind.paths.list
  const isGpu = kind.key === 'gpu'
  // Ortak ölçek: eksenler birbiriyle ve 100 referansıyla aynı çubukta okunur.
  const axisValues = isGpu ? [item.perfIndex] : [item.perfIndex, item.gamingIndex, item.singleIndex, item.multiIndex]
  const scaleMax = Math.max(200, ...axisValues.map(v => v ?? 0)) * 1.1

  return (
    <main id="main" className="mx-auto max-w-[1280px] px-4 sm:px-6">
      <PageHeader
        title={item.name}
        lead={[kind.meta(item), item.segment, formatRelease(item.releaseDate)].filter(Boolean).join(' · ')}
        aside={
          <div className="flex flex-wrap gap-2">
            {/* Metin eylemi söyler (ekle / çıkar); ayrıca aria-pressed vermek durumu iki kez okutuyordu. */}
            <button
              type="button"
              className={`btn ${inSet ? 'btn-secondary' : 'btn-primary'}`}
              disabled={!inSet && compare.full}
              title={!inSet && compare.full ? `Liste dolu (${MAX_COMPARE}/${MAX_COMPARE})` : undefined}
              onClick={() => compare.toggle(item.id)}
            >
              <Icon name={inSet ? 'check' : 'plus'} size={16} />
              {inSet ? 'Karşılaştırmadan çıkar' : 'Karşılaştırmaya ekle'}
            </button>
            {compare.ids.length > 0 && (
              <Link to={kind.paths.compare} className="btn btn-secondary">
                Karşılaştırmaya git ({compare.ids.length})
              </Link>
            )}
          </div>
        }
      >
        <nav aria-label="Konum" className="mb-3">
          <ol className="flex flex-wrap items-center gap-1.5 text-[0.8125rem] text-ink-3">
            <li>
              <Link to={listPath} className="hover:text-ink">
                {kind.code} sıralaması{item.server ? ` · ${kind.scopes.server.label}` : ''}
              </Link>
            </li>
            <li aria-hidden="true"><Icon name="chevronRight" size={14} /></li>
            <li aria-current="page" className="text-ink-2">{item.name}</li>
          </ol>
        </nav>
      </PageHeader>

      <div className="space-y-6">
        <Panel
          title="Performans"
          meta={`Referans ${kind.reference?.name} = 100 · spesifikasyondan tahmini`}
          bodyClassName="p-4 sm:p-5"
        >
          <div className="space-y-4">
            {isGpu ? (
              <ScoreRow strong label="Performans endeksi" info={infoFor('gpu', 'perfIndex')} value={item.perfIndex} max={scaleMax} />
            ) : (
              <>
                <ScoreRow strong label="Genel" info={infoFor('cpu', 'perfIndex')} value={item.perfIndex} max={scaleMax} />
                <ScoreRow label="Oyun" info={infoFor('cpu', 'gamingIndex')} value={item.gamingIndex} max={scaleMax} />
                <ScoreRow label="Tek çekirdek" info={infoFor('cpu', 'singleIndex')} value={item.singleIndex} max={scaleMax} />
                <ScoreRow label="Çok çekirdek" info={infoFor('cpu', 'multiIndex')} value={item.multiIndex} max={scaleMax} />
              </>
            )}
          </div>
          <p className="mt-5 border-t border-line pt-4 text-sm text-ink-2">
            {rank ? (
              <>
                {kind.rankedCount[scopeKey]} {kind.scopes[scopeKey].noun} arasında <span className="font-semibold text-ink tnum">{rank}.</span> sırada
              </>
            ) : (
              'Sıralamaya girmiyor'
            )}
            {item.perfPerWatt != null && (
              <>
                {' · '}100 W başına <span className="font-medium text-ink tnum">{formatIndex(item.perfPerWatt)}</span> puan
              </>
            )}
            {isGpu && item.perfPerDollar != null && (
              <>
                {' · '}çıkış fiyatına göre 100 $ başına <span className="font-medium text-ink tnum">{formatIndex(item.perfPerDollar)}</span> puan
              </>
            )}
          </p>
        </Panel>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] xl:items-start">
          <Panel title="Endeks nasıl hesaplandı" meta="Her adımın girdisi bu parçanın verisi" bodyClassName="p-0">
            {isGpu ? <GpuBreakdown item={item} kind={kind} /> : <CpuBreakdown item={item} kind={kind} />}
          </Panel>
          <Neighbours item={item} kind={kind} compare={compare} />
        </div>

        <SpecGroups item={item} kind={kind} />

        <EstimateNote kind={kind} className="max-w-[80ch]" />
      </div>
    </main>
  )
}
