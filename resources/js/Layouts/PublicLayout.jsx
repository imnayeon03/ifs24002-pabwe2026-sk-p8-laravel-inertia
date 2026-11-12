import { Link, router, usePage } from '@inertiajs/react';
import Avatar from '../Components/Avatar';
import FlashMessages from '../Components/FlashMessages';
import { LoginIcon, LogoutIcon, UserIcon } from '../Components/Icons';
import LoadingIndicator from '../Components/LoadingIndicator';

/** Layout halaman umum: Sticky Top Navbar, tanpa sidebar, + footer editorial. */
export default function PublicLayout({ children }) {
    const { auth, appName } = usePage().props;
    const user = auth.user;

    return (
        <div className="flex min-h-screen flex-col">
            <LoadingIndicator />
            <FlashMessages />

            <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
                    <Link href="/" className="flex items-center gap-2 text-lg font-bold text-primary">
                        <img src="/favicon.svg" alt="" className="h-7 w-7" />
                        {appName}
                    </Link>
                    <nav aria-label="Navigasi utama" className="hidden items-center gap-6 text-sm font-medium text-slate-600 sm:flex">
                        <Link href="/" className="hover:text-primary">Beranda</Link>
                        <Link href="/articles" className="hover:text-primary">Artikel</Link>
                    </nav>
                    <div className="flex items-center gap-2">
                        {user ? (
                            <>
                                <Link href={user.role === 'admin' ? '/admin/users' : '/dashboard/posts'}
                                    className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary-soft">
                                    <Avatar user={user} />
                                    {user.role === 'admin' ? 'Panel Admin' : 'Dashboard Penulis'}
                                </Link>
                                <button type="button" onClick={() => router.post('/logout')}
                                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Keluar" title="Keluar">
                                    <LogoutIcon />
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
                                    <LoginIcon /> Masuk
                                </Link>
                                <Link href="/register" className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark">
                                    <UserIcon /> Daftar
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1">{children}</main>

            <footer className="border-t border-slate-200 bg-white">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-slate-500 sm:flex-row">
                    <p>© {new Date().getFullYear()} {appName}. Ruang menulis untuk semua.</p>
                    <nav aria-label="Navigasi footer" className="flex gap-5">
                        <Link href="/" className="hover:text-primary">Beranda Publik</Link>
                        <Link href="/login" className="hover:text-primary">Halaman Login</Link>
                        <Link href="/register" className="hover:text-primary">Halaman Register</Link>
                    </nav>
                </div>
            </footer>
        </div>
    );
}
