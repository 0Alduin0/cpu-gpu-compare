import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import gpuDatabase from '../../data/gpu_database.json'
import { gpuById } from '../data/gpuData'
import { GPU_GROUPS } from '../data/labels'
import Navbar from '../components/Navbar'
import PageHeader, { ICON_GPU } from '../components/PageHeader'
import SpecGroups from '../components/SpecGroups'

function GpuDetailPage() {
  const { id } = useParams()
  const raw = useMemo(
    () => (Array.isArray(gpuDatabase) ? gpuDatabase.find(g => g.id === id) : null),
    [id]
  )
  const gpu = gpuById.get(id)

  if (!raw) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">GPU bulunamadi</h1>
          <Link to="/gpu-veritabani" className="text-purple-400 hover:text-purple-300">
            ← GPU Veritabanina don
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
        accent="purple"
        icon={ICON_GPU}
        backTo="/gpu-veritabani"
        backLabel="GPU veritabanina don"
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Ozet kartlari */}
        {gpu && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Performans Skoru', value: gpu.performanceScore ?? '–' },
              { label: 'FP32', value: gpu.fp32Tflops != null ? `${gpu.fp32Tflops} TF` : '–' },
              { label: 'Bellek', value: gpu.memorySize ? `${Math.round(gpu.memorySize / 1024)} GB` : '–' },
              { label: 'TDP', value: gpu.tdp != null ? `${gpu.tdp} W` : '–' },
            ].map(stat => (
              <div key={stat.label} className="bg-slate-800/60 rounded-xl border border-slate-700/50 px-3 py-3 text-center">
                <div className="text-lg sm:text-xl font-bold text-purple-400 break-words">{stat.value}</div>
                <div className="text-xs text-slate-400 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        <SpecGroups record={raw} groups={GPU_GROUPS} />

        <div className="mt-6">
          <Link
            to="/gpu-karsilastir"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-xl transition"
          >
            Bu karti karsilastir
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </main>
    </div>
  )
}

export default GpuDetailPage
