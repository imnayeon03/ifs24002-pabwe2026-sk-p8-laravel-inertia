<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureRole;
use App\Providers\AppServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class MiddlewareAndProviderTest extends TestCase
{
    public function test_force_https_config_switches_url_scheme(): void
    {
        config(['app.force_https' => true]);
        (new AppServiceProvider($this->app))->boot();

        $this->assertStringStartsWith('https://', url('/'));
        URL::forceScheme('http');
    }

    public function test_ensure_role_rejects_guest(): void
    {
        $this->expectException(HttpException::class);
        (new EnsureRole)->handle(Request::create('/x'), fn () => response('ok'), 'admin');
    }
}
