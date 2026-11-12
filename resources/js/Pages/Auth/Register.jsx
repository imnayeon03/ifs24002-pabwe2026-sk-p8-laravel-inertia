import { Head, Link, useForm } from '@inertiajs/react';
import Spinner from '../../Components/Spinner';
import PublicLayout from '../../Layouts/PublicLayout';

const FIELDS = [
    { name: 'name', label: 'Nama Lengkap', type: 'text', auto: 'name' },
    { name: 'username', label: 'Username', type: 'text', auto: 'username' },
    { name: 'password', label: 'Password', type: 'password', auto: 'new-password' },
    { name: 'password_confirmation', label: 'Konfirmasi Password', type: 'password', auto: 'new-password' },
];

export default function Register() {
    const form = useForm({ name: '', username: '', password: '', password_confirmation: '' });

    const submit = (e) => {
        e.preventDefault();
        form.post('/register', { onFinish: () => form.reset('password', 'password_confirmation') });
    };

    return (
        <>
            <Head title="Daftar" />
            <div className="mx-auto max-w-md px-4 py-12">
                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                    <h1 className="text-2xl font-bold">Daftar Penulis</h1>
                    <p className="mt-1 text-sm text-slate-500">Buat akun gratis dan mulai menulis.</p>

                    <form onSubmit={submit} className="mt-6 space-y-4">
                        {FIELDS.map((f) => (
                            <div key={f.name}>
                                <label htmlFor={`register-${f.name}`} className="mb-1 block text-sm font-medium">{f.label}</label>
                                <input id={`register-${f.name}`} name={f.name} type={f.type} autoComplete={f.auto}
                                    value={form.data[f.name]} onChange={(e) => form.setData(f.name, e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                {form.errors[f.name] && <p className="mt-1 text-sm text-red-600">{form.errors[f.name]}</p>}
                            </div>
                        ))}
                        <button id="register-submit" type="submit" disabled={form.processing}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-medium text-white hover:bg-primary-dark disabled:opacity-60">
                            {form.processing && <Spinner />} Daftar
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-500">
                        Sudah punya akun? <Link href="/login" className="font-medium text-primary hover:underline">Masuk</Link>
                    </p>
                </div>
            </div>
        </>
    );
}

Register.layout = (page) => <PublicLayout>{page}</PublicLayout>;
