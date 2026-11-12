<?php

namespace App\Http\Controllers;

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

    public function __invoke(string $path): BinaryFileResponse
    {
        $file = realpath(public_path($path));
        $build = realpath(public_path('build'));

        $allowed = $file !== false && is_file($file) && (
            $path === 'favicon.svg'
            || ($build !== false && str_starts_with($file, $build.DIRECTORY_SEPARATOR))
        );
        abort_unless($allowed, 404);

        $response = response()->file($file, [
            'Cache-Control' => 'public, max-age=31536000, immutable',
        ]);
        $mime = self::MIME[strtolower(pathinfo($file, PATHINFO_EXTENSION))] ?? null;
        if ($mime) {
            $response->headers->set('Content-Type', $mime);
        }

        return $response;
    }
}
