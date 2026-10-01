function Features() {
  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Detayli Teknik Veri',
      description: 'Her parca icin mimari, saat hizi, onbellek ve guc tuketimine kadar tum ozellikler.',
      color: 'blue'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Detayli Karsilastirma',
      description: 'Ayni anda 5 parcaya kadar yan yana karsilastirin, farklari tek bakista gorun.',
      color: 'purple'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Liste Fiyatlari',
      description: 'Cikis fiyatlarini karsilastirma tablosunda gorun, butcenize uygun secimi yapin.',
      color: 'green'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      title: 'Performans Skoru',
      description: 'Teknik ozelliklerden hesaplanan 0-100 arasi skor ile parcalari hizlica siralayin.',
      color: 'red'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      ),
      title: 'Genis Veritabani',
      description: 'Guncel ve eski nesil islemci ve ekran kartlarini kapsayan detayli veritabani.',
      color: 'yellow'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      ),
      title: 'Hizli Arama',
      description: 'Marka filtresi ve anlik arama ile aradiginiz parcaya saniyeler icinde ulasin.',
      color: 'pink'
    },
  ]

  const colorClasses = {
    blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'group-hover:border-blue-500/50' },
    purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'group-hover:border-purple-500/50' },
    green: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'group-hover:border-green-500/50' },
    red: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'group-hover:border-red-500/50' },
    yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'group-hover:border-yellow-500/50' },
    pink: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'group-hover:border-pink-500/50' },
  }

  return (
    <section className="bg-slate-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Neden PC Benchmark?
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Donanim kararlari verirken size yardimci olacak gucllu ozellikler
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 ${colorClasses[feature.color].border} transition-all duration-300 hover:bg-slate-800`}
            >
              <div className={`w-12 h-12 ${colorClasses[feature.color].bg} rounded-xl flex items-center justify-center mb-4`}>
                <span className={colorClasses[feature.color].text}>{feature.icon}</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
