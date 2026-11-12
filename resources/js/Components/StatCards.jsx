export default function StatCards({ stats }) {
    const items = [
        { label: 'Total Artikel', value: stats.total, tone: 'text-slate-900', bg: 'border-slate-200' },
        { label: 'Total Selesai', value: stats.published, tone: 'text-emerald-700', bg: 'border-emerald-200' },
        { label: 'Belum Selesai', value: stats.draft, tone: 'text-amber-700', bg: 'border-amber-200' },
    ];

    return (
        <div className="grid gap-4 sm:grid-cols-3">
            {items.map((s) => (
                <div key={s.label} className={`rounded-xl border bg-white p-4 shadow-sm ${s.bg}`}>
                    <p className="text-sm text-slate-500">{s.label}</p>
                    <p className={`mt-1 text-3xl font-bold ${s.tone}`}>{s.value}</p>
                </div>
            ))}
        </div>
    );
}
