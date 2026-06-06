import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { Area } from '../lib/api'
import { useAreas, Loading } from '../lib/ui'

const TAGLINE: Record<string, string> = {
  'Stadtfeld Ost': 'Urban Core West',
  Buckau: 'Riverside South',
  Altstadt: 'Historic Centre',
  Sudenburg: 'Inner South',
  Cracau: 'East of the Elbe',
  Herrenkrug: 'Riverside Park',
  'Neue Neustadt': 'North Quarter',
  Werder: 'River Island',
  'Neu Olvenstedt': 'North-West Estate',
  Brückfeld: 'East Bank',
}

const cold = (a: Area) => Math.round((a.rent_eur_sqm ?? 0) * 50)
const total = (a: Area) => cold(a) + 125 + 58 // 50 m²: utilities 2.5 €/m² + Deutschlandticket

function qual(s: number | null) {
  if (s == null) return { w: '—', c: '#585858' }
  if (s >= 85) return { w: 'Exceptional', c: '#006080' }
  if (s >= 68) return { w: 'High', c: '#006080' }
  if (s >= 50) return { w: 'Good', c: '#006080' }
  if (s >= 35) return { w: 'Medium', c: '#E98300' }
  return { w: 'Low', c: '#D6492A' }
}
function futureQual(s: number | null) {
  if (s == null) return { w: '—', c: '#585858' }
  if (s >= 78) return { w: 'Exceptional', c: '#006080' }
  if (s >= 50) return { w: 'Strong', c: '#006080' }
  if (s >= 30) return { w: 'Stable', c: '#383838' }
  return { w: 'Watch', c: '#E98300' }
}

type Metric = {
  key: string
  label: string
  icon: string
  num: (a: Area) => number | null
  lowerBetter?: boolean
  kind: 'money' | 'transit' | 'qual' | 'qual-nodot' | 'future'
}
const METRICS: Metric[] = [
  { key: 'rent', label: 'Est. Rent', icon: 'home', num: cold, lowerBetter: true, kind: 'money' },
  { key: 'total', label: 'Total Monthly', icon: 'receipt_long', num: total, lowerBetter: true, kind: 'money' },
  { key: 'transit', label: 'Transit', icon: 'tram', num: (a) => a.transit_score, kind: 'transit' },
  { key: 'fifteen', label: '15-Min City', icon: 'schedule', num: (a) => a.fifteen_min_score, kind: 'qual' },
  { key: 'health', label: 'Healthcare', icon: 'health_and_safety', num: (a) => a.healthcare_score, kind: 'qual-nodot' },
  { key: 'green', label: 'Green Space', icon: 'park', num: (a) => a.green_score, kind: 'qual' },
  { key: 'future', label: 'Future Value', icon: 'trending_up', num: (a) => a.future_value_score, kind: 'future' },
]

export default function Compare() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const { areas, loading, error } = useAreas()
  const first = params.get('a') || 'stadtfeld-ost'
  const second = first === 'buckau' ? 'stadtfeld-ost' : 'buckau'
  const [ids, setIds] = useState<string[]>([first, second])

  if (loading || error)
    return (
      <div className="space-y-6">
        <Header onExport={() => {}} onShare={() => {}} />
        <Loading error={error} />
      </div>
    )

  const byId = Object.fromEntries(areas.map((a) => [a.area_id, a]))
  const cols = ids.map((id) => byId[id]).filter(Boolean) as Area[]
  const scored = areas.filter((a) => a.life_value_score != null)
  const topScore = Math.max(...cols.map((a) => a.life_value_score ?? 0))

  function winnerIdx(m: Metric) {
    let best = -1
    let bestVal: number | null = null
    cols.forEach((a, i) => {
      const v = m.num(a)
      if (v == null) return
      if (bestVal == null || (m.lowerBetter ? v < bestVal : v > bestVal)) {
        bestVal = v
        best = i
      }
    })
    const ties = cols.filter((a) => m.num(a) === bestVal).length
    return ties === 1 ? best : -1
  }
  const winners = METRICS.map(winnerIdx)

  function setCol(i: number, id: string) {
    setIds((prev) => prev.map((p, j) => (j === i ? id : p)))
  }
  function addCol() {
    const unused = scored.find((a) => !ids.includes(a.area_id))
    if (unused) setIds((prev) => [...prev, unused.area_id])
  }
  function removeCol(i: number) {
    setIds((prev) => prev.filter((_, j) => j !== i))
  }

  const argbest = (fn: (a: Area) => number) =>
    cols.reduce((best, a) => (fn(a) > fn(best) ? a : best), cols[0])?.area_name
  const bestValue = argbest((a) => (a.life_value_score ?? 0) / (total(a) / 500))
  const bestAcc = argbest((a) => ((a.transit_score ?? 0) + (a.fifteen_min_score ?? 0)) / 2)
  const bestFam = argbest((a) => ((a.healthcare_score ?? 0) + (a.green_score ?? 0) + (a.education_score ?? 0) + (a.affordability_score ?? 0)) / 4)

  function exportCsv() {
    const f: (keyof Area)[] = ['area_name', 'life_value_score', 'transit_score', 'fifteen_min_score', 'healthcare_score', 'green_score', 'future_value_score', 'rent_eur_sqm']
    const csv = [f.join(','), ...cols.map((a) => f.map((c) => a[c] ?? '').join(','))].join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'magdeburg_comparison.csv'
    link.click()
    URL.revokeObjectURL(url)
  }
  function share() {
    const txt =
      'Magdeburg Area Comparison\n' +
      cols.map((a) => `• ${a.area_name}: Livability ${a.life_value_score}/100 · ~€${total(a)}/mo`).join('\n')
    navigator.clipboard?.writeText(txt).then(
      () => alert('Comparison copied to clipboard.'),
      () => {},
    )
  }

  const options = [...scored].sort((a, b) => a.area_name.localeCompare(b.area_name))

  return (
    <div className="space-y-6">
      <Header onExport={exportCsv} onShare={share} />

      {/* Columns */}
      <div className="flex gap-5 items-stretch overflow-x-auto pb-2">
        {cols.map((a, i) => (
          <div key={i} className="min-w-[280px] flex-1 bg-white rounded-2xl border border-line shadow-sm flex flex-col overflow-hidden relative">
            {a.life_value_score === topScore && cols.length > 1 && (
              <span className="absolute top-0 right-0 bg-petrol text-white text-[10px] font-bold px-2.5 py-1 rounded-bl-lg z-10">TOP PICK</span>
            )}
            {/* header */}
            <div className="p-4">
              {cols.length > 2 && (
                <button onClick={() => removeCol(i)} className="absolute top-2 left-2 text-muted hover:text-brick">
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              )}
              <div className="flex items-start justify-between gap-2 pt-1">
                <div>
                  <div className="relative inline-block">
                    <select
                      value={a.area_id}
                      onChange={(e) => setCol(i, e.target.value)}
                      className="appearance-none font-headline font-bold text-xl text-ink bg-transparent pr-6 cursor-pointer focus:outline-none max-w-[180px] truncate"
                    >
                      {options.map((o) => (
                        <option key={o.area_id} value={o.area_id}>
                          {o.area_name}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined text-base text-muted absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
                  </div>
                  <div className="text-xs text-muted flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">place</span>
                    {TAGLINE[a.area_name] || 'Magdeburg district'}
                  </div>
                </div>
                <Ring value={a.life_value_score ?? 0} />
              </div>
            </div>

            {/* metric rows */}
            <div>
              {METRICS.map((m, mi) => {
                const win = winners[mi] === i
                return (
                  <div key={m.key} className={`flex items-center justify-between px-4 py-3 border-t border-line ${win ? 'bg-petrol/5' : ''}`}>
                    <span className="flex items-center gap-2 text-sm text-muted">
                      <span className="material-symbols-outlined text-base">{m.icon}</span>
                      {m.label}
                    </span>
                    <Cell m={m} a={a} win={win} />
                  </div>
                )
              })}
            </div>

            {/* best for */}
            <div className="px-4 py-4 border-t border-line mt-auto">
              <div className="text-[11px] font-bold text-muted uppercase tracking-wider mb-1">Best For</div>
              <div className="text-sm text-body capitalize">{(a.best_for || ['balanced']).join(', ')}</div>
            </div>
          </div>
        ))}

        {cols.length < 3 && (
          <button
            onClick={addCol}
            className="min-w-[280px] flex-1 rounded-2xl border-2 border-dashed border-line text-muted hover:border-petrol hover:text-petrol transition-colors grid place-items-center p-8"
          >
            <div className="text-center">
              <span className="material-symbols-outlined" style={{ fontSize: 40 }}>add</span>
              <div className="font-headline font-bold mt-2">Add Area</div>
              <div className="text-xs mt-1 max-w-[180px]">Select another district to compare metrics side-by-side.</div>
            </div>
          </button>
        )}
      </div>

      {/* Verdict */}
      <div className="bg-white rounded-xl border border-line shadow-sm p-4 flex items-center gap-3 flex-wrap">
        <span className="text-xs font-bold text-muted uppercase tracking-wider">Analysis Verdict:</span>
        <Chip icon="paid" label="Best value" name={bestValue} />
        <Chip icon="directions_transit" label="Best accessibility" name={bestAcc} />
        <Chip icon="family_restroom" label="Best for families" name={bestFam} />
        <button onClick={() => nav('/matrix')} className="ml-auto text-sm text-petrol font-bold hover:underline">
          View detailed breakdown →
        </button>
      </div>
    </div>
  )
}

function Cell({ m, a, win }: { m: Metric; a: Area; win: boolean }) {
  let node
  if (m.kind === 'money') node = <span className="font-headline font-bold text-body">€{m.num(a)}{m.key === 'rent' ? <span className="text-xs text-muted font-body">/mo</span> : ''}</span>
  else if (m.kind === 'transit') node = <span className="font-headline font-bold text-body">{m.num(a) ?? '—'}<span className="text-xs text-muted font-body">/100</span></span>
  else if (m.kind === 'future') {
    const q = futureQual(m.num(a))
    node = <span className="font-bold" style={{ color: q.c }}>{q.w}</span>
  } else {
    const q = qual(m.num(a))
    node = (
      <span className="flex items-center gap-1.5 font-bold" style={{ color: q.c }}>
        {m.kind === 'qual' && <span className="w-2 h-2 rounded-full" style={{ background: q.c }} />}
        {q.w}
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1.5">
      {node}
      {win && <span className="material-symbols-outlined text-sm text-sun">emoji_events</span>}
    </span>
  )
}

function Chip({ icon, label, name }: { icon: string; label: string; name?: string }) {
  return (
    <span className="flex items-center gap-2 bg-page rounded-lg px-3 py-2 text-sm">
      <span className="material-symbols-outlined text-petrol text-base">{icon}</span>
      <span className="text-muted">{label}:</span>
      <b className="text-body">{name || '—'}</b>
    </span>
  )
}

function Header({ onExport, onShare }: { onExport: () => void; onShare: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 className="text-3xl font-headline font-bold text-ink">Area Comparison</h1>
        <p className="text-muted mt-1">Evaluating quality-of-life metrics across districts.</p>
      </div>
      <div className="flex gap-2">
        <button onClick={onExport} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-line text-sm text-body hover:border-petrol">
          <span className="material-symbols-outlined text-base">download</span>
          Export
        </button>
        <button onClick={onShare} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brick text-white text-sm font-bold hover:bg-terracotta">
          <span className="material-symbols-outlined text-base">share</span>
          Share Report
        </button>
      </div>
    </div>
  )
}

function Ring({ value }: { value: number }) {
  const dash = `${Math.max(0, Math.min(100, value))}, 100`
  return (
    <div className="relative w-12 h-12 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E8E8E8" strokeWidth="3" />
        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#006080" strokeWidth="3" strokeDasharray={dash} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-sm font-headline font-bold text-petrol">{value}</div>
    </div>
  )
}
