import { useState } from 'react'
import { ComposedChart, Area as AreaShape, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'
import { useNavigate } from 'react-router-dom'
import type { Area } from '../lib/api'
import { useAreas, Loading } from '../lib/ui'

const STAT = {
  stable: { t: 'Stable', icon: 'check_circle', cls: 'bg-petrol/10 text-petrol' },
  premium: { t: 'Premium', icon: 'star', cls: 'bg-purple-100 text-purple-700' },
  move: { t: 'Move early', icon: 'rocket_launch', cls: 'bg-petrol text-white' },
  budget: { t: 'Budget', icon: 'savings', cls: 'bg-gray-100 text-muted' },
  watch: { t: 'Watch rent', icon: 'schedule', cls: 'bg-sun/15 text-sun' },
}

function median(xs: number[]) {
  if (!xs.length) return 0
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}
function classify(a: Area, medRent: number): (typeof STAT)[keyof typeof STAT] {
  const g = a.rent_growth_pct ?? 0
  const rent = a.rent_eur_sqm ?? 0
  if (g >= 70) return STAT.watch
  if (g >= 50 && rent <= medRent * 1.05) return STAT.move
  if (rent >= medRent * 1.15) return STAT.premium
  if (rent <= medRent * 0.9) return STAT.budget
  return STAT.stable
}
function recommend(a: Area, medRent: number) {
  const g = a.rent_growth_pct ?? 0
  const rent = a.rent_eur_sqm ?? 0
  if (g >= 55 && rent <= medRent * 1.05) return 'Move early — rising area'
  if (rent >= medRent * 1.15) return 'Premium area'
  if (g < 20) return 'Stable choice'
  return 'Solid value'
}

const PANEL_NAMES = ['Stadtfeld Ost', 'Altstadt', 'Sudenburg', 'Neu Olvenstedt', 'Brückfeld']

export default function Future() {
  const nav = useNavigate()
  const { areas, loading, error } = useAreas()
  const [id, setId] = useState('buckau')
  if (loading || error)
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-headline font-bold text-ink">Future Neighborhood Predictor</h1>
        <Loading error={error} />
      </div>
    )

  const a = areas.find((x) => x.area_id === id) || areas[0]
  const scored = areas.filter((x) => x.rent_eur_sqm != null)
  const medRent = median(scored.map((x) => x.rent_eur_sqm ?? 0))

  const series = a.rent_series || []
  const data = series.map((p) => ({
    year: p.year,
    hist: p.year <= 2024 ? p.rent : null,
    proj: p.year >= 2024 ? p.rent : null,
  }))
  const vals = series.map((p) => p.rent)
  const ymin = vals.length ? Math.floor(Math.min(...vals) * 2) / 2 - 0.5 : 4.5
  const ymax = vals.length ? Math.ceil(Math.max(...vals) * 2) / 2 + 0.5 : 8.5
  const yticks: number[] = []
  for (let t = ymin; t <= ymax + 1e-6; t += 0.5) yticks.push(+t.toFixed(1))

  const growth = Math.round(a.rent_growth_pct ?? 0)
  const risk = growth >= 50 ? 'High' : growth >= 25 ? 'Moderate' : 'Low'
  const riskColor = growth >= 50 ? '#E98300' : growth >= 25 ? '#E98300' : '#006080'
  const rec = recommend(a, medRent)

  const panel: Area[] = PANEL_NAMES.map((n) => areas.find((x) => x.area_name === n)).filter(Boolean) as Area[]
  for (const x of scored) {
    if (panel.length >= 5) break
    if (!panel.includes(x)) panel.push(x)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-headline font-bold text-ink">Future Neighborhood Predictor</h1>
          <p className="text-muted mt-1">Projected trends and area viability based on historical civic data.</p>
        </div>
        <div className="relative">
          <span className="material-symbols-outlined text-petrol absolute left-3 top-1/2 -translate-y-1/2 text-base pointer-events-none">place</span>
          <select
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="border border-line rounded-lg pl-9 pr-4 py-2.5 text-sm bg-white text-body w-60"
          >
            {[...areas].sort((x, y) => x.area_name.localeCompare(y.area_name)).map((x) => (
              <option key={x.area_id} value={x.area_id}>
                {x.area_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trendline */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-line shadow-sm p-6">
          <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="font-headline font-bold text-ink text-lg">Rent Trendline (2012–2026)</h3>
              <p className="text-xs text-muted">Average cold rent (€/m²) for {a.area_name}.</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-xs bg-page text-muted rounded-full px-2.5 py-1">
                <span className="material-symbols-outlined text-sm text-petrol">show_chart</span>
                Historical + AI Projection
              </span>
              <div className="flex items-center gap-3 text-[11px] text-muted mt-1 justify-end">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full border-2 border-petrol" />Historical Rent</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full border-2 border-sun" />Projected</span>
              </div>
            </div>
          </div>

          <div style={{ height: 340 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                <XAxis dataKey="year" ticks={[2012, 2014, 2016, 2018, 2020, 2022, 2024, 2026]} tick={{ fontSize: 11, fill: '#585858' }} />
                <YAxis
                  domain={[ymin, ymax]}
                  ticks={yticks}
                  tickFormatter={(v) => `€${v}`}
                  tick={{ fontSize: 11, fill: '#585858' }}
                  width={44}
                />
                <Tooltip formatter={(v: any) => [`€${v}/m²`, 'Rent']} labelFormatter={(l) => `Year ${l}`} />
                <AreaShape dataKey="hist" stroke="none" fill="#006080" fillOpacity={0.08} />
                <Line dataKey="hist" stroke="#006080" strokeWidth={2.5} connectNulls={false}
                  dot={{ r: 3.5, fill: '#fff', stroke: '#006080', strokeWidth: 2 }} />
                <Line dataKey="proj" stroke="#E98300" strokeWidth={2.5} strokeDasharray="6 5" connectNulls
                  dot={{ r: 3.5, fill: '#fff', stroke: '#E98300', strokeWidth: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar metrics */}
        <div className="space-y-4">
          <Metric icon="euro" label="Current Rent" value={`€${a.rent_eur_sqm ?? '—'} `} unit="/m²" />
          <Metric icon="trending_up" label="Growth" value={`+${growth}%`} unit=" since 2012" />
          <div className="bg-white rounded-xl border border-line shadow-sm p-4 flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg grid place-items-center" style={{ background: 'rgba(233,131,0,0.12)' }}>
              <span className="material-symbols-outlined" style={{ color: riskColor }}>warning</span>
            </span>
            <div>
              <div className="text-[11px] font-bold text-muted uppercase tracking-wider">Rent-Increase Risk</div>
              <div className="text-xl font-headline font-bold text-ink">{risk}</div>
            </div>
          </div>
          <div className="bg-petrol text-white rounded-xl p-4 relative overflow-hidden">
            <span className="material-symbols-outlined absolute right-2 bottom-0 text-white/15" style={{ fontSize: 64 }}>smart_toy</span>
            <div className="text-[10px] font-bold uppercase tracking-wider text-white/70 relative">Recommendation</div>
            <div className="font-headline font-bold text-lg relative">{rec}</div>
          </div>
        </div>
      </div>

      {/* District comparison panel */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-headline font-bold text-ink text-lg">District Comparison Panel</h3>
          <button onClick={() => nav('/matrix')} className="text-sm text-petrol font-bold hover:underline">
            View full matrix →
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {panel.map((p) => {
            const st = classify(p, medRent)
            const active = p.area_id === a.area_id
            return (
              <button
                key={p.area_id}
                onClick={() => setId(p.area_id)}
                className={`text-left bg-white rounded-xl border shadow-sm p-4 transition-colors ${
                  active ? 'border-petrol ring-2 ring-petrol/20' : 'border-line hover:border-petrol/50'
                }`}
              >
                <div className="font-headline font-bold text-body mb-3 truncate">{p.area_name}</div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold ${st.cls}`}>
                  <span className="material-symbols-outlined text-sm">{st.icon}</span>
                  {st.t}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <p className="text-xs text-muted flex items-center gap-1.5">
        <span className="material-symbols-outlined text-sm">info</span>
        Estimated trend based on available open data — not exact prediction. Magdeburg Open Data Portal.
      </p>
    </div>
  )
}

function Metric({ icon, label, value, unit }: { icon: string; label: string; value: string; unit?: string }) {
  return (
    <div className="bg-white rounded-xl border border-line shadow-sm p-4 flex items-center gap-3">
      <span className="w-10 h-10 rounded-lg grid place-items-center bg-petrol/10">
        <span className="material-symbols-outlined text-petrol">{icon}</span>
      </span>
      <div>
        <div className="text-[11px] font-bold text-muted uppercase tracking-wider">{label}</div>
        <div className="text-xl font-headline font-bold text-ink">
          {value}
          {unit && <span className="text-sm text-muted font-body">{unit}</span>}
        </div>
      </div>
    </div>
  )
}
