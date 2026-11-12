import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { DotsIcon } from './Icons';

/** Menu tindakan ⋮ : item { label, icon, tone: 'primary' | 'danger', href?, onClick? } */
export default function KebabMenu({ items }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button type="button" aria-label="Menu tindakan" aria-haspopup="menu" aria-expanded={open}
                onClick={() => setOpen((o) => !o)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                <DotsIcon className="h-5 w-5" />
            </button>
            {open && (
                <div role="menu" className="absolute right-0 top-full z-30 mt-1 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                    {items.map(({ label, icon: Icon, tone = 'primary', href, onClick }) => {
                        const cls = `flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50 ${tone === 'danger' ? 'text-red-600' : 'text-primary'}`;
                        const inner = (<><Icon />{label}</>);
                        return href ? (
                            <Link key={label} href={href} role="menuitem" className={cls}>{inner}</Link>
                        ) : (
                            <button key={label} type="button" role="menuitem" className={cls}
                                onClick={() => { setOpen(false); onClick(); }}>{inner}</button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
