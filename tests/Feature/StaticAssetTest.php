<?php

namespace Tests\Feature;

use Illuminate\Foundation\Vite;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

class StaticAssetTest extends TestCase
{
    private string $dir;

    protected function setUp(): void
    {
        parent::setUp();
        $this->dir = public_path('build/assets');
        File::ensureDirectoryExists($this->dir);
    }

    protected function tearDown(): void
    {
        File::delete([$this->dir.'/t-test.js', $this->dir.'/t-test.js.gz', $this->dir.'/t-test.js.br', $this->dir.'/t-test.css', $this->dir.'/t-test.bin', public_path('build/manifest.json')]);
        parent::tearDown();
    }

    public function test_build_assets_are_served_with_long_cache_and_no_cookies(): void
    {
        File::put($this->dir.'/t-test.js', 'console.log(1)');
        File::put($this->dir.'/t-test.css', 'a{}');

        $js = $this->get('/_a/build/assets/t-test.js');
        $js->assertOk();
        $this->assertStringContainsString('max-age=31536000', $js->headers->get('Cache-Control'));
        $this->assertStringContainsString('immutable', $js->headers->get('Cache-Control'));
        $this->assertStringContainsString('javascript', $js->headers->get('Content-Type'));
        $this->assertEmpty($js->headers->getCookies());

        $this->get('/_a/build/assets/t-test.css')->assertOk()->assertHeader('Content-Type', 'text/css; charset=UTF-8');
    }

    public function test_precompressed_variants_are_served_by_accept_encoding(): void
    {
        File::put($this->dir.'/t-test.js', 'console.log(1)');
        File::put($this->dir.'/t-test.js.gz', gzencode('console.log(1)'));
        File::put($this->dir.'/t-test.js.br', 'br-bytes');

        $this->get('/_a/build/assets/t-test.js', ['Accept-Encoding' => 'gzip, br'])
            ->assertOk()->assertHeader('Content-Encoding', 'br')->assertHeader('Vary', 'Accept-Encoding');
        $this->get('/_a/build/assets/t-test.js', ['Accept-Encoding' => 'gzip'])
            ->assertOk()->assertHeader('Content-Encoding', 'gzip');
        $this->assertFalse($this->get('/_a/build/assets/t-test.js')->headers->has('Content-Encoding'));
    }

    public function test_unknown_extension_is_served_without_forced_mime(): void
    {
        File::put($this->dir.'/t-test.bin', 'x');

        $this->get('/_a/build/assets/t-test.bin')->assertOk();
    }

    public function test_favicon_is_served(): void
    {
        $this->get('/_a/favicon.svg')->assertOk()->assertHeader('Content-Type', 'image/svg+xml');
    }

    public function test_files_outside_build_directory_are_not_exposed(): void
    {
        $this->get('/_a/composer.json')->assertNotFound();
        $this->get('/_a/build/../../composer.json')->assertNotFound();
        $this->get('/_a/build/assets/tidak-ada.js')->assertNotFound();
    }

    public function test_vite_asset_urls_point_to_cached_route(): void
    {
        File::put(public_path('build/manifest.json'), json_encode([
            'resources/js/app.jsx' => ['file' => 'assets/app-abc.js', 'isEntry' => true, 'src' => 'resources/js/app.jsx'],
        ]));

        $this->withVite();

        $this->assertSame('/_a/build/assets/app-abc.js', app(Vite::class)->asset('resources/js/app.jsx'));
    }
}
