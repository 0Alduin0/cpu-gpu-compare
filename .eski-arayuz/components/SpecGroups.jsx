import { labelFor } from '../data/labels'

/**
 * Ham veritabani kaydini gruplanmis, Turkce etiketli spesifikasyon
 * listesine cevirir. Gruplarda tanimli olmayan alanlar "Diger" altinda
 * toplanir; boylece veriye yeni alan eklense de kaybolmaz.
 */
function SpecGroups({ record, groups, skipKeys = ['id', 'name'] }) {
  const used = new Set(skipKeys)
  const sections = groups
    .map(group => {
      const rows = group.keys
        .filter(key => {
          const v = record[key]
          return v != null && String(v).trim() !== ''
        })
        .map(key => {
          used.add(key)
          return [key, record[key]]
        })
      return { title: group.title, rows }
    })
    .filter(s => s.rows.length > 0)

  // Gruplara girmemis alanlar
  const leftovers = Object.entries(record).filter(
    ([k, v]) => !used.has(k) && v != null && String(v).trim() !== ''
  )
  if (leftovers.length > 0) sections.push({ title: 'Diger', rows: leftovers })

  return (
    <div className="space-y-5">
      {sections.map(section => (
        <section key={section.title} className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
          <h2 className="px-4 sm:px-5 py-3 bg-slate-800 border-b border-slate-700/60 text-sm font-semibold text-white">
            {section.title}
          </h2>
          <dl className="divide-y divide-slate-700/40">
            {section.rows.map(([key, value]) => (
              <div key={key} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 px-4 sm:px-5 py-3">
                <dt className="text-sm text-slate-400 sm:w-2/5 sm:flex-shrink-0">{labelFor(key)}</dt>
                <dd className="text-sm text-white whitespace-pre-line break-words sm:flex-1">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  )
}

export default SpecGroups
