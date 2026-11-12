import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Filters from '../../Components/Filters';
import { DownloadIcon, EyeIcon, FileTextIcon, PencilIcon, PlusIcon, SparklesIcon, TrashIcon, UploadIcon } from '../../Components/Icons';
import KebabMenu from '../../Components/KebabMenu';
import Modal, { ConfirmDialog } from '../../Components/Modal';
import Pagination from '../../Components/Pagination';
import PostForm from '../../Components/PostForm';
import StatCards from '../../Components/StatCards';
import StatusBadge from '../../Components/StatusBadge';
import { formatDate } from '../../lib/format';
import AppLayout from '../../Layouts/AppLayout';

const EMPTY = { title: '', category: 'Umum', excerpt: '', content: '', is_published: false, cover_image: null };

export default function Index({ posts, stats, categories, filters }) {
    const { flash } = usePage().props;
    const [mode, setMode] = useState(null); // 'create' | 'edit' | 'ai' | 'import'
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [deleteBusy, setDeleteBusy] = useState(false);

    const form = useForm(EMPTY);
    const aiForm = useForm({ topic: '', count: 3, category: '' });
    const importForm = useForm({ file: null });
    const [drafts, setDrafts] = useState([]);
    const [saving, setSaving] = useState(false);

    // Draf hasil AI dikirim server lewat flash.
    useEffect(() => {
        if (flash?.aiDrafts) setDrafts(flash.aiDrafts.map((d) => ({ ...d, selected: true })));
    }, [flash?.aiDrafts]);

    const close = () => { setMode(null); setEditing(null); setDrafts([]); };

    const openCreate = () => { form.setData(EMPTY); form.clearErrors(); setMode('create'); };
    const openEdit = (p) => {
        form.setData({ title: p.title, category: p.category, excerpt: p.excerpt ?? '', content: p.content, is_published: p.is_published, cover_image: null });
        form.clearErrors();
        setEditing(p);
        setMode('edit');
    };

    const submitPost = () => {
        const opts = { forceFormData: true, preserveScroll: true, onSuccess: close };
        // Ubah memakai method spoofing agar berkas cover ikut terkirim (multipart).
        form.transform((d) => (mode === 'edit' ? { ...d, _method: 'put' } : d));
        if (mode === 'create') form.post('/dashboard/posts', opts);
        else form.post(`/dashboard/posts/${editing.id}`, opts);
    };

    const submitAi = () => {
        if (drafts.length === 0) {
            aiForm.post('/dashboard/posts/ai-generate', { preserveState: true, preserveScroll: true });
            return;
        }
        const items = drafts.filter((d) => d.selected).map(({ selected, ...d }) => d);
        router.post('/dashboard/posts/ai-save', { items }, {
            preserveScroll: true,
            onStart: () => setSaving(true),
            onFinish: () => setSaving(false),
            onSuccess: close,
        });
    };

    const confirmDelete = () =>
        router.delete(`/dashboard/posts/${deleting.id}`, {
            preserveScroll: true,
            onStart: () => setDeleteBusy(true),
            onFinish: () => { setDeleteBusy(false); setDeleting(null); },
        });

    const toggle = (p) => router.patch(`/dashboard/posts/${p.id}/publish`, {}, { preserveScroll: true });

    const selectedDrafts = drafts.filter((d) => d.selected).length;

    return (
        <>
            <Head title="Artikel Saya" />

            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-bold">Artikel Saya</h1>
                <div className="flex flex-wrap gap-2">
                    <a href="/dashboard/posts/export" className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50">
                        <DownloadIcon /> Ekspor Excel
                    </a>
                    <button type="button" onClick={() => { importForm.reset(); setMode('import'); }} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50">
                        <UploadIcon /> Impor Excel
                    </button>
                    <button type="button" onClick={() => { aiForm.clearErrors(); setDrafts([]); setMode('ai'); }} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800">
                        <SparklesIcon /> AI Generator
                    </button>
                    <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark">
                        <PlusIcon /> Tambah Artikel
                    </button>
                </div>
            </div>

            <div className="mt-6"><StatCards stats={stats} /></div>

            <div className="mt-6"><Filters url="/dashboard/posts" filters={filters} placeholder="Cari artikel saya..." /></div>

            {posts.data.length === 0 ? (
                <div className="mt-10 rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-500">
                    <FileTextIcon className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-3">Belum ada artikel. Mulai menulis sekarang!</p>
                </div>
            ) : (
                <ul className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
                    {posts.data.map((p) => (
                        <li key={p.id} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50">
                            {p.cover_image_url ? (
                                <img src={p.cover_image_url} alt="" className="hidden h-12 w-16 rounded object-cover sm:block" />
                            ) : (
                                <div className="hidden h-12 w-16 items-center justify-center rounded bg-indigo-50 text-primary sm:flex"><FileTextIcon /></div>
                            )}
                            <div className="min-w-0 flex-1">
                                <Link href={`/dashboard/posts/${p.id}`} className="block truncate font-medium text-slate-900 hover:text-primary">{p.title}</Link>
                                <p className="text-xs text-slate-500">{p.category} · diperbarui {formatDate(p.updated_at)}</p>
                            </div>
                            <StatusBadge published={p.is_published} />
                            <button type="button" onClick={() => toggle(p)}
                                className="hidden rounded-lg border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-100 md:block">
                                {p.is_published ? 'Jadikan Draf' : 'Publikasikan'}
                            </button>
                            <KebabMenu items={[
                                { label: 'Detail', icon: EyeIcon, tone: 'primary', href: `/dashboard/posts/${p.id}` },
                                { label: 'Ubah', icon: PencilIcon, tone: 'primary', onClick: () => openEdit(p) },
                                { label: 'Hapus', icon: TrashIcon, tone: 'danger', onClick: () => setDeleting(p) },
                            ]} />
                        </li>
                    ))}
                </ul>
            )}

            <Pagination links={posts.links} />

            {(mode === 'create' || mode === 'edit') && (
                <Modal title={mode === 'create' ? 'Tambah Artikel' : 'Ubah Artikel'} tone={mode === 'create' ? 'indigo' : 'amber'}
                    onClose={close} onSubmit={submitPost} processing={form.processing}
                    submitLabel={mode === 'create' ? 'Simpan' : 'Simpan Perubahan'}>
                    <PostForm form={form} categories={categories} editorKey={editing?.id ?? 'new'} coverUrl={editing?.cover_image_url} />
                </Modal>
            )}

            {mode === 'ai' && (
                <Modal title="AI Generator Artikel" tone="emerald" onClose={close} onSubmit={submitAi}
                    processing={aiForm.processing || saving}
                    submitDisabled={drafts.length > 0 && selectedDrafts === 0}
                    submitLabel={drafts.length === 0 ? 'Hasilkan Artikel' : `Simpan ${selectedDrafts} Draf`}>
                    {drafts.length === 0 ? (
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="ai-topic" className="mb-1 block text-sm font-medium">Topik</label>
                                <input id="ai-topic" value={aiForm.data.topic} onChange={(e) => aiForm.setData('topic', e.target.value)}
                                    placeholder="mis. Belajar React untuk pemula" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
                                {aiForm.errors.topic && <p className="mt-1 text-sm text-red-600">{aiForm.errors.topic}</p>}
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="ai-count" className="mb-1 block text-sm font-medium">Jumlah Artikel (1–5)</label>
                                    <input id="ai-count" type="number" min={1} max={5} value={aiForm.data.count}
                                        onChange={(e) => aiForm.setData('count', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
                                    {aiForm.errors.count && <p className="mt-1 text-sm text-red-600">{aiForm.errors.count}</p>}
                                </div>
                                <div>
                                    <label htmlFor="ai-category" className="mb-1 block text-sm font-medium">Kategori (opsional)</label>
                                    <select id="ai-category" value={aiForm.data.category} onChange={(e) => aiForm.setData('category', e.target.value)}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2">
                                        <option value="">Otomatis</option>
                                        {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </select>
                                </div>
                            </div>
                            <p className="text-sm text-slate-500">Hasil disimpan sebagai draf setelah Anda memeriksanya.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-600">Pilih draf yang ingin disimpan:</p>
                                <button type="button" onClick={() => setDrafts([])} className="text-sm text-primary hover:underline">Hasilkan ulang</button>
                            </div>
                            {drafts.map((d, i) => (
                                <label key={i} className="block rounded-xl border border-slate-200 p-4">
                                    <span className="flex items-start gap-3">
                                        <input type="checkbox" className="mt-1" checked={d.selected}
                                            onChange={(e) => setDrafts(drafts.map((x, j) => (j === i ? { ...x, selected: e.target.checked } : x)))} />
                                        <span>
                                            <span className="block font-semibold">{d.title}</span>
                                            <span className="text-xs text-primary">{d.category}</span>
                                            {d.excerpt && <span className="mt-1 block text-sm text-slate-600">{d.excerpt}</span>}
                                        </span>
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                </Modal>
            )}

            {mode === 'import' && (
                <Modal title="Impor Artikel dari Excel" tone="sky" onClose={close} processing={importForm.processing}
                    submitDisabled={!importForm.data.file} submitLabel="Impor"
                    onSubmit={() => importForm.post('/dashboard/posts/import', { forceFormData: true, preserveScroll: true, onSuccess: close })}>
                    <p className="text-sm text-slate-600">
                        Berkas .xlsx dengan kolom: <strong>Judul, Kategori, Ringkasan, Isi, Status</strong> (Published/Draft). Baris pertama adalah header.
                        Gunakan tombol Ekspor Excel untuk mendapatkan contoh format.
                    </p>
                    <input id="import-file" type="file" accept=".xlsx,.xls,.csv" className="mt-4 text-sm"
                        onChange={(e) => importForm.setData('file', e.target.files[0] ?? null)} />
                    {importForm.errors.file && <p className="mt-1 text-sm text-red-600">{importForm.errors.file}</p>}
                </Modal>
            )}

            {deleting && (
                <ConfirmDialog title="Hapus Artikel" message={`Artikel "${deleting.title}" akan dihapus permanen.`}
                    processing={deleteBusy} onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />
            )}
        </>
    );
}

Index.layout = (page) => <AppLayout>{page}</AppLayout>;
