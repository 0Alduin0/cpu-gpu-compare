/**
 * Secilen parcalarin bir metrigini yatay cubuklarla karsilastirir.
 * En yuksek deger %100 genislik alir; digerleri ona oranlanir ve
 * lidere gore yuzde farki yazilir ("-23%").
 */
function ScoreBars({ items, title, getValue, unit = '', accent = 'blue', note }) {
  const rows = items
    .map(item => ({ item, value: getValue(item) }))
    .filter(r => typeof r.value === 'number' && Number.isFinite(r.value))
    .sort((a, b) => b.value - a.value)

  if (rows.length === 0) return null

  const max = rows[0].value
  const barColor = accent === 'purple'
    ? 'from-purple-500 to-fuchsia-500'
    : 'from-blue-500 to-cyan-500'

  return (
    <div className="bg-slate-900/40 rounded-xl p-4 sm:p-5 border border-slate-700/40">
      <h4 className="text-sm font-semibold text-white mb-1">{title}</h4>
      {note && <p className="text-xs text-slate-500 mb-3">{note}</p>}
      <div className={`space-y-3 ${note ? '' : 'mt-3'}`}>
        {rows.map(({ item, value }, i) => {
          const pct = max > 0 ? (value / max) * 100 : 0
          const diff = max > 0 ? Math.round((value / max - 1) * 100) : 0
          return (
            <div key={item.id}>
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <span className="text-xs text-slate-300 truncate">{item.name}</span>
                <span className="text-xs font-medium text-white whitespace-nowrap">
                  {value.toLocaleString('tr-TR', { maximumFractionDigits: 1 })}{unit}
                  {i > 0 && diff < 0 && <span className="text-slate-500 ml-1.5">{diff}%</span>}
                  {i === 0 && rows.length > 1 && <span className="text-emerald-400 ml-1.5">lider</span>}
                </span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-[width] duration-500`}
                  style={{ width: `${Math.max(pct, 2)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ScoreBars
