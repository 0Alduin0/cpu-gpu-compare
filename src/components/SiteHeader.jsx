import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Icon from './Icon'
import { useCompareCounts } from '../state/compare'
import { useTheme } from '../state/theme'
import { CPU_COUNT, GPU_COUNT } from '../data/counts'

const LINKS = [
  { to: '/gpu-karsilastir', label: 'GPU karşılaştır', kind: 'gpu' },
  { to: '/gpu-veritabani', label: 'GPU sıralaması' },
  { to: '/cpu-karsilastir', label: 'CPU karşılaştır', kind: 'cpu' },
  { to: '/cpu-veritabani', label: 'CPU sıralaması' },
  { to: '/yontem', label: 'Yöntem' },
]

function Logo() {
  return (
    <Link to="/" className="flex flex-none items-center gap-2.5 rounded-md" aria-label="PC Benchmark, ana sayfa">
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true" className="flex-none">
        <rect width="26" height="26" rx="7" fill="var(--accent)" />
        <rect x="6" y="14" width="3.2" height="6" rx="1.2" fill="var(--accent-ink)" />
        <rect x="11.4" y="10" width="3.2" height="10" rx="1.2" fill="var(--accent-ink)" />
        <rect x="16.8" y="6" width="3.2" height="14" rx="1.2" fill="var(--accent-ink)" />
      </svg>
      <span className="text-[0.9375rem] font-semibold tracking-[-0.01em]">PC Benchmark</span>
    </Link>
  )
}

function NavItem({ to, label, count }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `inline-flex min-h-9 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition-colors duration-150 ${
          isActive ? 'bg-surface-2 text-ink' : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
        }`
      }
    >
      {label}
      {count > 0 && (
        // Rolsüz span'deki aria-label okunmuyordu; sayı görünür, açıklaması gizli metin.
        <>
          <span aria-hidden="true" className="badge badge-accent h-[1.125rem] min-w-[1.125rem] justify-center px-1 tnum">
            {count}
          </span>
          <span className="sr-only">, {count} parça seçili</span>
        </>
      )}
    </NavLink>
  )
}

function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'
  return (
    <button
      type="button"
      className="btn btn-ghost btn-icon"
      onClick={toggle}
      aria-label={dark ? 'Açık temaya geç' : 'Koyu temaya geç'}
      title={dark ? 'Açık tema' : 'Koyu tema'}
    >
      <Icon name={dark ? 'sun' : 'moon'} size={18} />
    </button>
  )
}

export default function SiteHeader() {
  const counts = useCompareCounts()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  // Rota değişince mobil menüyü kapat.
  const [lastPath, setLastPath] = useState(pathname)
  if (lastPath !== pathname) {
    setLastPath(pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return undefined
    const onKey = e => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-6">
          <Logo />
          <nav aria-label="Ana gezinme" className="hidden items-center gap-0.5 lg:flex">
            {LINKS.map(l => (
              <NavItem key={l.to} to={l.to} label={l.label} count={l.kind ? counts[l.kind] : 0} />
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <span className="mr-2 hidden text-[0.8125rem] text-ink-3 xl:inline">
            {CPU_COUNT + GPU_COUNT} parça ·{' '}
            <Link to="/yontem" className="text-accent-text hover:underline">tahmini endeks</Link>
          </span>
          <ThemeToggle />
          <button
            type="button"
            className="btn btn-ghost btn-icon lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
            onClick={() => setOpen(v => !v)}
          >
            <Icon name={open ? 'close' : 'menu'} size={20} />
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Ana gezinme" className="border-t border-line bg-surface lg:hidden">
          <div className="mx-auto flex max-w-[1280px] flex-col gap-0.5 px-3 py-3 sm:px-5">
            {LINKS.map(l => (
              <NavItem key={l.to} to={l.to} label={l.label} count={l.kind ? counts[l.kind] : 0} />
            ))}
            <p className="px-2.5 pt-3 text-[0.8125rem] text-ink-3">
              {CPU_COUNT + GPU_COUNT} parça · endeks tahminidir
            </p>
          </div>
        </nav>
      )}
    </header>
  )
}
