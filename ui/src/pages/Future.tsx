import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ComposedChart, Area as AreaShape, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'
import { useNavigate } from 'react-router-dom'
import type { Area } from '../lib/api'
import { useAreas, Loading } from '../lib/ui'
import { BehindCards, InfoCard } from '../components/InfoCards'

function median(xs: number[]) {
  if (!xs.length) return 0
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

const PANEL_NAMES = ['Stadtfeld Ost', 'Altstadt', 'Sudenburg', 'Neu Olvenstedt', 'Brückfeld']

export default function Future() {
  const nav = useNavigate()
  const { t } = useTranslation()
  const { areas, loading, error } = useAreas()
  const [id, setId] = useState('buckau')
  if (loading || error)
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-headline font-bold text-ink">{t('pages.future.title')}</h1>
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
  for (let tick = ymin; tick <= ymax + 1e-6; tick += 0.5) yticks.push(+tick.toFixed(1))

  const growth = Math.round(a.rent_growth_pct ?? 0)
  const riskKey: 'high' | 'moderate' | 'low' =
    growth >= 50 ? 'high' : growth >= 25 ? 'moderate' : 'low'
  const riskColor = growth >= 50 ? '#E98300' : growth >= 25 ? '#E98300' : '#006080'

  function recommend(area: Area, mr: number) {
    const g = area.rent_growth_pct ?? 0
    const rent = area.rent_eur_sqm ?? 0
    if (g >= 55 && rent <= mr * 1.05) return t('pages.future.recommend.moveEarly')
    if (rent >= mr * 1.15) return t('pages.future.recommend.premium')
    if (g < 20) return t('pages.future.recommend.stable')
    return t('pages.future.recommend.solid')
  }

  function classify(area: Area, mr: number) {
    const g = area.rent_growth_pct ?? 0
    const rent = area.rent_eur_sqm ?? 0
    if (g >= 70) return { key: 'watch' as const, icon: 'schedule', cls: 'bg-sun/15 text-sun' }
    if (g >= 50 && rent <= mr * 1.05) return { key: 'move' as const, icon: 'rocket_launch', cls: 'bg-petrol text-white' }
    if (rent >= mr * 1.15) return { key: 'premium' as const, icon: 'star', cls: 'bg-purple-100 text-purple-700' }
    if (rent <= mr * 0.9) return { key: 'budget' as const, icon: 'savings', cls: 'bg-gray-100 text-muted' }
    return { key: 'stable' as const, icon: 'check_circle', cls: 'bg-petrol/10 text-petrol' }
  }

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
          <h1 className="text-3xl font-headline font-bold text-ink">{t('pages.future.title')}</h1>
          <p className="text-muted mt-1">{t('pages.future.subtitle')}</p>
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
              <h3 className="font-headline font-bold text-ink text-lg">{t('pages.future.chartTitle')}</h3>
              <p className="text-xs text-muted">{t('pages.future.chartSubtitle', { area: a.area_name })}</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-xs bg-page text-muted rounded-full px-2.5 py-1">
                <span className="material-symbols-outlined text-sm text-petrol">show_chart</span>
                {t('pages.future.badge')}
              </span>
              <div className="flex items-center gap-3 text-[11px] text-muted mt-1 justify-end">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full border-2 border-petrol" />{t('pages.future.legend.historical')}</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full border-2 border-sun" />{t('pages.future.legend.projected')}</span>
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
                <Tooltip
                  formatter={(v: unknown) => [`€${v}/m²`, t('pages.future.tooltip.rent')]}
                  labelFormatter={(l) => t('pages.future.tooltip.year', { year: l })}
                />
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
          <Metric icon="euro" label={t('pages.future.stats.currentRent')} value={`€${a.rent_eur_sqm ?? '—'} `} unit={t('pages.future.stats.currentUnit')} />
          <Metric icon="trending_up" label={t('pages.future.stats.growth')} value={`+${growth}%`} unit={t('pages.future.stats.growthSince')} />
          <div className="bg-white rounded-xl border border-line shadow-sm p-4 flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg grid place-items-center" style={{ background: 'rgba(233,131,0,0.12)' }}>
              <span className="material-symbols-outlined" style={{ color: riskColor }}>warning</span>
            </span>
            <div>
              <div className="text-[11px] font-bold text-muted uppercase tracking-wider">{t('pages.future.stats.risk')}</div>
              <div className="text-xl font-headline font-bold text-ink">{t(`pages.future.riskLevel.${riskKey}`)}</div>
            </div>
          </div>
          <div className="bg-petrol text-white rounded-xl p-4 relative overflow-hidden">
            <span className="material-symbols-outlined absolute right-2 bottom-0 text-white/15" style={{ fontSize: 64 }}>smart_toy</span>
            <div className="text-[10px] font-bold uppercase tracking-wider text-white/70 relative">{t('pages.future.stats.recommendation')}</div>
            <div className="font-headline font-bold text-lg relative">{rec}</div>
          </div>
        </div>
      </div>

      {/* District comparison panel */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-headline font-bold text-ink text-lg">{t('pages.future.comparison.title')}</h3>
          <button onClick={() => nav('/matrix')} className="text-sm text-petrol font-bold hover:underline">
            {t('pages.future.comparison.viewMatrix')}
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
                  {t(`pages.future.status.${st.key}`)}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <p className="text-xs text-muted flex items-center gap-1.5">
        <span className="material-symbols-outlined text-sm">info</span>
        {t('pages.future.disclaimer')}
      </p>

      <BehindCards label={t('pages.future.behind.label')} icon="trending_up">
        <InfoCard
          watermark="dataset"
          big={t('pages.future.behind.card1Big')}
          bigUnit={t('pages.future.behind.card1BigUnit')}
          source={t('pages.future.behind.card1Source')}
          details={t('pages.future.behind.card1Details')}
        >
          {t('pages.future.behind.card1Body')}
        </InfoCard>
        <InfoCard
          watermark="calculate"
          source={t('pages.future.behind.card2Source')}
          details={t('pages.future.behind.card2Details')}
        >
          <div className="text-4xl font-headline font-black text-sun mb-2">{t('pages.future.behind.card2GrowthRisk')}</div>
          {t('pages.future.behind.card2Body')}
        </InfoCard>
      </BehindCards>
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
