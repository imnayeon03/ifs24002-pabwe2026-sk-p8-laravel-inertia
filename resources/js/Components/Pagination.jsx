import { Link } from '@inertiajs/react';

export default function Pagination({ links = [] }) {
    if (links.length <= 3) return null;

    return (
        <nav className="mt-6 flex flex-wrap justify-center gap-1" aria-label="Paginasi">
            {links.map((link, i) => {
                const label = link.label.replace('&laquo;', '«').replace('&raquo;', '»');
                const base = 'rounded-lg border px-3 py-1.5 text-sm';
                if (!link.url) return <span key={i} className={`${base} border-slate-200 text-slate-400`}>{label}</span>;
                return (
                    <Link key={i} href={link.url} preserveScroll
                        className={`${base} ${link.active ? 'border-primary bg-primary text-white' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                        {label}
                    </Link>
                );
            })}
        </nav>
    );
}
