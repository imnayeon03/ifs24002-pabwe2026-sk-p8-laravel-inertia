# BlogVerse Pro — Studi Kasus P8 (Laravel 13 + Inertia.js + React)

Platform blog multi-tier dengan arsitektur **Clean Architecture & Feature-First**.

| Tingkat | URL | Akses |
|---|---|---|
| Umum | `/`, `/articles`, `/articles/{slug}`, `/login`, `/register` | Guest (Sticky Top Navbar, tanpa sidebar) |
| Anggota | `/dashboard/posts` | Login: CRUD, publish/draf, cover, Excel, AI |
| Admin | `/admin/users`, `/admin/posts`, `/admin/users/{user}/posts` | Role admin (read-only artikel, ekspor Excel) |

## Menjalankan
```bash
# prasyarat: PHP >= 8.4 (gd, zip, mbstring, pdo_pgsql), Composer, Node.js, PostgreSQL >= 17
psql -U postgres -c "CREATE DATABASE pabwe_p8_blog;"
cp .env.example .env            # isi OPENAI_API_KEY bila ingin memakai AI Generator
composer install
php artisan key:generate
npm install && npm run build    # atau: npm run dev
php artisan migrate --seed      # akun: admin/admin, member/member
php artisan storage:link
php artisan serve
```

## Pengujian
```bash
composer test
php artisan test --coverage --min=100   # butuh Xdebug/PCOV
composer audit
```
Test memakai SQLite in-memory (lihat `phpunit.xml`); ganti ke pgsql bila CI Anda menyediakannya.

## Catatan
- Form login: `#login-username`, `#login-password`, `#login-submit`.
- `storage/**` dipertahankan di git lewat `.gitignore` (`*` + `!.gitignore`).
- Excel: kolom `Judul, Kategori, Ringkasan, Isi, Status, (Dipublikasikan)`; sel selalu ditulis sebagai string (anti formula-injection).
- Versi paket di `composer.json`/`package.json` bila bentrok: jalankan `composer update` / `npm install`.
