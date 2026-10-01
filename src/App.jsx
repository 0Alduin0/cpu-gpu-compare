import { lazy, Suspense, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, useLocation, useNavigationType } from 'react-router-dom'
import SiteHeader from './components/SiteHeader'
import SiteFooter from './components/SiteFooter'
import { CompareProvider } from './state/compare'

/**
 * Sayfalar tembel yüklenir ve parça türü (cpu/gpu) route seviyesinde verilir.
 * Böylece GPU sayfası CPU veritabanını indirmez, tersi de geçerli.
 */
const withKind = (page, kind) =>
  lazy(() =>
    Promise.all([page(), kind()]).then(([p, k]) => {
      const Page = p.default
      const config = k.default
      return { default: props => <Page kind={config} {...props} /> }
    }),
  )

const comparePage = () => import('./pages/ComparePage')
const databasePage = () => import('./pages/DatabasePage')
const detailPage = () => import('./pages/DetailPage')
const gpu = () => import('./kinds/gpu')
const cpu = () => import('./kinds/cpu')

const HomePage = lazy(() => import('./pages/HomePage'))
const MethodPage = lazy(() => import('./pages/MethodPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const GpuCompare = withKind(comparePage, gpu)
const CpuCompare = withKind(comparePage, cpu)
const GpuDatabase = withKind(databasePage, gpu)
const CpuDatabase = withKind(databasePage, cpu)
const GpuDetail = withKind(detailPage, gpu)
const CpuDetail = withKind(detailPage, cpu)

const TITLES = [
  [/^\/$/, 'CPU ve GPU karşılaştırma'],
  [/^\/gpu-karsilastir/, 'GPU karşılaştır'],
  [/^\/cpu-karsilastir/, 'CPU karşılaştır'],
  // Parça sayfası başlığı kendi adını yazar (DetailPage); bu yalnızca yüklenirkenki ara değer.
  [/^\/gpu-veritabani\/[^/]+\/?$/, 'GPU'],
  [/^\/cpu-veritabani\/[^/]+\/?$/, 'CPU'],
  [/^\/gpu-veritabani\/?$/, 'GPU sıralaması'],
  [/^\/cpu-veritabani\/?$/, 'CPU sıralaması'],
  [/^\/yontem\/?$/, 'Yöntem'],
]

// Kaydırma konumu burada yönetilir: sayfalar tembel yüklendiği için tarayıcının kendi
// geri yüklemesi içerik gelmeden çalışıp en üstte kalıyordu.
if (typeof history !== 'undefined' && 'scrollRestoration' in history) history.scrollRestoration = 'manual'
const scrollByKey = new Map()

/** İçerik (tembel sayfa) gelene kadar birkaç kare dener. */
function retry(fn, frames = 60) {
  let n = 0
  const tick = () => {
    if (!fn() && n++ < frames) requestAnimationFrame(tick)
  }
  tick()
}

/**
 * Yeni sayfada en üste, geri/ileride kaldığı yere, #çapa bağlantısında o bölüme kaydırır;
 * başlığı günceller. Adres parametresi değişince (arama, filtre) kaydırmaz.
 */
function RouteEffects() {
  const { pathname, hash, key } = useLocation()
  const navType = useNavigationType()
  const lastPath = useRef(null)

  useEffect(() => {
    // Geçişte yeni sayfa kısa göründüğünde tarayıcı konumu kırpar; o olay eski sayfanın
    // kaydını ezmesin diye yalnızca geçmişteki etkin giriş hâlâ bu sayfaysa kaydedilir.
    const save = () => {
      if ((window.history.state?.key ?? 'default') === key) scrollByKey.set(key, window.scrollY)
    }
    window.addEventListener('scroll', save, { passive: true })
    return () => window.removeEventListener('scroll', save)
  }, [key])

  useEffect(() => {
    const moved = lastPath.current !== pathname
    lastPath.current = pathname
    if (navType === 'POP' && moved) {
      const y = scrollByKey.get(key) ?? 0
      retry(() => {
        window.scrollTo(0, y)
        return Math.abs(window.scrollY - y) < 2
      })
    } else if (hash) {
      retry(() => {
        const el = document.getElementById(decodeURIComponent(hash.slice(1)))
        el?.scrollIntoView()
        return !!el
      })
    } else if (moved) {
      window.scrollTo(0, 0)
    }
    const title = TITLES.find(([re]) => re.test(pathname))?.[1] ?? 'Sayfa bulunamadı'
    document.title = `${title} · PC Benchmark`
  }, [pathname, hash, key, navType])
  return null
}

/** İskelet: içerik gelene kadar gri satırlar (döner simge değil). */
function PageFallback() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 pt-12 sm:px-6" aria-busy="true" aria-label="Yükleniyor">
      <div className="h-8 w-64 max-w-full animate-pulse rounded-md bg-surface-3" />
      <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-surface-3" />
      <div className="panel mt-8 space-y-3 p-5">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-9 animate-pulse rounded-md bg-surface-2" />
        ))}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <CompareProvider>
        <RouteEffects />
        <a href="#main" className="btn btn-primary sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-2 focus:z-50 focus:px-4">
          İçeriğe geç
        </a>
        <SiteHeader />
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/gpu-karsilastir" element={<GpuCompare />} />
            <Route path="/cpu-karsilastir" element={<CpuCompare />} />
            <Route path="/gpu-veritabani" element={<GpuDatabase />} />
            <Route path="/gpu-veritabani/:id" element={<GpuDetail />} />
            <Route path="/cpu-veritabani" element={<CpuDatabase />} />
            <Route path="/cpu-veritabani/:id" element={<CpuDetail />} />
            <Route path="/yontem" element={<MethodPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        <SiteFooter />
      </CompareProvider>
    </BrowserRouter>
  )
}
