import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ command }) => ({
    // Saat build, aset disajikan lewat rute Laravel /_a/* (header Cache-Control panjang).
    ...(command === 'build' ? { base: '/_a/build/' } : {}),
    plugins: [
        laravel({ input: ['resources/css/app.css', 'resources/js/app.jsx'], refresh: true }),
        react(),
        tailwindcss(),
    ],
    build: { sourcemap: true },
    server: { watch: { ignored: ['**/storage/framework/views/**'] } },
}));
