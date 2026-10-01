import { Link } from 'react-router-dom'

/** Sayfa ustu baslik seridi (geri baglantisi + baslik + aciklama). */
function PageHeader({ title, subtitle, accent = 'blue', backTo = '/', backLabel = 'Ana sayfaya don', icon }) {
  const grad = accent === 'purple'
    ? 'from-purple-600 to-purple-800'
    : 'from-blue-600 to-blue-800'
  const sub = accent === 'purple' ? 'text-purple-200' : 'text-blue-200'

  return (
    <div className={`bg-gradient-to-r ${grad}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex items-center gap-3 mb-3">
          <Link to={backTo} aria-label={backLabel} className={`${sub} hover:text-white transition`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          {icon && (
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
              </svg>
            </div>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">{title}</h1>
        {subtitle && <p className={sub}>{subtitle}</p>}
      </div>
    </div>
  )
}

export const ICON_CPU = 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z'
export const ICON_GPU = 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z'

export default PageHeader
