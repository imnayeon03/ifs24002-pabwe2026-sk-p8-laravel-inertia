import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Avatar from '../Components/Avatar';
import FlashMessages from '../Components/FlashMessages';
import { FileTextIcon, HomeIcon, LogoutIcon, MenuIcon, UserIcon, UsersIcon, XIcon } from '../Components/Icons';
import LoadingIndicator from '../Components/LoadingIndicator';

/** Layout dashboard (penulis & admin) dengan sidebar. */
export default function AppLayout({ children }) {
    const { auth, appName } = usePage().props;
    const { url } = usePage();
    const user = auth.user;
    const [open, setOpen] = useState(false);

    const nav = [
        { href: '/dashboard/posts', label: 'Artikel Saya', icon: FileTextIcon, match: '/dashboard' },
        { href: '/profile', label: 'Profil', icon: UserIcon, match: '/profile' },
        ...(user.role === 'admin'
            ? [
                  { href: '/admin/users', label: 'Kelola Pengguna', icon: UsersIcon, match: '/admin/users' },
                  { href: '/admin/posts', label: 'Semua Artikel', icon: FileTextIcon, match: '/admin/posts' },
              ]
            : []),
    ];

    return (
        <div className="min-h-screen">
            <LoadingIndicator />
            <FlashMessages />

            <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
                <span className="font-bold text-primary">{appName}</span>
                <button type="button" onClick={() => setOpen(true)} aria-label="Buka menu"><MenuIcon className="h-6 w-6" /></button>
            </header>

            {open && <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={() => setOpen(false)} />}

            <aside aria-label="Sidebar" className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between px-5 py-4">
                    <Link href="/" className="flex items-center gap-2 text-lg font-bold text-primary">
                        <img src="/favicon.svg" alt="" className="h-7 w-7" /> {appName}
                    </Link>
                    <button type="button" className="lg:hidden" onClick={() => setOpen(false)} aria-label="Tutup menu"><XIcon className="h-5 w-5" /></button>
                </div>

                <nav aria-label="Menu dashboard" className="flex-1 space-y-1 px-3">
                    {nav.map(({ href, label, icon: Icon, match }) => (
                        <Link key={label} href={href} onClick={() => setOpen(false)}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${url.startsWith(match) ? 'bg-primary-soft text-primary' : 'text-slate-600 hover:bg-slate-100'}`}>
                            <Icon className="h-5 w-5" /> {label}
                        </Link>
                    ))}
                    <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
                        <HomeIcon className="h-5 w-5" /> Beranda Publik
                    </Link>
                </nav>

                <div className="border-t border-slate-200 p-4">
                    <div className="mb-3 flex items-center gap-3">
                        <Avatar user={user} size="h-10 w-10" />
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{user.name}</p>
                            <p className="truncate text-xs text-slate-500">@{user.username} · {user.role}</p>
                        </div>
                    </div>
                    <button type="button" onClick={() => router.post('/logout')}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        <LogoutIcon /> Keluar
                    </button>
                </div>
            </aside>

            <main className="p-4 sm:p-6 lg:ml-64 lg:p-8">{children}</main>
        </div>
    );
}
