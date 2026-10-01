import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { gpuList } from '../data/gpuData'
import Navbar from '../components/Navbar'
import PageHeader, { ICON_GPU } from '../components/PageHeader'
import PartPicker, { MAX_COMPARE } from '../components/PartPicker'
import CompareTable from '../components/CompareTable'
import ScoreBars from '../components/ScoreBars'

const SPECS = [
  { label: 'Performans Skoru', key: 'performanceScore', higherBetter: true },
  { label: 'Uretici', key: 'manufacturer', higherBetter: null },
  { label: 'Cip', key: 'chip', higherBetter: null },
  { label: 'Mimari', key: 'architecture', higherBetter: null },
  { label: 'Uretim Sureci', key: 'processSize', higherBetter: null },
  { label: 'FP32 Gucu', key: 'fp32Tflops', unit: ' TFLOPS', higherBetter: true },
  { label: 'Bellek', getValue: g => (g.memorySize != null ? Math.round(g.memorySize / 1024) : null), unit: ' GB', higherBetter: true },
  { label: 'Bellek Tipi', key: 'memoryType', higherBetter: null },
  { label: 'Bant Genisligi', key: 'memoryBandwidth', unit: ' GB/s', higherBetter: true },
  { label: 'Bellek Veri Yolu', key: 'memoryBus', unit: ' bit', higherBetter: true },
  { label: 'Temel Saat', key: 'gpuClock', unit: ' MHz', higherBetter: true },
  { label: 'Boost Saat', key: 'boostClock', unit: ' MHz', higherBetter: true },
  { label: 'Shader Sayisi', key: 'shaders', higherBetter: true },
  { label: 'TMU', key: 'tmus', higherBetter: true },
  { label: 'ROP', key: 'rops', higherBetter: true },
  { label: 'RT Cekirdegi', key: 'rtCores', higherBetter: true },
  { label: 'Tensor/Matrix', key: 'tensorCores', higherBetter: true },
  { label: 'Doku Hizi', key: 'textureRate', unit: ' GT/s', higherBetter: true },
  { label: 'Piksel Hizi', key: 'pixelRate', unit: ' GP/s', higherBetter: true },
  { label: 'TDP', key: 'tdp', unit: ' W', higherBetter: false },
  { label: 'Onerilen PSU', key: 'recommendedPsu', unit: ' W', higherBetter: false },
  { label: 'Arayuz', key: 'bus', higherBetter: null },
  { label: 'Cikis Tarihi', key: 'releaseDate', higherBetter: null },
  { label: 'Liste Fiyati', key: 'msrp', unit: ' $', higherBetter: false },
]

function GpuComparePage() {
  const [selected, setSelected] = useState([])

  const toggle = useCallback((gpu) => {
    setSelected(prev => {
      if (prev.some(g => g.id === gpu.id)) return prev.filter(g => g.id !== gpu.id)
      if (prev.length >= MAX_COMPARE) return prev
      return [...prev, gpu]
    })
  }, [])

  const clear = useCallback(() => setSelected([]), [])

  const renderMeta = useCallback((gpu) => (
    <>
      <span className="text-purple-400 font-semibold">{gpu.performanceScore ?? '–'}</span>
      <span>{gpu.memorySize ? `${Math.round(gpu.memorySize / 1024)} GB` : '–'}</span>
      <span>{gpu.tdp != null ? `${gpu.tdp}W` : '–'}</span>
      <span className="truncate">{gpu.architecture || '–'}</span>
    </>
  ), [])

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <PageHeader
        title="GPU Karsilastirma"
        subtitle={`En fazla ${MAX_COMPARE} ekran kartini yan yana karsilastirin`}
        accent="purple"
        icon={ICON_GPU}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <PartPicker
          items={gpuList}
          selected={selected}
          onToggle={toggle}
          onClear={clear}
          accent="purple"
          placeholder="GPU ara... (orn. RTX 4090, RX 7900)"
          renderMeta={renderMeta}
        />

        {selected.length === 0 ? (
          <div className="bg-slate-800/40 border border-dashed border-slate-700 rounded-2xl px-6 py-14 text-center">
            <svg className="w-12 h-12 mx-auto text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={ICON_GPU} />
            </svg>
            <p className="text-slate-400">Karsilastirmaya baslamak icin yukaridan GPU secin.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Gorsel karsilastirma */}
            {selected.length > 1 && (
              <div className="bg-slate-800/50 rounded-2xl p-4 sm:p-6 border border-slate-700/50">
                <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Performans Karsilastirmasi</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <ScoreBars
                    items={selected}
                    title="Genel Performans Skoru"
                    note="Spesifikasyonlardan hesaplanir (0-100)"
                    getValue={g => g.performanceScore}
                    accent="purple"
                  />
                  <ScoreBars
                    items={selected}
                    title="FP32 Hesaplama Gucu"
                    getValue={g => g.fp32Tflops}
                    unit=" TFLOPS"
                    accent="purple"
                  />
                  <ScoreBars
                    items={selected}
                    title="Bellek Bant Genisligi"
                    getValue={g => g.memoryBandwidth}
                    unit=" GB/s"
                    accent="purple"
                  />
                </div>
              </div>
            )}

            {/* Detay tablosu */}
            <div className="bg-slate-800/50 rounded-2xl p-4 sm:p-6 border border-slate-700/50">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {selected.length > 1 ? 'Teknik Ozellikler' : 'GPU Detaylari'}
                </h2>
                {selected.length > 1 && (
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />En iyi</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400" />En dusuk</span>
                  </div>
                )}
              </div>
              <CompareTable items={selected} specs={SPECS} accent="purple" />

              <div className="mt-5 flex flex-wrap gap-2">
                {selected.map(gpu => (
                  <Link
                    key={gpu.id}
                    to={`/gpu-veritabani/${gpu.id}`}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-700/60 text-slate-300 hover:bg-slate-700 hover:text-white transition"
                  >
                    {gpu.name} tum ozellikleri →
                  </Link>
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Performans skoru; FP32 gucu, bant genisligi, doku hizi, shader sayisi, bellek ve saat
              hizlarindan hesaplanan tahmini bir degerdir. Gercek oyun performansi surucu, cozunurluk
              ve oyuna gore degisir.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

export default GpuComparePage
