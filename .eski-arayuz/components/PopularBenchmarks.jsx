import { Link } from 'react-router-dom'
import { ICON_CPU, ICON_GPU } from './PageHeader'

/**
 * Populer parcalara hizli erisim.
 *
 * Onceki surumde burada uydurma veriler vardi ("125K goruntulenme", "+27%"
 * gibi hicbir kaynaga dayanmayan sayilar) ve kartlar tiklanamiyordu.
 * Artik her kart ilgili parcanin detay sayfasina goturur.
 */
const PICKS = [
  {
    type: 'GPU',
    title: 'Ust Segment Ekran Kartlari',
    description: 'RTX 5090, RTX 4090 ve RX 7900 XTX gibi amiral gemisi kartlar',
    to: '/gpu-veritabani',
  },
  {
    type: 'CPU',
    title: 'Oyun Icin En Iyi Islemciler',
    description: 'X3D serisi ve yuksek tek cekirdek performansli modeller',
    to: '/cpu-veritabani?sort=single',
  },
  {
    type: 'CPU',
    title: 'Cok Cekirdekli Is Istasyonlari',
    description: 'Render ve derleme icin Threadripper ve ust seri modeller',
    to: '/cpu-veritabani?sort=multi',
  },
  {
    type: 'GPU',
    title: 'Fiyat/Performans Kartlari',
    description: 'Orta segmentte dengeli secenekleri karsilastirin',
    to: '/gpu-karsilastir',
  },
]

function PopularBenchmarks() {
  return (
    <section id="benchmarks" className="bg-slate-950 py-16 sm:py-20 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
            Nereden Baslamali?
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Sik kullanilan karsilastirma baslangic noktalari
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {PICKS.map((pick) => {
            const isCpu = pick.type === 'CPU'
            return (
              <Link
                key={pick.title}
                to={pick.to}
                className={`group bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-800 transition ${
                  isCpu ? 'hover:border-blue-500/50' : 'hover:border-purple-500/50'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isCpu ? 'bg-blue-500/20' : 'bg-purple-500/20'
                  }`}>
                    <svg className={`w-5 h-5 ${isCpu ? 'text-blue-400' : 'text-purple-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isCpu ? ICON_CPU : ICON_GPU} />
                    </svg>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    isCpu ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
                  }`}>
                    {pick.type}
                  </span>
                </div>

                <h3 className={`text-lg font-semibold text-white mb-2 transition ${
                  isCpu ? 'group-hover:text-blue-400' : 'group-hover:text-purple-400'
                }`}>
                  {pick.title}
                </h3>
                <p className="text-sm text-slate-400 mb-4">{pick.description}</p>

                <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                  isCpu ? 'text-blue-400' : 'text-purple-400'
                }`}>
                  Incele
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            )
          })}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/gpu-karsilastir"
            className="px-6 sm:px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition font-medium inline-flex items-center gap-2"
          >
            Karsilastirmaya Basla
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default PopularBenchmarks
