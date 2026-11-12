<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Menyajikan aset hasil build Vite (public/build) dan favicon dengan header cache panjang,
 * apa pun web server-nya. Nama berkas Vite memakai hash, sehingga aman di-cache lama.
 */
class StaticAssetController
{
    private const MIME = [
        'js' => 'text/javascript; charset=UTF-8',
        'css' => 'text/css; charset=UTF-8',
        'map' => 'application/json',
        'svg' => 'image/svg+xml',
        'woff2' => 'font/woff2',
        'woff' => 'font/woff',
        'png' => 'image/png',
        'jpg' => 'image/jpeg',
        'webp' => 'image/webp',
    ];

    public function __invoke(Request $request, string $path): BinaryFileResponse
    {
        $file = realpath(public_path($path));
        $build = realpath(public_path('build'));

        $allowed = $file !== false && is_file($file) && (
            $path === 'favicon.svg'
            || ($build !== false && str_starts_with($file, $build.DIRECTORY_SEPARATOR))
        );
        abort_unless($allowed, 404);

        // Gunakan versi terkompresi (.br / .gz) hasil build bila klien mendukungnya.
        $headers = ['Cache-Control' => 'public, max-age=31536000, immutable', 'Vary' => 'Accept-Encoding'];
        $serve = $file;
        $accept = (string) $request->header('Accept-Encoding', '');
        foreach (['br' => '.br', 'gzip' => '.gz'] as $encoding => $ext) {
            if (str_contains($accept, $encoding) && is_file($file.$ext)) {
                $serve = $file.$ext;
                $headers['Content-Encoding'] = $encoding;
                break;
            }
        }

        $response = response()->file($serve, $headers);
        $mime = self::MIME[strtolower(pathinfo($file, PATHINFO_EXTENSION))] ?? null;
        if ($mime) {
            $response->headers->set('Content-Type', $mime);
        }

        return $response;
    }
}
