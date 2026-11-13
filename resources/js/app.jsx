import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';

// Halaman dimuat langsung agar konten (<main>, <h1>) tampil segera saat halaman terbuka.
// Hanya editor/viewer Markdown (library besar) yang dimuat belakangan, lihat Components/Markdown*.
const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });

createInertiaApp({
    title: (title) => (title ? `${title} — BlogVerse Pro` : 'BlogVerse Pro'),
    resolve: (name) => pages[`./Pages/${name}.jsx`],
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});
