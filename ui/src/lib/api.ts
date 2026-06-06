const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export interface Area {
  area_id: string
  area_name: string
  centroid: [number, number]
  area_km2: number
  rent_eur_sqm: number | null
  est_rent_50sqm: number | null
  rent_proj_2026: number | null
  affordability_score: number | null
  transit_score: number | null
  fifteen_min_score: number | null
  grocery_score: number | null
  pharmacy_score: number | null
  healthcare_score: number | null
  education_score: number | null
  park_score: number | null
  green_score: number | null
  lifestyle_score: number | null
  gym_score: number | null
  economic_score: number | null
  future_value_score: number | null
  life_value_score: number | null
  best_for: string[]
  data_confidence: string
  amenities?: Record<string, { count: number; nearest_m: number | null; r5?: number; r10?: number; r15?: number; nearest_lonlat?: [number, number] | null }>
  rent_series?: { year: number; rent: number }[]
  rent_growth_pct?: number | null
  match_score?: number
}

async function getJSON<T>(path: string): Promise<T> {
  const r = await fetch(`${BASE}${path}`)
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.json() as Promise<T>
}

async function postJSON<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.json() as Promise<T>
}

export const api = {
  health: () => getJSON<{ status: string; districts: number }>('/api/health'),
  areas: (profile = 'general') => getJSON<Area[]>(`/api/areas?profile=${profile}`),
  area: (id: string) => getJSON<Area>(`/api/areas/${id}`),
  hiddenCost: (b: { area_id: string; apartment_size: number; transport_mode: string }) =>
    postJSON<{ area: string; rent: number; utilities: number; transport: number; total_monthly_cost: number }>(
      '/api/hidden-cost',
      b,
    ),
  geojson: () => getJSON<any>('/api/geojson'),
  amenityPoints: (id: string) => getJSON<[string, number, number, number][]>(`/api/amenities/${id}`),
  compare: (a: string, b: string) =>
    getJSON<{ area1: Area; area2: Area }>(`/api/compare?area1=${a}&area2=${b}`),
  chat: (message: string) =>
    postJSON<{ parsed: { budget: number | null; profile: string }; reply: string; results: any[] }>('/api/chat', {
      message,
    }),
}
