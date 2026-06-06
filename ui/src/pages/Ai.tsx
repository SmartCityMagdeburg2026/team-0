import { useState } from 'react'
import { api } from '../lib/api'
import { PageHeader } from '../lib/ui'

type Msg = { role: 'user' | 'bot'; text: string; results?: any[] }

const SUGGESTIONS = ['I have €800 and want good transit as a student', 'Best value for a family', 'Quiet & green under €700']

export default function Ai() {
  const [msg, setMsg] = useState('')
  const [log, setLog] = useState<Msg[]>([
    {
      role: 'bot',
      text: 'Tell me your budget, who you are, and what matters — e.g. "I have €800 and want good transit as a student."',
    },
  ])
  const [busy, setBusy] = useState(false)

  async function send(text?: string) {
    const m = (text ?? msg).trim()
    if (!m || busy) return
    setLog((l) => [...l, { role: 'user', text: m }])
    setMsg('')
    setBusy(true)
    try {
      const r = await api.chat(m)
      setLog((l) => [...l, { role: 'bot', text: r.reply, results: r.results }])
    } catch {
      setLog((l) => [...l, { role: 'bot', text: 'Could not reach the API — is the backend running on :8000?' }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="AI Relocation Assistant" desc="Ask in plain language. Rule-based parser today; Claude-ready." />
      <div className="bg-white rounded-xl border border-line shadow-sm p-6 flex flex-col" style={{ minHeight: 460 }}>
        <div className="flex-1 space-y-3 overflow-y-auto">
          {log.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'text-right' : ''}>
              <div
                className={`inline-block px-4 py-2 rounded-2xl text-sm max-w-[80%] ${
                  m.role === 'user' ? 'bg-petrol text-white' : 'bg-page text-body'
                }`}
              >
                {m.text}
              </div>
              {m.results && m.results.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {m.results.slice(0, 3).map((r: any) => (
                    <span key={r.area_id} className="px-3 py-1 rounded-full bg-petrol/10 text-petrol text-xs font-bold">
                      {r.area_name} · {r.match_score}%
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mt-4 mb-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="px-3 py-1 rounded-full border border-line text-xs text-muted hover:border-petrol hover:text-petrol"
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Ask about neighbourhoods, budget, transit…"
            className="flex-1 border border-line rounded-lg px-4 py-2 text-sm"
          />
          <button
            onClick={() => send()}
            disabled={busy}
            className="bg-brick text-white px-5 rounded-lg font-bold disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
