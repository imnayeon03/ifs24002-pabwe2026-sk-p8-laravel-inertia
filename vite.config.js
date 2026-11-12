import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { brotliCompressSync, constants, gzipSync } from 'node:zlib';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/** Membuat berkas .br dan .gz untuk aset build; disajikan oleh StaticAssetController. */
const precompress = () => ({
    name: 'precompress-assets',
    apply: 'build',
    closeBundle() {
        const walk = (dir) =>
            readdirSync(dir).flatMap((f) => {
                const p = join(dir, f);
                return statSync(p).isDirectory() ? walk(p) : [p];
            });
        for (const file of walk('public/build').filter((f) => /\.(js|css|map|svg)$/.test(f))) {
            const buf = readFileSync(file);
            writeFileSync(`${file}.gz`, gzipSync(buf, { level: 9 }));
            writeFileSync(`${file}.br`, brotliCompressSync(buf, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }));
        }
    },
});

export default defineConfig(({ command }) => ({
    // Saat build, aset disajikan lewat rute Laravel /_a/* (Cache-Control panjang + kompresi).
    ...(command === 'build' ? { base: '/_a/build/' } : {}),
    plugins: [
        laravel({ input: ['resources/css/app.css', 'resources/js/app.jsx'], refresh: true }),
        react(),
        tailwindcss(),
        precompress(),
    ],
    build: { sourcemap: true },
    server: { watch: { ignored: ['**/storage/framework/views/**'] } },
}));
