import { Head, Link } from '@inertiajs/react';
import { LoginIcon, UserIcon } from '../../Components/Icons';
import MarkdownViewer from '../../Components/MarkdownViewer';
import { formatDate } from '../../lib/format';
import PublicLayout from '../../Layouts/PublicLayout';

export default function PostShow({ post, related }) {
    return (
        <>
            <Head title={post.title} />
            <article className="mx-auto max-w-3xl px-4 py-10">
                <Link href="/articles" className="text-sm text-primary hover:underline">← Semua artikel</Link>
                <span className="mt-6 block w-fit rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">{post.category}</span>
                <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">{post.title}</h1>
                <p className="mt-3 text-sm text-slate-500">Oleh <strong>{post.user?.name}</strong> · {formatDate(post.published_at)}</p>

                {post.cover_image_url && <img src={post.cover_image_url} alt={post.title} className="mt-6 w-full rounded-xl object-cover" />}
                {post.excerpt && <p className="mt-6 border-l-4 border-primary pl-4 text-lg italic text-slate-600">{post.excerpt}</p>}

                <div className="mt-8"><MarkdownViewer content={post.content} /></div>

                <aside className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-center text-white">
                    <h2 className="text-xl font-bold">Punya cerita untuk dibagikan?</h2>
                    <p className="mt-2 text-indigo-100">Bergabung dengan komunitas penulis BlogVerse Pro.</p>
                    <div className="mt-5 flex flex-wrap justify-center gap-3">
                        <Link href="/login" className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2 font-medium text-primary"><LoginIcon /> Masuk</Link>
                        <Link href="/register" className="inline-flex items-center gap-2 rounded-lg border border-white/60 px-5 py-2 font-medium"><UserIcon /> Daftar</Link>
                    </div>
                </aside>

                {related.length > 0 && (
                    <section className="mt-12">
                        <h2 className="text-lg font-bold">Artikel lainnya</h2>
                        <ul className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
                            {related.map((r) => (
                                <li key={r.id}>
                                    <Link href={`/articles/${r.slug}`} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-slate-50">
                                        <span className="font-medium">{r.title}</span>
                                        <span className="shrink-0 text-xs text-slate-500">{formatDate(r.published_at)}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </article>
        </>
    );
}

PostShow.layout = (page) => <PublicLayout>{page}</PublicLayout>;
