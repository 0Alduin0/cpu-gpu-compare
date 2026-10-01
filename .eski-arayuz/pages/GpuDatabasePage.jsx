import { gpuList } from '../data/gpuData'
import Navbar from '../components/Navbar'
import PageHeader, { ICON_GPU } from '../components/PageHeader'
import DatabaseList from '../components/DatabaseList'

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : -Infinity)

const SORT_OPTIONS = [
  { key: 'score', label: 'Performansa gore', compare: (a, b) => num(b.performanceScore) - num(a.performanceScore) },
  { key: 'name', label: 'Isme gore (A-Z)', compare: (a, b) => a.name.localeCompare(b.name, 'tr') },
  { key: 'newest', label: 'En yeni', compare: (a, b) => num(b.releaseYear) - num(a.releaseYear) },
  { key: 'vram', label: 'Bellege gore', compare: (a, b) => num(b.memorySize) - num(a.memorySize) },
  { key: 'tdp', label: 'En dusuk TDP', compare: (a, b) => (a.tdp ?? Infinity) - (b.tdp ?? Infinity) },
]

function GpuDatabasePage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <PageHeader
        title="GPU Veritabani"
        subtitle={`${gpuList.length} ekran karti — detay icin tiklayin`}
        accent="purple"
        icon={ICON_GPU}
      />
      <DatabaseList
        items={gpuList}
        basePath="/gpu-veritabani"
        accent="purple"
        placeholder="GPU ara..."
        sortOptions={SORT_OPTIONS}
        renderStats={(gpu, a) => (
          <>
            <span className={`font-semibold ${a.text}`}>{gpu.performanceScore ?? '–'}</span>
            <span>{gpu.memorySize ? `${Math.round(gpu.memorySize / 1024)} GB` : '–'}</span>
            <span>{gpu.architecture || '–'}</span>
            <span>{gpu.tdp != null ? `${gpu.tdp} W` : '–'}</span>
          </>
        )}
      />
    </div>
  )
}

export default GpuDatabasePage
