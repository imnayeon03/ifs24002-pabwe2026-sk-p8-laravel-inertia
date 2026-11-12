import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeftIcon, TrashIcon } from '../../Components/Icons';
import MarkdownViewer from '../../Components/MarkdownViewer';
import { ConfirmDialog } from '../../Components/Modal';
import Spinner from '../../Components/Spinner';
import StatusBadge from '../../Components/StatusBadge';
import { formatDate } from '../../lib/format';
import AppLayout from '../../Layouts/AppLayout';

export default function Show({ post }) {
    const [file, setFile] = useState(null);
    const [busy, setBusy] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const opts = { preserveScroll: true, onStart: () => setBusy(true), onFinish: () => setBusy(false) };

    return (
        <>
            <Head title={post.title} />
            <Link href="/dashboard/posts" className="inline-flex items-center gap-1 text-sm text-primary hover:underline"><ArrowLeftIcon /> Kembali</Link>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge published={post.is_published} />
                    <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-medium text-primary">{post.category}</span>
                    <span className="text-xs text-slate-500">Diperbarui {formatDate(post.updated_at)}</span>
                </div>
                <h1 className="mt-3 text-3xl font-bold">{post.title}</h1>
                {post.excerpt && <p className="mt-2 text-slate-600">{post.excerpt}</p>}

                {post.cover_image_url && <img src={post.cover_image_url} alt={post.title} className="mt-5 max-h-96 w-full rounded-lg object-cover" />}

                <div className="mt-5 flex flex-wrap items-center gap-2">
                    <input type="file" accept="image/*" aria-label="Unggah sampul" className="text-sm" onChange={(e) => setFile(e.target.files[0] ?? null)} />
                    <button type="button" disabled={!file || busy}
                        onClick={() => router.post(`/dashboard/posts/${post.id}/cover`, { cover_image: file }, { ...opts, forceFormData: true, onSuccess: () => setFile(null) })}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm text-white disabled:opacity-50">
                        {busy && <Spinner />} Unggah Sampul
                    </button>
                    {post.cover_image_url && (
                        <button type="button" disabled={busy} onClick={() => router.delete(`/dashboard/posts/${post.id}/cover`, opts)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50">
                            <TrashIcon /> Hapus Sampul
                        </button>
                    )}
                    <button type="button" disabled={busy} onClick={() => router.patch(`/dashboard/posts/${post.id}/publish`, {}, opts)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50">
                        {post.is_published ? 'Jadikan Draf' : 'Publikasikan'}
                    </button>
                    <button type="button" onClick={() => setConfirm(true)} className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-sm text-white hover:bg-rose-700">
                        <TrashIcon /> Hapus
                    </button>
                </div>

                <hr className="my-6 border-slate-200" />
                <MarkdownViewer content={post.content} />
            </div>

            {confirm && (
                <ConfirmDialog title="Hapus Artikel" message={`Artikel "${post.title}" akan dihapus permanen.`} processing={busy}
                    onConfirm={() => router.delete(`/dashboard/posts/${post.id}`, opts)} onCancel={() => setConfirm(false)} />
            )}
        </>
    );
}

Show.layout = (page) => <AppLayout>{page}</AppLayout>;
