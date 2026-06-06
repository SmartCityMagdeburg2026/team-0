import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api, type Area } from '../lib/api'
import heroBanner from '../assets/hero_banner.jpg'
import { BehindCards, InfoCard } from '../components/InfoCards'

const PROFILES = ['General', 'Student', 'Professional', 'Family', 'Senior']
const TRANSPORT = [
  { key: 'walk', icon: 'directions_walk' },
  { key: 'bike', icon: 'pedal_bike' },
  { key: 'tram', icon: 'tram' },
  { key: 'car', icon: 'directions_car' },
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

const HERO_BG = {
  backgroundImage:
    `linear-gradient(to bottom, rgba(245,244,242,0) 60%, rgba(245,244,242,0.55) 84%, #F5F4F2 100%), ` +
    `linear-gradient(90deg, rgba(40,20,15,0.82) 0%, rgba(40,20,15,0.42) 52%, rgba(40,20,15,0.12) 100%), ` +
    `url(${heroBanner}), ` +
    `linear-gradient(115deg, #2a1610 0%, #8f3018 48%, #E98300 100%)`,
  backgroundSize: 'cover, cover, cover, cover',
  backgroundPosition: 'center, center, top center, center',
}

const TRANSPORT_COST: Record<string, number> = { walk: 0, bike: 15, tram: 63, car: 300 }
const cold = (a: Area) => Math.round((a.rent_eur_sqm ?? 0) * 50)
const totalCost = (a: Area, transport: string) => cold(a) + 125 + (TRANSPORT_COST[transport] ?? 0) // rent + utilities + commute

function personal(a: Area, picks: string[]) {
  const base = a.match_score ?? a.life_value_score ?? 0
  if (!picks.length) return Math.round(base)
  const bonus = (picks.reduce((s, p) => s + (((a[LIFEMAP[p]] as number | null) ?? 50) - 50), 0) / picks.length) * 0.35
  return Math.round(Math.max(0, Math.min(100, base + bonus)))
}

function insights(a: Area, budget: number, transport: string, t: (key: string) => string) {
  const out: { icon: string; text: string }[] = []
  out.push(
    totalCost(a, transport) <= budget
      ? { icon: 'check_circle', text: t('pages.home.insights.withinBudget') }
      : { icon: 'account_balance_wallet', text: t('pages.home.insights.overBudget') },
  )
  if (transport === 'car') out.push({ icon: 'directions_car', text: t('pages.home.insights.carAccess') })
  else if (transport === 'walk' || transport === 'bike')
    out.push(
      (a.fifteen_min_score ?? 0) >= 60
        ? { icon: 'directions_walk', text: t('pages.home.insights.walkable') }
        : { icon: 'directions_walk', text: t('pages.home.insights.someWalking') },
    )
  else
    out.push(
      (a.transit_score ?? 0) >= 65
        ? { icon: 'tram', text: t('pages.home.insights.excellentTram') }
        : { icon: 'directions_bus', text: t('pages.home.insights.modestTransit') },
    )
  out.push(
    (a.green_score ?? 0) >= 55
      ? { icon: 'park', text: t('pages.home.insights.greenHigh') }
      : { icon: 'apartment', text: t('pages.home.insights.greenLow') },
  )
  out.push(
    (a.future_value_score ?? 0) >= 55
      ? { icon: 'trending_up', text: t('pages.home.insights.futureGrowth') }
      : { icon: 'trending_flat', text: t('pages.home.insights.futureStable') },
  )
  return out
}

export default function Home() {
  const nav = useNavigate()
  const { t } = useTranslation()
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
      setError(t('pages.home.error.api'))
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
              {t('pages.home.hero.heading').split('<1>')[0]}
              <span className="text-brick italic">{t('pages.home.hero.heading').split('<1>')[1]?.split('</1>')[0]}</span>
              {t('pages.home.hero.heading').split('</1>')[1]}
            </h1>
            <p className="text-white/80 mt-3 max-w-md">
              {t('pages.home.hero.sub')}
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
              <h3 className="font-headline font-bold text-ink">{t('pages.home.controls.heading')}</h3>
            </div>

            <Field label={t('pages.home.controls.profileLabel')}>
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
                    {t(`pages.home.profiles.${p}`)}
                  </button>
                ))}
              </div>
            </Field>

            <Field label={t('pages.home.controls.budgetLabel')} right={<span className="text-xl font-headline font-bold text-petrol">€{budget}</span>}>
              <input type="range" min={300} max={1500} step={10} value={budget} onChange={(e) => setBudget(+e.target.value)} className="w-full accent-brick" />
              <div className="flex justify-between text-[11px] text-muted mt-1">
                <span>{t('pages.home.controls.budgetMin')}</span>
                <span>{t('pages.home.controls.budgetMax')}</span>
              </div>
            </Field>

            <Field label={t('pages.home.controls.transportLabel')}>
              <div className="grid grid-cols-4 gap-2">
                {TRANSPORT.map((tr) => (
                  <button
                    key={tr.key}
                    onClick={() => setTransport(tr.key)}
                    className={`flex flex-col items-center justify-center py-2.5 rounded-lg border transition-colors ${
                      transport === tr.key ? 'border-petrol bg-petrol/5 text-petrol' : 'border-line text-muted hover:border-petrol'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">{tr.icon}</span>
                    <span className="text-[10px] font-bold mt-0.5 uppercase tracking-wider">{t(`commute.${tr.key}`)}</span>
                  </button>
                ))}
              </div>
            </Field>

            <Field label={t('pages.home.controls.lifestyleLabel')}>
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
                      {t(`pages.home.lifestyle.${l}`)}
                    </button>
                  )
                })}
              </div>
            </Field>

            <button onClick={() => load()} className="w-full bg-brick text-white py-3.5 rounded-xl font-headline font-bold hover:bg-terracotta transition-colors shadow-sm">
              {t('pages.home.controls.cta')}
            </button>
          </div>

          {/* Results */}
          <div className="lg:col-span-8 space-y-6">
            {error && <div className="bg-white border border-brick/40 text-brick rounded-2xl p-6">{error}</div>}
            {loading && <div className="bg-white border border-line rounded-2xl p-12 text-center text-muted">{t('common.loading')}</div>}

            {!loading && top && (
              <>
                <div className="bg-white rounded-2xl shadow-sm border border-line p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-sun uppercase tracking-wider mb-1">
                        <span className="material-symbols-outlined text-sm">star</span>
                        {t('pages.home.results.bestMatchLabel')}
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
                    <Tile label={t('pages.home.results.tileRent')} value={`€${cold(top.a)}`} unit="/mo" />
                    <Tile label={t('pages.home.results.tileCost')} value={`€${totalCost(top.a, transport)}`} unit="/mo" />
                    <Tile label={t('pages.home.results.tileTransit')} value={`${top.a.transit_score ?? '—'}`} unit="/100" accent />
                  </div>

                  <div className="text-[11px] font-bold text-muted uppercase tracking-wider mt-6 mb-2">{t('pages.home.results.insightsHeading')}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                    {insights(top.a, budget, transport, t).map((ins, i) => (
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
                    {t('pages.home.results.fullAnalysis')} <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-headline font-bold text-ink">{t('pages.home.results.altsHeading')}</h3>
                    <button onClick={() => nav('/compare')} className="text-sm text-petrol font-bold hover:underline">{t('pages.home.results.viewAll')}</button>
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
                        <p className="text-xs text-muted flex-1">
                          {t(`pages.home.districtDesc.${a.area_name}`, { defaultValue: t('pages.home.results.fallbackDesc') })}
                        </p>
                        <div className="mt-3 text-[11px] font-bold text-muted uppercase tracking-wider">
                          {t('pages.home.results.altRent', { amount: cold(a) })}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {!loading && !top && !error && (
              <div className="bg-white border border-line rounded-2xl p-12 text-center text-muted">
                {t('pages.home.results.noMatch', { budget })}
              </div>
            )}
          </div>
        </div>

        {/* Behind the recommendation */}
        <div className="mt-10">
          <BehindCards label={t('pages.home.behind.label')} icon="tune">
            <InfoCard
              watermark="dataset"
              big={t('pages.home.behind.card1Big')}
              bigUnit={t('pages.home.behind.card1BigUnit')}
              source={t('pages.home.behind.card1Source')}
              details={t('pages.home.behind.card1Details')}
            >
              {t('pages.home.behind.card1Body').split('<b>').reduce<React.ReactNode[]>((acc, part, i) => {
                if (i === 0) return [part]
                const [bold, rest] = part.split('</b>')
                return [...acc, <b key={i} className="text-sun">{bold}</b>, rest]
              }, [])}
            </InfoCard>
            <InfoCard
              watermark="calculate"
              source={t('pages.home.behind.card2Source')}
              details={t('pages.home.behind.card2Details')}
            >
              <div className="text-4xl font-headline font-black text-sun mb-2">{t('pages.home.behind.card2MatchScore')}</div>
              {t('pages.home.behind.card2Body').split('<b>').reduce<React.ReactNode[]>((acc, part, i) => {
                if (i === 0) return [part]
                const [bold, rest] = part.split('</b>')
                return [...acc, <b key={i} className="text-sun">{bold}</b>, rest]
              }, [])}
            </InfoCard>
          </BehindCards>
        </div>

        {/* footer */}
        <div className="mt-10 pt-6 border-t border-line flex flex-wrap justify-between gap-2 text-xs text-muted">
          <span>{t('pages.home.footer.copyright')}</span>
          <span className="flex gap-4">
            <a className="hover:text-petrol" href="#">{t('pages.home.footer.privacy')}</a>
            <a className="hover:text-petrol" href="#">{t('pages.home.footer.terms')}</a>
            <a className="hover:text-petrol" href="https://github.com/SmartCityMagdeburg2026/Datasources">{t('pages.home.footer.dataSource')}</a>
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
  const { t } = useTranslation()
  const dash = `${Math.max(0, Math.min(100, value))}, 100`
  return (
    <div className="relative w-20 h-20 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E8E8E8" strokeWidth="3" />
        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#006080" strokeWidth="3" strokeDasharray={dash} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-headline font-bold text-petrol leading-none">{value}%</span>
        <span className="text-[9px] text-muted uppercase tracking-wider">{t('pages.home.results.matchLabel')}</span>
      </div>
    </div>
  )
}
