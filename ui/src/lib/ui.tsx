import { useEffect, useState } from 'react'
import { api, type Area } from './api'

export function colorFor(score: number | null): string {
  if (score == null) return '#cccccc'
  if (score >= 66) return '#006080' // petrol — high value
  if (score >= 45) return '#E98300' // orange — balanced
  return '#D6492A' // brick — low / overpriced
}

export function useAreas(profile = 'general') {
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let on = true
    setLoading(true)
    api
      .areas(profile)
      .then((a) => {
        if (on) {
          setAreas(a)
          setError(null)
        }
      })
      .catch(() => on && setError('Could not reach the API — is the backend running on :8000?'))
      .finally(() => on && setLoading(false))
    return () => {
      on = false
    }
  }, [profile])
  return { areas, loading, error }
}

export function PageHeader({ title, desc }: { title: string; desc?: string }) {
  return (
    <div>
      <h1 className="text-3xl font-headline font-bold text-ink">{title}</h1>
      {desc && <p className="text-muted mt-1">{desc}</p>}
    </div>
  )
}

export function Loading({ error }: { error?: string | null }) {
  if (error) return <div className="bg-white border border-brick/40 text-brick rounded-xl p-6">{error}</div>
  return <div className="bg-white border border-line rounded-xl p-12 text-center text-muted">Loading…</div>
}

export function ScoreBar({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className="font-bold text-body">{value ?? '—'}</span>
      </div>
      <div className="h-2 rounded-full bg-line overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value ?? 0}%`, background: colorFor(value) }} />
      </div>
    </div>
  )
}

export function DistrictSelect({
  areas,
  value,
  onChange,
}: {
  areas: Area[]
  value: string
  onChange: (id: string) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-line rounded-lg px-3 py-2 text-sm bg-white text-body"
    >
      {[...areas]
        .sort((a, b) => a.area_name.localeCompare(b.area_name))
        .map((a) => (
          <option key={a.area_id} value={a.area_id}>
            {a.area_name}
          </option>
        ))}
    </select>
  )
}
