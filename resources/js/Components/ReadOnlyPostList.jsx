import { formatDate } from '../lib/format';
import StatusBadge from './StatusBadge';

/** Daftar artikel read-only untuk pemantauan admin. */
export default function ReadOnlyPostList({ posts }) {
    if (posts.length === 0) return <p className="py-12 text-center text-slate-500">Tidak ada artikel.</p>;

    return (
        <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {posts.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center gap-4 px-4 py-3">
                    <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{p.title}</p>
                        <p className="text-xs text-slate-500">
                            {p.user && <>oleh {p.user.name} · </>}{p.category} · diperbarui {formatDate(p.updated_at)}
                        </p>
                    </div>
                    <StatusBadge published={p.is_published} />
                    {p.is_published && (
                        <a href={`/articles/${p.slug}`} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">Lihat publik</a>
                    )}
                </li>
            ))}
        </ul>
    );
}
