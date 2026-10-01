import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import cpuDatabase from '../../data/cpu_database.json'
import { cpuById } from '../data/cpuData'
import { CPU_GROUPS } from '../data/labels'
import Navbar from '../components/Navbar'
import PageHeader, { ICON_CPU } from '../components/PageHeader'
import SpecGroups from '../components/SpecGroups'

function CpuDetailPage() {
  const { id } = useParams()
  const raw = useMemo(
    () => (Array.isArray(cpuDatabase) ? cpuDatabase.find(c => c.id === id) : null),
    [id]
  )
  const cpu = cpuById.get(id)

  if (!raw) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">CPU bulunamadi</h1>
          <Link to="/cpu-veritabani" className="text-blue-400 hover:text-blue-300">
            ← CPU Veritabanina don
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <PageHeader
        title={raw.name}
        subtitle="Tum teknik ozellikler"
        accent="blue"
        icon={ICON_CPU}
        backTo="/cpu-veritabani"
        backLabel="CPU veritabanina don"
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {cpu && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Performans Skoru', value: cpu.performanceScore ?? '–' },
              { label: 'Cekirdek / Thread', value: `${cpu.cores}C / ${cpu.threads}T` },
              { label: 'Boost Saat', value: cpu.boostClock ? `${cpu.boostClock} GHz` : '–' },
              { label: 'TDP', value: cpu.tdp != null ? `${cpu.tdp} W` : '–' },
            ].map(stat => (
              <div key={stat.label} className="bg-slate-800/60 rounded-xl border border-slate-700/50 px-3 py-3 text-center">
                <div className="text-lg sm:text-xl font-bold text-blue-400 break-words">{stat.value}</div>
                <div className="text-xs text-slate-400 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        <SpecGroups record={raw} groups={CPU_GROUPS} />

        <div className="mt-6">
          <Link
            to="/cpu-karsilastir"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition"
          >
            Bu islemciyi karsilastir
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </main>
    </div>
  )
}

export default CpuDetailPage
