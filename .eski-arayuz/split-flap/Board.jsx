import { Link } from 'react-router-dom'
import Icon from './Icon'

/** Çelik kasa içinde gömülü pano. Başlık şeridi + gövde. */
export function Board({ title, meta, actions, children, className = '', bodyClassName = 'p-3 sm:p-4', as = 'section', id, labelledBy }) {
  const Tag = as
  const headingId = labelledBy ?? (id ? `${id}-title` : undefined)
  return (
    <Tag className={`board ${className}`} id={id} aria-labelledby={title ? headingId : undefined}>
      {(title || meta || actions) && (
        <div className="board-head">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-4 gap-y-1">
            {title && <h2 id={headingId} className="board-title">{title}</h2>}
            {meta && <span className="board-label">{meta}</span>}
          </div>
          {actions && <div className="flex flex-none items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </Tag>
  )
}

/** Tek parça flap şeridi. value null ise tasarlanmış boş hücre çizilir. */
export function Strip({ children, className = '', tone, align = 'left', flipDelay, flipKey, title }) {
  const empty = children == null || children === ''
  const toneClass = tone === 'amber' ? 'text-amber' : tone === 'signal' ? 'text-signal' : tone === 'dim' ? 'text-paint-dim' : ''
  const alignClass = align === 'right' ? 'justify-end text-right' : align === 'center' ? 'justify-center text-center' : ''
  return (
    <span
      className={`strip ${alignClass} ${toneClass} ${className}`}
      data-flip={flipKey != null ? flipKey : undefined}
      style={flipDelay != null ? { '--flip-delay': `${flipDelay}ms` } : undefined}
      title={title}
    >
      {empty ? (
        <>
          <span className="strip-empty" aria-hidden="true" />
          <span className="sr-only">veri yok</span>
        </>
      ) : (
        children
      )}
    </span>
  )
}

/**
 * Segmentli gösterge: sabit sayıda hücre, değere göre yanar.
 * Sayı her zaman yanında yazılıdır; gösterge yalnızca göz içindir.
 */
export function CellGauge({ value, max, cells = 20, tone = 'paint', className = '' }) {
  const lit = value != null && max > 0 ? Math.max(value > 0 ? 1 : 0, Math.round((value / max) * cells)) : 0
  const on = tone === 'amber' ? 'bg-amber' : 'bg-paint'
  return (
    <span className={`flex gap-[2px] ${className}`} aria-hidden="true">
      {Array.from({ length: cells }, (_, i) => (
        <span key={i} className={`h-3 flex-1 rounded-[1px] ${i < lit ? on : 'bg-steel-800'}`} />
      ))}
    </span>
  )
}

/** "Tahmini" notu: her panoda endeksin ne olduğu tek satırda. */
export function EstimateNote({ kind, className = '' }) {
  return (
    <p className={`text-sm text-steel-300 ${className}`}>
      Endeks tahminidir: spesifikasyonlardan hesaplanır, benchmark değildir.{' '}
      <span className="whitespace-nowrap">Referans {kind.reference?.name} = 100,</span>{' '}
      <span className="whitespace-nowrap">tipik sapma ±%{kind.model.TYPICAL_ERROR}.</span>{' '}
      <Link to="/yontem" className="inline-flex items-center gap-1 whitespace-nowrap text-paint underline hover:text-amber">
        Yöntem
        <Icon name="arrowRight" size={16} />
      </Link>
    </p>
  )
}

/** Sayfa başlığı: flap hücrelerinde başlık + bir cümlelik açıklama. */
export function PageTitle({ children, lead, aside }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 pb-6 pt-8 sm:pt-10">
      <div className="min-w-0">
        <h1 className="text-[1.75rem] leading-none sm:text-[2.5rem]">{children}</h1>
        {lead && <p className="mt-4 max-w-[62ch] text-base text-steel-200 sm:text-lg">{lead}</p>}
      </div>
      {aside}
    </div>
  )
}
