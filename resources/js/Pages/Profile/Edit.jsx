import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Avatar from '../../Components/Avatar';
import Spinner from '../../Components/Spinner';
import AppLayout from '../../Layouts/AppLayout';

export default function Edit() {
    const { auth, errors } = usePage().props;
    const user = auth.user;
    const [data, setData] = useState({ name: user.name, username: user.username, password: '', password_confirmation: '', photo: null });
    const [processing, setProcessing] = useState(false);
    const set = (k) => (e) => setData({ ...data, [k]: e.target.type === 'file' ? e.target.files[0] : e.target.value });

    const submit = (e) => {
        e.preventDefault();
        router.post('/profile', { ...data, _method: 'put' }, {
            forceFormData: true,
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
            onSuccess: () => setData((d) => ({ ...d, password: '', password_confirmation: '', photo: null })),
        });
    };

    const field = (name, label, type = 'text') => (
        <div>
            <label htmlFor={`profile-${name}`} className="mb-1 block text-sm font-medium">{label}</label>
            <input id={`profile-${name}`} type={type} value={data[name]} onChange={set(name)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
            {errors[name] && <p className="mt-1 text-sm text-red-600">{errors[name]}</p>}
        </div>
    );

    return (
        <>
            <Head title="Profil" />
            <h1 className="text-2xl font-bold">Profil Penulis</h1>
            <form onSubmit={submit} className="mt-6 max-w-xl space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <Avatar user={user} size="h-16 w-16" />
                    <div>
                        <label htmlFor="profile-photo" className="mb-1 block text-sm font-medium">Foto Profil</label>
                        <input id="profile-photo" type="file" accept="image/*" onChange={set('photo')} className="text-sm" />
                        {errors.photo && <p className="mt-1 text-sm text-red-600">{errors.photo}</p>}
                    </div>
                </div>
                {field('name', 'Nama Lengkap')}
                {field('username', 'Username')}
                {field('password', 'Password Baru (opsional)', 'password')}
                {field('password_confirmation', 'Konfirmasi Password Baru', 'password')}
                <button type="submit" disabled={processing}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 font-medium text-white hover:bg-primary-dark disabled:opacity-60">
                    {processing && <Spinner />} Simpan Perubahan
                </button>
            </form>
        </>
    );
}

Edit.layout = (page) => <AppLayout>{page}</AppLayout>;
