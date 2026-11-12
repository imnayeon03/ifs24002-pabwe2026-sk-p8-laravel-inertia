import { Head, Link, useForm } from '@inertiajs/react';
import Spinner from '../../Components/Spinner';
import PublicLayout from '../../Layouts/PublicLayout';

export default function Login() {
    const form = useForm({ username: '', password: '', remember: false });

    const submit = (e) => {
        e.preventDefault();
        form.post('/login', { onFinish: () => form.reset('password') });
    };

    return (
        <>
            <Head title="Masuk" />
            <div className="mx-auto max-w-md px-4 py-12">
                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                    <h1 className="text-2xl font-bold">Masuk</h1>
                    <p className="mt-1 text-sm text-slate-500">Masuk untuk mengelola artikel Anda.</p>

                    <form onSubmit={submit} className="mt-6 space-y-4">
                        <div>
                            <label htmlFor="login-username" className="mb-1 block text-sm font-medium">Username</label>
                            <input id="login-username" name="username" type="text" autoComplete="username" autoFocus
                                value={form.data.username} onChange={(e) => form.setData('username', e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            {form.errors.username && <p className="mt-1 text-sm text-red-600">{form.errors.username}</p>}
                        </div>
                        <div>
                            <label htmlFor="login-password" className="mb-1 block text-sm font-medium">Password</label>
                            <input id="login-password" name="password" type="password" autoComplete="current-password"
                                value={form.data.password} onChange={(e) => form.setData('password', e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            {form.errors.password && <p className="mt-1 text-sm text-red-600">{form.errors.password}</p>}
                        </div>
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={form.data.remember} onChange={(e) => form.setData('remember', e.target.checked)} />
                            Ingat saya
                        </label>
                        <button id="login-submit" type="submit" disabled={form.processing}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-medium text-white hover:bg-primary-dark disabled:opacity-60">
                            {form.processing && <Spinner />} Masuk
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-500">
                        Belum punya akun? <Link href="/register" className="font-medium text-primary hover:underline">Daftar sebagai penulis</Link>
                    </p>
                </div>
            </div>
        </>
    );
}

Login.layout = (page) => <PublicLayout>{page}</PublicLayout>;
