import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Delta, EstimateNote, InfoTip, PageHeader, Panel, ScoreBar, Swatch, Value, seriesColor } from '../components/ui'
import { infoFor } from '../data/info'
import Icon from '../components/Icon'
import PartSearch from '../components/PartSearch'
import { MAX_COMPARE, useCompare } from '../state/compare'
import { formatDelta, formatIndex, percentDelta } from '../data/format'

const OTHER = { gpu: { code: 'CPU', to: '/cpu-karsilastir' }, cpu: { code: 'GPU', to: '/gpu-karsilastir' } }

function RankList({ kind, compare, items, axis, baseItem }) {
  const ranked = [...items].sort((a, b) => (b[axis.key] ?? -1) - (a[axis.key] ?? -1))
  const top = Math.max(100, ...ranked.map(i => i[axis.key] ?? 0))
  const scaleMax = top * 1.06
  const baseValue = baseItem?.[axis.key]

  return (
    <div>
      <div className="hidden grid-cols-[2.5rem_minmax(0,1.4fr)_minmax(0,2fr)_4.5rem_5.5rem_4.75rem] items-center gap-4 border-b border-line px-1 pb-2 text-xs font-medium text-ink-3 md:grid">
        <span>Sıra</span>
        <span>Parça</span>
        <span className="flex items-center gap-3">
          <span>
            {axis.title}
            <InfoTip text={infoFor(kind.key, axis.info)} label={axis.title} />
          </span>
          <span className="inline-flex items-center gap-1.5 font-normal">
            <span aria-hidden="true" className="inline-block h-3 w-px bg-[var(--ref-line)]" />
            referans 100
          </span>
        </span>
        <span className="text-right">Endeks</span>
        <span className="text-right">Baza göre</span>
        <span className="sr-only">Eylemler</span>
      </div>
      <ol aria-label={`Seçili ${kind.nounPlural}, ${axis.by} sıralı`}>
        {ranked.map((item, i) => {
          const value = item[axis.key]
          const isBase = baseItem?.id === item.id
          const color = seriesColor(compare.slotOf(item.id))
          return (
            <li
              key={item.id}
              className="grid grid-cols-[1.25rem_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 border-b border-line px-1 py-3.5 last:border-b-0 md:grid-cols-[2.5rem_minmax(0,1.4fr)_minmax(0,2fr)_4.5rem_5.5rem_4.75rem] md:gap-x-4"
            >
              <span className="flex items-center gap-2 text-sm text-ink-3 tnum">
                <Swatch color={color} />
                <span className="hidden md:inline">{i + 1}</span>
              </span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <Link to={kind.paths.detail(item.id)} className="font-medium text-ink hover:text-accent-text">
                    <span className="text-ink-3 md:hidden">{i + 1}. </span>
                    {item.name}
                  </Link>
                  {isBase && <span className="badge badge-accent">Baz</span>}
                </span>
                <span className="mt-0.5 block truncate text-xs text-ink-3">{kind.meta(item)}</span>
              </span>
              <span className="col-span-3 row-start-2 flex items-center gap-3 md:col-span-1 md:row-start-auto">
                <ScoreBar value={value} max={scaleMax} color={color} reference={100} className="flex-1" />
                <span className="w-12 text-right text-base font-semibold tnum md:hidden">
                  <Value>{formatIndex(value)}</Value>
                </span>
                <span className="w-16 text-right text-sm md:hidden">
                  {isBase ? <span className="text-ink-3">Baz</span> : <Delta value={percentDelta(value, baseValue)} />}
                </span>
              </span>
              <span className="hidden text-right text-lg font-semibold tnum md:block">
                <Value>{formatIndex(value)}</Value>
              </span>
              <span className="hidden text-right text-sm md:block">
                {isBase ? <span className="text-ink-3">Baz</span> : <Delta value={percentDelta(value, baseValue)} />}
              </span>
              <span className="col-start-3 row-start-1 flex justify-end gap-0.5 md:col-start-auto md:row-start-auto">
                <button
                  type="button"
                  className={`btn btn-ghost btn-icon ${isBase ? 'text-accent-text' : ''}`}
                  aria-pressed={isBase}
                  aria-label={isBase ? `${item.name} baz parça` : `${item.name} baz parça yap`}
                  title={isBase ? 'Baz parça' : 'Baz yap: farklar buna göre hesaplanır'}
                  onClick={() => compare.setBase(item.id)}
                >
                  <Icon name="base" size={18} />
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-icon hover:text-critical"
                  aria-label={`${item.name} karşılaştırmadan çıkar`}
                  title="Çıkar"
                  onClick={() => compare.remove(item.id)}
                >
                  <Icon name="close" size={18} />
                </button>
              </span>
            </li>
          )
        })}
      </ol>
      {items.length < MAX_COMPARE && (
        <p className="border-t border-dashed border-line px-1 pt-3 text-[0.8125rem] text-ink-3">
          {MAX_COMPARE - items.length} parça daha ekleyebilirsin.
        </p>
      )}
    </div>
  )
}

/** Satır içinde en iyi / en kötü değer. Sayısal olmayan ya da işaretsiz satırlar atlanır. */
function extremes(values, better) {
  if (!better) return { best: null, worst: null }
  const nums = values.filter(v => typeof v === 'number' && Number.isFinite(v))
  if (nums.length < 2) return { best: null, worst: null }
  const hi = Math.max(...nums)
  const lo = Math.min(...nums)
  if (hi === lo) return { best: null, worst: null }
  return better === 'high' ? { best: hi, worst: lo } : { best: lo, worst: hi }
}

const isNum = v => typeof v === 'number' && Number.isFinite(v)

/** Ekran okuyucu için farkın yönü; "düşük iyi" satırlarda işaret tek başına yanıltır. */
function verdict(delta, better) {
  if (!better || formatDelta(delta, 1) === '±%0') return ''
  return delta > 0 === (better === 'high') ? ', daha iyi' : ', daha kötü'
}

function SpecSheet({ kind, items, baseItem, compare }) {
  const [onlyDiff, setOnlyDiff] = useState(false)

  const groups = kind.specs
    .map(group => ({
      ...group,
      rows: group.rows.filter(row => {
        if (!onlyDiff || items.length < 2) return true
        const vals = items.map(it => row.get(it))
        return new Set(vals.map(v => (v == null ? '∅' : String(v)))).size > 1
      }),
    }))
    .filter(g => g.rows.length)

  return (
    <Panel
      title="Tüm özellikler"
      meta={
        items.length > 1
          ? `Yüzdeler baz parçaya (${baseItem.name}) göre fark · yukarı ok satırın en iyisi, aşağı ok en kötüsü · ${kind.specNote}`
          : undefined
      }
      actions={
        items.length > 1 && (
          <button type="button" className="btn btn-secondary min-h-9 px-3 text-[0.8125rem]" aria-pressed={onlyDiff} onClick={() => setOnlyDiff(v => !v)}>
            <span
              aria-hidden="true"
              className={`relative inline-flex h-4 w-7 flex-none rounded-full transition-colors ${onlyDiff ? 'bg-accent' : 'bg-surface-3'}`}
            >
              <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-surface shadow transition-transform ${onlyDiff ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
            </span>
            Yalnızca farklar
          </button>
        )
      }
      bodyClassName="p-0"
    >
      {items.length > 2 && (
        <p className="flex items-center gap-2 px-4 pt-3 text-xs text-ink-3 sm:hidden">
          <Icon name="swap" size={14} />
          {items.length} parça · diğerleri için yana kaydır
        </p>
      )}
      <div className="relative overflow-x-auto">
        <table
          className="data-table min-w-[var(--sheet-min-sm)] sm:min-w-[var(--sheet-min)]"
          style={{ '--sheet-min-sm': `${7 + items.length * 8}rem`, '--sheet-min': `${14 + items.length * 10}rem` }}
        >
          <caption className="sr-only">Seçili {kind.nounPlural} için tüm teknik özellikler</caption>
          <thead>
            <tr>
              <th scope="col" className="sticky left-0 z-10 w-[7rem] bg-surface !pl-4 sm:w-[14rem] sm:!pl-5">Özellik</th>
              {items.map(it => (
                <th key={it.id} scope="col" className="align-bottom !whitespace-normal">
                  <span className="flex items-start gap-2">
                    <Swatch color={seriesColor(compare.slotOf(it.id))} className="mt-1" />
                    <span className="min-w-0">
                      <Link to={kind.paths.detail(it.id)} className="text-[0.8125rem] font-semibold leading-snug text-ink hover:text-accent-text">
                        {it.name}
                      </Link>
                      {items.length > 1 && it.id === baseItem.id && <span className="badge badge-accent ml-1.5 h-[1.125rem] align-[1px]">Baz</span>}
                    </span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          {groups.map(group => (
            <tbody key={group.title}>
              <tr>
                <th colSpan={items.length + 1} scope="colgroup" className="bg-surface-2 !py-2 !pl-4 text-xs !font-semibold !text-ink-2 sm:!pl-5">
                  {group.title}
                </th>
              </tr>
              {group.rows.map(row => {
                const values = items.map(it => row.get(it))
                const { best, worst } = extremes(values, row.better)
                const baseValue = row.get(baseItem)
                const hint = [row.hint, row.better === 'low' && 'Düşük olan daha iyi'].filter(Boolean).join(' · ')
                return (
                  <tr key={row.label}>
                    <th scope="row" className="sticky left-0 z-10 bg-surface !pl-4 align-top text-[0.8125rem] !font-normal !whitespace-normal !text-ink-2 sm:!pl-5">
                      {row.label}
                      <InfoTip text={infoFor(kind.key, row.info)} label={row.label} />
                      {hint && <span className="block text-xs text-ink-3">{hint}</span>}
                    </th>
                    {values.map((v, i) => {
                      const text = v == null ? (row.fallback?.(items[i]) ?? null) : row.format(v)
                      const isBest = best != null && v === best
                      const isWorst = worst != null && v === worst
                      // Fark yalnızca yönü olan (`better`) satırlarda: rengi her zaman iyi/kötüyü söyler.
                      // Yönü olmayan satırda (yonga alanı) nötr bir yüzde yalnızca gürültü olurdu.
                      const delta =
                        row.better && items[i].id !== baseItem.id && isNum(v) && isNum(baseValue) ? percentDelta(v, baseValue) : null
                      return (
                        <td key={items[i].id} className={`tnum align-top ${row.key ? 'text-base font-semibold' : ''}`}>
                          {text == null ? (
                            <Value />
                          ) : (
                            <>
                              <span className={`inline-flex items-center gap-1 ${isBest ? 'font-semibold' : ''}`}>
                                {text}
                                {isBest && <Icon name="up" size={14} className="text-good" />}
                                {isWorst && <Icon name="down" size={14} className="text-critical" />}
                                {isBest && <span className="sr-only">(en iyi)</span>}
                                {isWorst && <span className="sr-only">(en kötü)</span>}
                              </span>
                              {delta != null && (
                                <span className="block text-xs">
                                  <Delta value={delta} better={row.better} digits={1} icon={false} />
                                  <span className="sr-only">
                                    {' '}baza göre{verdict(delta, row.better)}
                                  </span>
                                </span>
                              )}
                            </>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          ))}
        </table>
      </div>
    </Panel>
  )
}

function EmptyStart({ kind, compare }) {
  const examples = kind.examples
    .map(names => names.map(n => kind.list.find(it => it.name === n)).filter(Boolean))
    .filter(set => set.length >= 2)
  return (
    <div className="rounded-lg border border-dashed border-line-strong px-5 py-8 text-center">
      <p className="font-medium">Henüz parça eklenmedi</p>
      <p className="mx-auto mt-1 max-w-[46ch] text-sm text-ink-2">
        Yukarıdaki kutudan model ara ve ekle ya da hazır bir karşılaştırmayla başla.
      </p>
      <ul className="mt-5 flex flex-wrap justify-center gap-2">
        {examples.map(set => (
          <li key={set.map(s => s.id).join('-')}>
            <button type="button" className="btn btn-secondary" onClick={() => compare.set(set.map(s => s.id))}>
              {set.map(s => s.name).join(' vs ')}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function ComparePage({ kind }) {
  const compare = useCompare(kind.key, kind.byId)
  const [axisKey, setAxisKey] = useState(kind.axes[0].key)
  const axis = kind.axes.find(a => a.key === axisKey) ?? kind.axes[0]
  const sources = useMemo(() => [{ kind }], [kind])

  const items = useMemo(() => compare.ids.map(id => kind.byId.get(id)).filter(Boolean), [compare.ids, kind])
  const baseItem = items.find(it => it.id === compare.base) ?? items[0] ?? null
  const orderedForSheet = [...items].sort((a, b) => (b[axis.key] ?? -1) - (a[axis.key] ?? -1))

  return (
    <main id="main" className="mx-auto max-w-[1280px] px-4 sm:px-6">
      <PageHeader
        title={`${kind.code} karşılaştır`}
        lead={`En fazla ${MAX_COMPARE} ${kind.noun} seç. Üstte sıra ve baz parçaya göre fark, altta her teknik değer.`}
        aside={
          <Link to={OTHER[kind.key].to} className="btn btn-ghost">
            {OTHER[kind.key].code} karşılaştır
            <Icon name="arrowRight" size={16} />
          </Link>
        }
      />

      <div className="space-y-6">
        <Panel
          title="Karşılaştırma"
          meta={`${items.length}/${MAX_COMPARE} parça · referans ${kind.reference?.name} = 100 · tahmini`}
          actions={
            items.length > 0 && (
              <button type="button" className="btn btn-ghost" onClick={compare.clear}>
                <Icon name="reset" size={16} />
                Temizle
              </button>
            )
          }
        >
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <PartSearch
              sources={sources}
              placeholder={kind.placeholder}
              note={compare.full ? `liste dolu (${MAX_COMPARE}/${MAX_COMPARE}), eklemek için birini çıkar` : undefined}
              stateOf={item => ({ added: compare.has(item.id), disabled: !compare.has(item.id) && compare.full })}
              onChoose={item => compare.toggle(item.id)}
            />
            {kind.axes.length > 1 && (
              <div className="flex flex-wrap items-center gap-3">
                <span className="label" id={`${kind.key}-axis-label`}>Sırala</span>
                <div className="segmented" role="group" aria-labelledby={`${kind.key}-axis-label`}>
                  {kind.axes.map(a => (
                    <button key={a.key} type="button" aria-pressed={a.key === axis.key} onClick={() => setAxisKey(a.key)}>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-5">
            {items.length === 0 ? (
              <EmptyStart kind={kind} compare={compare} />
            ) : (
              <RankList kind={kind} compare={compare} items={items} axis={axis} baseItem={baseItem} />
            )}
          </div>
        </Panel>

        {items.length > 0 && <SpecSheet kind={kind} items={orderedForSheet} baseItem={baseItem} compare={compare} />}

        <EstimateNote kind={kind} className="max-w-[80ch]" />
      </div>
    </main>
  )
}
