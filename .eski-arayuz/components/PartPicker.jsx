import { useMemo, useState, useDeferredValue } from 'react'

export const MAX_COMPARE = 5

/**
 * Parca secme paneli.
 *
 * Onemli davranis: arama TUM veritabaninda calisir, listeleme sinirlanir.
 * (Onceki surumde once ilk 12 kayit aliniyordu; bu yuzden aranan model
 * listede yoksa hic bulunamiyordu.)
 */
function PartPicker({ items, selected, onToggle, onClear, accent = 'blue', placeholder, renderMeta }) {
  const [search, setSearch] = useState('')
  const [brand, setBrand] = useState('Tumu')
  // Yazarken listenin takilmamasi icin filtreleme dusuk oncelikte yapilir.
  const deferredSearch = useDeferredValue(search)

  const accents = {
    blue: {
      text: 'text-blue-400', border: 'border-blue-500', bg: 'bg-blue-500',
      soft: 'bg-blue-500/10', hover: 'hover:border-blue-500/50', focus: 'focus:border-blue-500',
      chip: 'bg-blue-500 text-white',
    },
    purple: {
      text: 'text-purple-400', border: 'border-purple-500', bg: 'bg-purple-500',
      soft: 'bg-purple-500/10', hover: 'hover:border-purple-500/50', focus: 'focus:border-purple-500',
      chip: 'bg-purple-500 text-white',
    },
  }
  const a = accents[accent] ?? accents.blue

  const brands = useMemo(() => {
    const set = new Set(items.map(i => i.brand || i.manufacturer).filter(Boolean))
    return ['Tumu', ...[...set].sort()]
  }, [items])

  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase()
    return items.filter(item => {
      if (brand !== 'Tumu' && (item.brand || item.manufacturer) !== brand) return false
      if (!q) return true
      // Isim + cip/seri uzerinde arama
      return (
        item.name.toLowerCase().includes(q) ||
        (item.chip || '').toLowerCase().includes(q) ||
        (item.series || '').toLowerCase().includes(q)
      )
    })
  }, [items, deferredSearch, brand])

  const selectedIds = useMemo(() => new Set(selected.map(s => s.id)), [selected])
  const isFull = selected.length >= MAX_COMPARE
  const LIST_LIMIT = 60
  const shown = filtered.slice(0, LIST_LIMIT)

  return (
    <div className="bg-slate-800/50 rounded-2xl p-4 sm:p-6 border border-slate-700/50 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-white">Parca Sec</h2>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium ${isFull ? 'text-amber-400' : a.text}`}>
            {selected.length}/{MAX_COMPARE} secildi
          </span>
          {selected.length > 0 && (
            <button
              onClick={onClear}
              className="text-sm px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition"
            >
              Temizle
            </button>
          )}
        </div>
      </div>

      {/* Secilenler - hizli cikarma icin cip listesi */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selected.map(item => (
            <button
              key={item.id}
              onClick={() => onToggle(item)}
              className={`inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-lg text-sm font-medium ${a.chip} transition hover:opacity-85`}
              aria-label={`${item.name} secimini kaldir`}
            >
              {item.name}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {/* Arama + marka filtresi */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder}
            className={`w-full bg-slate-900/60 border border-slate-600 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none ${a.focus} transition`}
          />
        </div>
        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className={`bg-slate-900/60 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none ${a.focus} transition sm:w-44`}
          aria-label="Marka filtresi"
        >
          {brands.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      <p className="text-xs text-slate-500 mb-3">
        {filtered.length} sonuc{shown.length < filtered.length ? ` (ilk ${shown.length} gosteriliyor, aramayi daraltin)` : ''}
        {isFull && ' — limit doldu, yeni eklemek icin birini cikarin'}
      </p>

      {/* Sonuc listesi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
        {shown.map(item => {
          const isSelected = selectedIds.has(item.id)
          const disabled = !isSelected && isFull
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onToggle(item)}
              disabled={disabled}
              aria-pressed={isSelected}
              className={`text-left rounded-xl p-3 border transition ${
                isSelected
                  ? `${a.border} ${a.soft}`
                  : disabled
                    ? 'border-slate-800 bg-slate-900/30 opacity-40 cursor-not-allowed'
                    : `border-slate-700/50 bg-slate-900/50 ${a.hover} cursor-pointer`
              }`}
            >
              <div className="flex items-start gap-2 mb-2">
                <span className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border ${
                  isSelected ? `${a.bg} border-transparent` : 'border-slate-600'
                }`}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <span className={`text-sm font-medium leading-snug break-words ${isSelected ? a.text : 'text-white'}`}>
                  {item.name}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400 pl-6">
                {renderMeta(item)}
              </div>
            </button>
          )
        })}
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-slate-400 py-8">Sonuc bulunamadi.</p>
        )}
      </div>
    </div>
  )
}

export default PartPicker
