<?php

namespace Tests\Feature;

use App\Features\Post\Models\Post;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicPostTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_and_articles_list_only_published_posts_without_login(): void
    {
        Post::factory()->count(2)->create();
        Post::factory()->draft()->create(['title' => 'Draf Rahasia']);

        foreach (['/', '/articles'] as $url) {
            $this->get($url)->assertOk()->assertInertia(fn (Assert $p) => $p
                ->component('Public/PostIndex')
                ->has('posts.data', 2)
                ->has('categories', 6)
                ->where('isHome', $url === '/'));
        }
    }

    public function test_public_list_hides_author_email(): void
    {
        Post::factory()->create();

        $this->get('/articles')->assertInertia(fn (Assert $p) => $p
            ->missing('posts.data.0.user.email')->has('posts.data.0.user.name'));
    }

    public function test_search_and_category_filters(): void
    {
        Post::factory()->create(['title' => 'Belajar Laravel', 'category' => 'Teknologi']);
        Post::factory()->create(['title' => 'Resep Sehat', 'category' => 'Gaya Hidup', 'content' => 'isi biasa', 'excerpt' => 'x']);

        $this->get('/articles?q=laravel')->assertInertia(fn (Assert $p) => $p->has('posts.data', 1)->where('filters.q', 'laravel'));
        $this->get('/articles?category=Gaya Hidup')->assertInertia(fn (Assert $p) => $p->has('posts.data', 1)->where('posts.data.0.title', 'Resep Sehat'));
        $this->get('/articles?q=tidakada')->assertInertia(fn (Assert $p) => $p->has('posts.data', 0));
    }

    public function test_reader_shows_published_article_with_related(): void
    {
        $post = Post::factory()->create(['slug' => 'artikel-satu']);
        Post::factory()->count(2)->create();

        $this->get('/articles/artikel-satu')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->component('Public/PostShow')
            ->where('post.id', $post->id)
            ->has('related', 2));
    }

    public function test_draft_or_unknown_article_is_404(): void
    {
        Post::factory()->draft()->create(['slug' => 'draf']);

        $this->get('/articles/draf')->assertNotFound();
        $this->get('/articles/tidak-ada')->assertNotFound();
    }
}
