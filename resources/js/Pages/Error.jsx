import { Head, Link } from '@inertiajs/react';
import PublicLayout from '../Layouts/PublicLayout';

const COPY = {
    403: ['Akses ditolak', 'Anda tidak memiliki izin untuk membuka halaman ini.'],
    404: ['Halaman tidak ditemukan', 'Halaman yang Anda cari tidak ada atau sudah dipindahkan.'],
};

export default function ErrorPage({ status }) {
    const [title, text] = COPY[status] ?? ['Terjadi kesalahan', 'Silakan coba lagi beberapa saat lagi.'];

    return (
        <>
            <Head title={title} />
            <div className="mx-auto max-w-xl px-4 py-24 text-center">
                <p className="text-6xl font-extrabold text-primary">{status}</p>
                <h1 className="mt-4 text-3xl font-bold">{title}</h1>
                <p className="mt-2 text-slate-600">{text}</p>
                <Link href="/" className="mt-8 inline-block rounded-lg bg-primary px-5 py-2.5 font-medium text-white hover:bg-primary-dark">
                    Kembali ke Beranda
                </Link>
            </div>
        </>
    );
}

ErrorPage.layout = (page) => <PublicLayout>{page}</PublicLayout>;
