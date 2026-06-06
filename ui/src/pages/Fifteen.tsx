import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MapContainer, TileLayer, Circle, Marker, GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { api, type Area } from '../lib/api'
import { useAreas, Loading, DistrictSelect } from '../lib/ui'
import { BehindCards, InfoCard } from '../components/InfoCards'

type Band = { count: number; nearest_m: number | null; r5?: number; r10?: number; r15?: number }
const amOf = (a: Area, cat: string): Band => (a.amenities?.[cat] as Band) || { count: 0, nearest_m: null }

const CAT_ICON: Record<string, string> = {
  grocery: 'shopping_cart',
  transit: 'tram',
  healthcare: 'local_hospital',
  school: 'school',
  university: 'account_balance',
  park: 'park',
  gym: 'fitness_center',
  cafe: 'storefront',
  pharmacy: 'local_pharmacy',
}

function bandColor(m: number | null) {
  if (m == null) return '#9ca3af'
  if (m <= 400) return '#D6492A'
  if (m <= 800) return '#E98300'
  if (m <= 1200) return '#006080'
  return '#b0a89f'
}

const centerIcon = L.divIcon({
  className: '',
  html: '<div style="width:16px;height:16px;border-radius:50%;background:#542D24;border:3px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,.45)"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})
function pinIcon(color: string, icon: string, label: string) {
  return L.divIcon({
    className: '',
    html: `<div title="${label}" style="width:22px;height:22px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;color:#fff"><span class="material-symbols-outlined" style="font-size:13px">${icon}</span></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  })
}

function quality(total: number, t: (k: string) => string) {
  if (total >= 12) return t('pages.fifteen.quality.optimal')
  if (total >= 6) return t('pages.fifteen.quality.excellent')
  if (total >= 3) return t('pages.fifteen.quality.good')
  if (total >= 1) return t('pages.fifteen.quality.fair')
  return t('pages.fifteen.quality.limited')
}

function Recenter({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap()
  useEffect(() => {
    map.invalidateSize()
    const dLat = 1400 / 111320
    const dLon = 1400 / (111320 * Math.cos((lat * Math.PI) / 180))
    map.fitBounds([[lat - dLat, lon - dLon], [lat + dLat, lon + dLon]])
  }, [lat, lon, map])
  return null
}

type Pt = [string, number, number, number] // [cat, lon, lat, dist_m]

export default function Fifteen() {
  const { t } = useTranslation()
  const { areas, loading, error } = useAreas()
  const [id, setId] = useState('sudenburg')
  const [geo, setGeo] = useState<any>(null)
  const [points, setPoints] = useState<Pt[]>([])

  useEffect(() => {
    api.geojson().then(setGeo).catch(() => {})
  }, [])
  useEffect(() => {
    api.amenityPoints(id).then(setPoints).catch(() => setPoints([]))
  }, [id])

  const CARDS = [
    {
      title: t('pages.fifteen.bands.r5'),
      sub: t('pages.fifteen.bands.r5sub'),
      color: '#D6492A',
      key: 'r5' as const,
      items: [
        { cat: 'grocery', icon: 'shopping_cart', label: t('pages.fifteen.cat.grocery') },
        { cat: 'transit', icon: 'tram', label: t('pages.fifteen.cat.transit') },
        { cat: 'healthcare', icon: 'local_hospital', label: t('pages.fifteen.cat.healthcare') },
        { cat: 'park', icon: 'park', label: t('pages.fifteen.cat.park') },
      ],
    },
    {
      title: t('pages.fifteen.bands.r10'),
      sub: t('pages.fifteen.bands.r10sub'),
      color: '#E98300',
      key: 'r10' as const,
      items: [
        { cat: 'school', icon: 'school', label: t('pages.fifteen.cat.school') },
        { cat: 'park', icon: 'park', label: t('pages.fifteen.cat.park') },
        { cat: 'cafe', icon: 'storefront', label: t('pages.fifteen.cat.retail') },
        { cat: 'healthcare', icon: 'local_hospital', label: t('pages.fifteen.cat.healthcare') },
      ],
    },
    {
      title: t('pages.fifteen.bands.r15'),
      sub: t('pages.fifteen.bands.r15sub'),
      color: '#006080',
      key: 'r15' as const,
      items: [
        { cat: 'healthcare', icon: 'local_hospital', label: t('pages.fifteen.cat.clinic') },
        { cat: 'university', icon: 'account_balance', label: t('pages.fifteen.cat.civic') },
        { cat: 'transit', icon: 'directions_bus', label: t('pages.fifteen.cat.transit') },
        { cat: 'gym', icon: 'fitness_center', label: t('pages.fifteen.cat.gyms') },
      ],
    },
  ]

  if (loading || error)
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-headline font-bold text-ink">{t('pages.fifteen.title')}</h1>
        <Loading error={error} />
      </div>
    )
  const a = areas.find((x) => x.area_id === id) || areas[0]
  const score = a.fifteen_min_score ?? 0
  const lat = a.centroid[1]
  const lon = a.centroid[0]
  const feature = geo?.features?.find((f: any) => f.properties.area_id === a.area_id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-petrol text-base">location_on</span>
            <DistrictSelect areas={areas} value={a.area_id} onChange={setId} />
          </div>
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-ink">{t('pages.fifteen.title')}</h1>
          <p className="text-muted mt-2 max-w-2xl">
            {t('pages.fifteen.subtitle')}
          </p>
        </div>
        <div className="bg-white px-5 py-3 rounded-xl border border-line shadow-sm flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-muted uppercase tracking-wider font-semibold">{t('pages.fifteen.walkScore.label')}</div>
            <div className="text-2xl font-bold text-petrol">{score}<span className="text-sm text-muted font-normal">/100</span></div>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-petrol flex items-center justify-center">
            <span className="material-symbols-outlined text-petrol">directions_walk</span>
          </div>
        </div>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[600px]">
        {/* Map */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-line shadow-sm flex flex-col overflow-hidden lg:h-full">
          <div className="p-4 border-b border-line flex justify-between items-center">
            <h3 className="font-headline font-bold text-ink">{t('pages.fifteen.map.title')} <span className="text-muted font-normal text-sm">· {t('pages.fifteen.map.amenities', { count: points.length })}</span></h3>
            <div className="flex gap-4 text-xs font-medium text-muted">
              <Legend c="#D6492A" label={t('pages.fifteen.legend.min5')} />
              <Legend c="#E98300" label={t('pages.fifteen.legend.min10')} />
              <Legend c="#006080" label={t('pages.fifteen.legend.min15')} />
            </div>
          </div>
          <div className="flex-1 relative min-h-[440px]">
            <MapContainer center={[lat, lon]} zoom={14} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution="&copy; OpenStreetMap &copy; CARTO"
                subdomains="abcd"
              />
              {feature && (
                <GeoJSON key={a.area_id} data={feature} style={{ color: '#006080', weight: 2, fillColor: '#006080', fillOpacity: 0.05, dashArray: '4 4' } as any} />
              )}
              <Circle center={[lat, lon]} radius={1200} pathOptions={{ color: '#006080', weight: 1.5, dashArray: '6 6', fill: false }} />
              <Circle center={[lat, lon]} radius={800} pathOptions={{ color: '#E98300', weight: 1.5, dashArray: '6 6', fill: false }} />
              <Circle center={[lat, lon]} radius={400} pathOptions={{ color: '#D6492A', weight: 1.5, dashArray: '6 6', fill: false }} />
              {points.map((pt, i) => {
                const [cat, plon, plat, m] = pt
                const dist = m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`
                return <Marker key={i} position={[plat, plon]} icon={pinIcon(bandColor(m), CAT_ICON[cat] || 'place', `${cat} · ${dist}`)} />
              })}
              <Marker position={[lat, lon]} icon={centerIcon} />
              <Recenter lat={lat} lon={lon} />
            </MapContainer>
          </div>
        </div>

        {/* Band cards */}
        <div className="flex flex-col gap-6">
          {CARDS.map((card) => {
            const total = card.items.reduce((s, it) => s + ((amOf(a, it.cat)[card.key] as number) ?? 0), 0)
            return (
              <div key={card.title} className="bg-white rounded-2xl border border-line shadow-sm p-5 flex-1 flex flex-col justify-center" style={{ borderLeft: `4px solid ${card.color}` }}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-lg text-ink">{card.title}</h4>
                    <p className="text-xs text-muted">{card.sub}</p>
                  </div>
                  <div className="px-2 py-1 rounded text-xs font-bold" style={{ background: card.color + '1a', color: card.color }}>
                    {quality(total, t)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {card.items.map((it) => {
                    const n = (amOf(a, it.cat)[card.key] as number) ?? 0
                    return (
                      <div key={it.label} className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm" style={{ color: n > 0 ? card.color : '#cfcac3' }}>{it.icon}</span>
                        <span className={`text-sm ${n > 0 ? 'font-medium text-body' : 'text-muted'}`}>{n} {it.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <p className="text-xs text-muted flex items-center gap-1.5">
        <span className="material-symbols-outlined text-sm">info</span>
        {t('pages.fifteen.footnote')}
      </p>

      <BehindCards label={t('pages.fifteen.behind.label')} icon="directions_walk">
        <InfoCard
          watermark="dataset"
          big={t('pages.fifteen.behind.card1.big')}
          bigUnit={t('pages.fifteen.behind.card1.bigUnit')}
          source={t('pages.fifteen.behind.card1.source')}
          details={t('pages.fifteen.behind.card1.details')}
        >
          {t('pages.fifteen.behind.card1.bodyPrefix')}{' '}
          <b className="text-sun">{t('pages.fifteen.behind.card1.bodyAmenities')}</b>{' '}
          {t('pages.fifteen.behind.card1.bodyMid')}{' '}
          <b className="text-sun">{t('pages.fifteen.behind.card1.bodyOsm')}</b>
          {t('pages.fifteen.behind.card1.bodySuffix')}
        </InfoCard>
        <InfoCard
          watermark="calculate"
          source={t('pages.fifteen.behind.card2.source')}
          details={t('pages.fifteen.behind.card2.details')}
        >
          <div className="text-4xl font-headline font-black text-sun mb-2">{t('pages.fifteen.behind.card2.scoreTitle')}</div>
          {t('pages.fifteen.behind.card2.bodyPrefix')}{' '}
          <b className="text-sun">{t('pages.fifteen.behind.card2.bodyOverall')}</b>{' '}
          {t('pages.fifteen.behind.card2.bodyMid')}{' '}
          <b className="text-sun">{t('pages.fifteen.behind.card2.bodyNorm')}</b>{' '}
          {t('pages.fifteen.behind.card2.bodySuffix')}
        </InfoCard>
      </BehindCards>
    </div>
  )
}

function Legend({ c, label }: { c: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className="w-3 h-3 rounded-full opacity-80" style={{ background: c }} />
      {label}
    </span>
  )
}
