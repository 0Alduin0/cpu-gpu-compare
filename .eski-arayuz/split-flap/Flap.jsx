import { useEffect, useRef, useState } from 'react'

const CHARSET = ' ABCDEFGHIJKLMNOPRSTUVYZ0123456789'
const STEP_MS = 55
const STAGGER_MS = 28

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * Hedef metne flap kaskadıyla ulaşan gösterim dizisi.
 * Her konum kendi gecikmesiyle birkaç ara karakterden geçip hedefte durur.
 * Tek bir rAF döngüsü tüm konumları zamana göre çözer.
 */
function useFlapSequence(target, { animateOnMount = false } = {}) {
  const [display, setDisplay] = useState(() => (animateOnMount ? ' '.repeat(target.length) : target))
  const [ticks, setTicks] = useState(() => new Array(target.length).fill(0))
  const displayRef = useRef(display)
  const frame = useRef(0)

  useEffect(() => {
    const from = displayRef.current
    if (from === target) return undefined
    if (reducedMotion()) {
      frame.current = requestAnimationFrame(() => {
        displayRef.current = target
        setDisplay(target)
        setTicks(new Array(target.length).fill(0))
      })
      return () => cancelAnimationFrame(frame.current)
    }

    const length = Math.max(from.length, target.length)
    const padFrom = from.padEnd(length, ' ')
    const padTo = target.padEnd(length, ' ')
    const sequences = []
    let changed = 0
    for (let i = 0; i < length; i++) {
      if (padFrom[i] === padTo[i]) {
        sequences.push(null)
        continue
      }
      const hops = 2 + ((i * 7 + target.length) % 3)
      const seq = []
      for (let h = 0; h < hops; h++) seq.push(CHARSET[(i * 11 + h * 5 + length) % CHARSET.length])
      seq.push(padTo[i])
      sequences.push({ seq, start: changed * STAGGER_MS })
      changed++
    }

    const t0 = performance.now()
    const run = (now) => {
      const elapsed = now - t0
      let done = true
      const nextTicks = new Array(length).fill(0)
      let out = ''
      for (let i = 0; i < length; i++) {
        const s = sequences[i]
        if (!s) {
          out += padTo[i]
          continue
        }
        const step = Math.floor((elapsed - s.start) / STEP_MS)
        if (step < 0) {
          out += padFrom[i]
          done = false
        } else if (step >= s.seq.length - 1) {
          out += s.seq[s.seq.length - 1]
          nextTicks[i] = s.seq.length
        } else {
          out += s.seq[step]
          nextTicks[i] = step + 1
          done = false
        }
      }
      const trimmed = done ? target : out
      displayRef.current = trimmed
      setDisplay(trimmed)
      setTicks(nextTicks)
      if (!done) frame.current = requestAnimationFrame(run)
    }
    frame.current = requestAnimationFrame(run)
    return () => cancelAnimationFrame(frame.current)
  }, [target])

  return { display, ticks }
}

/**
 * Karakter karakter flap hücreleri.
 * `cells` verilirse metin o genişliğe tamamlanır (panodaki sabit hücre sayısı).
 * `lang="en"` model adları için: büyük harfte Türkçe İ dönüşümü yapılmaz.
 */
export function FlapText({
  text,
  cells,
  className = '',
  cellClassName = '',
  lang,
  animateOnMount = false,
  tone,
  compact = false,
  pins = false,
}) {
  const raw = String(text ?? '')
  const upper = lang === 'en' ? raw.toUpperCase() : raw.toLocaleUpperCase('tr-TR')
  const target = cells ? upper.slice(0, cells).padEnd(cells, ' ') : upper
  const { display, ticks } = useFlapSequence(target, { animateOnMount })
  const toneClass = tone === 'amber' ? 'text-amber' : tone === 'signal' ? 'text-signal' : tone === 'dim' ? 'text-paint-dim' : ''

  return (
    <span className={`inline-flex flex-wrap ${compact ? 'flap-compact' : ''} ${pins ? 'flap-pins' : ''} ${className}`} lang={lang}>
      <span className="sr-only">{raw}</span>
      <span aria-hidden="true" className="inline-flex flex-wrap">
        {Array.from(display).map((ch, i) => (
          <span key={i} className={`flap ${toneClass} ${ch === ' ' ? 'flap-blank' : ''} ${cellClassName}`}>
            <span className="flap-glyph" data-tick={ticks[i] ? ticks[i] : undefined} key={`${ch}-${ticks[i]}`}>
              {ch === ' ' ? ' ' : ch}
            </span>
          </span>
        ))}
      </span>
    </span>
  )
}

/**
 * Kelime kelime sarılan flap başlığı: her kelime kendi hücre grubunda,
 * satır sonu yalnızca kelime arasında olur.
 */
export function FlapWords({ text, className = '', wordClassName = '', lang, animateOnMount, tone, compact = false, pins = false }) {
  const words = String(text ?? '').split(/\s+/).filter(Boolean)
  return (
    <span className={`flex flex-wrap ${compact ? 'gap-x-[0.3em]' : 'gap-x-[0.42em]'} gap-y-[0.12em] ${className}`}>
      {words.map((w, i) => (
        <FlapText
          key={i}
          text={w}
          lang={lang}
          animateOnMount={animateOnMount}
          tone={tone}
          compact={compact}
          pins={pins}
          className={wordClassName}
        />
      ))}
    </span>
  )
}
