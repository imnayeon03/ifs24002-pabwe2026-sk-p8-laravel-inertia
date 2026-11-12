import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { LoginIcon, SearchIcon, UserIcon } from '../../Components/Icons';
import Pagination from '../../Components/Pagination';
import { formatDate } from '../../lib/format';
import PublicLayout from '../../Layouts/PublicLayout';

export default function PostIndex({ posts, categories, filters, isHome }) {
    const [q, setQ] = useState(filters.q);
    const hasFilter = filters.q || filters.category;

    const go = (params) =>
        router.get('/articles', { q, category: filters.category, ...params }, { preserveState: true, replace: true });

    return (
        <>
            <Head title={isHome ? 'Beranda' : 'Artikel'} />

            {isHome && !hasFilter && (
                <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white">
                    <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:py-24">
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Tulis. Bagikan. Temukan.</h1>
                        <p className="mx-auto mt-4 max-w-2xl text-lg text-indigo-100">
                            BlogVerse Pro adalah ruang publikasi artikel tentang teknologi, pendidikan, gaya hidup, bisnis, dan opini
                            — dibaca siapa saja, ditulis oleh komunitas.
                        </p>
                        <div className="mt-8 flex flex-wrap justify-center gap-3">
                            <Link href="/login" className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 font-medium text-primary hover:bg-indigo-50">
                                <LoginIcon /> Masuk
                            </Link>
                            <Link href="/register" className="inline-flex items-center gap-2 rounded-lg border border-white/60 px-5 py-2.5 font-medium text-white hover:bg-white/10">
                                <UserIcon /> Daftar Penulis
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            <div className="mx-auto max-w-6xl px-4 py-10">
                <form onSubmit={(e) => { e.preventDefault(); go({ q }); }} className="flex gap-2">
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input type="search" name="q" value={q} onChange={(e) => setQ(e.target.value)}
                            placeholder="Cari judul atau isi artikel..."
                            className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <button type="submit" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark">Cari</button>
                </form>

                <div className="mt-4 flex flex-wrap gap-2">
                    {[{ value: '', label: 'Semua' }, ...categories].map((c) => (
                        <button key={c.value} type="button" onClick={() => go({ category: c.value })}
                            className={`rounded-full border px-3 py-1 text-sm ${filters.category === c.value ? 'border-primary bg-primary text-white' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-100'}`}>
                            {c.value === '' ? c.label : c.value}
                        </button>
                    ))}
                </div>

                {posts.data.length === 0 ? (
                    <p className="mt-16 text-center text-slate-500">Belum ada artikel yang cocok.</p>
                ) : (
                    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {posts.data.map((post) => (
                            <article key={post.id} className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
                                <Link href={`/articles/${post.slug}`} className="block">
                                    {post.cover_image_url ? (
                                        <img src={post.cover_image_url} alt={post.title} className="h-44 w-full object-cover" />
                                    ) : (
                                        <div className="flex h-44 items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 text-4xl font-black text-indigo-300">
                                            {post.title.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </Link>
                                <div className="flex flex-1 flex-col p-5">
                                    <span className="w-fit rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-medium text-primary">{post.category}</span>
                                    <h2 className="mt-3 text-lg font-bold leading-snug">
                                        <Link href={`/articles/${post.slug}`} className="hover:text-primary">{post.title}</Link>
                                    </h2>
                                    {post.excerpt && <p className="mt-2 line-clamp-3 text-sm text-slate-600">{post.excerpt}</p>}
                                    <p className="mt-auto pt-4 text-xs text-slate-500">{post.user?.name} · {formatDate(post.published_at)}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                <Pagination links={posts.links} />
            </div>
        </>
    );
}

PostIndex.layout = (page) => <PublicLayout>{page}</PublicLayout>;
