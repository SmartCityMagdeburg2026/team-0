import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'
import { api, type Area } from '../lib/api'
import scene1 from '../assets/scene1.jpg'
import scene2 from '../assets/scene2.jpg'
import scene3 from '../assets/scene3.jpg'
import scene4 from '../assets/scene4.jpg'
import scene5 from '../assets/scene5.jpg'
import scene6 from '../assets/scene6.jpg'
import scene7 from '../assets/scene7.jpg'

// district -> photo (we only have 7 images; others fall back to a gradient banner)
const DISTRICT_IMG: Record<string, string> = {
  Buckau: scene1,
  'Stadtfeld Ost': scene2,
  Altstadt: scene3,
  Sudenburg: scene4,
  Cracau: scene5,
  Herrenkrug: scene6,
  Werder: scene7,
}
const SCENES = [scene1, scene2, scene3, scene4, scene5, scene6, scene7]
// every district gets a photo: named ones above, the rest reuse a scene (stable per district)
function imgFor(name: string): string {
  if (DISTRICT_IMG[name]) return DISTRICT_IMG[name]
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return SCENES[h % SCENES.length]
}

function colorFor(score: number | null) {
  if (score == null) return '#cccccc'
  if (score >= 66) return '#006080'
  if (score >= 45) return '#E98300'
  return '#D6492A'
}
function rating(score: number | null) {
  if (score == null) return '—'
  if (score >= 85) return 'Exceptional'
  if (score >= 75) return 'Excellent'
  if (score >= 62) return 'High'
  if (score >= 48) return 'Good'
  if (score >= 35) return 'Moderate'
  return 'Low'
}
function ratingColor(score: number | null) {
  if (score == null) return '#585858'
  if (score >= 62) return '#383838'
  if (score >= 48) return '#E98300'
  return '#D6492A'
}

const PROFILES = [
  { key: 'general', label: 'General', icon: 'group' },
  { key: 'student', label: 'Student', icon: 'school' },
  { key: 'professional', label: 'Professional', icon: 'work' },
  { key: 'family', label: 'Family', icon: 'family_restroom' },
  { key: 'senior', label: 'Senior', icon: 'elderly' },
]

const DESCRIPTIONS: Record<string, string> = {
  Buckau:
    'A vibrant, rapidly developing riverside district known for its industrial heritage, cultural spaces, and thriving local arts scene.',
  'Stadtfeld Ost': 'A lively, sought-after district with leafy streets, cafés and strong tram links into the centre.',
  Altstadt: 'The historic old town — cathedral, river promenade and the densest mix of shops and services.',
  Sudenburg: 'A diverse, affordable inner-city district with good amenities and a relaxed everyday feel.',
  Cracau: 'A quiet, green residential area east of the Elbe, popular with families and nature lovers.',
  Herrenkrug: 'Green and riverside — home to the park, racecourse and the Hochschule campus.',
  Werder: 'A small island district by the river: calm, characterful and close to the centre.',
  'Neue Neustadt': 'A densely built, well-connected northern district with everyday amenities close by.',
}

const BREAKDOWN: { key: keyof Area; label: string; icon: string }[] = [
  { key: 'affordability_score', label: 'Affordability', icon: 'savings' },
  { key: 'transit_score', label: 'Transit', icon: 'tram' },
  { key: 'fifteen_min_score', label: '15-Min City', icon: 'timer' },
  { key: 'healthcare_score', label: 'Healthcare', icon: 'health_and_safety' },
  { key: 'green_score', label: 'Green Space', icon: 'park' },
  { key: 'future_value_score', label: 'Future Value', icon: 'trending_up' },
]

function FlyController({ target }: { target: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.flyTo(target, 13, { duration: 0.8 })
  }, [target, map])
  return null
}

export default function MapPage() {
  const nav = useNavigate()
  const geoRef = useRef<any>(null)
  const [geo, setGeo] = useState<any>(null)
  const [byId, setById] = useState<Record<string, Area>>({})
  const [selId, setSelId] = useState<string | null>(null)
  const [budget, setBudget] = useState(800)
  const [profile, setProfile] = useState('general')
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null)
  const [error, setError] = useState<string | null>(null)

  // geojson once
  useEffect(() => {
    api.geojson().then(setGeo).catch(() => setError('Could not reach the API — is the backend running on :8000?'))
  }, [])

  // areas re-fetch when profile changes (personalized match_score)
  useEffect(() => {
    api
      .areas(profile)
      .then((areas) => {
        const map = Object.fromEntries(areas.map((a) => [a.area_id, a]))
        setById(map)
        setSelId((prev) => prev ?? (map['buckau'] ? 'buckau' : (areas[0]?.area_id ?? null)))
      })
      .catch(() => setError('Could not reach the API — is the backend running on :8000?'))
  }, [profile])

  const sel = selId ? byId[selId] : null

  function scoreOf(a: Area | undefined, fallback: number | null) {
    return a?.match_score ?? fallback
  }
  function overBudget(a: Area | undefined) {
    return !!(budget && a?.est_rent_50sqm != null && a.est_rent_50sqm > budget)
  }
  function styleFeature(f: any) {
    const a = byId[f.properties.area_id]
    const over = overBudget(a)
    return {
      color: '#ffffff',
      weight: 1.5,
      fillColor: over ? '#c9c9c9' : colorFor(scoreOf(a, f.properties.life_value_score)),
      fillOpacity: over ? 0.3 : 0.82,
    }
  }

  // restyle live when budget / data / profile change (no remount)
  useEffect(() => {
    if (geoRef.current) geoRef.current.setStyle(styleFeature)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budget, byId, profile])

  const suggestions = search.trim()
    ? Object.values(byId)
        .filter((a) => a.area_name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => a.area_name.localeCompare(b.area_name))
        .slice(0, 6)
    : []

  function selectAndFly(a: Area) {
    setSelId(a.area_id)
    setFlyTarget([a.centroid[1], a.centroid[0]])
    setSearch('')
  }

  const activeProfile = PROFILES.find((p) => p.key === profile)!

  if (error)
    return (
      <div className="h-full grid place-items-center p-8">
        <div className="bg-white border border-brick/40 text-brick rounded-xl p-6">{error}</div>
      </div>
    )

  return (
    <div className="flex h-full">
      {/* MAP */}
      <div className="relative flex-1">
        {geo && (
          <MapContainer center={[52.13, 11.62]} zoom={12} zoomControl={false} style={{ height: '100%', width: '100%', background: '#F5F4F2' }}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution="&copy; OpenStreetMap &copy; CARTO"
              subdomains="abcd"
            />
            <GeoJSON
              ref={geoRef}
              data={geo}
              style={styleFeature as any}
              onEachFeature={(f: any, layer: any) => {
                layer.bindTooltip(f.properties.area_name, { permanent: true, direction: 'center', className: 'district-label' })
                layer.on('click', () => setSelId(f.properties.area_id))
                layer.on('mouseover', () => layer.setStyle({ weight: 3 }))
                layer.on('mouseout', () => layer.setStyle({ weight: 1.5 }))
              }}
            />
            <FlyController target={flyTarget} />
          </MapContainer>
        )}

        {/* Budget bar + profile */}
        <div className="absolute top-4 left-4 z-[1000] bg-white rounded-full shadow-md border border-line flex items-center gap-3 pl-4 pr-2 py-1.5">
          <span className="material-symbols-outlined text-petrol text-base">payments</span>
          <span className="text-sm text-muted">Budget:</span>
          <input type="range" min={300} max={1500} step={10} value={budget} onChange={(e) => setBudget(+e.target.value)} className="w-28 accent-brick" />
          <span className="text-sm font-bold text-petrol w-12 text-right">€{budget}</span>
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-1 pl-1.5 pr-1 py-1 rounded-full hover:bg-page"
            >
              <span className="w-7 h-7 rounded-full bg-brick text-white grid place-items-center">
                <span className="material-symbols-outlined text-base">{activeProfile.icon}</span>
              </span>
              <span className="material-symbols-outlined text-muted text-base">expand_more</span>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-line py-1 z-[1100]">
                <div className="px-3 py-1 text-[10px] font-bold text-muted uppercase tracking-wider">Value for…</div>
                {PROFILES.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => {
                      setProfile(p.key)
                      setMenuOpen(false)
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-page ${
                      profile === p.key ? 'text-petrol font-bold' : 'text-body'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">{p.icon}</span>
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search + suggestions */}
        <div className="absolute top-4 right-4 z-[1000] w-64">
          <div className="bg-white rounded-full shadow-md border border-line flex items-center gap-2 px-4 py-2">
            <span className="material-symbols-outlined text-muted text-base">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && suggestions[0] && selectAndFly(suggestions[0])}
              placeholder="Search districts..."
              className="flex-1 text-sm outline-none bg-transparent"
            />
          </div>
          {suggestions.length > 0 && (
            <div className="mt-2 bg-white rounded-xl shadow-lg border border-line py-1 overflow-hidden">
              {suggestions.map((a) => (
                <button
                  key={a.area_id}
                  onClick={() => selectAndFly(a)}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-page"
                >
                  <span className="text-body">{a.area_name}</span>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: colorFor(a.match_score ?? a.life_value_score) }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-xl shadow-md border border-line p-4 text-xs w-56">
          <div className="font-headline font-bold text-ink mb-2">Living Value Index</div>
          <LegendRow c="#006080" t="High Value" r="80-100" />
          <LegendRow c="#E98300" t="Balanced" r="50-79" />
          <LegendRow c="#D6492A" t="Overpriced / Low" r="< 50" />
          <div className="flex items-center gap-2 py-0.5 mt-1 pt-1 border-t border-line text-muted">
            <span className="w-2.5 h-2.5 rounded-full bg-[#c9c9c9]" />
            <span className="flex-1">Dimmed = above €{budget}</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <aside className="w-[380px] shrink-0 bg-white border-l border-line h-full overflow-y-auto">
        {!sel ? (
          <div className="p-8 text-muted text-sm">Select a district on the map.</div>
        ) : (
          <Detail
            sel={sel}
            over={overBudget(sel)}
            budget={budget}
            onClose={() => setSelId(null)}
            onCompare={() => nav(`/compare?a=${sel.area_id}`)}
          />
        )}
      </aside>
    </div>
  )
}

function Detail({
  sel,
  over,
  budget,
  onClose,
  onCompare,
}: {
  sel: Area
  over: boolean
  budget: number
  onClose: () => void
  onCompare: () => void
}) {
  const desc =
    DESCRIPTIONS[sel.area_name] ||
    'An established Magdeburg district with its own everyday character and access across the city.'
  const img = imgFor(sel.area_name)
  return (
    <div className="flex flex-col min-h-full">
      <div
        className={`relative h-40 flex items-end p-5 ${img ? '' : 'bg-gradient-to-br from-ink via-terracotta to-brick'}`}
        style={img ? { backgroundImage: `linear-gradient(to top, rgba(40,20,15,0.9), rgba(40,20,15,0.2)), url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      >
        {!img && <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(circle at 25% 15%, #ffffff66, transparent 45%)' }} />}
        <button onClick={onClose} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/30 text-white grid place-items-center hover:bg-black/50">
          <span className="material-symbols-outlined text-base">close</span>
        </button>
        <div className="relative">
          <span className="inline-block mb-2 px-2 py-1 rounded bg-black/40 text-white text-[11px] font-label capitalize">
            Best for: {(sel.best_for || ['balanced']).join(', ')}
          </span>
          <h2 className="text-3xl font-headline font-black text-white drop-shadow">{sel.area_name}</h2>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {over && (
          <div className="flex items-center gap-2 text-xs bg-sun/15 text-sun rounded-lg px-3 py-2">
            <span className="material-symbols-outlined text-sm">info</span>
            Above your €{budget}/mo budget (≈ €{sel.est_rent_50sqm}/mo)
          </div>
        )}
        <p className="text-sm text-muted leading-relaxed">{desc}</p>

        <div className="bg-page rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="font-headline font-bold text-ink">Livability Score</div>
            <div className="text-xs text-muted">Based on 6 key civic metrics</div>
          </div>
          <Ring value={sel.life_value_score ?? 0} />
        </div>

        <div className="border-l-4 border-petrol pl-3">
          <div className="text-[11px] font-bold text-muted uppercase tracking-wider">Market average</div>
          <div className="text-lg font-headline font-bold text-ink">
            Est. monthly rent €{sel.est_rent_50sqm ?? '—'}{' '}
            <span className="text-sm text-muted font-body">{sel.rent_eur_sqm ? `(€${sel.rent_eur_sqm}/m²)` : ''}</span>
          </div>
        </div>

        <div>
          <div className="font-headline font-bold text-ink mb-3">District Breakdown</div>
          <div className="space-y-3">
            {BREAKDOWN.map((b) => {
              const v = sel[b.key] as number | null
              return (
                <div key={b.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base" style={{ color: colorFor(v) }}>{b.icon}</span>
                      <span className="text-body">{b.label}</span>
                    </span>
                    <span className="text-xs font-bold" style={{ color: ratingColor(v) }}>{rating(v)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-line overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${v ?? 0}%`, background: colorFor(v) }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-auto p-5">
        <button onClick={onCompare} className="w-full bg-brick text-white py-3 rounded-lg font-headline font-bold hover:bg-terracotta transition-colors flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-base">compare_arrows</span>
          Compare District
        </button>
      </div>
    </div>
  )
}

function LegendRow({ c, t, r }: { c: string; t: string; r: string }) {
  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
      <span className="text-body flex-1">{t}</span>
      <span className="text-muted">{r}</span>
    </div>
  )
}

function Ring({ value }: { value: number }) {
  const dash = `${Math.max(0, Math.min(100, value))}, 100`
  return (
    <div className="relative w-14 h-14 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E8E8E8" strokeWidth="3" />
        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#006080" strokeWidth="3" strokeDasharray={dash} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-lg font-headline font-bold text-petrol">{value}</div>
    </div>
  )
}
