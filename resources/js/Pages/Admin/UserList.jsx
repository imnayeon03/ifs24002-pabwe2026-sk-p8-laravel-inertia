import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Avatar from '../../Components/Avatar';
import Filters from '../../Components/Filters';
import { EyeIcon, TrashIcon } from '../../Components/Icons';
import KebabMenu from '../../Components/KebabMenu';
import { ConfirmDialog } from '../../Components/Modal';
import Pagination from '../../Components/Pagination';
import AppLayout from '../../Layouts/AppLayout';

export default function UserList({ users, filters }) {
    const { auth } = usePage().props;
    const [target, setTarget] = useState(null);
    const [busy, setBusy] = useState(false);

    return (
        <>
            <Head title="Kelola Pengguna" />
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-bold">Kelola Pengguna</h1>
                <a href="/admin/posts/export" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50">Ekspor Semua Artikel</a>
            </div>
            <div className="mt-6"><Filters url="/admin/users" filters={filters} withStatus={false} placeholder="Cari nama atau username..." /></div>

            <ul className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
                {users.data.map((u) => (
                    <li key={u.id} className="flex items-center gap-4 px-4 py-3">
                        <Avatar user={u} size="h-10 w-10" />
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{u.name}</p>
                            <p className="text-xs text-slate-500">@{u.username} · {u.posts_count} artikel</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>{u.role}</span>
                        <KebabMenu items={[
                            { label: 'Artikel', icon: EyeIcon, tone: 'primary', href: `/admin/users/${u.id}/posts` },
                            ...(u.id !== auth.user.id ? [{ label: 'Hapus', icon: TrashIcon, tone: 'danger', onClick: () => setTarget(u) }] : []),
                        ]} />
                    </li>
                ))}
            </ul>
            <Pagination links={users.links} />

            {target && (
                <ConfirmDialog title="Hapus Pengguna" message={`Pengguna "${target.name}" beserta seluruh artikelnya akan dihapus permanen.`}
                    processing={busy} onCancel={() => setTarget(null)}
                    onConfirm={() => router.delete(`/admin/users/${target.id}`, {
                        preserveScroll: true,
                        onStart: () => setBusy(true),
                        onFinish: () => { setBusy(false); setTarget(null); },
                    })} />
            )}
        </>
    );
}

UserList.layout = (page) => <AppLayout>{page}</AppLayout>;
