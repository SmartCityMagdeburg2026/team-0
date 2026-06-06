import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAreas, Loading } from '../lib/ui'
import { BehindCards, InfoCard } from '../components/InfoCards'

const UTIL_PER_SQM = 2.5
const TICKET: Record<string, number> = { walk: 0, bike: 15, tram: 63, car: 300 }
const COMMUTE = [
  { key: 'walk', icon: 'directions_walk' },
  { key: 'bike', icon: 'pedal_bike' },
  { key: 'tram', icon: 'tram' },
  { key: 'car', icon: 'directions_car' },
]

/** Split a translated string on <b>...</b> tags into React nodes. */
function boldSplit(str: string): React.ReactNode[] {
  return str.split('<b>').reduce<React.ReactNode[]>((acc, part, i) => {
    if (i === 0) return [part]
    const [bold, rest] = part.split('</b>')
    return [...acc, <b key={i} className="text-sun">{bold}</b>, rest]
  }, [])
}

export default function Hidden() {
  const { t } = useTranslation()
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
  const modeLabel = t(`commute.${mode}`)
  const transportSub = t(`pages.hidden.transportSub.${mode}`)

  const insightKey = diff >= 0 ? 'pages.hidden.insight.above' : 'pages.hidden.insight.below'
  const insightStr = t(insightKey, { eur: Math.abs(diff), name: a.area_name })

  return (
    <div className="space-y-8">
      <Header />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT — parameters */}
        <div className="bg-white rounded-2xl border border-line shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-petrol">tune</span>
            <h3 className="font-headline font-bold text-ink text-lg">{t('pages.hidden.params.title')}</h3>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-muted uppercase tracking-wider">{t('common.targetDistrict')}</label>
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
              <label className="text-[11px] font-bold text-muted uppercase tracking-wider">{t('common.apartmentSize')}</label>
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
            <label className="text-[11px] font-bold text-muted uppercase tracking-wider">{t('pages.hidden.params.primaryCommute')}</label>
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
                  {t(`commute.${c.key}`)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — total */}
        <div className="bg-white rounded-2xl border border-line shadow-sm p-6 space-y-6">
          <div>
            <div className="text-[11px] font-bold text-muted uppercase tracking-wider mb-1">{t('pages.hidden.total.label')}</div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="text-5xl font-headline font-black text-ink">
                €{total}
                <span className="text-xl text-muted font-body"> {t('pages.hidden.total.perMonth')}</span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                  diff >= 0 ? 'bg-sun/15 text-sun' : 'bg-petrol/10 text-petrol'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{diff >= 0 ? 'trending_up' : 'trending_down'}</span>
                {diff >= 0 ? '+' : ''}€{diff} {t('pages.hidden.total.vsCityAvg')}
              </span>
            </div>
          </div>

          {/* Cost structure */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted font-bold uppercase tracking-wider">{t('pages.hidden.costStructure.label')}</span>
              <span className="text-muted">{t('pages.hidden.costStructure.hundred')}</span>
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
            <Line c="#D6492A" label={t('pages.hidden.lineItems.coldRent')} amount={rent} sub={`${sqm} €/m²`} />
            <Line c="#D8D2CC" label={t('pages.hidden.lineItems.utilitiesHeating')} amount={utilities} sub="2.5 €/m²" />
            <Line c="#006080" label={t('pages.hidden.lineItems.transport', { mode: modeLabel })} amount={transport} sub={transportSub} />
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
          <h4 className="font-headline font-bold text-lg">{t('pages.hidden.insight.title')}</h4>
        </div>
        <p className="text-sm text-white/90 leading-relaxed relative">
          {boldSplit(insightStr)}
        </p>
      </div>

      <BehindCards label={t('pages.hidden.behind.label')} icon="payments">
        <InfoCard
          watermark="dataset"
          big={t('pages.hidden.behind.card1Big')}
          bigUnit={t('pages.hidden.behind.card1BigUnit')}
          source={t('pages.hidden.behind.card1Source')}
          details={t('pages.hidden.behind.card1Details')}
        >
          {boldSplit(t('pages.hidden.behind.card1Body'))}
        </InfoCard>
        <InfoCard
          watermark="calculate"
          source={t('pages.hidden.behind.card2Source')}
          details={t('pages.hidden.behind.card2Details')}
        >
          <div className="text-4xl font-headline font-black text-sun mb-2">{t('pages.hidden.behind.card2BigLabel')}</div>
          {boldSplit(t('pages.hidden.behind.card2Body'))}
        </InfoCard>
      </BehindCards>
    </div>
  )
}

function Header() {
  const { t } = useTranslation()
  return (
    <div>
      <h1 className="text-4xl font-headline font-black text-ink leading-tight">
        {t('pages.hidden.title1')}{' '}
        <span className="text-brick underline decoration-2 underline-offset-2">{t('pages.hidden.title2')}</span>
      </h1>
      <p className="text-muted mt-2 max-w-2xl">{t('pages.hidden.subtitle')}</p>
    </div>
  )
}

function Line({ c, label, amount, sub }: { c: string; label: string; amount: number; sub: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-t border-line">
      <span className="flex items-center gap-2.5">
        <span className="w-3 h-3 rounded-full" style={{ background: c }} />
        <span className="text-body">{label}</span>
      </span>
      <div className="text-right">
        <div className="font-headline font-bold text-body">€{amount}</div>
        <div className="text-xs text-muted">{sub}</div>
      </div>
    </div>
  )
}
