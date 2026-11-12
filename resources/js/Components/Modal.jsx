import { useEffect } from 'react';
import { XIcon } from './Icons';
import Spinner from './Spinner';

const TONES = {
    indigo: { head: 'bg-indigo-600 text-white', foot: 'bg-indigo-50 border-indigo-200', btn: 'bg-indigo-600 hover:bg-indigo-700' },
    amber: { head: 'bg-amber-500 text-white', foot: 'bg-amber-50 border-amber-200', btn: 'bg-amber-600 hover:bg-amber-700' },
    emerald: { head: 'bg-emerald-600 text-white', foot: 'bg-emerald-50 border-emerald-200', btn: 'bg-emerald-600 hover:bg-emerald-700' },
    sky: { head: 'bg-sky-600 text-white', foot: 'bg-sky-50 border-sky-200', btn: 'bg-sky-600 hover:bg-sky-700' },
    rose: { head: 'bg-rose-600 text-white', foot: 'bg-rose-50 border-rose-200', btn: 'bg-rose-600 hover:bg-rose-700' },
};

/** Modal Full Screen: header & footer berwarna kontras, tombol aksi di kanan footer. */
export default function Modal({
    title,
    tone = 'indigo',
    onClose,
    onSubmit,
    submitLabel = 'Simpan',
    processing = false,
    submitDisabled = false,
    children,
}) {
    const t = TONES[tone];

    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && !processing && onClose();
        window.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [processing, onClose]);

    return (
        <div className="fixed inset-0 z-50 bg-white" role="dialog" aria-modal="true" aria-label={title}>
            <form
                className="flex h-full flex-col"
                onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit?.(e);
                }}
            >
                <header className={`flex items-center justify-between px-6 py-4 ${t.head}`}>
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <button type="button" onClick={onClose} disabled={processing} aria-label="Tutup" className="rounded p-1 hover:bg-white/20">
                        <XIcon className="h-5 w-5" />
                    </button>
                </header>
                <div className="flex-1 overflow-y-auto bg-white p-6">
                    <div className="mx-auto max-w-4xl">{children}</div>
                </div>
                <footer className={`flex justify-end gap-3 border-t px-6 py-4 ${t.foot}`}>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={processing}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={processing || submitDisabled}
                        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-60 ${t.btn}`}
                    >
                        {processing && <Spinner />}
                        {submitLabel}
                    </button>
                </footer>
            </form>
        </div>
    );
}

/** Dialog konfirmasi kecil (mis. hapus). */
export function ConfirmDialog({ title, message, confirmLabel = 'Hapus', processing, onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 z-[55] flex items-center justify-center bg-slate-900/50 p-4" role="alertdialog" aria-modal="true">
            <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl">
                <div className="bg-rose-600 px-5 py-3 font-semibold text-white">{title}</div>
                <p className="px-5 py-4 text-sm text-slate-600">{message}</p>
                <div className="flex justify-end gap-3 border-t border-rose-200 bg-rose-50 px-5 py-3">
                    <button type="button" onClick={onCancel} disabled={processing} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-60">
                        Batal
                    </button>
                    <button type="button" onClick={onConfirm} disabled={processing} className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60">
                        {processing && <Spinner />}
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
