import { useState, type ReactNode } from 'react'

/** Section wrapper: a small circled-icon label + a 2-up grid of explainer cards. */
export function BehindCards({
  label = 'behind the score',
  icon = 'insights',
  children,
}: {
  label?: string
  icon?: string
  children: ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="w-9 h-9 rounded-full border-2 border-sun/50 grid place-items-center text-sun">
          <span className="material-symbols-outlined text-base">{icon}</span>
        </span>
        <span className="text-petrol font-medium">{label}</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{children}</div>
    </div>
  )
}

/** Münster-style explainer card: cream surface, big orange number, source, expandable details. */
export function InfoCard({
  watermark,
  big,
  bigUnit,
  children,
  source,
  details,
}: {
  watermark: string
  big?: string
  bigUnit?: string
  children: ReactNode
  source: string
  details: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: '#FCEFE6' }}>
      <span className="material-symbols-outlined absolute right-5 top-5 text-sun/30" style={{ fontSize: 44 }}>
        {watermark}
      </span>
      {big && (
        <div className="text-5xl font-headline font-black text-sun mb-3">
          {big}
          <span className="text-2xl">{bigUnit}</span>
        </div>
      )}
      <div className="text-body text-sm leading-relaxed">{children}</div>
      {open && <div className="text-sm text-muted leading-relaxed mt-3 pt-3 border-t border-sun/20">{details}</div>}
      <div className="text-petrol text-xs mt-4">Source: {source}</div>
      <div className="flex items-center justify-between mt-4">
        <div className="flex gap-3 text-petrol/70">
          <span className="material-symbols-outlined text-lg">dataset</span>
          <span className="material-symbols-outlined text-lg">share</span>
          <span className="material-symbols-outlined text-lg">download</span>
        </div>
        <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1 text-petrol font-medium text-sm hover:underline">
          <span className="material-symbols-outlined text-base">info</span>
          {open ? 'Less' : 'More details'}
        </button>
      </div>
    </div>
  )
}
