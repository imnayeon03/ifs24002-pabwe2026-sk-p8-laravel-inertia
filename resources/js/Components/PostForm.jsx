import MarkdownEditor from './MarkdownEditor';

/** Isi form Tambah/Ubah artikel (dipakai di dalam Modal). */
export default function PostForm({ form, categories, editorKey, coverUrl }) {
    const { data, setData, errors } = form;
    const input = 'w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30';
    const err = (k) => errors[k] && <p className="mt-1 text-sm text-red-600">{errors[k]}</p>;

    return (
        <div className="space-y-5">
            <div>
                <label htmlFor="post-title" className="mb-1 block text-sm font-medium">Judul</label>
                <input id="post-title" className={input} value={data.title} onChange={(e) => setData('title', e.target.value)} placeholder="Judul artikel" />
                {err('title')}
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
                <div>
                    <label htmlFor="post-category" className="mb-1 block text-sm font-medium">Kategori</label>
                    <select id="post-category" className={input} value={data.category} onChange={(e) => setData('category', e.target.value)}>
                        {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                    {err('category')}
                </div>
                <div>
                    <label htmlFor="post-cover" className="mb-1 block text-sm font-medium">Foto Sampul</label>
                    <input id="post-cover" type="file" accept="image/*" className="text-sm"
                        onChange={(e) => setData('cover_image', e.target.files[0] ?? null)} />
                    {coverUrl && !data.cover_image && <img src={coverUrl} alt="Sampul saat ini" className="mt-2 h-16 rounded object-cover" />}
                    {err('cover_image')}
                </div>
            </div>
            <div>
                <label htmlFor="post-excerpt" className="mb-1 block text-sm font-medium">Ringkasan</label>
                <textarea id="post-excerpt" rows={2} className={input} value={data.excerpt}
                    onChange={(e) => setData('excerpt', e.target.value)} placeholder="Ringkasan pemikat pembaca (1-2 kalimat)" />
                {err('excerpt')}
            </div>
            <div>
                <span className="mb-1 block text-sm font-medium">Isi Artikel (Markdown)</span>
                <MarkdownEditor key={editorKey} value={data.content} onChange={(v) => setData('content', v)} />
                {err('content')}
            </div>
            <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={data.is_published} onChange={(e) => setData('is_published', e.target.checked)} />
                Publikasikan artikel (hilangkan centang untuk menyimpan sebagai draf)
            </label>
        </div>
    );
}
