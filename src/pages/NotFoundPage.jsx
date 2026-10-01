import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'

export default function NotFoundPage({ message = 'Aradığın sayfa yok. Adres yanlış yazılmış ya da sayfa kaldırılmış olabilir.' }) {
  // Bilinmeyen parça kimliğinde de (/gpu-veritabani/xyz) sekme "bulunamadı" desin.
  useEffect(() => {
    document.title = 'Sayfa bulunamadı · PC Benchmark'
  }, [])
  return (
    <main id="main" className="mx-auto max-w-[1280px] px-4 py-24 sm:px-6 sm:py-32">
      <h1 className="text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">Sayfa bulunamadı</h1>
      <p className="mt-3 max-w-[52ch] text-base text-ink-2">
        <span className="tnum">Hata 404.</span> {message}
      </p>
      <div className="mt-8 flex flex-wrap gap-2">
        <Link to="/" className="btn btn-primary">
          <Icon name="arrowLeft" size={16} />
          Ana sayfa
        </Link>
        <Link to="/gpu-veritabani" className="btn btn-secondary">GPU sıralaması</Link>
        <Link to="/cpu-veritabani" className="btn btn-secondary">CPU sıralaması</Link>
      </div>
    </main>
  )
}
