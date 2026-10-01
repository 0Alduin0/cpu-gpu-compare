import { useMemo, useState, useDeferredValue } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

/**
 * Veritabani liste gorunumu (CPU/GPU ortak).
 * Satirlar mobilde alt alta sarar; masaustunde tek satirda hizalanir.
 */
function DatabaseList({ items, basePath, accent = 'blue', placeholder, sortOptions, renderStats }) {
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)

  // Siralama URL'den okunur (?sort=multi gibi baglantilar calissin diye).
  const [searchParams, setSearchParams] = useSearchParams()
  const urlSort = searchParams.get('sort')
  const sortKey = sortOptions.some(o => o.key === urlSort) ? urlSort : sortOptions[0].key
  const setSortKey = (key) => {
    setSearchParams(key === sortOptions[0].key ? {} : { sort: key }, { replace: true })
  }

  const a = accent === 'purple'
    ? { text: 'text-purple-400', hover: 'group-hover:text-purple-400', focus: 'focus:border-purple-500' }
    : { text: 'text-blue-400', hover: 'group-hover:text-blue-400', focus: 'focus:border-blue-500' }

  const list = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase()
    const sort = sortOptions.find(o => o.key === sortKey) ?? sortOptions[0]
    return items
      .filter(item => {
        if (!q) return true
        return (
          item.name.toLowerCase().includes(q) ||
          (item.chip || '').toLowerCase().includes(q) ||
          (item.series || '').toLowerCase().includes(q)
        )
      })
      .slice()
      .sort(sort.compare)
  }, [items, deferredSearch, sortKey, sortOptions])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder}
            className={`w-full bg-slate-800 border border-slate-600 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none ${a.focus} transition`}
          />
        </div>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
          className={`bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none ${a.focus} transition sm:w-56`}
          aria-label="Siralama"
        >
          {sortOptions.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
        </select>
      </div>

      <p className="text-xs text-slate-500 mb-3">{list.length} kayit</p>

      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
        <ul className="divide-y divide-slate-700/50">
          {list.map(item => (
            <li key={item.id}>
              <Link
                to={`${basePath}/${item.id}`}
                className="flex items-center gap-3 px-4 sm:px-5 py-4 hover:bg-slate-700/30 transition group"
              >
                <div className="flex-1 min-w-0">
                  <span className={`font-medium text-white ${a.hover} transition block break-words`}>
                    {item.name}
                  </span>
                  {/* Mobilde alta saran istatistikler */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1.5">
                    {renderStats(item, a)}
                  </div>
                </div>
                <svg className={`w-5 h-5 text-slate-500 ${a.hover} transition flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
        {list.length === 0 && (
          <div className="px-5 py-12 text-center text-slate-400">Sonuc bulunamadi.</div>
        )}
      </div>
    </div>
  )
}

export default DatabaseList
