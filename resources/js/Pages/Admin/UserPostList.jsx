import { Head, Link } from '@inertiajs/react';
import Filters from '../../Components/Filters';
import { ArrowLeftIcon } from '../../Components/Icons';
import Pagination from '../../Components/Pagination';
import ReadOnlyPostList from '../../Components/ReadOnlyPostList';
import StatCards from '../../Components/StatCards';
import AppLayout from '../../Layouts/AppLayout';

export default function UserPostList({ author, posts, stats, filters }) {
    return (
        <>
            <Head title={`Artikel ${author.name}`} />
            <Link href="/admin/users" className="inline-flex items-center gap-1 text-sm text-primary hover:underline"><ArrowLeftIcon /> Kembali</Link>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-bold">Artikel {author.name} <span className="text-base font-normal text-slate-500">@{author.username}</span></h1>
                <a href={`/admin/users/${author.id}/posts/export`} className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark">Ekspor Excel</a>
            </div>
            <div className="mt-6"><StatCards stats={stats} /></div>
            <div className="mt-6"><Filters url={`/admin/users/${author.id}/posts`} filters={filters} placeholder="Cari artikel..." /></div>
            <div className="mt-4"><ReadOnlyPostList posts={posts.data} /></div>
            <Pagination links={posts.links} />
        </>
    );
}

UserPostList.layout = (page) => <AppLayout>{page}</AppLayout>;
