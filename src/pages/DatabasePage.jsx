import { memo, useDeferredValue, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { EstimateNote, InfoTip, PageHeader, Panel, ScoreBar, Value } from '../components/ui'
import { infoFor } from '../data/info'
import Icon from '../components/Icon'
import { MAX_COMPARE, useCompare } from '../state/compare'
import { formatIndex, queryTokens, searchKey } from '../data/format'

const HIDE = { md: 'hidden md:table-cell', lg: 'hidden lg:table-cell', xl: 'hidden xl:table-cell' }

function SortHeader({ col, sort, onSort, info, className = '' }) {
  const active = sort.key === col.key
  return (
    <th
      scope="col"
      className={`${className} ${col.align === 'right' ? 'text-right' : ''}`}
      aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <button type="button" className="sort-btn min-h-7" data-active={active || undefined} onClick={() => onSort(col)}>
        {col.label}
        <Icon name={active ? (sort.dir === 'asc' ? 'sortUp' : 'sortDown') : 'sortBoth'} size={13} className={active ? '' : 'opacity-60'} />
      </button>
      <InfoTip text={info} label={col.label} />
    </th>
  )
}

function compareValues(a, b, dir, text) {
  // Eksik veri her yönde en sona.
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  const r = text ? String(a).localeCompare(String(b), 'tr') : a - b
  return dir === 'asc' ? r : -r
}

/**
 * Tablo gövdesi ayrı ve memo: arama kutusuna her yazışta yalnızca kutu yeniden çizilir,
 * ~350 satır ertelenmiş sorgu (useDeferredValue) değişince çizilir.
 */
const TableBody = memo(function TableBody({ kind, rows, compare, primaryKey, topIndex }) {
  return (
    <tbody>
      {rows.map(it => {
        const inSet = compare.has(it.id)
        const disabled = !inSet && compare.full
        return (
          <tr key={it.id} className={inSet ? '[&>td]:bg-accent-soft' : ''}>
            <td className="num !pl-4 text-ink-3 sm:!pl-5">{kind.rank.get(it.id) ?? <Value />}</td>
            <td className="min-w-[11rem]">
              <Link to={kind.paths.detail(it.id)} className="font-medium text-ink hover:text-accent-text">
                {it.name}
              </Link>
            </td>
            {kind.columns.map(c => {
              const v = c.get(it)
              return (
                <td key={c.key} className={`${HIDE[c.priority] ?? ''} ${c.align === 'right' ? 'num' : ''} ${c.index ? '' : 'text-ink-2'}`}>
                  <Value>{v == null ? (c.fallback?.(it) ?? null) : c.format(v, it)}</Value>
                </td>
              )
            })}
            <td className="num font-semibold">
              <Value>{formatIndex(it[primaryKey])}</Value>
            </td>
            <td className="hidden lg:table-cell">
              <ScoreBar value={it[primaryKey]} max={topIndex} reference={100} />
            </td>
            <td className="!py-1 !pr-3 sm:!pr-4">
              {/* Etiket sabit, durum aria-pressed'de: ekran okuyucu "çıkar, basılı" gibi çift durum okumasın. */}
              <button
                type="button"
                className={`btn btn-ghost btn-icon ${inSet ? 'text-accent-text' : ''}`}
                aria-pressed={inSet}
                disabled={disabled}
                aria-label={`${it.name}: karşılaştırmaya ekle`}
                title={disabled ? `Liste dolu (${MAX_COMPARE}/${MAX_COMPARE})` : inSet ? 'Karşılaştırmadan çıkar' : 'Karşılaştırmaya ekle'}
                onClick={() => compare.toggle(it.id)}
              >
                <Icon name={inSet ? 'check' : 'plus'} size={18} />
              </button>
            </td>
          </tr>
        )
      })}
    </tbody>
  )
})

/**
 * Liste durumu adreste: grup (?grup=sunucu), arama (?ara=), filtreler (?segment=...),
 * sıralama (?sirala=tdp&yon=artan). Parça sayfasından geri dönünce ve bağlantı
 * paylaşılınca aynı görünüm gelir; başlıktaki "sıralama" bağlantısı hepsini sıfırlar.
 */
const SCOPE_PARAM = { server: 'sunucu' }
const DIR_PARAM = { asc: 'artan', desc: 'azalan' }
const DEFAULT_SORT = { key: 'perfIndex', dir: 'desc' }

export default function DatabasePage({ kind }) {
  const compare = useCompare(kind.key, kind.byId)
  const [params, setParams] = useSearchParams()
  const scopeKey = params.get('grup') === SCOPE_PARAM.server ? 'server' : 'main'
  const scope = kind.scopes[scopeKey]

  /** Adresi günceller: boş değer parametreyi siler. Yazarken geçmişe kayıt eklemez. */
  const patch = changes =>
    setParams(
      prev => {
        const next = new URLSearchParams(prev)
        for (const [k, v] of Object.entries(changes)) {
          if (v == null || v === '') next.delete(k)
          else next.set(k, v)
        }
        return next
      },
      { replace: true },
    )

  const scoped = useMemo(() => kind.list.filter(it => !!it.server === (scopeKey === 'server')), [kind, scopeKey])
  const scopeCounts = useMemo(() => {
    const server = kind.list.filter(it => it.server).length
    return { main: kind.list.length - server, server }
  }, [kind])
  const searchKeys = useMemo(() => new Map(kind.list.map(it => [it.id, searchKey(kind.searchText(it))])), [kind])

  // Yalnızca bu grupta karşılığı olan seçenekler; eşik filtreleri (VRAM) olduğu gibi.
  const optionsByFilter = useMemo(
    () =>
      Object.fromEntries(
        kind.filters.map(f => [f.key, f.match ? f.options : f.options.filter(o => scoped.some(it => String(f.get(it)) === String(o)))]),
      ),
    [kind, scoped],
  )
  // Adresteki filtre bu grupta yoksa (elle yazılmış, eski bağlantı) yok sayılır: seçim kutusu
  // "Tümü" gösterirken listeyi boşaltmasın.
  const filters = Object.fromEntries(
    kind.filters.map(f => {
      const v = params.get(f.key) ?? ''
      return [f.key, optionsByFilter[f.key].some(o => String(o) === v) ? v : '']
    }),
  )
  const filtersKey = JSON.stringify(filters)

  const query = params.get('ara') ?? ''
  const deferredQuery = useDeferredValue(query)

  const primary = kind.axes[0]
  const indexCol = { key: primary.key, label: kind.key === 'cpu' ? 'Genel' : 'Endeks', get: it => it[primary.key], align: 'right' }
  const nameCol = { key: 'name', label: 'Model', get: it => it.name, sort: 'text' }
  const rankCol = { key: 'rank', label: '#', sortLabel: 'Sıra', get: it => kind.rank.get(it.id) ?? null, align: 'right' }
  const sortable = [rankCol, nameCol, ...kind.columns, indexCol]
  const sortLabel = c => c.sortLabel ?? c.label

  const sortCol = sortable.find(c => c.key === params.get('sirala'))
  const sort = sortCol
    ? { key: sortCol.key, dir: params.get('yon') === DIR_PARAM.asc ? 'asc' : 'desc' }
    : DEFAULT_SORT
  const setSort = ({ key, dir }) =>
    patch(key === DEFAULT_SORT.key && dir === DEFAULT_SORT.dir ? { sirala: null, yon: null } : { sirala: key, yon: DIR_PARAM[dir] })
  const onSort = col => {
    if (sort.key === col.key) return setSort({ key: col.key, dir: sort.dir === 'asc' ? 'desc' : 'asc' })
    const ascFirst = col.sort === 'text' || col.key === 'rank'
    setSort({ key: col.key, dir: ascFirst ? 'asc' : 'desc' })
  }

  const setScope = key => {
    if (key === scopeKey) return
    // Filtre seçenekleri gruba göre değişir (segment, soket): grup değişince filtreler sıfırlanır.
    patch({ grup: SCOPE_PARAM[key] ?? null, ...Object.fromEntries(kind.filters.map(f => [f.key, null])) })
  }
  const reset = () => patch({ ara: null, ...Object.fromEntries(kind.filters.map(f => [f.key, null])) })

  const rows = useMemo(() => {
    const tokens = queryTokens(deferredQuery)
    const active = JSON.parse(filtersKey)
    const col = sortable.find(c => c.key === sort.key) ?? indexCol
    return scoped
      .filter(it => {
        if (tokens.length) {
          const hay = searchKeys.get(it.id)
          if (!tokens.every(t => hay.includes(t))) return false
        }
        for (const f of kind.filters) {
          const want = active[f.key]
          if (!want) continue
          const v = f.get(it)
          if (f.match ? !f.match(v, Number(want)) : String(v) !== want) return false
        }
        return true
      })
      .sort((a, b) => compareValues(col.get(a), col.get(b), sort.dir, col.sort === 'text'))
    // sortable/indexCol her render'da yeniden kurulur ama yalnızca kind'a bağlıdır.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, scoped, searchKeys, deferredQuery, filtersKey, sort.key, sort.dir])

  const topIndex = useMemo(() => Math.max(...scoped.map(it => it[primary.key] ?? 0)), [scoped, primary.key])
  const activeFilterCount = kind.filters.filter(f => filters[f.key]).length + (query ? 1 : 0)

  return (
    <main id="main" className="mx-auto max-w-[1280px] px-4 pb-24 sm:px-6">
      <PageHeader
        title={`${kind.code} sıralaması`}
        lead={`Veritabanındaki ${scoped.length} ${scope.noun}, performans endeksine göre sıralı. ${
          scope.lead ?? 'Sütun başlığıyla sırala, filtrelerle daralt, artıyla karşılaştırmaya ekle.'
        }`}
        aside={
          <div className="segmented" role="group" aria-label="Sıralama grubu">
            {Object.entries(kind.scopes).map(([key, s]) => (
              <button key={key} type="button" aria-pressed={key === scopeKey} onClick={() => setScope(key)}>
                {s.label} <span className="tnum text-ink-3">{scopeCounts[key]}</span>
              </button>
            ))}
          </div>
        }
      />

      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(14rem,1.6fr)_repeat(4,minmax(0,1fr))]">
          <label className="block sm:col-span-2 lg:col-span-1">
            <span className="label mb-1.5 block">Model</span>
            <span className="relative block">
              <Icon name="search" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
              <input type="search" value={query} onChange={e => patch({ ara: e.target.value })} placeholder={kind.placeholder} className="field pl-9" />
            </span>
          </label>
          {kind.filters.map(f => (
            <label key={f.key} className="block">
              <span className="label mb-1.5 block">{f.label}</span>
              <select className="field" value={filters[f.key]} onChange={e => patch({ [f.key]: e.target.value })}>
                <option value="">Tümü</option>
                {optionsByFilter[f.key].map(o => (
                  <option key={o} value={o}>{f.formatOption ? f.formatOption(o) : o}</option>
                ))}
              </select>
            </label>
          ))}
        </div>

        <Panel
          title={`${rows.length} / ${scoped.length} ${scope.noun}`}
          meta={`Referans ${kind.reference?.name} = 100 · spesifikasyondan tahmini`}
          actions={
            <>
              <label className="flex items-center gap-2 md:hidden">
                <span className="sr-only">Sırala</span>
                <select
                  className="field min-h-9 w-auto py-0 text-[0.8125rem]"
                  value={`${sort.key}:${sort.dir}`}
                  onChange={e => {
                    const [key, dir] = e.target.value.split(':')
                    setSort({ key, dir })
                  }}
                >
                  {sortable.flatMap(c => [
                    <option key={`${c.key}:desc`} value={`${c.key}:desc`}>{sortLabel(c)} (azalan)</option>,
                    <option key={`${c.key}:asc`} value={`${c.key}:asc`}>{sortLabel(c)} (artan)</option>,
                  ])}
                </select>
              </label>
              {activeFilterCount > 0 && (
                <button type="button" className="btn btn-ghost" onClick={reset}>
                  <Icon name="reset" size={16} />
                  <span className="hidden sm:inline">Filtreleri sıfırla</span>
                  <span className="sm:hidden">Sıfırla</span>
                </button>
              )}
            </>
          }
          bodyClassName="p-0"
        >
          {rows.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="font-medium">Bu filtrelerle eşleşen parça yok</p>
              <p className="mt-1 text-sm text-ink-2">Bir filtreyi gevşet ya da aramayı kısalt.</p>
              <button type="button" className="btn btn-secondary mt-5" onClick={reset}>
                <Icon name="reset" size={16} />
                Filtreleri sıfırla
              </button>
            </div>
          ) : (
            <div className="relative overflow-x-auto">
              <table className="data-table">
                <caption className="sr-only">
                  {kind.nounPlural} tablosu, {sortLabel(sortable.find(c => c.key === sort.key) ?? indexCol).toLocaleLowerCase('tr-TR')} sütununa göre{' '}
                  {sort.dir === 'asc' ? 'artan' : 'azalan'} sıralı
                </caption>
                <thead>
                  <tr>
                    <SortHeader col={rankCol} sort={sort} onSort={onSort} className="w-12 !pl-4 sm:!pl-5" />
                    <SortHeader col={nameCol} sort={sort} onSort={onSort} />
                    {kind.columns.map(c => (
                      <SortHeader key={c.key} col={c} sort={sort} onSort={onSort} info={infoFor(kind.key, c.info)} className={HIDE[c.priority] ?? ''} />
                    ))}
                    <SortHeader col={indexCol} sort={sort} onSort={onSort} info={infoFor(kind.key, primary.info)} className="w-20" />
                    <th scope="col" className="hidden w-[18%] lg:table-cell"><span className="sr-only">Göreli çubuk</span></th>
                    <th scope="col" className="w-12 !pr-3 sm:!pr-4"><span className="sr-only">Karşılaştır</span></th>
                  </tr>
                </thead>
                <TableBody kind={kind} rows={rows} compare={compare} primaryKey={primary.key} topIndex={topIndex} />
              </table>
            </div>
          )}
        </Panel>

        <EstimateNote kind={kind} className="max-w-[80ch]" />
      </div>

      {compare.ids.length > 0 && (
        <div className="fixed inset-x-0 bottom-4 z-30 px-4">
          <div className="mx-auto flex max-w-[44rem] items-center justify-between gap-4 rounded-xl border border-line bg-surface py-2.5 pl-4 pr-2.5 shadow-[var(--shadow-pop)]">
            <p className="min-w-0 truncate text-sm">
              <span className="font-semibold tnum">{compare.ids.length}/{MAX_COMPARE}</span>{' '}
              <span className="text-ink-2">
                {kind.noun} seçili<span className="hidden md:inline"> · {compare.ids.map(id => kind.byId.get(id)?.name).filter(Boolean).join(', ')}</span>
              </span>
            </p>
            <Link to={kind.paths.compare} className="btn btn-primary flex-none">
              Karşılaştır
              <Icon name="arrowRight" size={16} />
            </Link>
          </div>
        </div>
      )}
    </main>
  )
}
