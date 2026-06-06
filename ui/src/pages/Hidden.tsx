import { useState } from 'react'
import { useAreas, Loading } from '../lib/ui'
import { BehindCards, InfoCard } from '../components/InfoCards'

const UTIL_PER_SQM = 2.5
const TICKET: Record<string, number> = { walk: 0, bike: 0, tram: 58, car: 300 }
const COMMUTE = [
  { key: 'walk', icon: 'directions_walk', label: 'Walk' },
  { key: 'bike', icon: 'pedal_bike', label: 'Bike' },
  { key: 'tram', icon: 'tram', label: 'Tram' },
  { key: 'car', icon: 'directions_car', label: 'Car' },
]

export default function Hidden() {
  const { areas, loading, error } = useAreas()
  const [id, setId] = useState('stadtfeld-ost')
  const [size, setSize] = useState(50)
  const [mode, setMode] = useState('tram')

  if (loading || error)
    return (
      <div className="space-y-8">
        <Header />
        <Loading error={error} />
      </div>
    )

  const a = areas.find((x) => x.area_id === id) || areas[0]
  const sqm = a.rent_eur_sqm ?? 0
  const rent = Math.round(sqm * size)
  const utilities = Math.round(UTIL_PER_SQM * size)
  const transport = TICKET[mode] ?? 0
  const total = rent + utilities + transport

  const scored = areas.filter((x) => x.rent_eur_sqm != null)
  const cityAvgSqm = scored.reduce((s, x) => s + (x.rent_eur_sqm ?? 0), 0) / Math.max(1, scored.length)
  const cityTotal = Math.round(cityAvgSqm * size) + utilities + transport
  const diff = total - cityTotal

  const seg = (v: number) => (total ? (100 * v) / total : 0)
  const modeLabel = COMMUTE.find((c) => c.key === mode)?.label ?? 'Tram'
  const transportSub = mode === 'tram' ? 'Deutschlandticket' : mode === 'car' ? 'fuel + parking' : 'no ticket needed'

  return (
    <div className="space-y-8">
      <Header />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT — parameters */}
        <div className="bg-white rounded-2xl border border-line shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-petrol">tune</span>
            <h3 className="font-headline font-bold text-ink text-lg">Your Parameters</h3>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-muted uppercase tracking-wider">Target District</label>
            <select
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full border border-line rounded-lg px-4 py-3 text-sm bg-page text-body"
            >
              {[...areas]
                .sort((x, y) => x.area_name.localeCompare(y.area_name))
                .map((x) => (
                  <option key={x.area_id} value={x.area_id}>
                    {x.area_name}
                  </option>
                ))}
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label className="text-[11px] font-bold text-muted uppercase tracking-wider">Apartment Size</label>
              <span className="text-2xl font-headline font-bold text-petrol">{size} m²</span>
            </div>
            <input
              type="range"
              min={20}
              max={150}
              value={size}
              onChange={(e) => setSize(+e.target.value)}
              className="w-full accent-brick"
            />
            <div className="flex justify-between text-xs text-muted">
              <span>20 m²</span>
              <span>150 m²</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-muted uppercase tracking-wider">Primary Commute</label>
            <div className="grid grid-cols-2 gap-3">
              {COMMUTE.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setMode(c.key)}
                  className={`flex items-center justify-center gap-2 py-3 rounded-lg border text-sm transition-colors ${
                    mode === c.key ? 'border-petrol text-petrol bg-petrol/5 font-bold' : 'border-line text-muted hover:border-petrol'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{c.icon}</span>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — total */}
        <div className="bg-white rounded-2xl border border-line shadow-sm p-6 space-y-6">
          <div>
            <div className="text-[11px] font-bold text-muted uppercase tracking-wider mb-1">Estimated Monthly Total</div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="text-5xl font-headline font-black text-ink">
                €{total}
                <span className="text-xl text-muted font-body"> /mo</span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                  diff >= 0 ? 'bg-sun/15 text-sun' : 'bg-petrol/10 text-petrol'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{diff >= 0 ? 'trending_up' : 'trending_down'}</span>
                {diff >= 0 ? '+' : ''}€{diff} vs city avg
              </span>
            </div>
          </div>

          {/* Cost structure */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted font-bold uppercase tracking-wider">Cost Structure</span>
              <span className="text-muted">100%</span>
            </div>
            <div className="flex h-4 rounded-full overflow-hidden">
              <div style={{ width: `${seg(rent)}%`, background: '#D6492A' }} />
              <div style={{ width: `${seg(utilities)}%`, background: '#D8D2CC' }} />
              <div style={{ width: `${seg(transport)}%`, background: '#006080' }} />
            </div>
            {total > cityTotal && (
              <div className="relative h-2">
                <div
                  className="absolute top-0 w-2 h-2 rounded-full bg-ink/70"
                  style={{ left: `calc(${Math.min(100, (cityTotal / total) * 100)}% - 4px)` }}
                  title="city average"
                />
              </div>
            )}
          </div>

          {/* line items */}
          <div>
            <Line c="#D6492A" t="Cold Rent" amount={rent} sub={`${sqm} €/m²`} />
            <Line c="#D8D2CC" t="Utilities & Heating" amount={utilities} sub="2.5 €/m²" />
            <Line c="#006080" t={`Transport (${modeLabel})`} amount={transport} sub={transportSub} />
          </div>
        </div>
      </div>

      {/* Value insight */}
      <div className="bg-petrol text-white rounded-2xl p-6 relative overflow-hidden lg:w-[calc(50%-12px)] lg:ml-auto">
        <span className="material-symbols-outlined absolute -right-3 -bottom-4 text-white/15" style={{ fontSize: 110 }}>
          lightbulb
        </span>
        <div className="flex items-center gap-2 mb-2 relative">
          <span className="material-symbols-outlined">lightbulb</span>
          <h4 className="font-headline font-bold text-lg">Value Insight</h4>
        </div>
        <p className="text-sm text-white/90 leading-relaxed relative">
          Although <b className="text-sun">€{Math.abs(diff)} {diff >= 0 ? 'above' : 'below'} average</b>, {a.area_name}{' '}
          {diff >= 0
            ? 'offsets the higher base rent with strong daily access — amenities and transit within a short walk, saving commute effort and time.'
            : 'is an easy win: a low total cost without giving up everyday access.'}
        </p>
      </div>

      <BehindCards label="behind the cost" icon="payments">
        <InfoCard
          watermark="dataset"
          big="3"
          bigUnit=" cost layers"
          source="Mietspiegel 2024 · Deutschlandticket"
          details="Transport: tram = €58 (Deutschlandticket), car = €300 placeholder, walk/bike = €0. Utilities use a 2.5 €/m² Nebenkosten assumption; rent is the qualified Mietspiegel net cold rent for the selected district (a district average, not a live listing)."
        >
          True cost stacks three layers: <b className="text-sun">rent</b> (Mietspiegel 2024 net cold rent × size),{' '}
          <b className="text-sun">utilities</b> (a flat 2.5 €/m²), and <b className="text-sun">transport</b> for your
          commute mode.
        </InfoCard>
        <InfoCard
          watermark="calculate"
          source="Own calculation, transparent assumptions"
          details="Estimates are deliberately modest — a €30–40 difference is acceptable if access improves. Rent is a district average from the Mietspiegel, not an individual listing."
        >
          <div className="text-4xl font-headline font-black text-sun mb-2">Total Cost of Life</div>
          <b className="text-sun">Total = rent + utilities + transport</b>. We compare it to the{' '}
          <b className="text-sun">city average</b> for the same flat size and commute, so the badge shows whether you're
          above or below typical.
        </InfoCard>
      </BehindCards>
    </div>
  )
}

function Header() {
  return (
    <div>
      <h1 className="text-4xl font-headline font-black text-ink leading-tight">
        Rent isn't the{' '}
        <span className="text-brick underline decoration-2 underline-offset-2">full cost.</span>
      </h1>
      <p className="text-muted mt-2 max-w-2xl">
        Discover the true cost of living in different Magdeburg districts by factoring in utilities, mobility, and daily
        necessities.
      </p>
    </div>
  )
}

function Line({ c, t, amount, sub }: { c: string; t: string; amount: number; sub: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-t border-line">
      <span className="flex items-center gap-2.5">
        <span className="w-3 h-3 rounded-full" style={{ background: c }} />
        <span className="text-body">{t}</span>
      </span>
      <div className="text-right">
        <div className="font-headline font-bold text-body">€{amount}</div>
        <div className="text-xs text-muted">{sub}</div>
      </div>
    </div>
  )
}
