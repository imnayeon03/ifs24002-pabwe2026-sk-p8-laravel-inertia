import { Head } from '@inertiajs/react';
import Filters from '../../Components/Filters';
import Pagination from '../../Components/Pagination';
import ReadOnlyPostList from '../../Components/ReadOnlyPostList';
import StatCards from '../../Components/StatCards';
import AppLayout from '../../Layouts/AppLayout';

export default function PostList({ posts, stats, filters }) {
    return (
        <>
            <Head title="Semua Artikel" />
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-bold">Semua Artikel (Read-only)</h1>
                <a href="/admin/posts/export" className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark">Ekspor Excel</a>
            </div>
            <div className="mt-6"><StatCards stats={stats} /></div>
            <div className="mt-6"><Filters url="/admin/posts" filters={filters} placeholder="Cari artikel sistem..." /></div>
            <div className="mt-4"><ReadOnlyPostList posts={posts.data} /></div>
            <Pagination links={posts.links} />
        </>
    );
}

PostList.layout = (page) => <AppLayout>{page}</AppLayout>;
