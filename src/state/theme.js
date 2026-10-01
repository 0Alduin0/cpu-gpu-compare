import { useCallback, useSyncExternalStore } from 'react'

const KEY = 'pcb.theme'
const media = () => window.matchMedia('(prefers-color-scheme: dark)')

/** Geçerli tema: elle seçilmişse o, değilse cihaz ayarı. */
function effectiveTheme() {
  const forced = document.documentElement.dataset.theme
  if (forced === 'light' || forced === 'dark') return forced
  return media().matches ? 'dark' : 'light'
}

function subscribe(onChange) {
  const mq = media()
  mq.addEventListener('change', onChange)
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => {
    mq.removeEventListener('change', onChange)
    observer.disconnect()
  }
}

/** Mobil tarayıcı çubuğu elle seçilen temayı izlesin (index.html'deki iki meta cihaz ayarına göre). */
const BAR_COLOR = { light: '#f7f7f8', dark: '#0b0b0d' }
function applyBarColor(theme) {
  document.querySelectorAll('meta[name="theme-color"]').forEach(m => m.setAttribute('content', BAR_COLOR[theme]))
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, effectiveTheme, () => 'light')

  const toggle = useCallback(() => {
    const next = effectiveTheme() === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    applyBarColor(next)
    try {
      localStorage.setItem(KEY, next)
    } catch {
      /* depolama kapalı: tercih bu sekmeyle sınırlı kalır */
    }
  }, [])

  return { theme, toggle }
}
