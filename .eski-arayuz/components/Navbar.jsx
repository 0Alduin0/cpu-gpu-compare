import { useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { ICON_CPU } from './PageHeader'

const LINKS = [
  { to: '/', label: 'Ana Sayfa', end: true },
  { to: '/cpu-karsilastir', label: 'CPU Karsilastir' },
  { to: '/gpu-karsilastir', label: 'GPU Karsilastir' },
  { to: '/cpu-veritabani', label: 'CPU Veritabani' },
  { to: '/gpu-veritabani', label: 'GPU Veritabani' },
]

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { pathname } = useLocation()

  // Sayfa degisince mobil menu acik kalmasin. Efekt yerine render sirasinda
  // karsilastirma yapilir; boylece fazladan render turu olusmaz.
  const [lastPath, setLastPath] = useState(pathname)
  if (lastPath !== pathname) {
    setLastPath(pathname)
    if (isMenuOpen) setIsMenuOpen(false)
  }

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition ${
      isActive ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800'
    }`

  const mobileLinkClass = ({ isActive }) =>
    `block px-3 py-2.5 rounded-md text-base font-medium transition ${
      isActive ? 'text-white bg-slate-700' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
    }`

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ICON_CPU} />
              </svg>
            </div>
            <span className="text-lg font-bold text-white">PC Benchmark</span>
          </Link>

          {/* Masaustu menu - 6 baglanti md'de sigmadigi icin lg'den itibaren acilir */}
          <div className="hidden lg:flex items-center gap-1">
            {LINKS.map(link => (
              <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
          </div>

          <button
            onClick={() => setIsMenuOpen(v => !v)}
            className="lg:hidden text-slate-400 hover:text-white p-2 -mr-2 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-600"
            aria-label={isMenuOpen ? 'Menuyu kapat' : 'Menuyu ac'}
            aria-expanded={isMenuOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden bg-slate-800 border-t border-slate-700">
          <div className="px-2 py-2 space-y-1">
            {LINKS.map(link => (
              <NavLink key={link.to} to={link.to} end={link.end} className={mobileLinkClass}>
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
