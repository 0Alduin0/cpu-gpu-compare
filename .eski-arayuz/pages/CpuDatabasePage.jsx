import { cpuList } from '../data/cpuData'
import Navbar from '../components/Navbar'
import PageHeader, { ICON_CPU } from '../components/PageHeader'
import DatabaseList from '../components/DatabaseList'

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : -Infinity)

const SORT_OPTIONS = [
  { key: 'score', label: 'Performansa gore', compare: (a, b) => num(b.performanceScore) - num(a.performanceScore) },
  { key: 'single', label: 'Tek cekirdege gore', compare: (a, b) => num(b.singleCoreScore) - num(a.singleCoreScore) },
  { key: 'multi', label: 'Cok cekirdege gore', compare: (a, b) => num(b.multiCoreScore) - num(a.multiCoreScore) },
  { key: 'name', label: 'Isme gore (A-Z)', compare: (a, b) => a.name.localeCompare(b.name, 'tr') },
  { key: 'newest', label: 'En yeni', compare: (a, b) => num(b.releaseYear) - num(a.releaseYear) },
  { key: 'tdp', label: 'En dusuk TDP', compare: (a, b) => (a.tdp ?? Infinity) - (b.tdp ?? Infinity) },
]

function CpuDatabasePage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <PageHeader
        title="CPU Veritabani"
        subtitle={`${cpuList.length} islemci — detay icin tiklayin`}
        accent="blue"
        icon={ICON_CPU}
      />
      <DatabaseList
        items={cpuList}
        basePath="/cpu-veritabani"
        accent="blue"
        placeholder="CPU ara..."
        sortOptions={SORT_OPTIONS}
        renderStats={(cpu, a) => (
          <>
            <span className={`font-semibold ${a.text}`}>{cpu.performanceScore ?? '–'}</span>
            <span>{cpu.cores}C/{cpu.threads}T</span>
            <span>{cpu.boostClock ? `${cpu.boostClock} GHz` : '–'}</span>
            <span>{cpu.tdp != null ? `${cpu.tdp} W` : '–'}</span>
          </>
        )}
      />
    </div>
  )
}

export default CpuDatabasePage
