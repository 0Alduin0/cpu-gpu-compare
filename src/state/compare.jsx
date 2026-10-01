import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export const MAX_COMPARE = 5
const STORAGE_KEY = 'pcb.compare.v2'

const emptyKind = () => ({ ids: [], base: null, slots: {} })
const empty = () => ({ cpu: emptyKind(), gpu: emptyKind() })

function load() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return empty()
    const parsed = JSON.parse(raw)
    const read = k => {
      // Elle ya da eski sürümle bozulmuş kayıt: tekrarlar, listede olmayan baz, eksik slot.
      const ids = Array.isArray(parsed[k]?.ids) ? [...new Set(parsed[k].ids.filter(id => typeof id === 'string'))].slice(0, MAX_COMPARE) : []
      const saved = parsed[k]?.slots ?? {}
      const slots = {}
      for (const id of ids) slots[id] = Number.isInteger(saved[id]) ? saved[id] : freeSlot(slots)
      return { ids, base: ids.includes(parsed[k]?.base) ? parsed[k].base : (ids[0] ?? null), slots }
    }
    return { cpu: read('cpu'), gpu: read('gpu') }
  } catch {
    return empty()
  }
}

/** Boştaki en düşük renk slotu. Renk parçaya bağlıdır, sıraya değil. */
function freeSlot(slots) {
  const used = new Set(Object.values(slots))
  for (let i = 0; i < MAX_COMPARE; i++) if (!used.has(i)) return i
  return 0
}

function withAdded(s, id) {
  if (s.ids.includes(id) || s.ids.length >= MAX_COMPARE) return s
  return { ids: [...s.ids, id], base: s.base ?? id, slots: { ...s.slots, [id]: freeSlot(s.slots) } }
}

function withRemoved(s, id) {
  if (!s.ids.includes(id)) return s
  const ids = s.ids.filter(x => x !== id)
  const slots = { ...s.slots }
  delete slots[id]
  return { ids, base: s.base === id ? ids[0] ?? null : s.base, slots }
}

const CompareContext = createContext(null)

/**
 * Karşılaştırma kümesi: tür başına en fazla 5 kimlik, bir baz parça ve
 * her parçanın kalıcı renk slotu. Sekme ömrü boyunca sessionStorage'da tutulur.
 */
export function CompareProvider({ children }) {
  const [state, setState] = useState(load)

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* depolama kapalı: bellekte devam */
    }
  }, [state])

  const update = useCallback((kind, fn) => {
    setState(prev => {
      const next = fn(prev[kind])
      return next === prev[kind] ? prev : { ...prev, [kind]: next }
    })
  }, [])

  const api = useMemo(() => ({
    get: kind => state[kind],
    add: (kind, id) => update(kind, s => withAdded(s, id)),
    remove: (kind, id) => update(kind, s => withRemoved(s, id)),
    toggle: (kind, id) => update(kind, s => (s.ids.includes(id) ? withRemoved(s, id) : withAdded(s, id))),
    set: (kind, ids) => update(kind, () => {
      const unique = [...new Set(ids)].slice(0, MAX_COMPARE)
      return { ids: unique, base: unique[0] ?? null, slots: Object.fromEntries(unique.map((id, i) => [id, i])) }
    }),
    setBase: (kind, id) => update(kind, s => (s.ids.includes(id) ? { ...s, base: id } : s)),
    clear: kind => update(kind, emptyKind),
    /** Veride artık olmayan kimlikleri atar (eski oturumdan kalan, yeniden adlandırılmış parça). */
    prune: (kind, stale) => update(kind, s => stale.reduce(withRemoved, s)),
  }), [state, update])

  return <CompareContext.Provider value={api}>{children}</CompareContext.Provider>
}

/**
 * byId verilirse (türün parça haritası) veride olmayan kimlikler görünmez ve kümeden
 * atılır; yoksa hayalet kimlikler listeyi "dolu" gösterip eklemeyi kilitliyordu.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useCompare(kind, byId) {
  const ctx = useContext(CompareContext)
  if (!ctx) throw new Error('useCompare, CompareProvider içinde kullanılmalı')
  const s = ctx.get(kind)
  const staleKey = byId ? s.ids.filter(id => !byId.has(id)).join('|') : ''
  useEffect(() => {
    if (staleKey) ctx.prune(kind, staleKey.split('|'))
  }, [ctx, kind, staleKey])
  // Küme değişmedikçe aynı nesne: memo bileşenler (sıralama tablosu) boşuna çizilmesin.
  return useMemo(() => {
    const ids = byId ? s.ids.filter(id => byId.has(id)) : s.ids
    return {
      ids,
      base: ids.includes(s.base) ? s.base : (ids[0] ?? null),
      full: ids.length >= MAX_COMPARE,
      has: id => ids.includes(id),
      slotOf: id => s.slots[id] ?? 0,
      add: id => ctx.add(kind, id),
      remove: id => ctx.remove(kind, id),
      toggle: id => ctx.toggle(kind, id),
      set: next => ctx.set(kind, next),
      setBase: id => ctx.setBase(kind, id),
      clear: () => ctx.clear(kind),
    }
  }, [ctx, kind, s, byId])
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCompareCounts() {
  const ctx = useContext(CompareContext)
  return { cpu: ctx.get('cpu').ids.length, gpu: ctx.get('gpu').ids.length }
}
