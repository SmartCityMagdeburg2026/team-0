import { useEffect, useState } from 'react'
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

const CARDS = [
  {
    title: '5-Minute Walk', sub: 'Immediate Vicinity', color: '#D6492A', key: 'r5' as const,
    items: [
      { cat: 'grocery', icon: 'shopping_cart', label: 'Groceries' },
      { cat: 'transit', icon: 'tram', label: 'Transit' },
      { cat: 'healthcare', icon: 'local_hospital', label: 'Health' },
      { cat: 'park', icon: 'park', label: 'Parks' },
    ],
  },
  {
    title: '10-Minute Walk', sub: 'Neighborhood Level', color: '#E98300', key: 'r10' as const,
    items: [
      { cat: 'school', icon: 'school', label: 'School' },
      { cat: 'park', icon: 'park', label: 'Parks' },
      { cat: 'cafe', icon: 'storefront', label: 'Retail' },
      { cat: 'healthcare', icon: 'local_hospital', label: 'Health' },
    ],
  },
  {
    title: '15-Minute Walk', sub: 'District Bound', color: '#006080', key: 'r15' as const,
    items: [
      { cat: 'healthcare', icon: 'local_hospital', label: 'Clinic' },
      { cat: 'university', icon: 'account_balance', label: 'Civic' },
      { cat: 'transit', icon: 'directions_bus', label: 'Transit' },
      { cat: 'gym', icon: 'fitness_center', label: 'Gyms' },
    ],
  },
]
function quality(total: number) {
  if (total >= 12) return 'Optimal'
  if (total >= 6) return 'Excellent'
  if (total >= 3) return 'Good'
  if (total >= 1) return 'Fair'
  return 'Limited'
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

  if (loading || error)
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-headline font-bold text-ink">15-Minute City Radius</h1>
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
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-ink">15-Minute City Radius</h1>
          <p className="text-muted mt-2 max-w-2xl">
            Visualizing walking distances to essential amenities from the district center. A strong 15-minute score
            indicates high walkability and local convenience.
          </p>
        </div>
        <div className="bg-white px-5 py-3 rounded-xl border border-line shadow-sm flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-muted uppercase tracking-wider font-semibold">Overall Walk Score</div>
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
            <h3 className="font-headline font-bold text-ink">Accessibility Map <span className="text-muted font-normal text-sm">· {points.length} amenities</span></h3>
            <div className="flex gap-4 text-xs font-medium text-muted">
              <Legend c="#D6492A" t="5 Min" />
              <Legend c="#E98300" t="10 Min" />
              <Legend c="#006080" t="15 Min" />
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
                    {quality(total)}
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
        Every amenity within the 15-min radius is plotted at its real OpenStreetMap location; pin color = walk band (5 / 10 / 15 min).
      </p>

      <BehindCards label="behind the walk score" icon="directions_walk">
        <InfoCard
          watermark="dataset"
          big="2,059"
          bigUnit=" amenities"
          source="OpenStreetMap (Overpass) · district centroids"
          details="Walking speed ≈ 5 km/h, so 5 min ≈ 400 m, 10 min ≈ 800 m, 15 min ≈ 1200 m. Each POI's straight-line distance from the district centre is binned into those rings; the pins on the map are the real OSM coordinates."
        >
          Walkability comes from ~2,000 <b className="text-sun">amenities &amp; transit stops</b> mapped in{' '}
          <b className="text-sun">OpenStreetMap</b>, counted inside 400 / 800 / 1200 m walk rings around each district
          centre.
        </InfoCard>
        <InfoCard
          watermark="calculate"
          source="Min-max normalized access index"
          details="A district scoring high has many amenities close to its centre relative to the other districts. The radar shows the seven dimensions; the band cards count amenities reachable within each walk ring."
        >
          <div className="text-4xl font-headline font-black text-sun mb-2">Walk Score</div>
          The <b className="text-sun">Overall Walk Score</b> averages seven access dimensions — grocery, pharmacy,
          healthcare, parks, schools, transit and cafés — each <b className="text-sun">normalized 0–100</b> across all
          districts.
        </InfoCard>
      </BehindCards>
    </div>
  )
}

function Legend({ c, t }: { c: string; t: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className="w-3 h-3 rounded-full opacity-80" style={{ background: c }} />
      {t}
    </span>
  )
}
