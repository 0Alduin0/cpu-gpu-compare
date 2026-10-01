import { useDeferredValue, useEffect, useId, useMemo, useRef, useState } from 'react'
import Icon from './Icon'
import { formatIndex, queryTokens, searchKey } from '../data/format'

const LIMIT = 8

/**
 * Parça arama kutusu (ARIA 1.2 combobox + listbox).
 * Arama tüm veritabanında çalışır; yalnızca gösterim sınırlanır.
 *
 * sources: [{ kind }] — bir ya da birden çok parça türü. Kimliği kararlı olmalı
 *          (modül sabiti ya da useMemo); her render'da yeni dizi sonuçları sıfırlar.
 * onChoose(item, kind): seçim
 * stateOf(item, kind): { added?, disabled? } — karşılaştırma kutusunda kullanılır
 */
export default function PartSearch({ sources, onChoose, stateOf, placeholder, note, size = 'md', autoFocus = false }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const deferred = useDeferredValue(query)
  const inputRef = useRef(null)
  const listId = useId()
  const multi = sources.length > 1

  // Arama anahtarları bir kez: "rtx4070", "İ5-12400F" gibi yazımlar da bulunur (searchKey).
  const all = useMemo(
    () => sources.flatMap(({ kind }) => kind.list.map(item => ({ item, kind, hay: searchKey(kind.searchText(item)), name: searchKey(item.name) }))),
    [sources],
  )

  // total: kesilmeden önceki eşleşme sayısı ("109 sonuç · ilk 8").
  const { results, total } = useMemo(() => {
    const tokens = queryTokens(deferred)
    const q = tokens.join('')
    // Sunucu parçaları kendi grubunda sıralı (bkz. rank.js); tüketici parçalarından sonra gelir.
    const rank = r => (r.item.server ? 10000 : 0) + (r.kind.rank.get(r.item.id) ?? 9999)
    if (!tokens.length) {
      // Boş sorgu: türe göre en güçlüler.
      const per = Math.ceil(LIMIT / sources.length)
      const top = sources.flatMap(({ kind }) =>
        all
          .filter(r => r.kind === kind)
          .sort((a, b) => rank(a) - rank(b))
          .slice(0, per),
      )
      return { results: top, total: null }
    }
    const hits = all
      .filter(r => tokens.every(t => r.hay.includes(t)))
      .sort((a, b) => (a.name.startsWith(q) ? 0 : 1) - (b.name.startsWith(q) ? 0 : 1) || rank(a) - rank(b))
    return { results: hits.slice(0, LIMIT), total: hits.length }
  }, [all, deferred, sources])

  const [lastResults, setLastResults] = useState(results)
  if (lastResults !== results) {
    setLastResults(results)
    setActive(0)
  }

  const choose = r => {
    onChoose(r.item, r.kind)
    setQuery('')
    inputRef.current?.focus()
  }

  // Klavyeyle seçilen satır, kaydırılabilir listenin görünür alanında kalsın.
  useEffect(() => {
    if (!open) return
    const id = results[active] ? `${listId}-opt-${results[active].item.id}` : null
    if (id) document.getElementById(id)?.scrollIntoView({ block: 'nearest' })
  }, [active, open, results, listId])

  const onKeyDown = e => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      // Kapalı listeyi açan ilk basış ilk seçenekte kalır, atlamaz.
      if (!open) setOpen(true)
      else setActive(i => Math.min(results.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive(i => Math.max(0, i - 1))
    } else if (e.key === 'Enter') {
      const r = results[active]
      // Sonuçlar ertelenmiş sorguya göre; hızlı yaz-Enter'da eski listeden seçim yapılmasın.
      if (open && r && query.trim() === deferred.trim()) {
        e.preventDefault()
        if (!stateOf?.(r.item, r.kind)?.disabled) choose(r)
      }
    } else if (e.key === 'Escape') {
      if (query) setQuery('')
      else setOpen(false)
    }
  }

  const searching = total != null
  const showList = open && (results.length > 0 || searching)
  const heading = !searching
    ? multi
      ? 'En güçlü parçalar'
      : `En güçlü ${LIMIT}`
    : total > results.length
      ? `${total} sonuç · ilk ${results.length}`
      : `${total} sonuç`
  const big = size === 'lg'

  return (
    <div
      className="relative"
      onBlur={e => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false)
      }}
    >
      <label htmlFor={`${listId}-input`} className="sr-only">
        Parça ara
      </label>
      <div className="relative">
        <Icon name="search" size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
        <input
          ref={inputRef}
          id={`${listId}-input`}
          type="text"
          role="combobox"
          aria-expanded={showList}
          aria-controls={`${listId}-list`}
          aria-autocomplete="list"
          aria-activedescendant={showList && results[active] ? `${listId}-opt-${results[active].item.id}` : undefined}
          autoComplete="off"
          spellCheck={false}
          autoFocus={autoFocus}
          value={query}
          placeholder={placeholder}
          onChange={e => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className={`field pl-10 ${big ? 'min-h-12 text-base' : ''}`}
        />
      </div>

      {showList && (
        <div className="absolute inset-x-0 top-full z-30 mt-1.5 overflow-hidden rounded-[10px] border border-line bg-surface p-1 shadow-[var(--shadow-pop)]">
          <p className="px-2.5 pb-1 pt-1.5 text-xs font-medium text-ink-3">
            {heading}
            {note && ` · ${note}`}
          </p>
          {results.length === 0 && <p className="px-2.5 pb-2.5 pt-1 text-sm text-ink-2">Eşleşen parça yok. Model numarasını dene (örn. 4070, 7800X3D).</p>}
          <ul id={`${listId}-list`} role="listbox" aria-label="Arama sonuçları" className="max-h-[22rem] overflow-y-auto">
            {results.map((r, i) => {
              const st = stateOf?.(r.item, r.kind) ?? {}
              return (
                <li
                  key={`${r.kind.key}-${r.item.id}`}
                  id={`${listId}-opt-${r.item.id}`}
                  role="option"
                  aria-selected={i === active}
                  aria-disabled={st.disabled || undefined}
                  onMouseDown={e => e.preventDefault()}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => !st.disabled && choose(r)}
                  className={`flex cursor-pointer items-center gap-3 rounded-md px-2.5 py-2 ${i === active ? 'bg-surface-2' : ''} ${
                    st.disabled ? 'cursor-not-allowed opacity-45' : ''
                  }`}
                >
                  {multi && <span className="badge w-10 flex-none justify-center">{r.kind.code}</span>}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">{r.item.name}</span>
                    <span className="block truncate text-xs text-ink-3">{r.kind.meta(r.item)}</span>
                  </span>
                  {st.added ? (
                    <span className="badge badge-accent flex-none">
                      <Icon name="check" size={12} />
                      Ekli<span className="sr-only">, seçersen çıkarılır</span>
                    </span>
                  ) : (
                    <span className="flex-none text-sm tnum text-ink-2">
                      {r.item.perfIndex != null ? (
                        <>
                          <span className="sr-only">Endeks </span>
                          {formatIndex(r.item.perfIndex)}
                        </>
                      ) : (
                        <>
                          <span aria-hidden="true" className="text-ink-3">—</span>
                          <span className="sr-only">endeks yok</span>
                        </>
                      )}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
