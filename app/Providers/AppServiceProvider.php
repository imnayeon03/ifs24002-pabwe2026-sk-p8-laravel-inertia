<?php

namespace App\Providers;

use App\Features\Ai\Contracts\AiClientInterface;
use App\Features\Ai\Services\OpenAiPostGeneratorService;
use App\Features\Post\Contracts\PostRepositoryInterface;
use App\Features\Post\Models\Post;
use App\Features\Post\Policies\PostPolicy;
use App\Features\Post\Repositories\PostRepository;
use Illuminate\Foundation\Vite;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(PostRepositoryInterface::class, PostRepository::class);
        $this->app->bind(AiClientInterface::class, OpenAiPostGeneratorService::class);

        // Aset build Vite disajikan lewat rute /_a/* agar memperoleh header Cache-Control panjang.
        $this->app->resolving(Vite::class, function (Vite $vite) {
            $vite->createAssetPathsUsing(fn (string $path) => '/_a/'.ltrim($path, '/'));
        });
    }

    public function boot(): void
    {
        if (config('app.force_https')) {
            URL::forceScheme('https');
        }

        Gate::policy(Post::class, PostPolicy::class);
    }
}
