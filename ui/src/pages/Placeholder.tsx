export default function Placeholder({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold text-ink">{title}</h1>
        {desc && <p className="text-muted mt-1">{desc}</p>}
      </div>
      <div className="bg-white rounded-xl border border-line shadow-sm p-12 text-center">
        <span className="material-symbols-outlined text-petrol" style={{ fontSize: 48 }}>
          construction
        </span>
        <p className="mt-4 text-muted">
          Designed in Stitch — wiring to the live API next. Home is fully connected.
        </p>
      </div>
    </div>
  )
}
