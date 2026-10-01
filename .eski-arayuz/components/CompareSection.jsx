import { Link } from 'react-router-dom'
import { CPU_COUNT, GPU_COUNT } from '../data/counts'

function CompareSection() {

  return (
    <section id="compare" className="bg-slate-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Karsilastirma Araclari
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            CPU ve GPU karsilastirma sayfalarimizi kullanarak detayli karsilastirma yapin
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* CPU Card */}
          <Link
            to="/cpu-karsilastir"
            className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 hover:border-blue-500/50 transition group"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:bg-blue-500/30 transition">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition">
                  CPU Karsilastirma
                </h3>
                <p className="text-slate-400">
                  {CPU_COUNT} CPU mevcut
                </p>
              </div>
            </div>
            <p className="text-slate-400 mb-6">
              Islemcileri yan yana karsilastirin. Cekirdek sayisi, saat hizi, TDP ve daha fazla ozellik ile detayli analiz yapin.
            </p>
            <div className="flex items-center text-blue-400 font-medium">
              Karsilastirmaya Basla
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </Link>

          {/* GPU Card */}
          <Link
            to="/gpu-karsilastir"
            className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 hover:border-purple-500/50 transition group"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:bg-purple-500/30 transition">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white group-hover:text-purple-400 transition">
                  GPU Karsilastirma
                </h3>
                <p className="text-slate-400">
                  {GPU_COUNT} GPU mevcut
                </p>
              </div>
            </div>
            <p className="text-slate-400 mb-6">
              Ekran kartlarini karsilastirin. VRAM, benchmark degerleri, TDP ve daha fazla ozellik ile performans analizi yapin.
            </p>
            <div className="flex items-center text-purple-400 font-medium">
              Karsilastirmaya Basla
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default CompareSection
