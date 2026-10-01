import { useMemo } from 'react'
import { fmt } from '../data/parse'

/**
 * Karsilastirma tablosu.
 *
 * Mobilde: her parca icin ayri kart (dikey liste) - yatay kaydirma yok.
 * Genis ekranda: klasik tablo, ozellik adi sol sutunda sabit.
 *
 * Renklendirme: sadece EN IYI yesil, sadece EN KOTU kirmizi olur.
 * (Onceki surumde en iyi disindaki her deger kirmizi boyaniyordu; 5 parca
 * secildiginde 4 kirmizi cikiyor ve tablo okunmaz hale geliyordu.)
 */
function CompareTable({ items, specs, accent = 'blue' }) {
  const accents = {
    blue: { head: 'text-blue-400', ring: 'border-blue-500/40' },
    purple: { head: 'text-purple-400', ring: 'border-purple-500/40' },
  }
  const a = accents[accent] ?? accents.blue

  // Her satir icin en iyi/en kotu degerleri onceden hesapla.
  const rows = useMemo(() => specs.map(spec => {
    const values = items.map(item => (spec.getValue ? spec.getValue(item) : item[spec.key]))
    const nums = values.filter(v => typeof v === 'number' && Number.isFinite(v))
    let best = null
    let worst = null
    // En az 2 parca ve en az 2 farkli sayisal deger varsa vurgula.
    if (items.length > 1 && nums.length > 1 && spec.higherBetter != null) {
      const hi = Math.max(...nums)
      const lo = Math.min(...nums)
      if (hi !== lo) {
        best = spec.higherBetter ? hi : lo
        worst = spec.higherBetter ? lo : hi
      }
    }
    return { spec, values, best, worst }
  }), [items, specs])

  const cellClass = (value, best, worst) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) return 'text-slate-200'
    if (best !== null && value === best) return 'text-emerald-400 font-semibold'
    if (worst !== null && value === worst) return 'text-rose-400'
    return 'text-slate-200'
  }

  return (
    <>
      {/* ---------- Mobil: parca basina kart ---------- */}
      <div className="space-y-4 lg:hidden">
        {items.map((item, i) => (
          <div key={item.id} className={`rounded-xl border ${a.ring} bg-slate-900/60 overflow-hidden`}>
            <div className="px-4 py-3 bg-slate-800/80 border-b border-slate-700/60">
              <h3 className={`font-bold ${a.head} break-words`}>{item.name}</h3>
            </div>
            <dl className="divide-y divide-slate-800">
              {rows.map(({ spec, values, best, worst }) => (
                <div key={spec.key || spec.label} className="flex items-start justify-between gap-3 px-4 py-2.5">
                  <dt className="text-sm text-slate-400 shrink-0">{spec.label}</dt>
                  <dd className={`text-sm text-right break-words ${cellClass(values[i], best, worst)}`}>
                    {fmt(values[i], spec.unit)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      {/* ---------- Masaustu: tablo ---------- */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left text-slate-400 font-medium text-sm py-3 pr-4 w-48 sticky left-0 bg-slate-800/50 z-10">
                Ozellik
              </th>
              {items.map(item => (
                <th key={item.id} className={`px-3 py-3 text-center font-bold text-sm ${a.head} break-words`}>
                  {item.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ spec, values, best, worst }, index) => (
              <tr key={spec.key || spec.label} className={index % 2 === 0 ? 'bg-slate-700/20' : ''}>
                <th scope="row" className={`text-left text-slate-300 text-sm font-normal py-2.5 pl-3 pr-4 sticky left-0 z-10 ${index % 2 === 0 ? 'bg-slate-750' : 'bg-slate-800/50'}`}
                    style={{ backgroundColor: index % 2 === 0 ? 'rgb(43 55 75)' : 'rgb(35 45 62)' }}>
                  {spec.label}
                </th>
                {values.map((value, i) => (
                  <td key={items[i].id} className={`px-3 py-2.5 text-center text-sm ${cellClass(value, best, worst)}`}>
                    {fmt(value, spec.unit)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default CompareTable
