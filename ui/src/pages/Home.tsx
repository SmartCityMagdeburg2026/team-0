import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, type Area } from '../lib/api'
import heroBanner from '../assets/hero_banner.jpg'
import { BehindCards, InfoCard } from '../components/InfoCards'

const PROFILES = ['General', 'Student', 'Professional', 'Family', 'Senior']
const TRANSPORT = [
  { key: 'walk', icon: 'directions_walk', label: 'Walk' },
  { key: 'bike', icon: 'pedal_bike', label: 'Bike' },
  { key: 'tram', icon: 'tram', label: 'Tram' },
  { key: 'car', icon: 'directions_car', label: 'Car' },
]
const LIFESTYLE = ['Affordable', 'Green Spaces', 'Healthcare', 'Night Transit', 'Café Culture', 'Schools', 'City Center']
const LIFEMAP: Record<string, keyof Area> = {
  Affordable: 'affordability_score',
  'Green Spaces': 'green_score',
  Healthcare: 'healthcare_score',
  'Night Transit': 'transit_score',
  'Café Culture': 'lifestyle_score',
  Schools: 'education_score',
  'City Center': 'fifteen_min_score',
}
const DESC: Record<string, string> = {
  Buckau: 'Riverside creative hub with industrial charm.',
  Sudenburg: 'Traditional, lively, and highly affordable.',
  Cracau: 'Serene park-side living for nature lovers.',
  'Stadtfeld Ost': 'Leafy, central and well-connected.',
  Altstadt: 'Historic old town at the heart of the city.',
  Herrenkrug: 'Green riverside by the park and campus.',
}

const HERO_BG = {
  backgroundImage:
    `linear-gradient(to bottom, rgba(245,244,242,0) 60%, rgba(245,244,242,0.55) 84%, #F5F4F2 100%), ` +
    `linear-gradient(90deg, rgba(40,20,15,0.82) 0%, rgba(40,20,15,0.42) 52%, rgba(40,20,15,0.12) 100%), ` +
    `url(${heroBanner}), ` +
    `linear-gradient(115deg, #2a1610 0%, #8f3018 48%, #E98300 100%)`,
  backgroundSize: 'cover, cover, cover, cover',
  backgroundPosition: 'center, center, top center, center',
}

const TRANSPORT_COST: Record<string, number> = { walk: 0, bike: 0, tram: 58, car: 300 }
const cold = (a: Area) => Math.round((a.rent_eur_sqm ?? 0) * 50)
const totalCost = (a: Area, transport: string) => cold(a) + 125 + (TRANSPORT_COST[transport] ?? 0) // rent + utilities + commute

function personal(a: Area, picks: string[]) {
  const base = a.match_score ?? a.life_value_score ?? 0
  if (!picks.length) return Math.round(base)
  const bonus = (picks.reduce((s, p) => s + (((a[LIFEMAP[p]] as number | null) ?? 50) - 50), 0) / picks.length) * 0.35
  return Math.round(Math.max(0, Math.min(100, base + bonus)))
}

function insights(a: Area, budget: number, transport: string) {
  const out: { icon: string; text: string }[] = []
  out.push(
    totalCost(a, transport) <= budget
      ? { icon: 'check_circle', text: 'Perfectly within your budget' }
      : { icon: 'account_balance_wallet', text: 'Slightly above your budget' },
  )
  // commute insight reflects the chosen transport mode
  if (transport === 'car') out.push({ icon: 'directions_car', text: 'Easy road & parking access' })
  else if (transport === 'walk' || transport === 'bike')
    out.push(
      (a.fifteen_min_score ?? 0) >= 60
        ? { icon: 'directions_walk', text: 'Highly walkable & bike-friendly' }
        : { icon: 'directions_walk', text: 'Some walking distances' },
    )
  else
    out.push(
      (a.transit_score ?? 0) >= 65
        ? { icon: 'tram', text: 'Excellent tram network coverage' }
        : { icon: 'directions_bus', text: 'Modest transit coverage' },
    )
  out.push(
    (a.green_score ?? 0) >= 55
      ? { icon: 'park', text: 'High density of green spaces' }
      : { icon: 'apartment', text: 'Compact, built-up surroundings' },
  )
  out.push(
    (a.future_value_score ?? 0) >= 55
      ? { icon: 'trending_up', text: 'Projected future value growth' }
      : { icon: 'trending_flat', text: 'Stable long-term value' },
  )
  return out
}

export default function Home() {
  const nav = useNavigate()
  const [profile, setProfile] = useState('General')
  const [budget, setBudget] = useState(800)
  const [transport, setTransport] = useState('walk')
  const [picks, setPicks] = useState<string[]>(['Affordable', 'Night Transit'])
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load(p = profile) {
    setLoading(true)
    setError(null)
    try {
      setAreas(await api.areas(p.toLowerCase()))
    } catch {
      setError('Could not reach the API — is the backend running on :8000?')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    load('General')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const ranked = useMemo(
    () =>
      areas
        .filter((a) => a.rent_eur_sqm != null && a.life_value_score != null)
        .filter((a) => totalCost(a, transport) <= budget)
        .map((a) => ({ a, score: personal(a, picks) }))
        .sort((p, q) => q.score - p.score),
    [areas, budget, picks, transport],
  )
  const top = ranked[0]
  const alts = ranked.slice(1, 4)
  const toggle = (v: string) => setPicks((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]))

  return (
    <div className="bg-page pb-12 min-h-full">
      {/* HERO */}
      <div className="relative h-[28rem]" style={HERO_BG}>
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-6xl mx-auto w-full px-6 lg:px-8">
            <h1 className="text-4xl lg:text-5xl font-headline font-black text-white leading-[1.1] max-w-2xl">
              Where should you <span className="text-brick italic">live</span> in Magdeburg?
            </h1>
            <p className="text-white/80 mt-3 max-w-md">
              Discover the perfect neighborhood tailored to your budget, commute, and lifestyle goals.
            </p>
          </div>
        </div>
      </div>

      {/* CONTENT (overlaps hero) */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Personalize */}
          <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-line p-6 space-y-6 self-start">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-petrol">tune</span>
              <h3 className="font-headline font-bold text-ink">Personalize Your Search</h3>
            </div>

            <Field label="I am looking as a:">
              <div className="flex flex-wrap gap-2">
                {PROFILES.map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setProfile(p)
                      load(p)
                    }}
                    className={`px-3.5 py-1.5 rounded-full border text-sm transition-colors ${
                      profile === p ? 'border-petrol bg-petrol text-white' : 'border-line text-muted hover:border-petrol hover:text-petrol'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Monthly Budget" right={<span className="text-xl font-headline font-bold text-petrol">€{budget}</span>}>
              <input type="range" min={300} max={1500} step={10} value={budget} onChange={(e) => setBudget(+e.target.value)} className="w-full accent-brick" />
              <div className="flex justify-between text-[11px] text-muted mt-1">
                <span>MIN. €300</span>
                <span>MAX. €1500+</span>
              </div>
            </Field>

            <Field label="Primary Transport">
              <div className="grid grid-cols-4 gap-2">
                {TRANSPORT.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTransport(t.key)}
                    className={`flex flex-col items-center justify-center py-2.5 rounded-lg border transition-colors ${
                      transport === t.key ? 'border-petrol bg-petrol/5 text-petrol' : 'border-line text-muted hover:border-petrol'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">{t.icon}</span>
                    <span className="text-[10px] font-bold mt-0.5 uppercase tracking-wider">{t.label}</span>
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Lifestyle Must-Haves">
              <div className="flex flex-wrap gap-2">
                {LIFESTYLE.map((l) => {
                  const on = picks.includes(l)
                  return (
                    <button
                      key={l}
                      onClick={() => toggle(l)}
                      className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${
                        on ? 'border-sun text-sun bg-sun/10 font-medium' : 'border-line text-muted hover:border-sun'
                      }`}
                    >
                      {l}
                    </button>
                  )
                })}
              </div>
            </Field>

            <button onClick={() => load()} className="w-full bg-brick text-white py-3.5 rounded-xl font-headline font-bold hover:bg-terracotta transition-colors shadow-sm">
              Find My Best Areas
            </button>
          </div>

          {/* Results */}
          <div className="lg:col-span-8 space-y-6">
            {error && <div className="bg-white border border-brick/40 text-brick rounded-2xl p-6">{error}</div>}
            {loading && <div className="bg-white border border-line rounded-2xl p-12 text-center text-muted">Loading districts…</div>}

            {!loading && top && (
              <>
                <div className="bg-white rounded-2xl shadow-sm border border-line p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-sun uppercase tracking-wider mb-1">
                        <span className="material-symbols-outlined text-sm">star</span>
                        Best match for you
                      </div>
                      <h2 className="text-3xl font-headline font-black text-ink">{top.a.area_name}</h2>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(top.a.best_for || ['balanced']).map((b) => (
                          <span key={b} className="px-2 py-1 bg-page text-muted text-xs font-label rounded capitalize">{b}</span>
                        ))}
                      </div>
                    </div>
                    <Ring value={top.score} />
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-5">
                    <Tile label="Estimated Rent" value={`€${cold(top.a)}`} unit="/mo" />
                    <Tile label="Total Cost of Life" value={`€${totalCost(top.a, transport)}`} unit="/mo" />
                    <Tile label="Transit Score" value={`${top.a.transit_score ?? '—'}`} unit="/100" accent />
                  </div>

                  <div className="text-[11px] font-bold text-muted uppercase tracking-wider mt-6 mb-2">Key Insights</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                    {insights(top.a, budget, transport).map((ins, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-body">
                        <span className="material-symbols-outlined text-petrol text-base">{ins.icon}</span>
                        {ins.text}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => nav(`/compare?a=${top.a.area_id}`)}
                    className="mt-5 text-sm font-bold text-petrol hover:underline flex items-center gap-1"
                  >
                    Full district analysis <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-headline font-bold text-ink">Strong Alternatives</h3>
                    <button onClick={() => nav('/compare')} className="text-sm text-petrol font-bold hover:underline">View All Comparisons</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {alts.map(({ a, score }) => (
                      <button
                        key={a.area_id}
                        onClick={() => nav(`/compare?a=${a.area_id}`)}
                        className="text-left bg-white rounded-xl shadow-sm border border-line p-4 hover:border-petrol/50 transition-colors flex flex-col"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-headline font-bold text-body">{a.area_name}</h4>
                          <span className="text-petrol font-bold text-sm">{score}%</span>
                        </div>
                        <p className="text-xs text-muted flex-1">{DESC[a.area_name] || 'A characterful Magdeburg district.'}</p>
                        <div className="mt-3 text-[11px] font-bold text-muted uppercase tracking-wider">Est. Rent €{cold(a)}/mo</div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {!loading && !top && !error && (
              <div className="bg-white border border-line rounded-2xl p-12 text-center text-muted">
                No districts within €{budget}. Raise the budget to see matches.
              </div>
            )}
          </div>
        </div>

        {/* Behind the recommendation */}
        <div className="mt-10">
          <BehindCards label="behind the recommendation" icon="tune">
            <InfoCard
              watermark="dataset"
              big="40"
              bigUnit=" districts"
              source="Mietspiegel 2024 · OpenStreetMap · KISS-MD"
              details="Affordability is the Mietspiegel 2024 net cold rent; transit, 15-minute access, green space and healthcare come from ~2,000 OpenStreetMap amenities & stops; future value from the 2012–2026 rent trend. Each metric is normalized 0–100 across all districts."
            >
              Every district is scored from <b className="text-sun">open data</b> across six dimensions —{' '}
              <b className="text-sun">affordability, transit, 15-min access, green, healthcare</b> and{' '}
              <b className="text-sun">future value</b>.
            </InfoCard>
            <InfoCard
              watermark="calculate"
              source="Profile weights + lifestyle bonus, budget-filtered"
              details="Your profile sets the weight vector (e.g. Family favours healthcare, green & schools). Each lifestyle chip you pick adds a bonus toward that dimension. Your budget + commute mode then filter out districts whose total cost (rent + utilities + transport) exceeds it — the top card is the highest-scoring district that fits."
            >
              <div className="text-4xl font-headline font-black text-sun mb-2">Match Score</div>
              We start from your <b className="text-sun">profile's</b> weighted Life Value Score, add a{' '}
              <b className="text-sun">bonus</b> for your lifestyle must-haves, then keep only districts within your{' '}
              <b className="text-sun">budget</b> &amp; commute cost.
            </InfoCard>
          </BehindCards>
        </div>

        {/* footer */}
        <div className="mt-10 pt-6 border-t border-line flex flex-wrap justify-between gap-2 text-xs text-muted">
          <span>© 2026 Magdeburg Smart Living Navigator</span>
          <span className="flex gap-4">
            <a className="hover:text-petrol" href="#">Privacy</a>
            <a className="hover:text-petrol" href="#">Terms</a>
            <a className="hover:text-petrol" href="https://github.com/SmartCityMagdeburg2026/Datasources">Data Source</a>
          </span>
        </div>
      </div>
    </div>
  )
}

function Field({ label, right, children }: { label: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <label className="text-[11px] font-bold text-muted uppercase tracking-wider">{label}</label>
        {right}
      </div>
      {children}
    </div>
  )
}

function Tile({ label, value, unit, accent }: { label: string; value: string; unit?: string; accent?: boolean }) {
  return (
    <div className={`p-3 rounded-xl ${accent ? 'bg-petrol/10 border border-petrol/20' : 'bg-page'}`}>
      <div className={`text-[10px] mb-1 font-bold uppercase tracking-wider ${accent ? 'text-petrol' : 'text-muted'}`}>{label}</div>
      <div className={`text-lg font-headline font-bold ${accent ? 'text-petrol' : 'text-ink'}`}>
        {value}
        {unit && <span className="text-xs text-muted font-body">{unit}</span>}
      </div>
    </div>
  )
}

function Ring({ value }: { value: number }) {
  const dash = `${Math.max(0, Math.min(100, value))}, 100`
  return (
    <div className="relative w-20 h-20 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E8E8E8" strokeWidth="3" />
        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#006080" strokeWidth="3" strokeDasharray={dash} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-headline font-bold text-petrol leading-none">{value}%</span>
        <span className="text-[9px] text-muted uppercase tracking-wider">Match</span>
      </div>
    </div>
  )
}
