import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Area } from '../lib/api'
import { useAreas, Loading } from '../lib/ui'

const M = { l: 40, r: 22, t: 24, b: 40 }
const H = 470

const TIER = {
  high: { c: '#006080', label: 'High Value' },
  balanced: { c: '#E98300', label: 'Balanced' },
  overpriced: { c: '#D6492A', label: 'Overpriced' },
}
type Tier = keyof typeof TIER

function median(xs: number[]) {
  if (!xs.length) return 0
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}
function trend(a: Area) {
  const f = a.future_value_score ?? 0
  if (f >= 60) return { t: 'Positive trend', i: 'trending_up' }
  if (f >= 45) return { t: 'Emerging', i: 'trending_up' }
  return { t: 'Steady', i: 'trending_flat' }
}

function useWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(760)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setW(el.clientWidth)
    measure() // capture the real container width immediately
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])
  return [ref, w] as const
}

type Pt = { a: Area; cost: number; life: number; value: number; vScore: number; tier: Tier; color: string; w: number }

// bubble size metric: total local amenities (a proxy for demand / centrality)
function weightOf(a: Area): number {
  const am = a.amenities
  if (am) {
    const t = Object.values(am).reduce((s, v: any) => s + (v?.count || 0), 0)
    if (t > 0) return t
  }
  return (a.area_km2 || 1) * 5
}

export default function Matrix() {
  const nav = useNavigate()
  const { areas, loading, error } = useAreas()
  const [ref, w] = useWidth()
  const [selId, setSelId] = useState<string | null>(null)
  const [hovId, setHovId] = useState<string | null>(null)
  const [cats, setCats] = useState({ high: true, balanced: true, overpriced: true })
  const [filterOpen, setFilterOpen] = useState(false)
  const [showAll, setShowAll] = useState(false)

  // points + scales (value = livability percentile minus cost percentile -> above/below fair line)
  const model = useMemo(() => {
    const scored = areas.filter((a) => a.est_rent_50sqm != null && a.life_value_score != null)
    if (!scored.length) return null
    const costs = scored.map((a) => a.est_rent_50sqm as number)
    const lifes = scored.map((a) => a.life_value_score as number)
    const cMin = Math.min(...costs), cMax = Math.max(...costs)
    const lMin = Math.min(...lifes), lMax = Math.max(...lifes)
    const norm = (v: number, lo: number, hi: number) => (hi > lo ? (v - lo) / (hi - lo) : 0.5)
    const pts: Pt[] = scored.map((a) => {
      const cost = a.est_rent_50sqm as number
      const life = a.life_value_score as number
      const value = norm(life, lMin, lMax) - norm(cost, cMin, cMax)
      const tier: Tier = value > 0.1 ? 'high' : value < -0.1 ? 'overpriced' : 'balanced'
      return { a, cost, life, value, vScore: Math.round(Math.max(0, Math.min(100, 50 + 62 * value))), tier, color: TIER[tier].c, w: weightOf(a) }
    })
    const ws = pts.map((p) => p.w)
    const cPad = (cMax - cMin) * 0.14 || 40
    const lPad = (lMax - lMin) * 0.12 || 6
    return {
      pts,
      xMin: cMin - cPad, xMax: cMax + cPad,
      yMin: Math.max(0, lMin - lPad), yMax: Math.min(100, lMax + lPad),
      xMed: median(costs), yMed: median(lifes),
      wMin: Math.min(...ws), wMax: Math.max(...ws),
    }
  }, [areas])

  useEffect(() => {
    if (!selId && model) setSelId(model.pts.find((p) => p.a.area_id === 'stadtfeld-ost')?.a.area_id ?? model.pts[0].a.area_id)
  }, [model, selId])

  if (loading || error || !model)
    return (
      <div className="space-y-6">
        <Header areas={[]} cats={cats} setCats={setCats} open={filterOpen} setOpen={setFilterOpen} />
        <Loading error={error} />
      </div>
    )

  const innerW = Math.max(220, w - M.l - M.r)
  const innerH = H - M.t - M.b
  const xS = (c: number) => M.l + ((c - model.xMin) / (model.xMax - model.xMin)) * innerW
  const yS = (v: number) => M.t + (1 - (v - model.yMin) / (model.yMax - model.yMin)) * innerH
  const rOf = (pw: number) => 6 + ((pw - model.wMin) / (model.wMax - model.wMin || 1)) * 12

  const byId = Object.fromEntries(model.pts.map((p) => [p.a.area_id, p]))
  const visible = model.pts.filter((p) => cats[p.tier])
  const active = (hovId && byId[hovId]) || (selId && byId[selId]) || null

  const ranked = [...model.pts].sort((a, b) => b.value - a.value)
  const best = ranked[0]?.a

  const xTicks = [model.xMin, (model.xMin + model.xMax) / 2, model.xMax]
  const yTicks = [model.yMin, (model.yMin + model.yMax) / 2, model.yMax]

  return (
    <div className="space-y-6">
      <Header areas={areas} cats={cats} setCats={setCats} open={filterOpen} setOpen={setFilterOpen} />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Chart */}
        <div className="xl:col-span-3 bg-white rounded-xl border border-line shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-headline font-bold text-ink text-lg">Value Matrix</h3>
            <div className="flex items-center gap-4 text-xs">
              <Dot c="#006080" t="High Value" />
              <Dot c="#E98300" t="Balanced" />
              <Dot c="#D6492A" t="Overpriced" />
              <span className="text-muted hidden sm:inline">· bubble = amenity density</span>
            </div>
          </div>

          <div ref={ref} className="relative" style={{ height: H }}>
            <svg width={w} height={H} className="overflow-visible">
              {/* quadrants split at the data medians */}
              <rect x={xS(model.xMin)} y={yS(model.yMax)} width={xS(model.xMed) - xS(model.xMin)} height={yS(model.yMed) - yS(model.yMax)} fill="#006080" fillOpacity={0.06} />
              <rect x={xS(model.xMed)} y={yS(model.yMax)} width={xS(model.xMax) - xS(model.xMed)} height={yS(model.yMed) - yS(model.yMax)} fill="#E98300" fillOpacity={0.045} />
              <rect x={xS(model.xMin)} y={yS(model.yMed)} width={xS(model.xMed) - xS(model.xMin)} height={yS(model.yMin) - yS(model.yMed)} fill="#585858" fillOpacity={0.035} />
              <rect x={xS(model.xMed)} y={yS(model.yMed)} width={xS(model.xMax) - xS(model.xMed)} height={yS(model.yMin) - yS(model.yMed)} fill="#D6492A" fillOpacity={0.05} />

              <text x={xS(model.xMin) + 8} y={yS(model.yMax) + 16} fontSize={11} fontWeight={700} fill="#9bb9c4">BEST VALUE</text>
              <text x={xS(model.xMax) - 8} y={yS(model.yMax) + 16} fontSize={11} fontWeight={700} fill="#e3bd96" textAnchor="end">PREMIUM</text>
              <text x={xS(model.xMin) + 8} y={yS(model.yMin) - 10} fontSize={11} fontWeight={700} fill="#bcbcbc">BUDGET COMPROMISE</text>
              <text x={xS(model.xMax) - 8} y={yS(model.yMin) - 10} fontSize={11} fontWeight={700} fill="#e0a596" textAnchor="end">OVERPRICED</text>

              {/* fair value diagonal */}
              <line x1={xS(model.xMin)} y1={yS(model.yMin)} x2={xS(model.xMax)} y2={yS(model.yMax)} stroke="#DcDcDc" strokeDasharray="6 6" />
              <text x={xS((model.xMin + model.xMax) / 2) + 6} y={yS((model.yMin + model.yMax) / 2) - 6} fontSize={10} fill="#b8b8b8">Fair Value Reference</text>

              {/* axes */}
              {yTicks.map((t, i) => (
                <text key={i} x={M.l - 10} y={yS(t) + 4} fontSize={11} fill="#585858" textAnchor="end">{Math.round(t)}</text>
              ))}
              {xTicks.map((t, i) => (
                <text key={i} x={xS(t)} y={H - M.b + 18} fontSize={11} fill="#585858" textAnchor="middle">€{Math.round(t / 10) * 10}</text>
              ))}
              <text transform={`translate(15, ${M.t + innerH / 2}) rotate(-90)`} fontSize={11} fill="#585858" textAnchor="middle">Life Value Score</text>

              {/* bubbles */}
              {visible.map((p) => {
                const cx = xS(p.cost), cy = yS(p.life)
                return (
                  <circle
                    key={p.a.area_id}
                    cx={cx}
                    cy={cy}
                    r={rOf(p.w)}
                    fill={p.color}
                    stroke="#fff"
                    strokeWidth={1.5}
                    opacity={active && active.a.area_id !== p.a.area_id ? 0.55 : 0.92}
                    className="cursor-pointer transition-opacity"
                    onMouseEnter={() => setHovId(p.a.area_id)}
                    onMouseLeave={() => setHovId(null)}
                    onClick={() => setSelId(p.a.area_id)}
                  />
                )
              })}

              {/* selection ring + connector + label */}
              {active && cats[active.tier] && (
                <g pointerEvents="none">
                  <circle cx={xS(active.cost)} cy={yS(active.life)} r={rOf(active.w) + 4} fill="none" stroke="#542D24" strokeWidth={2} />
                  <line x1={xS(active.cost)} y1={yS(active.life) - rOf(active.w) - 4} x2={xS(active.cost)} y2={yS(active.life) - rOf(active.w) - 15} stroke="#542D24" strokeWidth={1.5} />
                  <text x={xS(active.cost)} y={yS(active.life) + rOf(active.w) + 14} fontSize={10} fontWeight={700} fill="#54453D" textAnchor="middle">{active.a.area_name}</text>
                </g>
              )}
            </svg>

            {/* tooltip card */}
            {active && cats[active.tier] && (
              <div
                className="absolute pointer-events-none bg-ink text-white rounded-lg px-4 py-3 shadow-lg"
                style={{ left: xS(active.cost), top: yS(active.life) - rOf(active.w) - 15, transform: 'translate(-50%, -100%)', whiteSpace: 'nowrap' }}
              >
                <div className="font-headline font-bold text-sm mb-1.5">{active.a.area_name}</div>
                <div className="flex gap-5 text-xs">
                  <div>
                    <div className="text-white/60">Livability:</div>
                    <div className="font-bold">{active.life}/100</div>
                  </div>
                  <div>
                    <div className="text-white/60">Est. Rent:</div>
                    <div className="font-bold">€{active.cost}/mo</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-line shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-sun">star</span>
              <h3 className="font-headline font-bold text-ink leading-tight">Best value right now</h3>
            </div>
            <div className={`space-y-3 ${showAll ? 'max-h-80 overflow-y-auto pr-1' : ''}`}>
              {(showAll ? ranked : ranked.slice(0, 3)).map((p, i) => {
                const tr = trend(p.a)
                const on = p.a.area_id === selId
                return (
                  <button
                    key={p.a.area_id}
                    onClick={() => setSelId(p.a.area_id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${on ? 'border-petrol bg-petrol/5' : 'border-line hover:border-petrol/50'}`}
                  >
                    <span className="w-7 h-7 rounded-full bg-petrol/10 text-petrol grid place-items-center text-sm font-bold shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-headline font-bold text-body truncate">{p.a.area_name}</div>
                      <div className="text-xs text-muted flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-petrol">{tr.i}</span>
                        {tr.t}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-headline font-bold text-petrol">{p.vScore}</div>
                      <div className="text-[10px] text-muted uppercase tracking-wider">Value</div>
                    </div>
                  </button>
                )
              })}
            </div>
            <button onClick={() => setShowAll((s) => !s)} className="mt-4 text-sm text-petrol font-bold hover:underline">
              {showAll ? 'Show less' : 'View full ranking'}
            </button>
          </div>

          <div className="bg-white rounded-xl border border-line shadow-sm p-5">
            <div className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2">Market Insight</div>
            <p className="text-sm text-muted leading-relaxed">
              <b className="text-body">{best?.area_name}</b> offers the best livability for its price
              {best?.est_rent_50sqm ? ` (≈ €${best.est_rent_50sqm}/mo)` : ''}, sitting furthest above the fair-value line.
            </p>
            <button
              onClick={() => {
                if (best) setSelId(best.area_id)
                nav('/map')
              }}
              className="mt-3 text-sm text-petrol font-bold hover:underline"
            >
              Read detailed analysis →
            </button>
          </div>
        </div>
      </div>

      {/* Behind the score — Münster-style explainer cards */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-9 h-9 rounded-full border-2 border-sun/50 grid place-items-center text-sun">
            <span className="material-symbols-outlined text-base">insights</span>
          </span>
          <span className="text-petrol font-medium">behind the score</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InfoCard watermark="dataset" big="40" bigUnit=" districts" source="Mietspiegel 2024 · OpenStreetMap · KISS-MD"
            details="Rent is the qualified Mietspiegel net cold rent per Stadtteil (2012–2026). Amenities, transit stops and green space are counted from OpenStreetMap within each district. District boundaries come from the city's open geodata.">
            Every district is scored from <b className="text-sun">open data</b> — net cold rent from the{' '}
            <b className="text-sun">Mietspiegel 2024</b>, ~2,000 <b className="text-sun">amenities &amp; transit stops</b> from
            OpenStreetMap, and green space from the city tree cadastre.
          </InfoCard>

          <InfoCard watermark="calculate" source="Transparent weighted index — no black-box ML"
            details="Each district's six sub-scores are min-max normalized to 0–100 across all districts, then combined with the weights above into a Life Value Score. A district's color on the chart is its value: livability percentile minus cost percentile — above the fair-value line is good value (petrol), below is overpriced (red).">
            <div className="text-4xl font-headline font-black text-sun mb-2">Life Value Score</div>
            Six sub-scores are normalized <b className="text-sun">0–100</b> and combined by weight. On the chart, color is{' '}
            <b className="text-sun">value</b> — how far a district sits above or below the <b className="text-sun">fair-value line</b>.
            <WeightBar />
          </InfoCard>
        </div>
      </div>
    </div>
  )
}

const WEIGHTS = [
  { k: 'Affordability', w: 25, c: '#006080' },
  { k: 'Transit', w: 20, c: '#2D8BBF' },
  { k: '15-Min City', w: 20, c: '#E98300' },
  { k: 'Future', w: 15, c: '#C44D36' },
  { k: 'Green', w: 10, c: '#7A9E3B' },
  { k: 'Healthcare', w: 10, c: '#D6492A' },
]

function WeightBar() {
  return (
    <div className="mt-4">
      <div className="flex h-3 rounded-full overflow-hidden">
        {WEIGHTS.map((w) => (
          <div key={w.k} style={{ width: `${w.w}%`, background: w.c }} title={`${w.k} ${w.w}%`} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
        {WEIGHTS.map((w) => (
          <span key={w.k} className="flex items-center gap-1 text-[11px] text-muted">
            <span className="w-2 h-2 rounded-full" style={{ background: w.c }} />
            {w.k} {w.w}%
          </span>
        ))}
      </div>
    </div>
  )
}

function InfoCard({
  watermark,
  big,
  bigUnit,
  children,
  source,
  details,
}: {
  watermark: string
  big?: string
  bigUnit?: string
  children: React.ReactNode
  source: string
  details: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: '#FCEFE6' }}>
      <span className="material-symbols-outlined absolute right-5 top-5 text-sun/30" style={{ fontSize: 44 }}>{watermark}</span>
      {big && (
        <div className="text-5xl font-headline font-black text-sun mb-3">
          {big}
          <span className="text-2xl">{bigUnit}</span>
        </div>
      )}
      <div className="text-body text-sm leading-relaxed">{children}</div>
      {open && <div className="text-sm text-muted leading-relaxed mt-3 pt-3 border-t border-sun/20">{details}</div>}
      <div className="text-petrol text-xs mt-4">Source: {source}</div>
      <div className="flex items-center justify-between mt-4">
        <div className="flex gap-3 text-petrol/70">
          <span className="material-symbols-outlined text-lg">dataset</span>
          <span className="material-symbols-outlined text-lg">share</span>
          <span className="material-symbols-outlined text-lg">download</span>
        </div>
        <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1 text-petrol font-medium text-sm hover:underline">
          <span className="material-symbols-outlined text-base">info</span>
          {open ? 'Less' : 'More details'}
        </button>
      </div>
    </div>
  )
}

function Dot({ c, t }: { c: string; t: string }) {
  return (
    <span className="flex items-center gap-1.5 text-muted">
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
      {t}
    </span>
  )
}

function exportCsv(areas: Area[]) {
  const cols: (keyof Area)[] = ['area_name', 'life_value_score', 'est_rent_50sqm', 'affordability_score', 'transit_score', 'fifteen_min_score', 'green_score', 'healthcare_score', 'future_value_score']
  const csv = [cols.join(','), ...areas.map((a) => cols.map((c) => a[c] ?? '').join(','))].join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'magdeburg_value_matrix.csv'
  link.click()
  URL.revokeObjectURL(url)
}

function Header({
  areas,
  cats,
  setCats,
  open,
  setOpen,
}: {
  areas: Area[]
  cats: { high: boolean; balanced: boolean; overpriced: boolean }
  setCats: (c: { high: boolean; balanced: boolean; overpriced: boolean }) => void
  open: boolean
  setOpen: (b: boolean) => void
}) {
  const ROWS: { k: keyof typeof cats; t: string; c: string }[] = [
    { k: 'high', t: 'High Value', c: '#006080' },
    { k: 'balanced', t: 'Balanced', c: '#E98300' },
    { k: 'overpriced', t: 'Overpriced', c: '#D6492A' },
  ]
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 className="text-3xl font-headline font-bold text-ink">Affordability vs. Livability</h1>
        <p className="text-muted mt-1 max-w-2xl">
          Analyze district value based on standardized life-quality scores against estimated median monthly costs.
        </p>
      </div>
      <div className="flex gap-2">
        <div className="relative">
          <button onClick={() => setOpen(!open)} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-line text-sm text-body hover:border-petrol">
            <span className="material-symbols-outlined text-base">filter_list</span>
            Filter
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-line p-3 z-50">
              <div className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Show categories</div>
              {ROWS.map((r) => (
                <label key={r.k} className="flex items-center gap-2 py-1.5 text-sm cursor-pointer">
                  <input type="checkbox" checked={cats[r.k]} onChange={(e) => setCats({ ...cats, [r.k]: e.target.checked })} className="accent-petrol" />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: r.c }} />
                  {r.t}
                </label>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => exportCsv(areas)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-petrol text-white text-sm font-bold hover:bg-petrol/90">
          <span className="material-symbols-outlined text-base">download</span>
          Export Report
        </button>
      </div>
    </div>
  )
}
