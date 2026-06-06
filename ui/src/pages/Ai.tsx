import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { api, type Area } from '../lib/api'
import { useAreas } from '../lib/ui'
import { BehindCards, InfoCard } from '../components/InfoCards'

function Markdown({ text }: { text: string }) {
  return (
    <div className="text-sm text-body leading-relaxed space-y-2">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="my-1">{children}</p>,
          strong: ({ children }) => <strong className="font-bold text-ink">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          h1: ({ children }) => <h3 className="font-headline font-bold text-ink text-base mt-3 mb-1">{children}</h3>,
          h2: ({ children }) => <h3 className="font-headline font-bold text-ink text-base mt-3 mb-1">{children}</h3>,
          h3: ({ children }) => <h4 className="font-headline font-bold text-ink text-sm mt-2 mb-1">{children}</h4>,
          ul: ({ children }) => <ul className="list-disc pl-5 space-y-0.5 my-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 space-y-0.5 my-1">{children}</ol>,
          li: ({ children }) => <li className="marker:text-petrol">{children}</li>,
          a: ({ children, href }) => (
            <a href={href} className="text-petrol underline" target="_blank" rel="noreferrer">{children}</a>
          ),
          code: ({ children }) => <code className="bg-page rounded px-1 py-0.5 text-[12px] font-mono">{children}</code>,
          hr: () => <hr className="my-2 border-line" />,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-petrol/40 pl-3 text-muted italic">{children}</blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-2">
              <table className="w-full text-xs border border-line rounded-lg overflow-hidden">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-page">{children}</thead>,
          th: ({ children }) => <th className="text-left font-bold text-ink px-2.5 py-1.5 border-b border-line">{children}</th>,
          td: ({ children }) => <td className="px-2.5 py-1.5 border-b border-line align-top">{children}</td>,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  )
}

type Msg = { role: 'user' | 'bot'; text: string; results?: any[]; sources?: string[] }

const SUGGESTIONS = [
  { key: 'value', q: 'Which district is the best value for money?' },
  { key: 'family', q: 'Best area for a family with schools and parks?' },
  { key: 'student', q: 'Where should a student live near the university with good transit under €700?' },
  { key: 'quiet', q: 'Quiet and green areas to live under €700?' },
]

type TFn = (key: string) => string

function prosCons(t: TFn, a?: Area): { pro: string; con: string } {
  if (!a) return { pro: t('pages.ai.pros.overall'), con: t('pages.ai.cons.limitedData') }
  const dims: { k: keyof Area; proKey: string }[] = [
    { k: 'transit_score', proKey: 'pages.ai.pros.transit' },
    { k: 'park_score', proKey: 'pages.ai.pros.park' },
    { k: 'green_score', proKey: 'pages.ai.pros.green' },
    { k: 'fifteen_min_score', proKey: 'pages.ai.pros.walking' },
    { k: 'healthcare_score', proKey: 'pages.ai.pros.healthcare' },
    { k: 'affordability_score', proKey: 'pages.ai.pros.affordable' },
  ]
  let best = dims[0]
  let bestV = -1
  for (const d of dims) {
    const v = (a[d.k] as number) ?? 0
    if (v > bestV) {
      bestV = v
      best = d
    }
  }
  let conKey = 'pages.ai.cons.highDemand'
  if ((a.affordability_score ?? 50) < 45) conKey = 'pages.ai.cons.higherRent'
  else if ((a.transit_score ?? 50) < 50) conKey = 'pages.ai.cons.commute'
  else if ((a.green_score ?? 50) < 40) conKey = 'pages.ai.cons.limitedGreen'
  else if ((a.life_value_score ?? 0) >= 70) conKey = 'pages.ai.cons.highDemand'
  return { pro: t(best.proKey), con: t(conKey) }
}

export default function Ai() {
  const nav = useNavigate()
  const { t } = useTranslation()
  const { areas } = useAreas()
  const byId = Object.fromEntries(areas.map((a) => [a.area_id, a]))
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [log, setLog] = useState<Msg[]>([{ role: 'bot', text: t('pages.ai.welcome') }])

  async function send(text?: string) {
    const m = (text ?? msg).trim()
    if (!m || busy) return
    const history = log.filter((x) => x.text).map((x) => ({ role: x.role === 'user' ? 'user' : 'assistant', content: x.text }))
    setLog((l) => [...l, { role: 'user', text: m }])
    setMsg('')
    setBusy(true)
    try {
      const r = await api.assistant(m, history)
      setLog((l) => [...l, { role: 'bot', text: r.reply, results: r.results, sources: r.sources }])
    } catch {
      setLog((l) => [...l, { role: 'bot', text: t('pages.ai.error.api') }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-bold text-ink">{t('pages.ai.title')}</h1>

      <div className="bg-white rounded-2xl border border-line shadow-sm p-5 flex flex-col" style={{ minHeight: 540 }}>
        <div className="flex-1 space-y-5 overflow-y-auto pr-1">
          {log.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {m.role === 'bot' ? (
                <span className="w-9 h-9 rounded-full bg-petrol text-white grid place-items-center shrink-0">
                  <span className="material-symbols-outlined text-base">smart_toy</span>
                </span>
              ) : (
                <span className="w-9 h-9 rounded-full bg-ink text-white grid place-items-center shrink-0">
                  <span className="material-symbols-outlined text-base">person</span>
                </span>
              )}

              {m.role === 'user' ? (
                <div className="bg-[#FBE7E0] text-body rounded-2xl px-4 py-2.5 text-sm max-w-[80%]">{m.text}</div>
              ) : (
                <div className="bg-page rounded-2xl px-4 py-3 max-w-[88%]">
                  <Markdown text={m.text} />

                  {m.results && m.results.length > 0 && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                        {m.results.slice(0, 3).map((r: any) => {
                          const pc = prosCons(t, byId[r.area_id])
                          return (
                            <div key={r.area_id} className="bg-white border border-line rounded-lg p-3">
                              <div className="flex items-start justify-between gap-1 mb-2">
                                <h4 className="font-headline font-bold text-ink text-sm leading-tight">{r.area_name}</h4>
                                <span className="text-[10px] font-bold bg-petrol/10 text-petrol px-1.5 py-0.5 rounded shrink-0 whitespace-nowrap">
                                  {r.match_score}{t('pages.ai.matchSuffix')}
                                </span>
                              </div>
                              <div className="flex items-start gap-1 text-xs text-body mb-1">
                                <span className="material-symbols-outlined text-sm text-petrol">check_circle</span>
                                {pc.pro}
                              </div>
                              <div className="flex items-start gap-1 text-xs text-muted">
                                <span className="material-symbols-outlined text-sm text-sun">warning</span>
                                {pc.con}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      <button
                        onClick={() => nav('/map')}
                        className="w-full mt-3 bg-brick text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-terracotta transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">map</span>
                        {t('common.showOnMap')}
                      </button>
                    </>
                  )}

                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-2 text-[11px] text-muted flex flex-wrap items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">menu_book</span>
                      {t('pages.ai.sourcesLabel')} {m.sources.join(' · ')}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {busy && <div className="text-sm text-muted pl-12">{t('pages.ai.thinking')}</div>}
        </div>

        {/* suggestions */}
        <div className="flex flex-wrap gap-2 mt-4 mb-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => send(s.q)}
              className="px-3.5 py-1.5 rounded-full border border-line text-xs text-body hover:border-petrol hover:text-petrol transition-colors"
            >
              {t(`pages.ai.sg.${s.key}`)}
            </button>
          ))}
        </div>

        {/* input */}
        <div className="flex items-center gap-2 border border-line rounded-full pl-4 pr-1.5 py-1.5">
          <input
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder={t('pages.ai.placeholder')}
            className="flex-1 text-sm outline-none bg-transparent"
          />
          <button
            onClick={() => send()}
            disabled={busy}
            className="w-9 h-9 rounded-full bg-petrol text-white grid place-items-center hover:bg-petrol/90 disabled:opacity-50 shrink-0"
          >
            <span className="material-symbols-outlined text-lg">send</span>
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-muted">{t('pages.ai.disclaimer')}</p>

      <BehindCards label={t('pages.ai.cards.dataLabel')} icon="smart_toy">
        <InfoCard
          watermark="dataset"
          big={t('pages.ai.cards.dataTitle')}
          bigUnit={t('pages.ai.cards.dataUnit')}
          source={t('pages.ai.cards.dataSource')}
          details={t('pages.ai.cards.dataDetails')}
        >
          Recommendations come from our <b className="text-sun">live scored dataset</b> via a tool (exact rent, scores,
          ranking). Knowledge answers are <b className="text-sun">retrieved</b> from indexed district profiles,
          methodology and Magdeburg open-data docs.
        </InfoCard>
        <InfoCard
          watermark="calculate"
          source={t('pages.ai.cards.modelSource')}
          details={t('pages.ai.cards.modelDetails')}
        >
          <div className="text-4xl font-headline font-black text-sun mb-2">{t('pages.ai.cards.modelBig')}</div>
          <b className="text-sun">DeepSeek</b> decides per question: a recommendation calls the{' '}
          <b className="text-sun">recommend_districts</b> tool (filter + sort live data); a knowledge question uses{' '}
          <b className="text-sun">BM25 retrieval</b>, then DeepSeek answers grounded in the sources.
        </InfoCard>
      </BehindCards>
    </div>
  )
}
