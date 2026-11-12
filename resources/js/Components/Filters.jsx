import { router } from '@inertiajs/react';
import { useState } from 'react';
import { SearchIcon } from './Icons';

/** Pencarian + filter status untuk daftar (dashboard maupun admin). */
export default function Filters({ url, filters, withStatus = true, placeholder = 'Cari...' }) {
    const [q, setQ] = useState(filters.q ?? '');
    const go = (params) => router.get(url, { q, status: filters.status, ...params }, { preserveState: true, replace: true });

    return (
        <form onSubmit={(e) => { e.preventDefault(); go({ q }); }} className="flex flex-wrap gap-2">
            <div className="relative min-w-[200px] flex-1">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder}
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            {withStatus && (
                <select value={filters.status ?? ''} onChange={(e) => go({ status: e.target.value })} aria-label="Filter status"
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                    <option value="">Semua status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draf</option>
                </select>
            )}
            <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">Cari</button>
        </form>
    );
}
