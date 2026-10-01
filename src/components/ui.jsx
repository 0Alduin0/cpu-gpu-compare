import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import Icon from './Icon'
import { formatDelta } from '../data/format'

/**
 * Bilginin yanındaki "i": üzerine gelince, odaklanınca ya da dokununca kısa açıklama.
 * Açıklama gövdeye çizilir (portal); tablolar yatay kaydırılan kapsayıcıda olduğu için
 * içeride kırpılırdı. Ekran okuyucu açıklamayı düğmenin tanımı olarak duyar.
 */
export function InfoTip({ text, label }) {
  const ref = useRef(null)
  const id = useId()
  const [pos, setPos] = useState(null)

  useEffect(() => {
    if (!pos) return
    const close = () => setPos(null)
    const onKey = e => e.key === 'Escape' && close()
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    document.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [pos])

  if (!text) return null
  const open = () => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    const maxWidth = Math.min(288, window.innerWidth - 16)
    // Düğmenin solundan başlar, ekranın sağından taşmaz; altta yer yoksa üstte açılır.
    const left = Math.max(8, Math.min(r.left - 10, window.innerWidth - maxWidth - 8))
    const below = window.innerHeight - r.bottom > 150 || r.top < 150
    setPos({ left, maxWidth, top: below ? r.bottom + 6 : r.top - 6, below })
  }

  return (
    <>
      <button
        ref={ref}
        type="button"
        className="info-btn"
        aria-label={`${label}: açıklama`}
        aria-describedby={`${id}-d`}
        onMouseEnter={open}
        onMouseLeave={() => setPos(null)}
        onFocus={open}
        onBlur={() => setPos(null)}
        // Dokunmatikte dokunma açar (kapatmak değil); dışarı dokununca blur kapatır.
        onClick={open}
      >
        <Icon name="info" size={14} />
      </button>
      <span id={`${id}-d`} hidden>
        {text}
      </span>
      {pos &&
        createPortal(
          <span
            aria-hidden="true"
            className="info-tip"
            style={{ left: pos.left, top: pos.top, maxWidth: pos.maxWidth, transform: pos.below ? undefined : 'translateY(-100%)' }}
          >
            {text}
          </span>,
          document.body,
        )}
    </>
  )
}

/** Kıl çizgisi kenarlıklı yüzey; isteğe bağlı başlık satırı. */
export function Panel({ title, meta, actions, children, className = '', bodyClassName = 'p-4 sm:p-5', id, as = 'section' }) {
  const Tag = as
  const headingId = id ? `${id}-title` : undefined
  return (
    <Tag className={`panel ${className}`} id={id} aria-labelledby={title && headingId ? headingId : undefined}>
      {(title || actions) && (
        <div className="panel-head">
          <div className="min-w-0">
            {title && <h2 id={headingId} className="panel-title">{title}</h2>}
            {meta && <p className="mt-0.5 text-[0.8125rem] text-ink-3">{meta}</p>}
          </div>
          {actions && <div className="flex flex-none items-center gap-1.5">{actions}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </Tag>
  )
}

/** Sayfa başlığı: h1, bir cümle açıklama, sağda isteğe bağlı eylem. */
export function PageHeader({ title, lead, aside, children }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 pb-6 pt-8 sm:pb-8 sm:pt-12">
      <div className="min-w-0 max-w-[68ch]">
        {children}
        <h1 className="text-[1.75rem] font-semibold leading-tight tracking-[-0.02em] sm:text-[2rem]">{title}</h1>
        {lead && <p className="mt-2 text-base text-ink-2">{lead}</p>}
      </div>
      {aside}
    </div>
  )
}

/** Eksik veri: görünür "—", ekran okuyucuya "veri yok". */
export function Empty() {
  return (
    <>
      <span aria-hidden="true" className="text-ink-3">—</span>
      <span className="sr-only">veri yok</span>
    </>
  )
}

/** Değer ya da tasarlanmış boşluk. */
export function Value({ children }) {
  return children == null || children === '' ? <Empty /> : children
}

/**
 * Yatay puan çubuğu. Değer metin olarak her zaman yanında yazılır;
 * çubuk yalnızca göz içindir. `reference` verilirse 100 çizgisi çizilir.
 */
export function ScoreBar({ value, max, color = 'var(--single)', reference, className = '' }) {
  const ratio = value != null && max > 0 ? Math.max(0, Math.min(1, value / max)) : 0
  return (
    <span className={`bar-track block ${className}`} aria-hidden="true">
      <span className="bar-fill" style={{ transform: `scaleX(${ratio})`, background: color }} />
      {reference != null && max > 0 && reference <= max && (
        <span className="bar-ref" style={{ left: `${(reference / max) * 100}%` }} />
      )}
    </span>
  )
}

/** Renk anahtarı: kategorik serinin kimliği (metin rengini değiştirmez). */
export function Swatch({ color, className = '' }) {
  return <span aria-hidden="true" className={`inline-block h-2.5 w-2.5 flex-none rounded-[3px] ${className}`} style={{ background: color }} />
}

/**
 * Baz parçaya göre fark: işaret (+ yön ikonu); renk tek başına anlam taşımaz.
 * better: 'high' artışı, 'low' azalışı iyi sayar; null farkı nötr gösterir.
 */
export function Delta({ value, better = 'high', digits = 0, icon = true, className = '' }) {
  if (value == null) return <Empty />
  const text = formatDelta(value, digits)
  if (text === '±%0') return <span className={`text-ink-3 ${className}`}>{text}</span>
  const up = value > 0
  const tone = !better ? 'text-ink-3' : up === (better === 'high') ? 'text-good' : 'text-critical'
  return (
    <span className={`inline-flex items-center gap-0.5 font-medium tnum ${tone} ${className}`}>
      {icon && <Icon name={up ? 'up' : 'down'} size={14} />}
      {text}
    </span>
  )
}

/** Endeks panellerinde tek satırlık "tahmini" notu. */
export function EstimateNote({ kind, className = '' }) {
  return (
    <p className={`text-[0.8125rem] text-ink-3 ${className}`}>
      Endeks tahminidir: teknik özelliklerden hesaplanır, benchmark değildir; tek tek oyunlarda gerçek fark
      farklı olabilir. Referans <span className="whitespace-nowrap">{kind.reference?.name} = 100</span>.{' '}
      <Link to="/yontem" className="whitespace-nowrap font-medium text-accent-text hover:underline">
        Nasıl hesaplanır?
      </Link>
    </p>
  )
}

/** Kategorik slot → CSS değişkeni. */
// eslint-disable-next-line react-refresh/only-export-components
export const seriesColor = slot => `var(--series-${(slot % 5) + 1})`
