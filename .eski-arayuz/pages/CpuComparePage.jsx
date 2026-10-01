import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { cpuList } from '../data/cpuData'
import Navbar from '../components/Navbar'
import PageHeader, { ICON_CPU } from '../components/PageHeader'
import PartPicker, { MAX_COMPARE } from '../components/PartPicker'
import CompareTable from '../components/CompareTable'
import ScoreBars from '../components/ScoreBars'

const SPECS = [
  { label: 'Performans Skoru', key: 'performanceScore', higherBetter: true },
  { label: 'Tek Cekirdek', key: 'singleCoreScore', higherBetter: true },
  { label: 'Cok Cekirdek', key: 'multiCoreScore', higherBetter: true },
  { label: 'Marka', key: 'brand', higherBetter: null },
  { label: 'Seri', key: 'series', higherBetter: null },
  { label: 'Kod Adi', key: 'codename', higherBetter: null },
  { label: 'Segment', key: 'market', higherBetter: null },
  { label: 'Cekirdek', key: 'cores', higherBetter: true },
  { label: 'Thread', key: 'threads', higherBetter: true },
  { label: 'Temel Saat', key: 'baseClock', unit: ' GHz', higherBetter: true },
  { label: 'Boost Saat', key: 'boostClock', unit: ' GHz', higherBetter: true },
  { label: 'L2 Onbellek', key: 'l2Cache', unit: ' MB', higherBetter: true },
  { label: 'L3 Onbellek', key: 'l3Cache', unit: ' MB', higherBetter: true },
  { label: 'TDP', key: 'tdp', unit: ' W', higherBetter: false },
  { label: 'Soket', key: 'socket', higherBetter: null },
  { label: 'Uretim Sureci', key: 'process', higherBetter: null },
  { label: 'Uretici Fab', key: 'foundry', higherBetter: null },
  { label: 'Bellek Destegi', key: 'memoryType', higherBetter: null },
  { label: 'Maks Bellek Hizi', key: 'maxMemorySpeed', unit: ' MT/s', higherBetter: true },
  { label: 'Carpan Kilidi', getValue: c => (c.unlocked ? 'Acik' : 'Kilitli'), higherBetter: null },
  { label: 'Entegre Grafik', key: 'integratedGraphics', higherBetter: null },
  { label: 'Cikis Tarihi', key: 'releaseDate', higherBetter: null },
]

function CpuComparePage() {
  const [selected, setSelected] = useState([])

  const toggle = useCallback((cpu) => {
    setSelected(prev => {
      if (prev.some(c => c.id === cpu.id)) return prev.filter(c => c.id !== cpu.id)
      if (prev.length >= MAX_COMPARE) return prev
      return [...prev, cpu]
    })
  }, [])

  const clear = useCallback(() => setSelected([]), [])

  const renderMeta = useCallback((cpu) => (
    <>
      <span className="text-blue-400 font-semibold">{cpu.performanceScore ?? '–'}</span>
      <span>{cpu.cores}C/{cpu.threads}T</span>
      <span>{cpu.boostClock ? `${cpu.boostClock} GHz` : '–'}</span>
      <span>{cpu.tdp != null ? `${cpu.tdp}W` : '–'}</span>
    </>
  ), [])

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <PageHeader
        title="CPU Karsilastirma"
        subtitle={`En fazla ${MAX_COMPARE} islemciyi yan yana karsilastirin`}
        accent="blue"
        icon={ICON_CPU}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <PartPicker
          items={cpuList}
          selected={selected}
          onToggle={toggle}
          onClear={clear}
          accent="blue"
          placeholder="CPU ara... (orn. i9-14900K, Ryzen 9)"
          renderMeta={renderMeta}
        />

        {selected.length === 0 ? (
          <div className="bg-slate-800/40 border border-dashed border-slate-700 rounded-2xl px-6 py-14 text-center">
            <svg className="w-12 h-12 mx-auto text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={ICON_CPU} />
            </svg>
            <p className="text-slate-400">Karsilastirmaya baslamak icin yukaridan CPU secin.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {selected.length > 1 && (
              <div className="bg-slate-800/50 rounded-2xl p-4 sm:p-6 border border-slate-700/50">
                <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Performans Karsilastirmasi</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <ScoreBars
                    items={selected}
                    title="Genel Skor"
                    note="Spesifikasyonlardan hesaplanir (0-100)"
                    getValue={c => c.performanceScore}
                    accent="blue"
                  />
                  <ScoreBars
                    items={selected}
                    title="Tek Cekirdek"
                    note="Oyun ve gunluk kullanimda belirleyici"
                    getValue={c => c.singleCoreScore}
                    accent="blue"
                  />
                  <ScoreBars
                    items={selected}
                    title="Cok Cekirdek"
                    note="Render, derleme, video islemede belirleyici"
                    getValue={c => c.multiCoreScore}
                    accent="blue"
                  />
                </div>
              </div>
            )}

            <div className="bg-slate-800/50 rounded-2xl p-4 sm:p-6 border border-slate-700/50">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {selected.length > 1 ? 'Teknik Ozellikler' : 'CPU Detaylari'}
                </h2>
                {selected.length > 1 && (
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />En iyi</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400" />En dusuk</span>
                  </div>
                )}
              </div>
              <CompareTable items={selected} specs={SPECS} accent="blue" />

              <div className="mt-5 flex flex-wrap gap-2">
                {selected.map(cpu => (
                  <Link
                    key={cpu.id}
                    to={`/cpu-veritabani/${cpu.id}`}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-700/60 text-slate-300 hover:bg-slate-700 hover:text-white transition"
                  >
                    {cpu.name} tum ozellikleri →
                  </Link>
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Skorlar cekirdek/thread sayisi, saat hizlari ve onbellekten hesaplanan tahmini
              degerlerdir; gercek benchmark sonucu degildir. Tek cekirdek skoru oyunlarda,
              cok cekirdek skoru render ve derleme islerinde daha belirleyicidir.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

export default CpuComparePage
