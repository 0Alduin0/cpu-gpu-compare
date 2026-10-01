import { Link } from 'react-router-dom'
import { CPU_COUNT, GPU_COUNT } from '../data/counts'

const LINKS = [
  ['GPU karşılaştır', '/gpu-karsilastir'],
  ['GPU sıralaması', '/gpu-veritabani'],
  ['CPU karşılaştır', '/cpu-karsilastir'],
  ['CPU sıralaması', '/cpu-veritabani'],
  ['Yöntem', '/yontem'],
]

export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.5fr_1fr]">
        <div className="max-w-[62ch]">
          <p className="text-sm font-semibold">PC Benchmark</p>
          <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-3">
            {GPU_COUNT} ekran kartı ve {CPU_COUNT} işlemcinin teknik özellikleri tek yerde.
            Performans endeksleri bu özelliklerden hesaplanan tahminlerdir; gerçek oyun ve uygulama performansı
            sürücüye, çözünürlüğe, soğutmaya ve yazılıma göre değişir.
          </p>
        </div>
        <nav aria-label="Alt gezinme">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-0.5">
            {LINKS.map(([label, to]) => (
              <li key={to}>
                <Link to={to} className="inline-flex min-h-9 items-center text-[0.8125rem] text-ink-2 hover:text-ink">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  )
}
