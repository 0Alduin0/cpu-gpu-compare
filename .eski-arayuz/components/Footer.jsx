import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">PC Benchmark</span>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              CPU ve GPU karsilastirma platformu. Donanim secimlerinizde en dogru karari verin.
            </p>
          </div>

          {/* Karsilastirma */}
          <div>
            <h3 className="text-white font-semibold mb-4">Karsilastirma</h3>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Ana Sayfa' },
                { to: '/cpu-karsilastir', label: 'CPU Karsilastir' },
                { to: '/gpu-karsilastir', label: 'GPU Karsilastir' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-slate-400 hover:text-white transition text-sm">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Veritabani */}
          <div>
            <h3 className="text-white font-semibold mb-4">Veritabani</h3>
            <ul className="space-y-2">
              {[
                { to: '/cpu-veritabani', label: 'Tum Islemciler' },
                { to: '/gpu-veritabani', label: 'Tum Ekran Kartlari' },
                { to: '/cpu-veritabani?sort=single', label: 'Oyun Icin En Iyi CPU' },
                { to: '/gpu-veritabani?sort=newest', label: 'En Yeni Ekran Kartlari' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-slate-400 hover:text-white transition text-sm">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Veri kaynagi */}
          <div>
            <h3 className="text-white font-semibold mb-4">Veri Hakkinda</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Teknik ozellikler ureticilerin yayinladigi degerlere dayanir. Performans
              skorlari bu ozelliklerden hesaplanan tahmini degerlerdir; gercek benchmark
              sonucu degildir.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} PC Benchmark. Tum haklari saklidir.
            </p>
            <p className="text-slate-500 text-sm">
              Turkiye'de gelistirildi
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
